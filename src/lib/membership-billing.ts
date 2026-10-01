// ===============================================
// ClubForge - Membership status ↔ Stripe subscription sync (server only)
//
// Member subscriptions live on the CLUB's connected Stripe account, not the
// platform account, so every cancellation must be made with
// `{ stripeAccount }`. Any admin action that changes a membership's status
// must go through applyMembershipStatusChange() so the club's records and
// Stripe never disagree (a membership marked cancelled while Stripe keeps
// charging is the failure mode this file exists to prevent).
// ===============================================

import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getStripeClient } from '@/lib/stripe';

export type CancelMode = 'immediately' | 'period_end';

export type MembershipStatusTarget =
    | 'active'
    | 'pending'
    | 'inactive'
    | 'cancelled'
    /** Keep access until the paid period ends, then Stripe ends it (webhook flips status) */
    | 'cancel_at_period_end';

export const MEMBERSHIP_STATUS_TARGETS: MembershipStatusTarget[] = [
    'active', 'pending', 'inactive', 'cancelled', 'cancel_at_period_end',
];

export interface StripeSyncResult {
    attempted: boolean;
    ok: boolean;
    account?: 'connected' | 'platform';
    action?: 'cancelled' | 'scheduled' | 'resumed' | 'already_cancelled' | 'nothing_to_do' | 'not_found';
    /** YYYY-MM-DD of the current paid period end, when known */
    periodEnd?: string | null;
    error?: string;
}

type Located = { sub: Stripe.Subscription; opts?: Stripe.RequestOptions; account: 'connected' | 'platform' };

const toDate = (unixSeconds?: number | null) =>
    unixSeconds ? new Date(unixSeconds * 1000).toISOString().slice(0, 10) : null;

/**
 * Current paid period end (unix seconds). Older Stripe API versions expose it on
 * the subscription; from 2025-03 it lives on each subscription item. Read both.
 */
export function subscriptionPeriodEndUnix(sub: Stripe.Subscription): number | null {
    const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
    if (typeof legacy === 'number') return legacy;
    const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
    return typeof item?.current_period_end === 'number' ? item.current_period_end : null;
}

const isMissing = (err: unknown) => {
    const e = err as { code?: string; statusCode?: number; type?: string };
    return e?.code === 'resource_missing' || e?.statusCode === 404;
};

/** Find the subscription on the club's connected account first, then the platform account. */
async function locateSubscription(
    stripe: Stripe,
    subscriptionId: string,
    connectedAccountId: string | null,
): Promise<Located | null> {
    const attempts: Array<{ opts?: Stripe.RequestOptions; account: 'connected' | 'platform' }> = [];
    if (connectedAccountId) attempts.push({ opts: { stripeAccount: connectedAccountId }, account: 'connected' });
    attempts.push({ opts: undefined, account: 'platform' });

    for (const attempt of attempts) {
        try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId, undefined, attempt.opts);
            return { sub, opts: attempt.opts, account: attempt.account };
        } catch (err) {
            if (isMissing(err)) continue;
            throw err;
        }
    }
    return null;
}

export async function cancelStripeSubscription(
    subscriptionId: string,
    connectedAccountId: string | null,
    mode: CancelMode,
): Promise<StripeSyncResult> {
    const stripe = getStripeClient();
    if (!stripe) return { attempted: false, ok: false, error: 'Stripe is not configured' };

    try {
        const found = await locateSubscription(stripe, subscriptionId, connectedAccountId);
        if (!found) {
            return { attempted: true, ok: false, action: 'not_found', error: 'Subscription not found in Stripe' };
        }
        const { sub, opts, account } = found;
        const periodEnd = toDate(subscriptionPeriodEndUnix(sub));

        if (sub.status === 'canceled') {
            return { attempted: true, ok: true, account, action: 'already_cancelled', periodEnd };
        }

        if (mode === 'period_end') {
            if (!sub.cancel_at_period_end) {
                await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true }, opts);
            }
            return { attempted: true, ok: true, account, action: 'scheduled', periodEnd };
        }

        await stripe.subscriptions.cancel(sub.id, undefined, opts);
        return { attempted: true, ok: true, account, action: 'cancelled', periodEnd };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Stripe error';
        console.error('[membership-billing] cancel failed:', subscriptionId, message);
        return { attempted: true, ok: false, error: message };
    }
}

