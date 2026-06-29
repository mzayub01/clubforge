import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, getStripeClient } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import {
    renderMembershipActivatedEmail,
    renderEventConfirmationEmail,
    renderPaymentFailedEmail,
    renderWelcomeEmail,
    renderSubscriptionActivatedEmail,
    renderPlanUpgradeEmail,
} from '@/lib/email-templates';
import { renderEmailFromDatabase, getTenantBranding } from '@/lib/email-templates-db';
import { PLANS } from '@/lib/stripe-plans';
import Stripe from 'stripe';

// Feature highlights per tier (for email templates)
const TIER_FEATURE_HIGHLIGHTS: Record<string, string[]> = {
    starter: [
        'Up to 150 members',
        'Class scheduling & attendance',
        'Belt progression tracking',
        'Stripe member billing',
        'Announcements',
    ],
    pro: [
        'Up to 750 members',
        'Up to 3 locations',
        'Events & ticketing',
        'Video library',
        'Email templates',
        'Promo codes',
        'Advanced reports & CSV export',
        'Grading feedback',
    ],
    elite: [
        'Unlimited members & locations',
        'Custom domain',
        'White-label branding',
        'API access & webhooks',
        'Automation workflows',
        'Priority support & SLA',
    ],
};

// Features unlocked when upgrading between tiers
const UPGRADE_FEATURES: Record<string, string[]> = {
    'starter_to_pro': [
        'Up to 750 members (from 150)',
        'Up to 3 locations',
        'Events & ticketing',
        'Video library',
        'Email templates',
        'Promo codes',
        'Advanced reports & CSV export',
        'Grading feedback',
    ],
    'starter_to_elite': [
        'Unlimited members & locations',
        'Everything in Pro',
        'Custom domain',
        'White-label branding',
        'API access & webhooks',
        'Automation workflows',
        'Priority support & SLA',
    ],
    'pro_to_elite': [
        'Unlimited members (from 750)',
        'Unlimited locations (from 3)',
        'Custom domain',
        'White-label branding',
        'API access & webhooks',
        'Automation workflows',
        'Priority support & SLA',
    ],
};

