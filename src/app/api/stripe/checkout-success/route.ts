// ===============================================
// ClubForge - Checkout Success Handler
// Processes completed Stripe checkout sessions on return
// from payment. This is needed because Standard connected
// accounts don't forward checkout.session.completed events
// to the platform webhook.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    const tenantId = request.nextUrl.searchParams.get('tenant_id');
    const stripeAccountId = request.nextUrl.searchParams.get('account_id');

    console.log('[Checkout-Success] Processing:', { sessionId, tenantId, stripeAccountId });

    // Build redirect URL
    const appDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'clubforgehq.com';
    const protocol = appDomain.includes('localhost') ? 'http' : 'https';

    // Default fallback redirect
    let redirectUrl = `${protocol}://${appDomain}/dashboard?registered=true&payment=success`;

    try {
        if (!sessionId || !stripeAccountId) {
            console.error('[Checkout-Success] Missing session_id or account_id');
            return NextResponse.redirect(new URL(redirectUrl));
        }

        const stripe = getStripeClient();
        if (!stripe) {
            console.error('[Checkout-Success] Stripe not configured');
            return NextResponse.redirect(new URL(redirectUrl));
        }

        // Retrieve the checkout session from the connected account
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription'],
        }, {
            stripeAccount: stripeAccountId,
        });

        console.log('[Checkout-Success] Session retrieved:', {
            status: session.status,
            paymentStatus: session.payment_status,
            subscription: session.subscription ? (typeof session.subscription === 'string' ? session.subscription : session.subscription.id) : null,
            metadata: session.metadata,
        });

        // Only process completed sessions
        if (session.status !== 'complete' || session.payment_status !== 'paid') {
            console.log('[Checkout-Success] Session not complete, skipping DB updates');
            return NextResponse.redirect(new URL(redirectUrl));
        }

        const metadata = session.metadata || {};
        const userId = metadata.user_id;
        const locationId = metadata.location_id;
        const sessionTenantId = metadata.tenant_id || tenantId;
        const membershipTypeId = metadata.membership_type_id;
        const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id || null;

        // Build tenant-specific redirect URL
        if (sessionTenantId) {
            const supabaseAdmin = await createAdminClient();
            const { data: tenant } = await supabaseAdmin
                .from('tenants')
                .select('slug')
                .eq('id', sessionTenantId)
                .single();

            if (tenant?.slug) {
                redirectUrl = `${protocol}://${tenant.slug}.${appDomain}/dashboard?registered=true&payment=success`;
            }
        }

        if (!userId || !locationId || !sessionTenantId) {
            console.error('[Checkout-Success] Missing metadata:', { userId, locationId, sessionTenantId });
            return NextResponse.redirect(new URL(redirectUrl));
        }

        const supabase = await createAdminClient();

        // 1. Ensure tenant_members row exists
        const { data: existingTenantMember } = await supabase
            .from('tenant_members')
            .select('id')
            .eq('user_id', userId)
            .eq('tenant_id', sessionTenantId)
            .single();

        if (!existingTenantMember) {
            const { error: tmError } = await supabase.from('tenant_members').insert({
                user_id: userId,
                tenant_id: sessionTenantId,
                role: 'member',
                is_active: true,
            });
            console.log('[Checkout-Success] Created tenant_members:', tmError ? `ERROR: ${tmError.message}` : 'OK');
        }

        // 2. Set tenant_id on profile
        await supabase
            .from('profiles')
            .update({ tenant_id: sessionTenantId })
            .eq('user_id', userId);

        // 3. Create or activate membership
        const { data: existingMembership } = await supabase
            .from('memberships')
            .select('id')
            .eq('user_id', userId)
            .eq('location_id', locationId)
            .eq('tenant_id', sessionTenantId)
            .single();

        if (existingMembership) {
            // Update existing (pending) membership to active
            const { error: updateError } = await supabase
                .from('memberships')
                .update({
                    status: 'active',
                    stripe_subscription_id: subscriptionId,
                    start_date: new Date().toISOString().split('T')[0],
                })
                .eq('id', existingMembership.id);
            console.log('[Checkout-Success] Membership activated:', updateError ? `ERROR: ${updateError.message}` : existingMembership.id);
        } else {
            // Create new active membership
            const { data: newMembership, error: insertError } = await supabase
                .from('memberships')
                .insert({
                    user_id: userId,
                    location_id: locationId,
                    membership_type_id: membershipTypeId || null,
                    status: 'active',
                    stripe_subscription_id: subscriptionId,
                    start_date: new Date().toISOString().split('T')[0],
                    tenant_id: sessionTenantId,
                })
                .select('id')
                .single();
            console.log('[Checkout-Success] New membership created:', insertError ? `ERROR: ${insertError.message}` : newMembership?.id);
        }

        // 4. Update stripe_customer_id on profile
        if (session.customer) {
            await supabase
                .from('profiles')
                .update({ stripe_customer_id: session.customer as string })
                .eq('user_id', userId);
        }

        console.log('[Checkout-Success] All DB updates complete. Redirecting to dashboard.');
        return NextResponse.redirect(new URL(redirectUrl));
    } catch (error) {
        console.error('[Checkout-Success] ERROR:', error);
        return NextResponse.redirect(new URL(redirectUrl));
    }
}
