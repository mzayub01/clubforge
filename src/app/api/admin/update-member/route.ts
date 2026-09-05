import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';

// Profile fields an admin may edit from the members page
const EDITABLE_PROFILE_FIELDS = [
    'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
    'role', 'belt_rank', 'stripes',
    'gender', 'address', 'city', 'postcode',
    'emergency_contact_name', 'emergency_contact_phone', 'medical_info',
    'waiver_accepted', 'best_practice_accepted',
    'parent_guardian_id',
] as const;

const GENDERS = ['male', 'female'];
const MEMBERSHIP_STATUSES = ['active', 'pending', 'inactive', 'cancelled'];

/**
 * POST /api/admin/update-member
 * Body: {
 *   userId: string,
 *   profile?: Partial<profile fields above>,
 *   membershipUpdates?: [{ id: string, membership_type_id: string }]
 * }
 *
 * Admin-edits a member: personal details, role/belt, and membership tier.
 * - Email changes also update the member's LOGIN email via the auth admin API
 *   (skipped for child accounts, which keep their phantom login).
 * - Tier changes update our records only — they do NOT modify any existing
 *   Stripe subscription amount.
 */
export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'admin-update-member', 20);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await request.json();
        const { userId, profile: profileUpdates, membershipUpdates } = body as {
            userId?: string;
            profile?: Record<string, unknown>;
            membershipUpdates?: { id: string; membership_type_id?: string; status?: string }[];
        };

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();

        // The target member must belong to the admin's tenant
        const { data: targetProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, email, is_child, tenant_id, waiver_accepted, best_practice_accepted, parent_guardian_id')
            .eq('user_id', userId)
            .single();

        if (!targetProfile || targetProfile.tenant_id !== auth.tenantId) {
            return NextResponse.json({ error: 'Member not found in your club' }, { status: 404 });
        }

        // ---- Profile / personal details ----
        if (profileUpdates && typeof profileUpdates === 'object') {
            const safeUpdates: Record<string, unknown> = {};
            for (const key of EDITABLE_PROFILE_FIELDS) {
                if (key in profileUpdates && profileUpdates[key] !== undefined) {
                    safeUpdates[key] = profileUpdates[key];
                }
            }

            // date_of_birth is NOT NULL in the schema — never write an empty value
            if (!safeUpdates.date_of_birth) delete safeUpdates.date_of_birth;

            // gender is an enum: anything else means "not specified"
            if ('gender' in safeUpdates) {
                safeUpdates.gender = GENDERS.includes(safeUpdates.gender as string) ? safeUpdates.gender : null;
            }
            if ('medical_info' in safeUpdates && !safeUpdates.medical_info) safeUpdates.medical_info = null;

            // Agreement flags carry a timestamp; only touch it when the flag actually changes
            const now = new Date().toISOString();
            if ('waiver_accepted' in safeUpdates) {
                const next = !!safeUpdates.waiver_accepted;
                if (next === !!targetProfile.waiver_accepted) delete safeUpdates.waiver_accepted;
                else { safeUpdates.waiver_accepted = next; safeUpdates.waiver_accepted_at = next ? now : null; }
            }
            if ('best_practice_accepted' in safeUpdates) {
                const next = !!safeUpdates.best_practice_accepted;
                if (next === !!targetProfile.best_practice_accepted) delete safeUpdates.best_practice_accepted;
                else { safeUpdates.best_practice_accepted = next; safeUpdates.best_practice_accepted_at = next ? now : null; }
            }

            // Guardian link: children only; must be an adult member of this club
            if ('parent_guardian_id' in safeUpdates) {
                const guardianId = (safeUpdates.parent_guardian_id as string | null) || null;
                if (!targetProfile.is_child) {
                    delete safeUpdates.parent_guardian_id;
                } else if (guardianId === targetProfile.parent_guardian_id) {
                    delete safeUpdates.parent_guardian_id;
                } else if (guardianId) {
                    const { data: guardian } = await supabaseAdmin
                        .from('profiles')
                        .select('id, tenant_id, is_child')
                        .eq('id', guardianId)
                        .maybeSingle();
                    if (!guardian || guardian.tenant_id !== auth.tenantId || guardian.is_child || guardian.id === targetProfile.id) {
                        return NextResponse.json({ error: 'Guardian must be an adult member of your club' }, { status: 400 });
                    }
                    safeUpdates.parent_guardian_id = guardianId;
                } else {
                    safeUpdates.parent_guardian_id = null;
                }
            }

            const newEmail = typeof safeUpdates.email === 'string' ? safeUpdates.email.trim() : '';
            if ('email' in safeUpdates) {
                if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                    return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
                }
                safeUpdates.email = newEmail;

                // Changing a real account's email must also change the LOGIN email.
                // Do this first: if the address is already taken, abort before
                // touching the profile so the two never diverge.
                // Child accounts keep their phantom login — profile email only.
                if (newEmail !== targetProfile.email && !targetProfile.is_child) {
                    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
                        userId,
                        { email: newEmail, email_confirm: true }
                    );
                    if (authUpdateError) {
                        console.error('[update-member] Auth email update failed:', authUpdateError);
                        return NextResponse.json(
                            { error: `Could not update login email: ${authUpdateError.message}` },
                            { status: 400 }
                        );
                    }
                }
            }

            if (Object.keys(safeUpdates).length > 0) {
                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .update(safeUpdates)
                    .eq('id', targetProfile.id);

                if (profileError) {
                    console.error('[update-member] Profile update failed:', profileError);
                    return NextResponse.json({ error: 'Failed to update member details' }, { status: 500 });
                }
            }
        }

        // ---- Membership tier / status changes (records only — never touches Stripe) ----
        if (Array.isArray(membershipUpdates) && membershipUpdates.length > 0) {
            for (const update of membershipUpdates) {
                if (!update?.id || (!update.membership_type_id && !update.status)) continue;
                if (update.status && !MEMBERSHIP_STATUSES.includes(update.status)) {
                    return NextResponse.json({ error: 'Invalid membership status' }, { status: 400 });
                }

                // Membership must belong to this member and tenant
                const { data: membership } = await supabaseAdmin
                    .from('memberships')
                    .select('id, location_id, tenant_id, user_id')
                    .eq('id', update.id)
                    .single();

                if (!membership || membership.user_id !== userId || membership.tenant_id !== auth.tenantId) {
                    return NextResponse.json({ error: 'Membership not found for this member' }, { status: 400 });
                }

                const membershipPatch: Record<string, unknown> = {};

                if (update.membership_type_id) {
                    // New tier must belong to the tenant and match the membership's
                    // location (multisite tiers have no location and are allowed)
                    const { data: newType } = await supabaseAdmin
                        .from('membership_types')
                        .select('id, location_id, tenant_id')
                        .eq('id', update.membership_type_id)
                        .single();

                    if (!newType || newType.tenant_id !== auth.tenantId
                        || (newType.location_id && newType.location_id !== membership.location_id)) {
                        return NextResponse.json({ error: 'Invalid membership tier for this location' }, { status: 400 });
                    }
                    membershipPatch.membership_type_id = update.membership_type_id;
                }
                if (update.status) {
                    membershipPatch.status = update.status;
                    if (update.status === 'cancelled' || update.status === 'inactive') {
                        membershipPatch.end_date = new Date().toISOString().split('T')[0];
                    } else {
                        membershipPatch.end_date = null;
                    }
                }

                const { error: membershipError } = await supabaseAdmin
                    .from('memberships')
                    .update(membershipPatch)
                    .eq('id', update.id);

                if (membershipError) {
                    console.error('[update-member] Membership update failed:', membershipError);
                    return NextResponse.json({ error: 'Failed to update membership tier' }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[update-member] Error:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Failed to update member') },
            { status: 500 }
        );
    }
}
