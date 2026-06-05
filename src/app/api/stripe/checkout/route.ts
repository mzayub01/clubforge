import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, getStripeClient } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveTenantForUser } from '@/lib/tenant';
import Stripe from 'stripe';
import { rateLimit } from '@/lib/rate-limit';
import { safeErrorResponse } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
    // Rate limit: 10 requests per minute
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { success: allowed } = rateLimit(`stripe-checkout:${ip}`, { maxRequests: 10, windowMs: 60_000 });
    if (!allowed) {
        return NextResponse.json({ error: 'Too many requests', url: null }, { status: 429 });
    }

    // Return a specific JSON response when Stripe is not configured
    if (!isStripeConfigured()) {
        console.log('Stripe checkout: Stripe not configured');
        return NextResponse.json(
            { error: 'Stripe is not configured', url: null },
            { status: 200 }
        );
    }

    const stripe = getStripeClient();
    if (!stripe) {
        console.log('Stripe checkout: Stripe client not available');
        return NextResponse.json(
            { error: 'Stripe client not available', url: null },
            { status: 200 }
        );
    }

    try {
        const body = await request.json();
        const {
            membershipTypeId,
            membershipTypeName,
            price,
            userId,
            locationId,
            locationName,
            userEmail,
        } = body;

        console.log('Stripe checkout: Creating session for membership type', membershipTypeId);

        // Authenticate: the caller must be logged in
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized', url: null }, { status: 401 });
        }

        // Security: the authenticated user must match the userId in the body
        if (user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden: User mismatch', url: null }, { status: 403 });
        }

        const adminSupabase = createAdminClient();
        const { data: membershipType, error: fetchError } = await adminSupabase
            .from('membership_types')
            .select('stripe_price_id')
            .eq('id', membershipTypeId)
            .single();

        if (fetchError) {
            console.error('Stripe checkout: Error fetching membership type:', fetchError.code);
        }



        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clubforgehq.com';

        // Get tenant context from authenticated user's membership
        // userId comes from the request body (the member paying)
        const membership = userId ? await resolveTenantForUser(userId) : null;
        const tenantId = membership?.tenantId;

        // Create or get Stripe customer (required for Stripe Accounts V2)
        let customer;
        try {
            // Check if customer already exists
            const existingCustomers = await stripe.customers.list({
                email: userEmail,
                limit: 1,
            });

            if (existingCustomers.data.length > 0) {
                customer = existingCustomers.data[0];
            } else {
                // Create new customer
                customer = await stripe.customers.create({
                    email: userEmail,
                    metadata: {
                        userId,
                        locationId,
                    },
                });
            }
        } catch (customerError) {
            console.error('Stripe checkout: Error creating customer:', customerError);
            throw customerError;
        }

        // Create Checkout Session
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: customer.id,
            allow_promotion_codes: true, // Enable promo code field at checkout
            metadata: {
                userId,
                locationId,
                membershipTypeId,
                ...(tenantId && { tenantId }),
            },
            success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/checkout/cancel`,
        };

        // Use existing Stripe Price ID if available, otherwise create price data
        if (membershipType?.stripe_price_id) {
            sessionParams.line_items = [{
                price: membershipType.stripe_price_id,
                quantity: 1,
            }];
        } else {
            // Create inline price (for testing or when no Stripe Price ID is set)
            sessionParams.line_items = [{
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: membershipTypeName,
                        description: `${locationName} - Monthly Membership`,
                    },
                    unit_amount: price * 100, // Convert pounds to pence
                    recurring: {
                        interval: 'month',
                    },
                },
                quantity: 1,
            }];
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Failed to create checkout session'), url: null },
            { status: 500 }
        );
    }
}

