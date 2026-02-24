// ===============================================
// ClubForge - Stripe Connect Onboarding API
// Creates a Connect account link for club owners
// ===============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

const stripe = getStripeClient()!;


export async function POST() {
    try {
        // 1. Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get user's tenant (they must be an admin)
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

        // 3. Get tenant
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('id, name, slug, stripe_account_id, contact_email')
            .eq('id', tenantMember.tenant_id)
            .single();

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // 4. Create or retrieve Stripe Connect account
        let accountId = tenant.stripe_account_id;

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'standard',
                email: tenant.contact_email || user.email || undefined,
                business_profile: {
                    name: tenant.name,
                    url: `https://${tenant.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'clubforgehq.com'}`,
                },
                metadata: {
                    tenant_id: tenant.id,
                    tenant_slug: tenant.slug,
                },
            });

            accountId = account.id;

            // Save account ID to tenant
            await adminSupabase
                .from('tenants')
                .update({ stripe_account_id: accountId })
                .eq('id', tenant.id);
        }

        // 5. Create account link for onboarding
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${baseUrl}/admin/settings?tab=payments&connect=refresh`,
            return_url: `${baseUrl}/api/stripe/connect/callback?account_id=${accountId}`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error) {
        console.error('Stripe Connect error:', error);
        const message = error instanceof Error ? error.message : 'Failed to start Stripe Connect';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
