// ===============================================
// ClubForge - Cancel a member's Stripe subscription (admin)
// POST /api/stripe/cancel  { membershipId, subscriptionId?, mode? }
//
// Kept for compatibility; delegates to applyMembershipStatusChange so the
// cancellation happens on the club's CONNECTED Stripe account (the previous
// implementation called the platform account, where member subscriptions do
// not exist) and the membership record is updated in the same step.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';
import { applyMembershipStatusChange } from '@/lib/membership-billing';

export async function POST(request: NextRequest) {
    const rateLimited = checkRateLimit(request, 'stripe-cancel', 10);
    if (rateLimited) return rateLimited;

    const auth = await requireAdmin();
    if (auth.error || !auth.tenantId) {
        return NextResponse.json({ error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
    }

    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 });
    }

    try {
        const { subscriptionId, membershipId, mode } = await request.json() as {
            subscriptionId?: string; membershipId?: string; mode?: 'immediately' | 'period_end';
        };

        const admin = createAdminClient();

        // Resolve the membership: by id, or by subscription id within this tenant
        let targetMembershipId = membershipId || null;
        if (!targetMembershipId && subscriptionId) {
            const { data } = await admin
                .from('memberships')
                .select('id')
                .eq('stripe_subscription_id', subscriptionId)
                .eq('tenant_id', auth.tenantId)
                .maybeSingle();
            targetMembershipId = data?.id || null;
        }
        if (!targetMembershipId) {
            return NextResponse.json({ error: 'Membership not found in your tenant' }, { status: 404 });
        }

        const result = await applyMembershipStatusChange(admin, {
            membershipId: targetMembershipId,
            tenantId: auth.tenantId,
            target: mode === 'period_end' ? 'cancel_at_period_end' : 'cancelled',
        });

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: result.note || 'Subscription cancelled successfully',
            status: result.status,
            end_date: result.end_date,
            subscription: result.stripe ? { action: result.stripe.action, account: result.stripe.account } : null,
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Failed to cancel subscription') },
            { status: 500 }
        );
    }
}
