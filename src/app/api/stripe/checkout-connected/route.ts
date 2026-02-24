// ===============================================
// ClubForge - Connected Stripe Checkout
// Creates checkout sessions on club's connected Stripe account
// with 2.5% platform fee
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

const stripe = getStripeClient()!;


const PLATFORM_FEE_PERCENT = 2.5;

export async function POST(request: NextRequest) {
    try {
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
        } = body;

        if (!tenantId || !price || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get tenant's connected Stripe account
        const adminSupabase = await createAdminClient();
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('stripe_account_id, stripe_connect_enabled, name, slug')
            .eq('id', tenantId)
            .single();

        if (!tenant?.stripe_account_id || !tenant.stripe_connect_enabled) {
            return NextResponse.json({ error: 'Club has not completed Stripe setup' }, { status: 400 });
        }

        // Create pending membership BEFORE redirecting to Stripe
        // This ensures the dashboard doesn't show "Complete Your Membership" if the webhook is slow
        if (userId && locationId) {
            // Ensure user is a tenant member (required for RLS policies)
            const { data: existingTenantMember } = await adminSupabase
                .from('tenant_members')
                .select('id')
                .eq('user_id', userId)
                .eq('tenant_id', tenantId)
                .single();

            if (!existingTenantMember) {
                await adminSupabase.from('tenant_members').insert({
                    user_id: userId,
                    tenant_id: tenantId,
                    role: 'member',
                    is_active: true,
                });
            }

            // Also set tenant_id on the user's profile
            await adminSupabase
                .from('profiles')
                .update({ tenant_id: tenantId })
                .eq('user_id', userId);

            const { data: existingMembership } = await adminSupabase
                .from('memberships')
                .select('id')
                .eq('user_id', userId)
                .eq('location_id', locationId)
                .eq('tenant_id', tenantId)
                .single();

            if (!existingMembership) {
                await adminSupabase.from('memberships').insert({
                    user_id: userId,
                    location_id: locationId,
                    membership_type_id: membershipTypeId || null,
                    status: 'pending',
                    start_date: new Date().toISOString().split('T')[0],
                    tenant_id: tenantId,
                });
            }
        }

        // Calculate platform fee (2.5%)
        const priceInPence = Math.round(price * 100);

        // Build success URL using the tenant's subdomain so the member returns to THEIR club dashboard
        const appDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'clubforgehq.com';
        const protocol = appDomain.includes('localhost') ? 'http' : 'https';
        const tenantBaseUrl = `${protocol}://${tenant.slug}.${appDomain}`;
        const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create checkout session on the connected account
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            allow_promotion_codes: true,
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: membershipTypeName || 'Membership',
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
            success_url: `${tenantBaseUrl}/dashboard?registered=true&payment=success`,
            cancel_url: `${tenantBaseUrl}/register?payment=cancelled`,
            metadata: {
                user_id: userId,
                location_id: locationId,
                tenant_id: tenantId,
                membership_type_id: membershipTypeId || '',
                membership_type_name: membershipTypeName,
            },
        }, {
            stripeAccount: tenant.stripe_account_id,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Connected checkout error:', error);
        const message = error instanceof Error ? error.message : 'Checkout failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

