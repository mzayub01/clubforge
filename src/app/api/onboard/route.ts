// ===============================================
// ClubForge - Tenant Provisioning API
// POST /api/onboard
// Creates a new club: auth user → profile → tenant → location
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripeClient } from '@/lib/stripe';
import { calculateTrialEndDate } from '@/lib/trial';
import { getStripePriceId, TRIAL_DURATION_DAYS } from '@/lib/stripe-plans';

interface OnboardRequest {
    // Step 1: Owner details
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;

    // Step 2: Club details
    clubName: string;
    slug: string;
    clubType: string;

    // Step 3: Club address
    address: string;
    city: string;
    postcode: string;
    clubPhone: string;
    clubEmail: string;

    // Step 4: Plan selection
    plan: 'starter' | 'pro' | 'elite';
    billingInterval: 'monthly' | 'annual';
}

export async function POST(request: NextRequest) {
    try {
        const body: OnboardRequest = await request.json();

        // -----------------------------------------------
        // Validation
        // -----------------------------------------------
        const required = ['firstName', 'lastName', 'email', 'password', 'clubName', 'slug', 'plan'];
        for (const field of required) {
            if (!(body as unknown as Record<string, unknown>)[field]) {
                return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        if (body.password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // Validate slug format (lowercase, alphanumeric, hyphens)
        const slugRegex = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
        if (!slugRegex.test(body.slug)) {
            return NextResponse.json(
                { error: 'Slug must be 3-50 characters, lowercase, alphanumeric and hyphens only' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // -----------------------------------------------
        // 1. Check slug availability
        // -----------------------------------------------
        const { data: existingTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', body.slug)
            .single();

        if (existingTenant) {
            return NextResponse.json({ error: 'This URL is already taken. Please choose a different one.' }, { status: 409 });
        }

        // -----------------------------------------------
        // 2. Create auth user
        // -----------------------------------------------
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: body.email,
            password: body.password,
            email_confirm: true, // Auto-confirm during onboarding
            user_metadata: {
                first_name: body.firstName,
                last_name: body.lastName,
                is_club_owner: true,
            },
        });

        if (authError || !authData.user) {
            console.error('Auth error:', authError);
            const message = authError?.message?.includes('already been registered')
                ? 'An account with this email already exists. Please log in instead.'
                : 'Failed to create account. Please try again.';
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const userId = authData.user.id;

        try {
            // -----------------------------------------------
            // 3. Create tenant
            // -----------------------------------------------
            const trialEndsAt = calculateTrialEndDate();

            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    name: body.clubName,
                    slug: body.slug,
                    owner_user_id: userId,
                    subscription_tier: body.plan,
                    subscription_status: 'trialing',
                    trial_ends_at: trialEndsAt,
                    onboarding_completed: false,
                    contact_email: body.clubEmail || body.email,
                    contact_phone: body.clubPhone || body.phone,
                    settings: {
                        club_type: body.clubType,
                        billing_interval: body.billingInterval,
                    },
                })
                .select('id')
                .single();

            if (tenantError || !tenant) {
                throw new Error(`Failed to create tenant: ${tenantError?.message}`);
            }

            // -----------------------------------------------
            // 4. Create profile
            // -----------------------------------------------
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: userId,
                    tenant_id: tenant.id,
                    first_name: body.firstName,
                    last_name: body.lastName,
                    email: body.email,
                    phone: body.phone,
                    date_of_birth: '1990-01-01', // Default, owner can update later
                    address: body.address || '',
                    city: body.city || '',
                    postcode: body.postcode || '',
                    emergency_contact_name: '',
                    emergency_contact_phone: '',
                    is_child: false,
                    belt_rank: 'white',
                    best_practice_accepted: true,
                    waiver_accepted: true,
                });

            if (profileError) {
                throw new Error(`Failed to create profile: ${profileError.message}`);
            }

            // -----------------------------------------------
            // 5. Create tenant_member (owner role = admin)
            // -----------------------------------------------
            const { error: memberError } = await supabase
                .from('tenant_members')
                .insert({
                    tenant_id: tenant.id,
                    user_id: userId,
                    role: 'admin',
                    is_active: true,
                });

            if (memberError) {
                throw new Error(`Failed to create tenant member: ${memberError.message}`);
            }

            // -----------------------------------------------
            // 6. Create default location
            // -----------------------------------------------
            const { error: locationError } = await supabase
                .from('locations')
                .insert({
                    tenant_id: tenant.id,
                    name: body.clubName,
                    address: body.address || 'TBC',
                    city: body.city || 'TBC',
                    postcode: body.postcode || 'TBC',
                    is_active: true,
                    settings: { allow_waitlist: true },
                });

            if (locationError) {
                console.error('Location creation warning:', locationError.message);
                // Non-fatal — owner can set up location later
            }

            // -----------------------------------------------
            // 7. Create Stripe customer + subscription (with trial)
            // -----------------------------------------------
            let stripeCustomerId: string | null = null;
            const stripe = getStripeClient();

            if (stripe) {
                try {
                    // Create Stripe customer
                    const customer = await stripe.customers.create({
                        email: body.email,
                        name: `${body.firstName} ${body.lastName}`,
                        metadata: {
                            tenant_id: tenant.id,
                            club_name: body.clubName,
                            slug: body.slug,
                        },
                    });

                    stripeCustomerId = customer.id;

                    // Create subscription with trial
                    const priceId = getStripePriceId(body.plan, body.billingInterval);

                    if (priceId) {
                        await stripe.subscriptions.create({
                            customer: customer.id,
                            items: [{ price: priceId }],
                            trial_period_days: TRIAL_DURATION_DAYS,
                            payment_settings: {
                                save_default_payment_method: 'on_subscription',
                            },
                            metadata: {
                                tenant_id: tenant.id,
                                plan: body.plan,
                            },
                        });
                    }

                    // Save Stripe customer ID to tenant
                    await supabase
                        .from('tenants')
                        .update({ stripe_customer_id: customer.id })
                        .eq('id', tenant.id);
                } catch (stripeError) {
                    console.error('Stripe setup warning:', stripeError);
                    // Non-fatal in development — Stripe may not be configured
                }
            }

            // -----------------------------------------------
            // 8. Return success
            // -----------------------------------------------
            return NextResponse.json({
                success: true,
                tenantId: tenant.id,
                slug: body.slug,
                userId,
                stripeCustomerId,
                trialEndsAt,
                redirectUrl: `/${body.slug}/admin`,
            });

        } catch (provisioningError) {
            // Cleanup: delete the auth user if provisioning fails
            console.error('Provisioning failed, cleaning up:', provisioningError);
            await supabase.auth.admin.deleteUser(userId);
            throw provisioningError;
        }

    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Onboarding failed. Please try again.' },
            { status: 500 }
        );
    }
}
