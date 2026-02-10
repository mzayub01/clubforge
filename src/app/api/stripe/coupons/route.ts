import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, getStripeClient } from '@/lib/stripe';

// GET - List all coupons
// Optional query param: ?stripeAccountId=acct_xxx (for connected accounts)
export async function GET(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe is not configured', coupons: [] }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe client not available', coupons: [] }, { status: 400 });
    }

    try {
        const stripeAccountId = request.nextUrl.searchParams.get('stripeAccountId');
        const opts = stripeAccountId ? { stripeAccount: stripeAccountId } : undefined;

        const coupons = await stripe.coupons.list({ limit: 50 }, opts);

        const formattedCoupons = coupons.data.map((coupon) => ({
            id: coupon.id,
            name: coupon.name,
            percent_off: coupon.percent_off,
            amount_off: coupon.amount_off ? coupon.amount_off / 100 : null,
            currency: coupon.currency,
            duration: coupon.duration,
            duration_in_months: coupon.duration_in_months,
            max_redemptions: coupon.max_redemptions,
            times_redeemed: coupon.times_redeemed,
            valid: coupon.valid,
            created: coupon.created,
        }));

        return NextResponse.json({ coupons: formattedCoupons });
    } catch (error: any) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json({ error: error.message, coupons: [] }, { status: 500 });
    }
}

// POST - Create a new coupon
// Optional body field: stripeAccountId (for connected accounts)
export async function POST(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe client not available' }, { status: 400 });
    }

    try {
        const { id, name, percent_off, amount_off, duration, duration_in_months, max_redemptions, stripeAccountId } = await request.json();
        const opts = stripeAccountId ? { stripeAccount: stripeAccountId } : undefined;

        if (!id) {
            return NextResponse.json({ error: 'Coupon code (id) is required' }, { status: 400 });
        }

        const couponParams: any = {
            id: id.toUpperCase().replace(/\s/g, ''),
            name: name || id,
            duration: duration || 'once',
        };

        if (percent_off) {
            couponParams.percent_off = parseFloat(percent_off);
        } else if (amount_off) {
            couponParams.amount_off = Math.round(parseFloat(amount_off) * 100);
            couponParams.currency = 'gbp';
        } else {
            return NextResponse.json({ error: 'Either percent_off or amount_off is required' }, { status: 400 });
        }

        if (duration === 'repeating' && duration_in_months) {
            couponParams.duration_in_months = parseInt(duration_in_months);
        }

        if (max_redemptions) {
            couponParams.max_redemptions = parseInt(max_redemptions);
        }

        console.log('Creating coupon with params:', JSON.stringify(couponParams), stripeAccountId ? `on connected account ${stripeAccountId}` : 'on platform account');
        let coupon;
        try {
            coupon = await stripe.coupons.create(couponParams, opts);
            console.log('Coupon created:', coupon.id);
        } catch (err: any) {
            console.error('Failed to create coupon:', err);
            return NextResponse.json({ error: 'Failed to create coupon: ' + err.message }, { status: 500 });
        }

        // Crucial: Create a Promotion Code for this coupon so it works in Checkout
        // The coupon ID defines the discount, but the Promotion Code is what the user types
        try {
            const promoParams: any = {
                coupon: coupon.id,
                code: id.toUpperCase().replace(/\s/g, ''),
                restrictions: {
                    first_time_transaction: duration === 'once',
                },
            };
            console.log('Creating promotion code with params:', JSON.stringify(promoParams));

            const promotionCode = await stripe.promotionCodes.create(promoParams, opts);
            console.log('Promotion code created:', promotionCode.id);

            return NextResponse.json({
                success: true,
                coupon: {
                    id: coupon.id,
                    name: coupon.name,
                    percent_off: coupon.percent_off,
                    amount_off: coupon.amount_off ? coupon.amount_off / 100 : null,
                    promo_code: promotionCode.code,
                },
            });
        } catch (err: any) {
            console.error('Failed to create promotion code:', err);
            // If promo code creation fails, try to rollback (delete) the coupon to avoid orphans
            try {
                await stripe.coupons.del(coupon.id, opts);
                console.log('Rolled back (deleted) orphan coupon:', coupon.id);
            } catch (delErr) {
                console.error('Failed to rollback coupon:', delErr);
            }
            return NextResponse.json({ error: 'Failed to create promotion code: ' + err.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Unexpected error in promo creation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete a coupon
// Optional body field: stripeAccountId (for connected accounts)
export async function DELETE(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe client not available' }, { status: 400 });
    }

    try {
        const { couponId, stripeAccountId } = await request.json();
        const opts = stripeAccountId ? { stripeAccount: stripeAccountId } : undefined;

        if (!couponId) {
            return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
        }

        await stripe.coupons.del(couponId, opts);

        return NextResponse.json({ success: true, message: 'Coupon deleted' });
    } catch (error: any) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
