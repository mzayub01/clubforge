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
 *  - cancelled / inactive  → Stripe subscription cancelled immediately, end_date = today
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
        .select('id, user_id, tenant_id, status, stripe_subscription_id, end_date')
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
            note = stripe.action === 'cancelled'
                ? 'Stripe subscription cancelled — no further charges.'
                : stripe.action === 'already_cancelled'
                    ? 'Stripe subscription was already cancelled.'
                    : 'No matching subscription found in Stripe (nothing was billing).';
        }
        patch.status = target;
        patch.end_date = today;
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
