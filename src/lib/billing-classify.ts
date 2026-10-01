// ===============================================
// ClubForge - Billing check: classify live Stripe subscriptions (pure)
//
// Compares the subscriptions that can still charge on a club's connected
// Stripe account with the club's membership records and flags the ones that
// should not be charging. No I/O and only type imports, so it can be tested
// without Stripe (scripts/test-billing-classify.mjs).
//
// Subscriptions are matched to members by the stored
// `memberships.stripe_subscription_id`, then by the metadata checkout writes
// on every subscription: { user_id, location_id, tenant_id }.
// ===============================================

import type Stripe from 'stripe';

export type BillingIssueKind = 'cancelled_membership' | 'no_membership' | 'duplicate';

export interface BillingMembershipRow {
    id: string;
    user_id: string;
    location_id: string;
    status: string;
    stripe_subscription_id: string | null;
}

export interface BillingProfileRow {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
}

export interface BillingIssue {
    subscriptionId: string;
    kind: BillingIssueKind;
    reason: string;
    memberName: string;
    customerEmail: string | null;
    /** Major units (pounds), null when the price is not a simple fixed amount */
    amount: number | null;
    currency: string | null;
    interval: string | null;
    stripeStatus: string;
    /** YYYY-MM-DD — when Stripe will next charge (end of the current period) */
    nextChargeDate: string | null;
    startedDate: string | null;
    membershipId: string | null;
    membershipStatus: string | null;
    locationName: string | null;
}

export interface BillingTotals {
    /** Subscriptions on the account that can still charge */
    live: number;
    /** Linked to a membership that is not cancelled */
    healthy: number;
    /** Paying for a current membership, but the record points at a different (dead or missing) subscription id */
    unlinked: number;
    /** Would be a problem, but already set to stop at the end of the paid period */
    ending: number;
    /** Not created by ClubForge (no member metadata) — left alone */
    unmanaged: number;
    issues: number;
}

export interface BillingClassification {
    totals: BillingTotals;
    issues: BillingIssue[];
}

const ENDED_STATUSES: ReadonlySet<string> = new Set(['cancelled', 'canceled', 'inactive', 'expired']);

const toDate = (unixSeconds?: number | null) =>
    unixSeconds ? new Date(unixSeconds * 1000).toISOString().slice(0, 10) : null;

function periodEndUnix(sub: Stripe.Subscription): number | null {
    const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
    if (typeof legacy === 'number') return legacy;
    const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
    return typeof item?.current_period_end === 'number' ? item.current_period_end : null;
}

function customerOf(sub: Stripe.Subscription): { email: string | null; name: string | null } {
    const c = sub.customer;
    if (!c || typeof c === 'string' || ('deleted' in c && c.deleted)) return { email: null, name: null };
    const customer = c as Stripe.Customer;
    return { email: customer.email ?? null, name: customer.name ?? null };
}

export function classifySubscriptions(input: {
    tenantId: string;
    live: Stripe.Subscription[];
    memberships: BillingMembershipRow[];
    profiles: BillingProfileRow[];
    locations: Array<{ id: string; name: string }>;
}): BillingClassification {
    const { tenantId, live, memberships, profiles, locations } = input;

    const bySubId = new Map<string, BillingMembershipRow>();
    const byUser = new Map<string, BillingMembershipRow[]>();
    for (const m of memberships) {
        if (m.stripe_subscription_id) bySubId.set(m.stripe_subscription_id, m);
        const list = byUser.get(m.user_id);
        if (list) list.push(m); else byUser.set(m.user_id, [m]);
    }
    const profileByUser = new Map(profiles.map(p => [p.user_id, p]));
    const locationName = new Map(locations.map(l => [l.id, l.name]));
    const liveIds = new Set(live.map(s => s.id));

    const totals: BillingTotals = { live: live.length, healthy: 0, unlinked: 0, ending: 0, unmanaged: 0, issues: 0 };
    const issues: BillingIssue[] = [];

    for (const sub of live) {
        const meta = sub.metadata || {};
        const linked = bySubId.get(sub.id) || null;
        const taggedForThisClub = !!meta.user_id && (!meta.tenant_id || meta.tenant_id === tenantId);

        let kind: BillingIssueKind | null = null;
        let reason = '';
        let membership: BillingMembershipRow | null = linked;
        let userId: string | null = linked?.user_id ?? null;

        if (linked) {
            if (ENDED_STATUSES.has(linked.status)) {
                kind = 'cancelled_membership';
                reason = `Membership is ${linked.status} but this subscription is still charging`;
            }
        } else if (taggedForThisClub) {
            userId = meta.user_id;
            const rows = byUser.get(meta.user_id) || [];
            const atLocation = meta.location_id
                ? rows.find(m => m.location_id === meta.location_id) || null
                : (rows.length === 1 ? rows[0] : null);
            membership = atLocation;

            if (!atLocation) {
                kind = 'no_membership';
                reason = profileByUser.has(meta.user_id)
                    ? 'No membership record for this subscription — the member is still being charged'
                    : 'Member no longer exists in the club (deleted) but the subscription is still charging';
            } else if (ENDED_STATUSES.has(atLocation.status)) {
                kind = 'cancelled_membership';
                reason = `Membership is ${atLocation.status} but this subscription is still charging`;
            } else if (atLocation.stripe_subscription_id && liveIds.has(atLocation.stripe_subscription_id)) {
                kind = 'duplicate';
                reason = 'Second subscription for the same membership — the member is being charged twice';
            } else {
                // The only live subscription for a current membership; the record just
                // holds a different id. Cancelling the membership sweeps it up.
                totals.unlinked++;
                continue;
            }
        } else {
            totals.unmanaged++;
            continue;
        }

        if (!kind) { totals.healthy++; continue; }
        // Already set to stop when the paid period ends — nothing more will be taken
        if (sub.cancel_at_period_end) { totals.ending++; continue; }

        const profile = userId ? profileByUser.get(userId) : undefined;
        const customer = customerOf(sub);
        const price = sub.items?.data?.[0]?.price;
        issues.push({
            subscriptionId: sub.id,
            kind,
            reason,
            memberName: profile
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed member'
                : customer.name || customer.email || 'Unknown (deleted member)',
            customerEmail: customer.email,
            amount: typeof price?.unit_amount === 'number' ? price.unit_amount / 100 : null,
            currency: price?.currency ?? sub.currency ?? null,
            interval: price?.recurring?.interval ?? null,
            stripeStatus: sub.status,
            nextChargeDate: toDate(periodEndUnix(sub)),
            startedDate: toDate(sub.created),
            membershipId: membership?.id ?? null,
            membershipStatus: membership?.status ?? null,
            locationName: locationName.get(membership?.location_id || meta.location_id || '') ?? null,
        });
    }

    issues.sort((a, b) => (a.nextChargeDate || '9999').localeCompare(b.nextChargeDate || '9999'));
    totals.issues = issues.length;
    return { totals, issues };
}
