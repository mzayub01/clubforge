// ===============================================
// ClubForge - Connected Stripe Checkout
// Creates checkout sessions on club's connected Stripe account
// with 2.5% platform fee
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';
import { checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';

const PLATFORM_FEE_PERCENT = 2.5;

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 requests per minute
        const rateLimited = checkRateLimit(request, 'checkout-connected', 10);
        if (rateLimited) return rateLimited;

        // Authenticate: the caller must be logged in
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[Checkout-Connected] Auth failed:', authError?.message);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stripe = getStripeClient();
        if (!stripe) {
            console.error('[Checkout-Connected] Stripe not configured');
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
        }

        const body = await request.json();
        const {
            membershipTypeName,
            price,
            userId,
            locationId,
            locationName,
            userEmail,
            tenantId,
            membershipTypeId,
            cancelPath,
        } = body;

        // Trim membership type name — some tenants have names with trailing whitespace
        const trimmedMembershipTypeName = (membershipTypeName || 'Membership').trim();

        console.log('[Checkout-Connected] Request received:', {
            tenantId,
            userId,
            price,
            membershipTypeName,
            locationId,
            userEmail,
        });

        if (!tenantId || price === undefined || price === null || !userId) {
            console.error('[Checkout-Connected] Missing required fields:', { tenantId, price, userId });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Security: the authenticated user must match the userId in the body
        if (user.id !== userId) {
            console.error('[Checkout-Connected] User mismatch:', { authUserId: user.id, bodyUserId: userId });
            return NextResponse.json({ error: 'Forbidden: User mismatch' }, { status: 403 });
        }

        // Get tenant's connected Stripe account
        const adminSupabase = await createAdminClient();
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('stripe_account_id, stripe_connect_enabled, name, slug, custom_domain')
            .eq('id', tenantId)
            .single();

        console.log('[Checkout-Connected] Tenant lookup:', {
            found: !!tenant,
            stripeAccountId: tenant?.stripe_account_id,
            stripeConnectEnabled: tenant?.stripe_connect_enabled,
            slug: tenant?.slug,
        });

        if (!tenant?.stripe_account_id || !tenant.stripe_connect_enabled) {
            console.error('[Checkout-Connected] Club Stripe not ready:', {
                hasAccountId: !!tenant?.stripe_account_id,
                connectEnabled: tenant?.stripe_connect_enabled,
            });
            return NextResponse.json({ error: 'Club has not completed Stripe setup' }, { status: 400 });
        }

        // NOTE: Membership creation is handled by the checkout-success handler
        // when the user returns from Stripe. We use this instead of webhooks
        // because Standard connected accounts don't forward checkout.session.completed
        // events to the platform webhook.

        // Calculate platform fee (2.5%)
        const priceInPence = Math.round(price * 100);

        // Build success URL that routes through our checkout-success handler
        // which processes the payment and creates DB records before redirecting to dashboard
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://clubforgehq.com`;
        const appDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'clubforgehq.com';
        const protocol = appDomain.includes('localhost') ? 'http' : 'https';
        // Use custom domain if available, otherwise subdomain
        const tenantBaseUrl = tenant.custom_domain
            ? `https://${tenant.custom_domain}`
            : `${protocol}://${tenant.slug}.${appDomain}`;

        // Use {CHECKOUT_SESSION_ID} template — Stripe replaces this with the actual session ID
        const successUrl = `${appUrl}/api/stripe/checkout-success?session_id={CHECKOUT_SESSION_ID}&tenant_id=${tenantId}&account_id=${tenant.stripe_account_id}`;

        console.log('[Checkout-Connected] Creating Stripe session:', {
            priceInPence,
            stripeAccount: tenant.stripe_account_id,
            successUrl,
        });

        // Create checkout session on the connected account
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            allow_promotion_codes: true,
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: trimmedMembershipTypeName,
                            description: `${tenant.name} — ${locationName || 'Membership'}`,
                        },
                        unit_amount: priceInPence,
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            payment_intent_data: undefined,
            subscription_data: {
                application_fee_percent: PLATFORM_FEE_PERCENT,
                metadata: {
                    user_id: userId,
                    location_id: locationId,
                    tenant_id: tenantId,
                    membership_type_id: membershipTypeId || '',
                },
            },
            success_url: successUrl,
            cancel_url: `${tenantBaseUrl}${cancelPath || '/register?payment=cancelled'}`,
            metadata: {
                user_id: userId,
                location_id: locationId,
                tenant_id: tenantId,
                membership_type_id: membershipTypeId || '',
                membership_type_name: trimmedMembershipTypeName,
            },
        }, {
            stripeAccount: tenant.stripe_account_id,
        });

        console.log('[Checkout-Connected] Session created successfully:', { sessionId: session.id, url: !!session.url });
        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[Checkout-Connected] ERROR:', error);
        const message = error instanceof Error ? error.message : 'Checkout failed';
        return NextResponse.json({ error: safeErrorResponse(error, 'Checkout failed'), details: message }, { status: 500 });
    }
}
