#!/usr/bin/env node
// ===============================================
// ClubForge - Integration test for src/lib/membership-billing.ts against Stripe TEST mode
//
//   node scripts/test-billing-stripe.mjs
//
// Clubs' connected accounts are live-mode, so the local test key can never
// reach them. This test runs the REAL library code against the platform's own
// test-mode account instead (Stripe accepts your own account id in the
// Stripe-Account header), with trialing subscriptions that never charge:
//   - cancelling a membership's subscription also cancels a duplicate for the
//     same member + location, but not another location's or another member's
//   - "end at period end" schedules instead of cancelling, and is idempotent
//   - deleting a member cancels everything they hold
//   - the billing-check classifier reads real subscription objects
// Refuses to run with a live key. Cleans up everything it creates.
// ===============================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import Stripe from 'stripe';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^"|"$/g, '');
}
if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    console.error('Refusing to run: STRIPE_SECRET_KEY is not a test key.');
    process.exit(1);
}

// ---- load the real library (transpiled next to this script so `stripe` resolves) ----
const outDir = path.join(root, 'scripts', `.tmp-billing-${process.pid}`);
fs.mkdirSync(outDir, { recursive: true });
const transpile = (file, name) => {
    const js = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText.replace(/from ['"]@\/lib\/([\w-]+)['"]/g, "from './$1.mjs'");
    fs.writeFileSync(path.join(outDir, name), js);
};
transpile('src/lib/stripe.ts', 'stripe.mjs');
transpile('src/lib/membership-billing.ts', 'membership-billing.mjs');
transpile('src/lib/billing-classify.ts', 'billing-classify.mjs');
const billing = await import(pathToFileURL(path.join(outDir, 'membership-billing.mjs')).href);
const { classifySubscriptions } = await import(pathToFileURL(path.join(outDir, 'billing-classify.mjs')).href);
fs.rmSync(outDir, { recursive: true, force: true });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
const account = (await stripe.accounts.retrieve()).id;
const opts = { stripeAccount: account };

const run = Date.now().toString(36);
const TENANT = `test-tenant-${run}`;
const USER_A = `test-user-a-${run}`;
const USER_B = `test-user-b-${run}`;
const LOC_1 = `test-loc-1-${run}`;
const LOC_2 = `test-loc-2-${run}`;

let failed = 0;
const check = (name, actual, expected) => {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `\n       expected ${JSON.stringify(expected)}\n       actual   ${JSON.stringify(actual)}`}`);
};
const statusOf = async id => (await stripe.subscriptions.retrieve(id, undefined, opts)).status;

/** Minimal stand-in for the Supabase admin client: from(table).select().eq()… */
const fakeAdmin = tables => ({
    from(table) {
        const rows = tables[table] || [];
        const q = {
            select: () => q,
            eq: () => q,
            maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
            then: (resolve, reject) => Promise.resolve({ data: rows, error: null }).then(resolve, reject),
        };
        return q;
    },
});

const created = { subs: [], customer: null, product: null };
try {
    const product = await stripe.products.create({ name: `ClubForge billing test ${run}` }, opts);
    created.product = product.id;
    const customer = await stripe.customers.create({ email: `billing-test-${run}@clubforgehq.com`, name: 'Billing Test' }, opts);
    created.customer = customer.id;

    const makeSub = async (userId, locationId) => {
        const sub = await stripe.subscriptions.create({
            customer: customer.id,
            trial_period_days: 30, // trialing: live, but never charges
            items: [{ price_data: { currency: 'gbp', product: product.id, unit_amount: 3500, recurring: { interval: 'month' } } }],
            metadata: { user_id: userId, location_id: locationId, tenant_id: TENANT },
        }, opts);
        created.subs.push(sub.id);
        return sub.id;
    };
    const stored = await makeSub(USER_A, LOC_1);      // the id the membership row remembers
    const duplicate = await makeSub(USER_A, LOC_1);   // paid twice
    const otherLoc = await makeSub(USER_A, LOC_2);    // same member, another location
    const otherUser = await makeSub(USER_B, LOC_1);   // another member
    console.log(`created 4 trialing subscriptions on ${account.slice(0, 9)}… (test mode)\n`);

    // ---- listing + classifier on real objects ----
    const live = await billing.listLiveSubscriptions(stripe, account, { expandCustomer: true });
    const mine = live.filter(s => s.metadata?.tenant_id === TENANT);
    check('listLiveSubscriptions finds all four (trialing counts as live)', mine.length, 4);
    const { issues } = classifySubscriptions({
        tenantId: TENANT,
        live: mine,
        memberships: [
            { id: 'm1', user_id: USER_A, location_id: LOC_1, status: 'active', stripe_subscription_id: stored },
            { id: 'm2', user_id: USER_A, location_id: LOC_2, status: 'cancelled', stripe_subscription_id: otherLoc },
        ],
        profiles: [{ user_id: USER_A, first_name: 'Test', last_name: 'Member' }],
        locations: [{ id: LOC_1, name: 'One' }, { id: LOC_2, name: 'Two' }],
    });
    const kinds = Object.fromEntries(issues.map(i => [i.subscriptionId, i.kind]));
    check('classifier on real objects: duplicate / cancelled membership / deleted member',
        [kinds[duplicate], kinds[otherLoc], kinds[otherUser], kinds[stored]],
        ['duplicate', 'cancelled_membership', 'no_membership', undefined]);
    const flagged = issues.find(i => i.subscriptionId === duplicate);
    check('classifier reads amount, interval and customer email from real objects',
        [flagged?.amount, flagged?.interval, flagged?.customerEmail, /^\d{4}-\d{2}-\d{2}$/.test(flagged?.nextChargeDate || '')],
        [35, 'month', `billing-test-${run}@clubforgehq.com`, true]);

    // ---- "end at period end" sweep: schedules, idempotent ----
    const scheduled = await billing.cancelOtherLiveSubscriptions(account, { userId: USER_A, locationId: LOC_2 }, [], 'period_end');
    check('period-end sweep schedules the matching subscription', scheduled.handled, [otherLoc]);
    const after = await stripe.subscriptions.retrieve(otherLoc, undefined, opts);
    check('…it is still live but will not renew', [after.status, after.cancel_at_period_end], ['trialing', true]);
    const again = await billing.cancelOtherLiveSubscriptions(account, { userId: USER_A, locationId: LOC_2 }, [], 'period_end');
    check('…and a second run changes nothing', again.handled, []);
    const resumed = await billing.resumeStripeSubscription(otherLoc, account);
    check('resume clears the scheduled cancellation', resumed.action, 'resumed');

    // ---- cancelling the membership: stored id + duplicate, nothing else ----
    const primary = await billing.cancelStripeSubscription(stored, account, 'immediately');
    check('stored subscription cancelled on the connected account', [primary.ok, primary.action, primary.account], [true, 'cancelled', 'connected']);
    const sweep = await billing.cancelOtherLiveSubscriptions(account, { userId: USER_A, locationId: LOC_1 }, [stored], 'immediately');
    check('sweep cancels the duplicate for the same member + location', [sweep.checked, sweep.handled], [true, [duplicate]]);
    check('duplicate is cancelled in Stripe', await statusOf(duplicate), 'canceled');
    check('same member, other location is untouched', await statusOf(otherLoc), 'trialing');
    check('other member is untouched', await statusOf(otherUser), 'trialing');
    const repeat = await billing.cancelStripeSubscription(stored, account, 'immediately');
    check('cancelling again reports already cancelled', repeat.action, 'already_cancelled');
    const missing = await billing.cancelStripeSubscription('sub_doesnotexist000', account, 'immediately');
    check('unknown subscription id reports not found', missing.action, 'not_found');

    // ---- deleting a member: everything they hold ----
    const adminA = fakeAdmin({ tenants: [{ stripe_account_id: account }], memberships: [{ stripe_subscription_id: stored }] });
    const deletedA = await billing.cancelAllSubscriptionsForUser(adminA, { tenantId: TENANT, userId: USER_A });
    check('member delete cancels a subscription the records never pointed at', [deletedA.ok, deletedA.cancelled], [true, 1]);
    check('…in Stripe', await statusOf(otherLoc), 'canceled');
    check('…and still leaves the other member alone', await statusOf(otherUser), 'trialing');
    const adminB = fakeAdmin({ tenants: [{ stripe_account_id: account }], memberships: [{ stripe_subscription_id: otherUser }] });
    const deletedB = await billing.cancelAllSubscriptionsForUser(adminB, { tenantId: TENANT, userId: USER_B });
    check('member delete cancels the stored subscription', [deletedB.ok, deletedB.cancelled], [true, 1]);

    const remaining = (await billing.listLiveSubscriptions(stripe, account)).filter(s => s.metadata?.tenant_id === TENANT);
    check('nothing from this test is left live', remaining.length, 0);
} catch (err) {
    failed++;
    console.error('FAIL unexpected error:', err?.message || err);
} finally {
    for (const id of created.subs) {
        try {
            const sub = await stripe.subscriptions.retrieve(id, undefined, opts);
            if (sub.status !== 'canceled') await stripe.subscriptions.cancel(id, undefined, opts);
        } catch { /* already gone */ }
    }
    if (created.customer) await stripe.customers.del(created.customer, undefined, opts).catch(() => {});
    if (created.product) await stripe.products.update(created.product, { active: false }, opts).catch(() => {});
    console.log('\ncleaned up test customer, subscriptions and product');
}

console.log(failed === 0 ? 'All checks passed' : `${failed} check(s) FAILED`);
process.exit(failed ? 1 : 0);
