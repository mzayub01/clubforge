#!/usr/bin/env node
// ===============================================
// ClubForge - Tests for the billing-check classifier (no Stripe, no DB)
//
//   node scripts/test-billing-classify.mjs
//
// Transpiles src/lib/billing-classify.ts (pure, type-only imports) and runs it
// against hand-built subscriptions and membership rows. Exit code 1 on failure.
// ===============================================
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src/lib/billing-classify.ts'), 'utf8');
const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const tmp = path.join(os.tmpdir(), `billing-classify-${process.pid}.mjs`);
fs.writeFileSync(tmp, js);
const { classifySubscriptions } = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const TENANT = 'tenant-1';
const LOC_A = 'loc-a';
const LOC_B = 'loc-b';
const PERIOD_END = 1793491200; // 2026-11-01

const sub = (id, over = {}) => ({
    id,
    status: 'active',
    cancel_at_period_end: false,
    created: 1782864000, // 2026-07-01
    currency: 'gbp',
    metadata: {},
    customer: { id: 'cus_x', email: 'parent@mail.test', name: 'Parent Name' },
    items: { data: [{ current_period_end: PERIOD_END, price: { unit_amount: 3500, currency: 'gbp', recurring: { interval: 'month' } } }] },
    ...over,
});
const tagged = (userId, locationId = LOC_A, tenantId = TENANT) => ({ user_id: userId, location_id: locationId, tenant_id: tenantId });
const membership = (id, userId, status, subId, locationId = LOC_A) =>
    ({ id, user_id: userId, location_id: locationId, status, stripe_subscription_id: subId });

const profiles = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u9'].map(u => ({ user_id: u, first_name: `First${u}`, last_name: `Last${u}` }));
const locations = [{ id: LOC_A, name: 'Main Dojo' }, { id: LOC_B, name: 'North Dojo' }];

const memberships = [
    membership('m1', 'u1', 'active', 'sub_healthy'),
    membership('m2', 'u2', 'cancelled', 'sub_cancelled_linked'),
    membership('m3', 'u3', 'cancelled', 'sub_cancelled_ending'),
    membership('m4', 'u4', 'active', 'sub_dup_current'),
    membership('m5', 'u5', 'active', null),
    membership('m6', 'u6', 'inactive', 'sub_dead_old_id'),
    membership('m9', 'u9', 'active', 'sub_other_location', LOC_B),
    membership('m10', 'u1', 'pending', 'sub_past_due'),
];

const live = [
    sub('sub_healthy', { metadata: tagged('u1') }),
    sub('sub_cancelled_linked', { metadata: tagged('u2') }),
    sub('sub_cancelled_ending', { metadata: tagged('u3'), cancel_at_period_end: true }),
    sub('sub_dup_current', { metadata: tagged('u4') }),
    sub('sub_dup_extra', { metadata: tagged('u4') }),
    sub('sub_unlinked', { metadata: tagged('u5') }),
    sub('sub_inactive_by_metadata', { metadata: tagged('u6') }),
    sub('sub_deleted_member', { metadata: tagged('u7') }),
    sub('sub_no_row_at_location', { metadata: tagged('u9', LOC_A) }),
    sub('sub_other_location', { metadata: tagged('u9', LOC_B) }),
    sub('sub_manual', { metadata: {} }),
    sub('sub_other_tenant', { metadata: tagged('u1', LOC_A, 'tenant-2') }),
    sub('sub_past_due', { metadata: tagged('u1'), status: 'past_due' }),
    sub('sub_deleted_customer', { metadata: tagged('u8'), customer: { id: 'cus_gone', deleted: true } }),
];

const { totals, issues } = classifySubscriptions({ tenantId: TENANT, live, memberships, profiles, locations });
const byId = Object.fromEntries(issues.map(i => [i.subscriptionId, i]));

let failed = 0;
const check = (name, actual, expected) => {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `\n       expected ${JSON.stringify(expected)}\n       actual   ${JSON.stringify(actual)}`}`);
};

check('active linked membership is not flagged', byId.sub_healthy, undefined);
check('pending membership with a past-due subscription is not flagged', byId.sub_past_due, undefined);
check('cancelled membership, subscription alive → flagged', byId.sub_cancelled_linked?.kind, 'cancelled_membership');
check('cancelled membership, already set to stop → not flagged', byId.sub_cancelled_ending, undefined);
check('second live subscription for one membership → duplicate', byId.sub_dup_extra?.kind, 'duplicate');
check('the subscription the membership points at is kept', byId.sub_dup_current, undefined);
check('only live subscription for a current membership (id not recorded) → not flagged', byId.sub_unlinked, undefined);
check('inactive membership matched by metadata → flagged', byId.sub_inactive_by_metadata?.kind, 'cancelled_membership');
check('deleted member → flagged as no membership', byId.sub_deleted_member?.kind, 'no_membership');
check('deleted member reason mentions deletion', /deleted/.test(byId.sub_deleted_member?.reason || ''), true);
check('deleted member falls back to the Stripe customer name', byId.sub_deleted_member?.memberName, 'Parent Name');
check('deleted customer does not crash, name is a placeholder', byId.sub_deleted_customer?.memberName, 'Unknown (deleted member)');
check('member with no membership at the tagged location → flagged', byId.sub_no_row_at_location?.kind, 'no_membership');
check('same member, subscription for their real location is fine', byId.sub_other_location, undefined);
check('subscription without ClubForge metadata is left alone', byId.sub_manual, undefined);
check('subscription tagged for another tenant is left alone', byId.sub_other_tenant, undefined);
check('amount is in pounds', byId.sub_cancelled_linked?.amount, 35);
check('interval and next charge date are reported', [byId.sub_cancelled_linked?.interval, byId.sub_cancelled_linked?.nextChargeDate], ['month', '2026-11-01']);
check('member and location names resolve', [byId.sub_cancelled_linked?.memberName, byId.sub_cancelled_linked?.locationName], ['Firstu2 Lastu2', 'Main Dojo']);
check('totals', totals, { live: 14, healthy: 4, unlinked: 1, ending: 1, unmanaged: 2, issues: 6 });

console.log(`\n${failed === 0 ? 'All checks passed' : `${failed} check(s) FAILED`}`);
process.exit(failed ? 1 : 0);
