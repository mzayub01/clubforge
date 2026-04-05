import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, getStripeClient } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
    // Rate limit: 10 per minute
    const rateLimited = checkRateLimit(request, 'stripe-cancel', 10);
    if (rateLimited) return rateLimited;

    // Require admin authentication
    const auth = await requireAdmin();
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!isStripeConfigured()) {
        return NextResponse.json(
            { error: 'Stripe is not configured' },
            { status: 400 }
        );
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe client not available' },
            { status: 400 }
        );
    }

    try {
        const { subscriptionId, membershipId } = await request.json();

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'Subscription ID is required' },
                { status: 400 }
            );
        }

        // Verify the membership belongs to the admin's tenant before cancelling
        if (membershipId) {
            const supabase = await createAdminClient();
            const { data: membership } = await supabase
                .from('memberships')
                .select('id, tenant_id')
                .eq('id', membershipId)
                .eq('tenant_id', auth.tenantId)
                .single();

            if (!membership) {
                return NextResponse.json({ error: 'Membership not found in your tenant' }, { status: 404 });
            }
        }

        // Cancel the subscription in Stripe
        const cancelledSubscription = await stripe.subscriptions.cancel(subscriptionId);

        // Update membership status in database
        if (membershipId) {
            const supabase = await createAdminClient();
            await supabase
                .from('memberships')
                .update({ status: 'cancelled' })
                .eq('id', membershipId)
                .eq('tenant_id', auth.tenantId); // Tenant isolation
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled successfully',
            subscription: {
                id: cancelledSubscription.id,
                status: cancelledSubscription.status,
            },
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Failed to cancel subscription') },
            { status: 500 }
        );
    }
}
