// ===============================================
// ClubForge - Connected Account Stripe Webhook
// Handles events from club's connected Stripe accounts
// (e.g. checkout.session.completed for member payments)
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';
import Stripe from 'stripe';

const stripe = getStripeClient()!;


export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // Use the Connect webhook secret (separate from platform webhook secret)
        const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('[Connect Webhook] Signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Only process events from connected accounts
    const connectedAccountId = (event as any).account;
    console.log(`[Connect Webhook] Event: ${event.type}, Account: ${connectedAccountId || 'platform'}`);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        // Extract metadata (snake_case format from checkout-connected)
        const userId = metadata.user_id;
        const locationId = metadata.location_id;
        const tenantId = metadata.tenant_id;
        const membershipTypeId = metadata.membership_type_id;

        console.log('[Connect Webhook] Checkout completed:', {
            userId, locationId, tenantId, membershipTypeId,
            subscription: session.subscription,
        });

        if (userId && locationId && tenantId) {
            const supabase = await createAdminClient();

            // Ensure tenant_members row exists (safety net for legacy registrations)
            const { data: existingTenantMember } = await supabase
                .from('tenant_members')
                .select('id')
                .eq('user_id', userId)
                .eq('tenant_id', tenantId)
                .single();

            if (!existingTenantMember) {
                await supabase.from('tenant_members').insert({
                    user_id: userId,
                    tenant_id: tenantId,
                    role: 'member',
                    is_active: true,
                });
                console.log('[Connect Webhook] Created tenant_members row for:', userId);
            }

            // Set tenant_id on profile
            await supabase
                .from('profiles')
                .update({ tenant_id: tenantId })
                .eq('user_id', userId);

            // Check if membership already exists (idempotency guard)
            const { data: existingMembership } = await supabase
                .from('memberships')
                .select('id')
                .eq('user_id', userId)
                .eq('location_id', locationId)
                .eq('tenant_id', tenantId)
                .single();

            if (existingMembership) {
                // Update existing (pending) membership to active
                await supabase
                    .from('memberships')
                    .update({
                        status: 'active',
                        stripe_subscription_id: session.subscription as string,
                        start_date: new Date().toISOString().split('T')[0],
                    })
                    .eq('id', existingMembership.id);
                console.log('[Connect Webhook] Membership activated:', existingMembership.id);
            } else {
                // Create new active membership (fallback if pending wasn't created)
                const { data: newMembership } = await supabase
                    .from('memberships')
                    .insert({
                        user_id: userId,
                        location_id: locationId,
                        membership_type_id: membershipTypeId || null,
                        status: 'active',
                        stripe_subscription_id: session.subscription as string,
                        start_date: new Date().toISOString().split('T')[0],
                        tenant_id: tenantId,
                    })
                    .select('id')
                    .single();
                console.log('[Connect Webhook] New active membership created:', newMembership?.id);
            }

            // Update user's stripe_customer_id in profile
            if (session.customer) {
                await supabase
                    .from('profiles')
                    .update({ stripe_customer_id: session.customer as string })
                    .eq('user_id', userId);
            }
        }
    }

    // Handle subscription cancellation on connected account
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const supabase = await createAdminClient();

        await supabase
            .from('memberships')
            .update({ status: 'cancelled', end_date: new Date().toISOString().slice(0, 10) })
            .eq('stripe_subscription_id', subscription.id);

        console.log('[Connect Webhook] Subscription cancelled:', subscription.id);
    }

    // Keep end_date in step when a cancellation is scheduled / unscheduled
    // (from our admin UI or directly in the club's Stripe dashboard)
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const previous = (event.data.previous_attributes || {}) as Partial<Stripe.Subscription>;

        if ('cancel_at_period_end' in previous && subscription.status === 'active') {
            const supabase = await createAdminClient();
            // Period end moved from the subscription to its items in newer Stripe API versions
            const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
                ?? (subscription.items?.data?.[0] as unknown as { current_period_end?: number } | undefined)?.current_period_end
                ?? null;
            const endDate = subscription.cancel_at_period_end && periodEnd
                ? new Date(periodEnd * 1000).toISOString().slice(0, 10)
                : null;
            await supabase
                .from('memberships')
                .update({ end_date: endDate })
                .eq('stripe_subscription_id', subscription.id)
                .eq('status', 'active');
            console.log('[Connect Webhook] Subscription renewal', subscription.cancel_at_period_end ? 'stopped' : 'resumed', subscription.id);
        }
    }

    // Handle subscription past_due on connected account
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.status === 'past_due') {
            const supabase = await createAdminClient();

            await supabase
                .from('memberships')
                .update({ status: 'pending' })
                .eq('stripe_subscription_id', subscription.id);

            console.log('[Connect Webhook] Subscription past due:', subscription.id);
        }
    }

    return NextResponse.json({ received: true });
}
