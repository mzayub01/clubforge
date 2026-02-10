// ===============================================
// ClubForge - Plan Upgrade / Manage Billing
// Opens Stripe Customer Portal or creates upgrade checkout
// ===============================================

import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/stripe-plans';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

export async function POST() {
    try {
        // 1. Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get user's tenant (must be admin)
        const adminSupabase = await createAdminClient();
        const { data: tenantMember } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id, role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .eq('is_active', true)
            .single();

        if (!tenantMember) {
            return NextResponse.json({ error: 'Not a club admin' }, { status: 403 });
        }

        // 3. Get tenant's Stripe customer ID
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('stripe_customer_id, name, subscription_tier')
            .eq('id', tenantMember.tenant_id)
            .single();

        if (!tenant?.stripe_customer_id) {
            return NextResponse.json({ error: 'No billing account found. Please contact support.' }, { status: 400 });
        }

        // 4. Check if there's an active subscription
        const subscriptions = await stripe.subscriptions.list({
            customer: tenant.stripe_customer_id,
            status: 'all',
            limit: 1,
        });

        const currentSub = subscriptions.data[0];
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clubforgehq.com';

        // 5. If currently trialing or no active payment method, create a checkout session
        //    to let them provide payment and activate immediately
        if (!currentSub || currentSub.status === 'trialing' || currentSub.status === 'incomplete') {
            // Determine the target plan (upgrade to next tier)
            const currentTier = tenant.subscription_tier || 'starter';
            const tierOrder = ['starter', 'pro', 'elite'];
            const currentIndex = tierOrder.indexOf(currentTier);
            const nextTier = currentIndex < 2 ? tierOrder[currentIndex + 1] : currentTier;
            const plan = PLANS[nextTier];

            if (!plan || !plan.stripePriceMonthly || !plan.stripePriceMonthly.startsWith('price_')) {
                return NextResponse.json({ error: 'Plan not configured. Please contact support.' }, { status: 400 });
            }

            // If trialing, cancel the trial subscription first so checkout creates a new one
            if (currentSub && currentSub.status === 'trialing') {
                await stripe.subscriptions.cancel(currentSub.id);
            }

            // Create checkout session for immediate activation (no trial)
            const checkoutSession = await stripe.checkout.sessions.create({
                customer: tenant.stripe_customer_id,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: plan.stripePriceMonthly, quantity: 1 }],
                subscription_data: {
                    metadata: {
                        tenant_id: tenantMember.tenant_id,
                        plan: nextTier,
                    },
                },
                success_url: `${baseUrl}/admin/settings?upgraded=true`,
                cancel_url: `${baseUrl}/admin/settings`,
                metadata: {
                    tenant_id: tenantMember.tenant_id,
                    type: 'plan_upgrade',
                },
            });

            return NextResponse.json({ url: checkoutSession.url });
        }

        // 6. For active subscriptions, open Stripe Customer Portal (plan change, billing, cancel)
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: tenant.stripe_customer_id,
            return_url: `${baseUrl}/admin/settings`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Upgrade/billing error:', error);
        const message = error instanceof Error ? error.message : 'Failed to open billing portal';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