export async function POST(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ received: true });
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json({ received: true });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        // Check if this is an event payment
        if (metadata.type === 'event') {
            const { eventId, userId, userName, userEmail, userPhone, tenantId } = metadata;

            console.log('Processing event payment for event:', eventId);

            const supabase = await createAdminClient();

            // Check if RSVP already exists (to prevent duplicates)
            const { data: existingRsvp } = await supabase
                .from('event_rsvps')
                .select('id')
                .eq('event_id', eventId)
                .eq('email', userEmail)
                .single();

            if (!existingRsvp) {
                // Create the RSVP as paid and confirmed
                const { error: rsvpError } = await supabase.from('event_rsvps').insert({
                    event_id: eventId,
                    user_id: userId !== 'guest' ? userId : null,
                    full_name: userName,
                    email: userEmail,
                    phone: userPhone || null,
                    status: 'confirmed',
                    payment_status: 'paid',
                    stripe_payment_id: session.payment_intent as string,
                    ...(tenantId && { tenant_id: tenantId }),
                });

                if (rsvpError) {
                    console.error('Error creating event RSVP:', rsvpError);
                } else {
                    console.log('Event RSVP created successfully for:', userEmail);
                }
            } else {
                // Update existing RSVP to paid
                await supabase
                    .from('event_rsvps')
                    .update({
                        status: 'confirmed',
                        payment_status: 'paid',
                        stripe_payment_id: session.payment_intent as string,
                    })
                    .eq('id', existingRsvp.id);
                console.log('Existing RSVP updated to paid for:', userEmail);
            }

            // Send event confirmation email
            try {
                const { data: eventData } = await supabase
                    .from('events')
                    .select('title, event_date, location, price')
                    .eq('id', eventId)
                    .single();

                if (eventData && userEmail) {
                    const eventDate = new Date(eventData.event_date);
                    const firstName = userName?.split(' ')[0] || 'Guest';
                    const formattedDate = eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                    const formattedTime = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                    const formattedPrice = eventData.price ? `£${eventData.price}` : 'Free';

                    // Try DB template with tenant branding first
                    const branding = tenantId ? await getTenantBranding(tenantId) : null;
                    const dbEmail = await renderEmailFromDatabase('event_confirmation', {
                        firstName,
                        eventTitle: eventData.title,
                        eventDate: formattedDate,
                        eventTime: formattedTime,
                        eventLocation: eventData.location || 'TBC',
                        amountPaid: formattedPrice,
                    }, tenantId || undefined, branding || undefined);

                    let html: string;
                    let subject: string;

                    if (dbEmail) {
                        html = dbEmail.html;
                        subject = dbEmail.subject;
                    } else {
                        html = renderEventConfirmationEmail({
                            firstName,
                            eventTitle: eventData.title,
                            eventDate: formattedDate,
                            eventTime: formattedTime,
                            eventLocation: eventData.location || 'TBC',
                            amountPaid: formattedPrice,
                        });
                        subject = `Booking Confirmed: ${eventData.title}`;
                    }

                    const fromName = branding?.name || 'ClubForge';
                    await sendEmail({
                        to: userEmail,
                        subject,
                        html,
                        from: `${fromName} <noreply@clubforgehq.com>`,
                        replyTo: branding?.contactEmail,
                    });
                    console.log('Event confirmation email sent to:', userEmail);
                }
            } catch (emailErr) {
                console.error('Failed to send event confirmation email:', emailErr);
            }
        } else if (metadata.type === 'platform_subscription') {
            // Platform subscription payment (club owner subscribing to ClubForge)
            const { tenant_id } = metadata;
            console.log('[Webhook] Platform subscription checkout completed for tenant:', tenant_id);

            if (tenant_id) {
                const supabase = await createAdminClient();
                await supabase
                    .from('tenants')
                    .update({
                        subscription_status: 'active',
                        stripe_subscription_id: session.subscription as string,
                    })
                    .eq('id', tenant_id);
                console.log('[Webhook] Tenant subscription activated:', tenant_id);

                // Send subscription activated email to tenant owner
                try {
                    const { data: tenant } = await supabase
                        .from('tenants')
                        .select('name, owner_user_id, subscription_tier, trial_ends_at')
                        .eq('id', tenant_id)
                        .single();

                    if (tenant?.owner_user_id) {
                        const { data: ownerProfile } = await supabase
                            .from('profiles')
                            .select('first_name, email')
                            .eq('user_id', tenant.owner_user_id)
                            .single();

                        if (ownerProfile?.email) {
                            const tier = tenant.subscription_tier || 'starter';
                            const plan = PLANS[tier];
                            const trialEndDate = tenant.trial_ends_at
                                ? new Date(tenant.trial_ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                                : '14 days from now';

                            const html = renderSubscriptionActivatedEmail({
                                firstName: ownerProfile.first_name || 'there',
                                clubName: tenant.name,
                                planName: plan?.name || tier.charAt(0).toUpperCase() + tier.slice(1),
                                price: plan ? `${plan.monthlyPriceDisplay}/month` : `£39/month`,
                                trialEndDate,
                                features: TIER_FEATURE_HIGHLIGHTS[tier] || TIER_FEATURE_HIGHLIGHTS.starter,
                            });

                            await sendEmail({
                                to: ownerProfile.email,
                                subject: `Welcome to ClubForge — Your ${plan?.name || 'Starter'} Plan is Active!`,
                                html,
                            });
                            console.log('[Webhook] Subscription activated email sent to:', ownerProfile.email);
                        }
                    }
                } catch (emailErr) {
                    console.error('[Webhook] Failed to send subscription activated email:', emailErr);
                }
            }
        } else if (metadata.type === 'plan_upgrade') {
            // Plan upgrade (club owner upgrading their plan)
            const { tenant_id } = metadata;
            console.log('[Webhook] Plan upgrade checkout completed for tenant:', tenant_id);

            if (tenant_id) {
                const supabase = await createAdminClient();

                // Get previous tier before updating
                const { data: currentTenant } = await supabase
                    .from('tenants')
                    .select('name, owner_user_id, subscription_tier')
                    .eq('id', tenant_id)
                    .single();

                const previousTier = currentTenant?.subscription_tier || 'starter';

                // Get the subscription to find the plan from its metadata
                const subscriptionId = session.subscription as string;
                let newTier: string | null = null;

                if (subscriptionId) {
                    const stripeClient = getStripeClient();
                    const subscription = await stripeClient!.subscriptions.retrieve(subscriptionId);
                    newTier = subscription.metadata?.plan || null;

                    const updateData: Record<string, any> = {
                        subscription_status: 'active',
                        stripe_subscription_id: subscriptionId,
                    };

                    if (newTier) {
                        updateData.subscription_tier = newTier;
                    }

                    await supabase
                        .from('tenants')
                        .update(updateData)
                        .eq('id', tenant_id);

                    console.log('[Webhook] Tenant plan upgraded to:', newTier, 'for tenant:', tenant_id);
                }

                // Send plan upgrade email to tenant owner
                if (currentTenant?.owner_user_id && newTier && newTier !== previousTier) {
                    try {
                        const { data: ownerProfile } = await supabase
                            .from('profiles')
                            .select('first_name, email')
                            .eq('user_id', currentTenant.owner_user_id)
                            .single();

                        if (ownerProfile?.email) {
                            const newPlan = PLANS[newTier];
                            const prevPlanName = previousTier.charAt(0).toUpperCase() + previousTier.slice(1);
                            const newPlanName = newPlan?.name || newTier.charAt(0).toUpperCase() + newTier.slice(1);
                            const upgradeKey = `${previousTier}_to_${newTier}`;

                            const html = renderPlanUpgradeEmail({
                                firstName: ownerProfile.first_name || 'there',
                                clubName: currentTenant.name,
                                previousPlan: prevPlanName,
                                newPlan: newPlanName,
                                newPrice: newPlan ? `${newPlan.monthlyPriceDisplay}/month` : '',
                                newFeatures: UPGRADE_FEATURES[upgradeKey] || TIER_FEATURE_HIGHLIGHTS[newTier] || [],
                            });

                            await sendEmail({
                                to: ownerProfile.email,
                                subject: `Plan Upgraded to ${newPlanName} — ${currentTenant.name}`,
                                html,
                            });
                            console.log('[Webhook] Plan upgrade email sent to:', ownerProfile.email);
                        }
                    } catch (emailErr) {
                        console.error('[Webhook] Failed to send plan upgrade email:', emailErr);
                    }
                }
            }
        } else {
            // Membership payment (existing logic)
            const { userId, locationId, membershipTypeId, tenantId: membershipTenantId } = metadata;

            if (userId && locationId) {
                const supabase = await createAdminClient();

                // Check if membership already exists
                const { data: existingMembership } = await supabase
                    .from('memberships')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('location_id', locationId)
                    .single();

                if (existingMembership) {
                    // Update existing membership to active
                    await supabase
                        .from('memberships')
                        .update({
                            status: 'active',
                            stripe_subscription_id: session.subscription as string,
                            start_date: new Date().toISOString().split('T')[0],
                        })
                        .eq('id', existingMembership.id);
                } else {
                    // Create new membership as active
                    await supabase
                        .from('memberships')
                        .insert({
                            user_id: userId,
                            location_id: locationId,
                            membership_type_id: membershipTypeId || null,
                            status: 'active',
                            stripe_subscription_id: session.subscription as string,
                            start_date: new Date().toISOString().split('T')[0],
                            ...(membershipTenantId && { tenant_id: membershipTenantId }),
                        });
                }

                // Update user's stripe_customer_id in profile
                await supabase
                    .from('profiles')
                    .update({ stripe_customer_id: session.customer as string })
                    .eq('user_id', userId);

                // Send membership activation email
                try {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('first_name, email')
                        .eq('user_id', userId)
                        .single();

                    const { data: locationData } = await supabase
                        .from('locations')
                        .select('name')
                        .eq('id', locationId)
                        .single();

                    const { data: membershipTypeData } = await supabase
                        .from('membership_types')
                        .select('name, price')
                        .eq('id', membershipTypeId)
                        .single();

                    if (profileData?.email) {
                        const firstName = profileData.first_name || 'Member';
                        const locationName = locationData?.name || 'the club';
                        const membershipType = membershipTypeData?.name || 'Membership';
                        const price = membershipTypeData?.price ? `£${membershipTypeData.price}/month` : 'N/A';
                        const startDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

                        // Try DB template with tenant branding first
                        const branding = membershipTenantId ? await getTenantBranding(membershipTenantId) : null;
                        const dbEmail = await renderEmailFromDatabase('membership_activated', {
                            firstName,
                            locationName,
                            membershipType,
                            price,
                            startDate,
                        }, membershipTenantId || undefined, branding || undefined);

                        let html: string;
                        let subject: string;

                        if (dbEmail) {
                            html = dbEmail.html;
                            subject = dbEmail.subject;
                        } else {
                            html = renderMembershipActivatedEmail({
                                firstName,
                                locationName,
                                membershipType,
                                price,
                                startDate,
                            });
                            subject = `Your ${branding?.name || 'ClubForge'} Membership is Now Active!`;
                        }

                        const fromName = branding?.name || 'ClubForge';
                        await sendEmail({
                            to: profileData.email,
                            subject,
                            html,
                            from: `${fromName} <noreply@clubforgehq.com>`,
                            replyTo: branding?.contactEmail,
                        });
                        console.log('Membership activation email sent to:', profileData.email);
                    }
                } catch (emailErr) {
                    console.error('Failed to send membership activation email:', emailErr);
                }
            }
        }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;

        const supabase = await createAdminClient();

        // Mark membership as cancelled
        await supabase
            .from('memberships')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id);
    }

    // Handle failed payment
    if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceWithSub = invoice as any; // Cast for subscription access

        console.log('Payment failed for invoice:', invoice.id, 'Customer:', invoice.customer);

        // Get customer email from invoice
        const customerEmail = invoice.customer_email;
        const attemptCount = invoice.attempt_count || 1;
        const subscriptionId = invoiceWithSub.subscription;

        if (subscriptionId) {
            const supabase = await createAdminClient();

            // If this is a recurring payment failure (not first charge), consider updating status
            if (attemptCount >= 3) {
                // After 3 failed attempts, mark as payment_failed
                await supabase
                    .from('memberships')
                    .update({ status: 'payment_failed' })
                    .eq('stripe_subscription_id', String(subscriptionId));

                console.log('Membership marked as payment_failed after', attemptCount, 'attempts');
            } else {
                console.log('Payment attempt', attemptCount, 'failed for subscription:', subscriptionId);
            }

            // Send payment failed notification email
            if (customerEmail) {
                try {
                    // Get membership details (don't join profiles — no FK)
                    const { data: membershipData } = await supabase
                        .from('memberships')
                        .select('user_id, tenant_id, membership_type:membership_types(name)')
                        .eq('stripe_subscription_id', String(subscriptionId))
                        .single();

                    const membershipTypeName = (membershipData?.membership_type as unknown as { name: string } | null)?.name || 'Membership';
                    const memberTenantId = membershipData?.tenant_id;

                    // Fetch profile separately
                    let firstName = 'Member';
                    if (membershipData?.user_id) {
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('first_name')
                            .eq('user_id', membershipData.user_id)
                            .single();
                        firstName = profileData?.first_name || 'Member';
                    }

                    const amountDue = `£${((invoice.amount_due || 0) / 100).toFixed(2)}`;
                    const nextAttemptDate = invoice.next_payment_attempt
                        ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : undefined;

                    // Try DB template with tenant branding first
                    const branding = memberTenantId ? await getTenantBranding(memberTenantId) : null;
                    const dbEmail = await renderEmailFromDatabase('payment_failed', {
                        firstName,
                        membershipType: membershipTypeName,
                        amountDue,
                        attemptCount: String(attemptCount),
                        ...(nextAttemptDate && { nextAttemptDate }),
                    }, memberTenantId || undefined, branding || undefined);

                    let html: string;
                    let subject: string;

                    if (dbEmail) {
                        html = dbEmail.html;
                        subject = dbEmail.subject;
                    } else {
                        html = renderPaymentFailedEmail({
                            firstName,
                            membershipType: membershipTypeName,
                            amountDue,
                            attemptCount,
                            nextAttemptDate,
                        });
                        subject = `Action Required: Payment Failed for Your Membership`;
                    }

                    const fromName = branding?.name || 'ClubForge';
                    await sendEmail({
                        to: customerEmail,
                        subject,
                        html,
                        from: `${fromName} <noreply@clubforgehq.com>`,
                        replyTo: branding?.contactEmail,
                    });
                    console.log('Payment failed email sent to:', customerEmail);
                } catch (emailErr) {
                    console.error('Failed to send payment failed email:', emailErr);
                }
            }
        }
    }

    // Handle subscription past due (entering dunning)
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.status === 'past_due') {
            console.log('Subscription past due:', subscription.id);

            const supabase = await createAdminClient();

            // Mark membership as pending (payment issue)
            await supabase
                .from('memberships')
                .update({ status: 'pending' })
                .eq('stripe_subscription_id', subscription.id);
        }
    }

    return NextResponse.json({ received: true });
}
