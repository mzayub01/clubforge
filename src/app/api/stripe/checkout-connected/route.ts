// ===============================================
// ClubForge - Connected Stripe Checkout
// Creates checkout sessions on club's connected Stripe account
// with 2.5% platform fee
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

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
        } = body;

        if (!tenantId || !price || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get tenant's connected Stripe account
        const adminSupabase = await createAdminClient();
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('stripe_account_id, stripe_connect_enabled, name')
            .eq('id', tenantId)
            .single();

        if (!tenant?.stripe_account_id || !tenant.stripe_connect_enabled) {
            return NextResponse.json({ error: 'Club has not completed Stripe setup' }, { status: 400 });
        }

        // Calculate platform fee (2.5%)
        const priceInPence = Math.round(price * 100);
        const platformFee = Math.round(priceInPence * (PLATFORM_FEE_PERCENT / 100));

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
                },
            },
            success_url: `${baseUrl}/dashboard?registered=true&payment=success`,
            cancel_url: `${baseUrl}/register?payment=cancelled`,
            metadata: {
                user_id: userId,
                location_id: locationId,
                tenant_id: tenantId,
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
