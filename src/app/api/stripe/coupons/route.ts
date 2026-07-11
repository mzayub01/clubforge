import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, getStripeClient } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTenantId } from '@/lib/tenant';
import { requireAdmin, checkRateLimit } from '@/lib/auth-guard';

/**
 * Resolves who may manage coupons and on which Stripe account.
 *
 * - On a tenant domain: caller must be that tenant's admin (or a platform
 *   admin); coupons act on the tenant's CONNECTED account, resolved
 *   server-side from the tenants table. The client never supplies the
 *   account id — previously this endpoint was unauthenticated and acted on
 *   whatever stripeAccountId the request named.
 * - On the platform domain (no tenant context): platform admins only;
 *   coupons act on the platform account.
 */
async function resolveCouponContext(): Promise<
    | { error: string; status: number; stripeAccount?: undefined }
    | { stripeAccount: string | undefined; error?: undefined }
> {
    const headerTenantId = await getTenantId();

    if (headerTenantId) {
        const auth = await requireAdmin();
        if (auth.error) return { error: auth.error, status: auth.status };

        const adminSupabase = createAdminClient();
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('stripe_account_id, stripe_connect_enabled')
            .eq('id', auth.tenantId)
            .single();

        if (!tenant?.stripe_account_id || !tenant.stripe_connect_enabled) {
            return { error: 'Club has not completed Stripe setup', status: 400 };
        }
        return { stripeAccount: tenant.stripe_account_id };
    }

    // Platform domain — platform admins manage platform-account coupons
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized', status: 401 };

    const adminSupabase = createAdminClient();
    const { data: platformAdmin } = await adminSupabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!platformAdmin) return { error: 'Forbidden', status: 403 };
    return { stripeAccount: undefined };
}

// GET - List all coupons
export async function GET(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe is not configured', coupons: [] }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe client not available', coupons: [] }, { status: 400 });
    }

    const rateLimited = checkRateLimit(request, 'coupons-get', 30);
    if (rateLimited) return rateLimited;

    const ctx = await resolveCouponContext();
    if (ctx.error) {
        return NextResponse.json({ error: ctx.error, coupons: [] }, { status: ctx.status });
    }
    const opts = ctx.stripeAccount ? { stripeAccount: ctx.stripeAccount } : undefined;

    try {
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

// POST - Create a new coupon (+ matching promotion code)
export async function POST(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe client not available' }, { status: 400 });
    }

    const rateLimited = checkRateLimit(request, 'coupons-write', 10);
    if (rateLimited) return rateLimited;

    const ctx = await resolveCouponContext();
    if (ctx.error) {
        return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const opts = ctx.stripeAccount ? { stripeAccount: ctx.stripeAccount } : undefined;

    try {
        const { id, name, percent_off, amount_off, duration, duration_in_months, max_redemptions } = await request.json();

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

        console.log('Creating coupon with params:', JSON.stringify(couponParams), ctx.stripeAccount ? `on connected account ${ctx.stripeAccount}` : 'on platform account');
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
export async function DELETE(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe client not available' }, { status: 400 });
    }

    const rateLimited = checkRateLimit(request, 'coupons-write', 10);
    if (rateLimited) return rateLimited;

    const ctx = await resolveCouponContext();
    if (ctx.error) {
        return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const opts = ctx.stripeAccount ? { stripeAccount: ctx.stripeAccount } : undefined;

    try {
        const { couponId } = await request.json();

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
