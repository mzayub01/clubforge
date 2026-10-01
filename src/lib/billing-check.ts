// ===============================================
// ClubForge - Billing check (server only)
//
// "Who is Stripe still charging that the club thinks has left?" Lists every
// subscription that can still charge on the club's connected account, compares
// it with the membership records (src/lib/billing-classify.ts) and lets an
// admin stop the ones that should not be running:
//   - membership cancelled / inactive but the subscription is alive (anything
//     cancelled before 2026-09-05 was a record-only change)
//   - member deleted, subscription left behind
//   - a second subscription for the same membership (paid twice)
// ===============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { getStripeClient } from '@/lib/stripe';
import { cancelStripeSubscription, listLiveSubscriptions } from '@/lib/membership-billing';
import {
    classifySubscriptions,
    type BillingIssue,
    type BillingMembershipRow,
    type BillingProfileRow,
    type BillingTotals,
} from '@/lib/billing-classify';

export interface BillingCheckResult {
    ok: boolean;
    error?: string;
    /** false when the club has not connected Stripe (nothing to check) */
    connected: boolean;
    totals: BillingTotals;
    issues: BillingIssue[];
}

const NO_TOTALS: BillingTotals = { live: 0, healthy: 0, unlinked: 0, ending: 0, unmanaged: 0, issues: 0 };

/** PostgREST caps a response at 1,000 rows; a truncated list would make real members look deleted. */
async function fetchAllRows<T>(
    admin: SupabaseClient,
    table: string,
    columns: string,
    tenantId: string,
): Promise<T[]> {
    const pageSize = 1000;
    const rows: T[] = [];
    for (let from = 0; ; from += pageSize) {
        const { data, error } = await admin
            .from(table)
            .select(columns)
            .eq('tenant_id', tenantId)
            .order('id', { ascending: true })
            .range(from, from + pageSize - 1);
        if (error) throw new Error(`Could not read ${table}: ${error.message}`);
        rows.push(...((data || []) as unknown as T[]));
        if (!data || data.length < pageSize) break;
    }
    return rows;
}

async function check(admin: SupabaseClient, tenantId: string): Promise<BillingCheckResult & { account: string | null }> {
    const { data: tenant } = await admin
        .from('tenants')
        .select('stripe_account_id')
        .eq('id', tenantId)
        .maybeSingle();
    const account: string | null = tenant?.stripe_account_id || null;
    if (!account) return { ok: true, connected: false, totals: NO_TOTALS, issues: [], account };

    const stripe = getStripeClient();
    if (!stripe) return { ok: false, connected: true, error: 'Stripe is not configured', totals: NO_TOTALS, issues: [], account };

    try {
        const [live, memberships, profiles, locations] = await Promise.all([
            listLiveSubscriptions(stripe, account, { expandCustomer: true }),
            fetchAllRows<BillingMembershipRow>(admin, 'memberships', 'id, user_id, location_id, status, stripe_subscription_id', tenantId),
            fetchAllRows<BillingProfileRow>(admin, 'profiles', 'id, user_id, first_name, last_name', tenantId),
            fetchAllRows<{ id: string; name: string }>(admin, 'locations', 'id, name', tenantId),
        ]);
        const { totals, issues } = classifySubscriptions({ tenantId, live, memberships, profiles, locations });
        return { ok: true, connected: true, totals, issues, account };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Stripe error';
        console.error('[billing-check] failed:', message);
        return { ok: false, connected: true, error: message, totals: NO_TOTALS, issues: [], account };
    }
}

export async function runBillingCheck(admin: SupabaseClient, tenantId: string): Promise<BillingCheckResult> {
    const { ok, error, connected, totals, issues } = await check(admin, tenantId);
    return { ok, error, connected, totals, issues };
}

/**
 * Cancel one subscription the check has flagged. The check is re-run first so
 * a subscription that belongs to a current membership can never be cancelled
 * from here — those go through the membership's own status change.
 */
export async function cancelFlaggedSubscription(
    admin: SupabaseClient,
    tenantId: string,
    subscriptionId: string,
): Promise<{ ok: boolean; error?: string; issue?: BillingIssue }> {
    const result = await check(admin, tenantId);
    if (!result.ok) return { ok: false, error: result.error || 'Billing check failed' };

    const issue = result.issues.find(i => i.subscriptionId === subscriptionId);
    if (!issue) {
        return { ok: false, error: 'That subscription is no longer flagged — it has already ended, or it belongs to a current membership' };
    }

    const cancelled = await cancelStripeSubscription(subscriptionId, result.account, 'immediately');
    if (!cancelled.ok) return { ok: false, error: cancelled.error || 'Stripe refused the cancellation' };
    return { ok: true, issue };
}