export async function resumeStripeSubscription(
    subscriptionId: string,
    connectedAccountId: string | null,
): Promise<StripeSyncResult> {
    const stripe = getStripeClient();
    if (!stripe) return { attempted: false, ok: false, error: 'Stripe is not configured' };

    try {
        const found = await locateSubscription(stripe, subscriptionId, connectedAccountId);
        if (!found) return { attempted: true, ok: false, action: 'not_found', error: 'Subscription not found in Stripe' };
        const { sub, opts, account } = found;
        const periodEnd = toDate(subscriptionPeriodEndUnix(sub));

        if (sub.status === 'canceled') {
            return {
                attempted: true, ok: false, account, action: 'already_cancelled', periodEnd,
                error: 'The Stripe subscription has already ended — the member will need to pay again to restart billing',
            };
        }
        if (sub.cancel_at_period_end) {
            await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false }, opts);
            return { attempted: true, ok: true, account, action: 'resumed', periodEnd };
        }
        return { attempted: true, ok: true, account, action: 'nothing_to_do', periodEnd };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Stripe error';
        console.error('[membership-billing] resume failed:', subscriptionId, message);
        return { attempted: true, ok: false, error: message };
    }
}

/** Statuses in which Stripe can still take (or retry) a payment. */
const LIVE_STATUSES: ReadonlySet<string> = new Set(['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete']);

export function isLiveSubscription(sub: Pick<Stripe.Subscription, 'status'>): boolean {
    return LIVE_STATUSES.has(sub.status);
}

/**
 * Every subscription on the club's connected account that can still charge.
 * Checkout tags each subscription with metadata { user_id, location_id,
 * tenant_id }, which is how they are matched back to members.
 */
export async function listLiveSubscriptions(
    stripe: Stripe,
    connectedAccountId: string,
    options: { expandCustomer?: boolean; max?: number } = {},
): Promise<Stripe.Subscription[]> {
    const max = options.max ?? 5000;
    const params: Stripe.SubscriptionListParams = { limit: 100 };
    if (options.expandCustomer) params.expand = ['data.customer'];

    const live: Stripe.Subscription[] = [];
    // Without a status filter Stripe returns every subscription that is not cancelled
    for await (const sub of stripe.subscriptions.list(params, { stripeAccount: connectedAccountId })) {
        if (isLiveSubscription(sub)) live.push(sub);
        if (live.length >= max) break;
    }
    return live;
}

export interface SweepResult {
    /** false when the account's subscriptions could not be listed */
    checked: boolean;
    /** ids cancelled (or set to stop renewing) by the sweep */
    handled: string[];
    /** a subscription was found but Stripe refused the change — blocking */
    error?: string;
    /** the account could not be searched — not blocking */
    warning?: string;
}

/**
 * A member can hold more than one live subscription while the membership row
 * only remembers one id: every checkout creates a NEW subscription, so paying
 * twice, or paying again after a failed payment, leaves the earlier one
 * running. Cancelling by the stored id alone left those charging (HaMeem,
 * 2026-10). Every cancellation therefore also sweeps the club's account for
 * subscriptions tagged with this member (and location, when given).
 */
export async function cancelOtherLiveSubscriptions(
    connectedAccountId: string | null,
    match: { userId: string; locationId?: string | null },
    excludeIds: string[],
    mode: CancelMode,
): Promise<SweepResult> {
    const stripe = getStripeClient();
    if (!stripe || !connectedAccountId) return { checked: false, handled: [] };

    let live: Stripe.Subscription[];
    try {
        live = await listLiveSubscriptions(stripe, connectedAccountId);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Stripe error';
        console.error('[membership-billing] sweep could not list subscriptions:', message);
        return { checked: false, handled: [], warning: message };
    }

    const opts: Stripe.RequestOptions = { stripeAccount: connectedAccountId };
    const handled: string[] = [];
    for (const sub of live) {
        if (excludeIds.includes(sub.id)) continue;
        if (sub.metadata?.user_id !== match.userId) continue;
        // A subscription tagged with a different location belongs to another membership
        if (match.locationId && sub.metadata?.location_id && sub.metadata.location_id !== match.locationId) continue;
        try {
            if (mode === 'period_end') {
                if (sub.cancel_at_period_end) continue;
                await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true }, opts);
            } else {
                await stripe.subscriptions.cancel(sub.id, undefined, opts);
            }
            handled.push(sub.id);
        } catch (err) {
            if (isMissing(err)) continue;
            const message = err instanceof Error ? err.message : 'Stripe error';
            console.error('[membership-billing] sweep cancel failed:', sub.id, message);
            return { checked: true, handled, error: message };
        }
    }
    if (handled.length > 0) {
        console.log(`[membership-billing] sweep ${mode === 'period_end' ? 'scheduled' : 'cancelled'} ${handled.length} extra subscription(s) for user ${match.userId}: ${handled.join(', ')}`);
    }
    return { checked: true, handled };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Admin-facing summary of an immediate cancellation. */
