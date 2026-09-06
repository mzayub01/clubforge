// ===============================================
// ClubForge - Member: Stripe customer portal (payment details only)
// POST /api/stripe/member-portal  { userId? }
//
// Lets a member (or a guardian for their child) update card details, see
// invoices and fix a failed payment — WITHOUT being able to cancel, pause or
// change the subscription. Cancellations stay with the club.
//
// Subscriptions live on the club's connected Stripe account, so the portal
// session is created there. A restricted portal configuration is created
// once per club (cached in tenants.settings.stripe_portal_config_id).
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripeClient } from '@/lib/stripe';
import { checkRateLimit } from '@/lib/auth-guard';
import { getTenantId } from '@/lib/tenant';

async function ensurePortalConfiguration(
    stripe: Stripe,
    admin: ReturnType<typeof createAdminClient>,
    tenant: { id: string; name: string; settings: Record<string, unknown> | null; stripe_account_id: string },
    origin: string,
): Promise<string> {
    const opts = { stripeAccount: tenant.stripe_account_id };
    const cached = tenant.settings?.stripe_portal_config_id;
    if (typeof cached === 'string' && cached) {
        try {
            const existing = await stripe.billingPortal.configurations.retrieve(cached, opts);
            if (existing.active) return existing.id;
        } catch { /* fall through and create a fresh one */ }
    }

    const config = await stripe.billingPortal.configurations.create({
        business_profile: {
            headline: `${tenant.name} — manage your payment details`,
            privacy_policy_url: 'https://clubforgehq.com/privacy',
            terms_of_service_url: 'https://clubforgehq.com/terms',
        },
        features: {
            payment_method_update: { enabled: true },
            invoice_history: { enabled: true },
            customer_update: { enabled: true, allowed_updates: ['email', 'address', 'phone'] },
            // Members may NOT cancel, pause or change plans here — the club does that.
            subscription_cancel: { enabled: false },
            subscription_update: { enabled: false },
        },
        default_return_url: `${origin}/dashboard/membership`,
        metadata: { clubforge: 'member_portal', tenant_id: tenant.id },
    }, opts);

    await admin
        .from('tenants')
        .update({ settings: { ...(tenant.settings || {}), stripe_portal_config_id: config.id } })
        .eq('id', tenant.id);

    return config.id;
}

export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'member-portal', 10);
        if (rateLimited) return rateLimited;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const stripe = getStripeClient();
        if (!stripe) return NextResponse.json({ error: 'Payments are not configured' }, { status: 400 });

        const body = (await request.json().catch(() => ({}))) as { userId?: string };
        const targetUserId = body.userId || user.id;

        const admin = createAdminClient();

        // Acting for a child requires the guardian link
        if (targetUserId !== user.id) {
            const { data: me } = await admin.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
            const { data: child } = await admin.from('profiles').select('parent_guardian_id').eq('user_id', targetUserId).maybeSingle();
            if (!me || !child || child.parent_guardian_id !== me.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Club (request context first, then the member's own tenant)
        let tenantId = await getTenantId();
        if (!tenantId) {
            const { data: p } = await admin.from('profiles').select('tenant_id').eq('user_id', targetUserId).maybeSingle();
            tenantId = p?.tenant_id || null;
        }
        if (!tenantId) return NextResponse.json({ error: 'No club context' }, { status: 400 });

        const { data: tenant } = await admin
            .from('tenants')
            .select('id, name, settings, stripe_account_id, stripe_connect_enabled')
            .eq('id', tenantId)
            .maybeSingle();
        if (!tenant?.stripe_account_id || !tenant.stripe_connect_enabled) {
            return NextResponse.json({ error: 'This club does not take card payments online' }, { status: 400 });
        }
        const opts = { stripeAccount: tenant.stripe_account_id };

        // Find the customer via the member's Stripe-backed membership (the customer
        // record lives on the connected account, alongside the subscription).
        const { data: memberships } = await admin
            .from('memberships')
            .select('stripe_subscription_id, status')
            .eq('user_id', targetUserId)
            .eq('tenant_id', tenantId)
            .not('stripe_subscription_id', 'is', null)
            .order('created_at', { ascending: false });

        let customerId: string | null = null;
        for (const m of memberships || []) {
            try {
                const sub = await stripe.subscriptions.retrieve(m.stripe_subscription_id, undefined, opts);
                customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
                break;
            } catch { /* try the next one */ }
        }
        if (!customerId) {
            return NextResponse.json({ error: 'No online subscription found for this membership' }, { status: 404 });
        }

        const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'clubforgehq.com';
        const origin = `https://${host}`;

        const configuration = await ensurePortalConfiguration(stripe, admin, tenant as any, origin);

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            configuration,
            return_url: `${origin}/dashboard/membership`,
        }, opts);

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[member-portal] Error:', error);
        return NextResponse.json({ error: 'Could not open the payment portal right now' }, { status: 500 });
    }
}
