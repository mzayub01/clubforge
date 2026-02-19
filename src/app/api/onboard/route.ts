import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripeClient } from '@/lib/stripe';
import { calculateTrialEndDate } from '@/lib/trial';
import { getStripePriceId, TRIAL_DURATION_DAYS } from '@/lib/stripe-plans';
import { rateLimit } from '@/lib/rate-limit';
import { getRankPreset } from '@/lib/rank-presets';

// -----------------------------------------------
// clubType → rank preset IDs mapping
// -----------------------------------------------
const CLUB_TYPE_PRESET_MAP: Record<string, string[]> = {
    bjj: ['bjj_adult', 'bjj_kids'],
    mma: ['bjj_adult', 'bjj_kids'],
    karate: ['karate'],
    taekwondo: ['taekwondo'],
    judo: ['judo'],
};

/**
 * Auto-create rank schemas + levels for a new tenant during onboarding.
 * Silently skips if no presets are defined for the given clubType.
 */
async function seedRankSchemasForClubType(
    supabase: ReturnType<typeof createAdminClient>,
    tenantId: string,
    clubType: string,
) {
    const presetIds = CLUB_TYPE_PRESET_MAP[clubType];
    if (!presetIds || presetIds.length === 0) return;

    for (let i = 0; i < presetIds.length; i++) {
        const preset = getRankPreset(presetIds[i]);
        if (!preset) continue;

        // Create the schema row
        const { data: schema, error: schemaError } = await supabase
            .from('rank_schemas')
            .insert({
                tenant_id: tenantId,
                name: preset.name,
                has_stripes: preset.has_stripes,
                max_stripes: preset.max_stripes,
                is_default: i === 0,      // First schema is the default
                sort_order: i,
            })
            .select('id')
            .single();

        if (schemaError || !schema) {
            console.error(`[Onboard] Failed to create rank schema ${preset.name}:`, schemaError?.message);
            continue;
        }

        // Create the rank_level rows
        const levels = preset.levels.map(level => ({
            schema_id: schema.id,
            name: level.name,
            color_hex: level.color_hex,
            bar_color_hex: level.bar_color_hex,
            sort_order: level.sort_order,
        }));

        const { error: levelsError } = await supabase
            .from('rank_levels')
            .insert(levels);

        if (levelsError) {
            console.error(`[Onboard] Failed to create rank levels for ${preset.name}:`, levelsError.message);
        }
    }

    console.log(`[Onboard] Seeded ${presetIds.length} rank schema(s) for clubType=${clubType}`);
}



interface OnboardRequest {
    // Step 1: Owner details
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    dialCode: string;
    countryCode: string;

    // Step 2: Club details
    clubName: string;
    slug: string;
    clubType: string;

    // Step 3: Club address
    address: string;
    city: string;
    postcode: string;
    clubPhone: string;
    clubDialCode: string;
    clubEmail: string;
    timezone: string;

    // Step 4: Plan selection
    plan: 'starter' | 'pro' | 'elite';
    billingInterval: 'monthly' | 'annual';
}

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 5 requests per minute (tenant provisioning is expensive)
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { success: allowed } = rateLimit(`onboard:${ip} `, { maxRequests: 5, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
        }

        const body: OnboardRequest = await request.json();

        // -----------------------------------------------
        // Validation
        // -----------------------------------------------
        const required = ['firstName', 'lastName', 'email', 'password', 'clubName', 'slug', 'plan'];
        for (const field of required) {
            if (!(body as unknown as Record<string, unknown>)[field]) {
                return NextResponse.json({ error: `Missing required field: ${field} ` }, { status: 400 });
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
                    contact_phone: body.clubPhone ? `${body.clubDialCode || ''}${body.clubPhone}` : (body.phone ? `${body.dialCode || ''}${body.phone}` : ''),
                    settings: {
                        club_type: body.clubType,
                        billing_interval: body.billingInterval,
                        country: body.countryCode || 'GB',
                        timezone: body.timezone || 'Europe/London',
                    },
                })
                .select('id')
                .single();

            if (tenantError || !tenant) {
                throw new Error(`Failed to create tenant: ${tenantError?.message} `);
            }

            // -----------------------------------------------
            // 4. Create profile
            // -----------------------------------------------
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    user_id: userId,
                    tenant_id: tenant.id,
                    first_name: body.firstName,
                    last_name: body.lastName,
                    email: body.email,
                    phone: body.phone ? `${body.dialCode || ''}${body.phone}` : '',
                    date_of_birth: '1990-01-01', // Default, owner can update later
                    address: body.address || '',
                    city: body.city || '',
                    postcode: body.postcode || '',
                    emergency_contact_name: '',
                    emergency_contact_phone: '',
                    is_child: false,
                    belt_rank: 'white',
                    role: 'admin', // Club owners get admin role
                    best_practice_accepted: true,
                    waiver_accepted: true,
                }, { onConflict: 'user_id' });

            if (profileError) {
                throw new Error(`Failed to create profile: ${profileError.message} `);
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
                throw new Error(`Failed to create tenant member: ${memberError.message} `);
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
            // 6b. Auto-create rank schemas based on club type
            // -----------------------------------------------
            if (body.clubType) {
                try {
                    await seedRankSchemasForClubType(supabase, tenant.id, body.clubType);
                } catch (rankError) {
                    console.error('[Onboard] Rank schema seeding warning:', rankError);
                    // Non-fatal — owner can configure rank system later
                }
            }

            // -----------------------------------------------
            // 7. Create Stripe customer + subscription (with trial)
            // -----------------------------------------------
            let stripeCustomerId: string | null = null;
            let stripeCheckoutUrl: string | null = null;
            const stripe = getStripeClient();

            if (stripe) {
                try {
                    // Create Stripe customer
                    const customer = await stripe.customers.create({
                        email: body.email,
                        name: `${body.firstName} ${body.lastName} `,
                        metadata: {
                            tenant_id: tenant.id,
                            club_name: body.clubName,
                            slug: body.slug,
                        },
                    });

                    stripeCustomerId = customer.id;

                    // Create checkout session with trial (collects payment method upfront)
                    const priceId = getStripePriceId(body.plan, body.billingInterval);
                    console.log('[Onboard] Stripe price ID for', body.plan, body.billingInterval, ':', priceId || '(EMPTY - env vars missing?)');

                    if (priceId && priceId.startsWith('price_')) {
                        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clubforgehq.com';
                        const checkoutSession = await stripe.checkout.sessions.create({
                            customer: customer.id,
                            mode: 'subscription',
                            payment_method_types: ['card'],
                            allow_promotion_codes: true,
                            line_items: [{ price: priceId, quantity: 1 }],
                            subscription_data: {
                                trial_period_days: TRIAL_DURATION_DAYS,
                                metadata: {
                                    tenant_id: tenant.id,
                                    plan: body.plan,
                                },
                            },
                            success_url: `${baseUrl}/login?onboarded=true&slug=${body.slug}`,
                            cancel_url: `${baseUrl}/get-started?step=4`,
                            metadata: {
                                tenant_id: tenant.id,
                                type: 'platform_subscription',
                            },
                        });

                        stripeCheckoutUrl = checkoutSession.url;
                        console.log('[Onboard] Checkout session created, URL:', stripeCheckoutUrl ? 'OK' : 'NULL');
                    } else {
                        console.warn('[Onboard] Skipping Stripe checkout - no valid price ID. Check STRIPE_PRICE_* env vars.');
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
                stripeCheckoutUrl,
                trialEndsAt,
                redirectUrl: stripeCheckoutUrl || `/${body.slug}/admin`,
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