function cancellationNote(primary: StripeSyncResult | null, sweep: SweepResult): string | undefined {
    const parts: string[] = [];
    const extras = sweep.handled.length;
    if (primary?.action === 'cancelled') parts.push('Stripe subscription cancelled — no further charges.');
    else if (primary?.action === 'already_cancelled') parts.push('Stripe subscription was already cancelled.');
    else if (primary?.action === 'not_found' && extras === 0) parts.push('No matching subscription found in Stripe (nothing was billing).');

    if (extras > 0) {
        parts.push(primary && primary.action !== 'not_found'
            ? `Also cancelled ${plural(extras, 'other subscription')} found in Stripe for this member.`
            : `Cancelled ${plural(extras, 'subscription')} found in Stripe for this member — no further charges.`);
    }
    if (sweep.warning) {
        parts.push(`Could not check Stripe for other subscriptions (${sweep.warning}) — run Billing check on the Memberships page to confirm.`);
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
}

/**
 * Cancel every Stripe subscription a member holds at this club — used before a
 * member is deleted, because deleting the records alone leaves Stripe charging.
 */
export async function cancelAllSubscriptionsForUser(
    admin: SupabaseClient,
    params: { tenantId: string; userId: string },
): Promise<{ ok: boolean; cancelled: number; error?: string; warning?: string }> {
    const { tenantId, userId } = params;

    const [{ data: tenant }, { data: rows }] = await Promise.all([
        admin.from('tenants').select('stripe_account_id').eq('id', tenantId).maybeSingle(),
        admin.from('memberships').select('stripe_subscription_id').eq('tenant_id', tenantId).eq('user_id', userId),
    ]);
    const connectedAccountId: string | null = tenant?.stripe_account_id || null;
    const ids = Array.from(new Set(
        (rows || []).map(r => r.stripe_subscription_id as string | null).filter((id): id is string => !!id),
    ));
    if (ids.length === 0 && !connectedAccountId) return { ok: true, cancelled: 0 };

    let cancelled = 0;
    for (const id of ids) {
        const result = await cancelStripeSubscription(id, connectedAccountId, 'immediately');
        if (!result.ok && result.action !== 'not_found') {
            return { ok: false, cancelled, error: result.error || 'Stripe error' };
        }
        if (result.action === 'cancelled') cancelled++;
    }

    const sweep = await cancelOtherLiveSubscriptions(connectedAccountId, { userId }, ids, 'immediately');
    cancelled += sweep.handled.length;
    if (sweep.error) return { ok: false, cancelled, error: sweep.error };
    return { ok: true, cancelled, warning: sweep.warning };
}

export interface StatusChangeResult {
    ok: boolean;
    error?: string;
    status?: string;
    end_date?: string | null;
    stripe?: StripeSyncResult | null;
    /** Human-readable note about what happened in Stripe, for the admin UI */
    note?: string;
}

/**
 * Change a membership's status AND keep its Stripe subscription in step.
 *  - cancelled / inactive  → Stripe subscription cancelled immediately, end_date = today;
 *                            any OTHER live subscription tagged with this member +
 *                            location is cancelled too (see cancelOtherLiveSubscriptions)
 *  - cancel_at_period_end  → Stripe stops renewal; membership stays active with
 *                            end_date = period end (webhook marks it cancelled later)
 *  - active                → clears a scheduled cancellation in Stripe if there is one
 *  - pending               → records only
 * If Stripe rejects the change (network/permission), the record is NOT updated,
 * so the club never believes a subscription is cancelled while it still bills.
 */
export async function applyMembershipStatusChange(
    admin: SupabaseClient,
    params: { membershipId: string; tenantId: string; target: MembershipStatusTarget },
): Promise<StatusChangeResult> {
    const { membershipId, tenantId, target } = params;

    const { data: membership } = await admin
        .from('memberships')
        .select('id, user_id, tenant_id, location_id, status, stripe_subscription_id, end_date')
        .eq('id', membershipId)
        .maybeSingle();
    if (!membership || membership.tenant_id !== tenantId) {
        return { ok: false, error: 'Membership not found in your club' };
    }

    const { data: tenant } = await admin
        .from('tenants')
        .select('stripe_account_id')
        .eq('id', tenantId)
        .maybeSingle();
    const connectedAccountId: string | null = tenant?.stripe_account_id || null;

    const today = new Date().toISOString().slice(0, 10);
    const subId: string | null = membership.stripe_subscription_id || null;
    const patch: Record<string, unknown> = {};
    let stripe: StripeSyncResult | null = null;
    let note: string | undefined;

    if (target === 'cancelled' || target === 'inactive') {
        if (subId) {
            stripe = await cancelStripeSubscription(subId, connectedAccountId, 'immediately');
            if (!stripe.ok && stripe.action !== 'not_found') {
                return { ok: false, error: `Stripe refused the cancellation: ${stripe.error}`, stripe };
            }
        }
        const sweep = await cancelOtherLiveSubscriptions(
            connectedAccountId,
            { userId: membership.user_id, locationId: membership.location_id },
            subId ? [subId] : [],
            'immediately',
        );
        if (sweep.error) {
            return { ok: false, error: `Stripe refused to cancel another subscription held by this member: ${sweep.error}`, stripe };
        }
        note = cancellationNote(stripe, sweep);
        patch.status = target;
        // Re-running a cancellation (to re-check Stripe) keeps the original end date
        patch.end_date = membership.status === target && membership.end_date ? membership.end_date : today;
    } else if (target === 'cancel_at_period_end') {
        if (!subId) {
            return { ok: false, error: 'This membership has no Stripe subscription — use Cancelled instead' };
        }
        stripe = await cancelStripeSubscription(subId, connectedAccountId, 'period_end');
        if (!stripe.ok) {
            return { ok: false, error: `Stripe refused the change: ${stripe.error}`, stripe };
        }
        if (stripe.action === 'already_cancelled') {
            patch.status = 'cancelled';
            patch.end_date = stripe.periodEnd || today;
            note = 'Stripe subscription had already ended — membership marked cancelled.';
        } else {
            patch.status = 'active';
            patch.end_date = stripe.periodEnd || null;
            note = stripe.periodEnd
                ? `Stripe will not renew — access continues until ${stripe.periodEnd}, then the membership ends automatically.`
                : 'Stripe will not renew — the membership ends at the close of the current period.';
            const sweep = await cancelOtherLiveSubscriptions(
                connectedAccountId,
                { userId: membership.user_id, locationId: membership.location_id },
                [subId],
                'period_end',
            );
            if (sweep.error) {
                return { ok: false, error: `Stripe refused to stop another subscription held by this member: ${sweep.error}`, stripe };
            }
            if (sweep.handled.length > 0) {
                note += ` Also stopped ${plural(sweep.handled.length, 'other subscription')} found in Stripe for this member from renewing.`;
            }
        }
    } else if (target === 'active') {
        if (subId) {
            stripe = await resumeStripeSubscription(subId, connectedAccountId);
            note = stripe.action === 'resumed'
                ? 'Scheduled Stripe cancellation removed — billing continues.'
                : stripe.action === 'already_cancelled'
                    ? 'Marked active in club records, but the Stripe subscription has already ended — the member must pay again to restart billing.'
                    : undefined;
        }
        patch.status = 'active';
        patch.end_date = null;
    } else {
        patch.status = 'pending';
    }

    const { error } = await admin
        .from('memberships')
        .update(patch)
        .eq('id', membership.id)
        .eq('tenant_id', tenantId);
    if (error) {
        console.error('[membership-billing] record update failed:', error.message);
        return { ok: false, error: 'Stripe was updated but the membership record could not be saved — please retry', stripe };
    }

    return {
        ok: true,
        status: patch.status as string,
        end_date: (patch.end_date as string | null | undefined) ?? membership.end_date ?? null,
        stripe,
        note,
    };
}
