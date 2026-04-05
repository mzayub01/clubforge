import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, getStripeClient } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
    // Rate limit: 5 per minute
    const rateLimited = checkRateLimit(request, 'stripe-refund', 5);
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
        const { paymentIntentId, chargeId, amount, reason } = await request.json();

        if (!paymentIntentId && !chargeId) {
            return NextResponse.json(
                { error: 'Payment intent ID or charge ID is required' },
                { status: 400 }
            );
        }

        console.log('Processing refund for tenant:', auth.tenantId);

        // Create refund params
        const refundParams: any = {
            reason: reason || 'requested_by_customer',
        };

        if (paymentIntentId) {
            refundParams.payment_intent = paymentIntentId;
        } else if (chargeId) {
            refundParams.charge = chargeId;
        }

        // If specific amount provided, use it (in pence/cents)
        if (amount && amount > 0) {
            refundParams.amount = Math.round(amount * 100);
        }

        // Create the refund in Stripe
        const refund = await stripe.refunds.create(refundParams);

        return NextResponse.json({
            success: true,
            message: 'Refund processed successfully',
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                currency: refund.currency,
            },
        });
    } catch (error) {
        console.error('Error processing refund:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Failed to process refund') },
            { status: 500 }
        );
    }
}
