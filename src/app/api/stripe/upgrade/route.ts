// ===============================================
// ClubForge - Plan Upgrade Checkout
// Creates a Stripe Portal session for plan changes
// ===============================================

import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
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
            .select('stripe_customer_id, name')
            .eq('id', tenantMember.tenant_id)
            .single();

        if (!tenant?.stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer found. Please contact support.' }, { status: 400 });
        }

        // 4. Create Stripe Customer Portal session (allows plan change + billing management)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clubforgehq.com';
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: tenant.stripe_customer_id,
            return_url: `${baseUrl}/admin/settings`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Upgrade checkout error:', error);
        const message = error instanceof Error ? error.message : 'Failed to open billing portal';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
