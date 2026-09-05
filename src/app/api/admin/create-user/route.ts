// ===============================================
// ClubForge - Admin: create a full member
// POST /api/admin/create-user
//
// Lets a club admin create a complete member in one go — the same result a
// self-registration produces: auth login (adults), full profile, role,
// rank, guardian link (children), membership at a location, photo, and
// optional welcome / set-password emails. Everything runs with the service
// role and is scoped to the admin's request tenant.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, escapeHtml, safeErrorResponse } from '@/lib/auth-guard';
import { sendEmail } from '@/lib/email';
import { renderEmailFromDatabase, getTenantBranding } from '@/lib/email-templates-db';
import { renderWelcomeEmail } from '@/lib/email-templates';
import { CHILD_EMAIL_DOMAIN } from '@/lib/member-contact';

const ROLES = ['member', 'instructor', 'professor', 'admin'] as const;
type Role = typeof ROLES[number];
const GENDERS = ['male', 'female'] as const;

interface CreateMemberBody {
    accountType?: 'adult' | 'child';
    // Login (adults)
    email?: string;
    password?: string;
    sendWelcomeEmail?: boolean;
    sendSetPasswordEmail?: boolean;
    // Personal
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    city?: string;
    postcode?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    medicalInfo?: string;
    // Role & rank
    role?: string;
    beltRank?: string;
    stripes?: number;
    // Child
    guardianProfileId?: string;
    // Membership
    locationId?: string;
    membershipTypeId?: string;
    membershipStatus?: 'active' | 'pending' | 'none';
    // Photo & agreements
    profileImageUrl?: string;
    waiverAccepted?: boolean;
    bestPracticeAccepted?: boolean;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function generatePassword(): string {
    // 12 URL-safe chars + a symbol and digit so it passes stricter policies
    return randomBytes(9).toString('base64url') + '!7';
}

export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'create-user', 10);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ success: false, error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }
        const tenantId = auth.tenantId;

        const body = (await request.json()) as CreateMemberBody;
        const isChild = body.accountType === 'child';

        // ---- Validate ----
        const firstName = (body.firstName || '').trim();
        const lastName = (body.lastName || '').trim();
        const dateOfBirth = (body.dateOfBirth || '').trim();
        if (!firstName || !lastName) {
            return NextResponse.json({ success: false, error: 'First and last name are required' }, { status: 400 });
        }
        if (!DATE_RE.test(dateOfBirth) || Number.isNaN(Date.parse(dateOfBirth))) {
            return NextResponse.json({ success: false, error: 'A valid date of birth is required' }, { status: 400 });
        }

        const email = (body.email || '').trim().toLowerCase();
        let password = body.password || '';
        let generatedPassword: string | null = null;
        if (!isChild) {
            if (!EMAIL_RE.test(email)) {
                return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
            }
            if (email.endsWith(CHILD_EMAIL_DOMAIN)) {
                return NextResponse.json({ success: false, error: 'That email domain is reserved' }, { status: 400 });
            }
            if (password && password.length < 8) {
                return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
            }
            if (!password) {
                generatedPassword = generatePassword();
                password = generatedPassword;
            }
        }

        const role: Role = !isChild && ROLES.includes(body.role as Role) ? (body.role as Role) : 'member';
        const gender = GENDERS.includes(body.gender as typeof GENDERS[number]) ? body.gender : null;
        const beltRank = (body.beltRank || 'white').toString().toLowerCase().slice(0, 40);
        const stripes = Number.isInteger(body.stripes) && (body.stripes as number) >= 0 ? (body.stripes as number) : 0;
        const profileImageUrl = typeof body.profileImageUrl === 'string' && /^https:\/\//.test(body.profileImageUrl)
            ? body.profileImageUrl
            : null;

        const supabaseAdmin = createAdminClient();

        // ---- Guardian (children) ----
        let guardianProfileId: string | null = null;
        let guardianEmail: string | null = null;
        if (isChild) {
            if (!body.guardianProfileId) {
                return NextResponse.json({ success: false, error: 'Select the child\'s guardian' }, { status: 400 });
            }
            const { data: guardian } = await supabaseAdmin
                .from('profiles')
                .select('id, email, tenant_id, is_child')
                .eq('id', body.guardianProfileId)
                .maybeSingle();
            if (!guardian || guardian.tenant_id !== tenantId || guardian.is_child) {
                return NextResponse.json({ success: false, error: 'Guardian must be an adult member of your club' }, { status: 400 });
            }
            guardianProfileId = guardian.id;
            guardianEmail = guardian.email;
        }

        // ---- Membership target (optional) ----
        const wantsMembership = body.membershipStatus !== 'none' && !!body.locationId;
        let locationName = 'your club';
        let membershipTypeName = 'Member';
        if (wantsMembership) {
            const { data: location } = await supabaseAdmin
                .from('locations')
                .select('id, name')
                .eq('id', body.locationId)
                .eq('tenant_id', tenantId)
                .maybeSingle();
            if (!location) {
                return NextResponse.json({ success: false, error: 'Location not found in your club' }, { status: 400 });
            }
            locationName = location.name;
            if (body.membershipTypeId) {
                const { data: type } = await supabaseAdmin
                    .from('membership_types')
                    .select('id, name')
                    .eq('id', body.membershipTypeId)
                    .eq('tenant_id', tenantId)
                    .maybeSingle();
                if (!type) {
                    return NextResponse.json({ success: false, error: 'Membership type not found in your club' }, { status: 400 });
                }
                membershipTypeName = type.name;
            }
        }

        // ---- 1. Auth user ----
        const loginEmail = isChild
            ? `child-${Date.now()}-${Math.random().toString(36).substring(7)}${CHILD_EMAIL_DOMAIN}`
            : email;
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: loginEmail,
            password: isChild ? randomUUID() : password,
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dateOfBirth,
                ...(isChild ? { is_child: true } : {}),
                created_by_admin: auth.userId,
            },
        });
        if (createError || !created?.user) {
            const msg = createError?.message || 'Failed to create user';
            const friendly = /already/i.test(msg) ? 'An account with this email already exists' : msg;
            return NextResponse.json({ success: false, error: friendly }, { status: 400 });
        }
        const userId = created.user.id;

        const cleanup = async () => {
            await supabaseAdmin.from('memberships').delete().eq('user_id', userId);
            await supabaseAdmin.from('tenant_members').delete().eq('user_id', userId);
            await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
            await supabaseAdmin.auth.admin.deleteUser(userId);
        };

        // ---- 2. Profile (the signup trigger created a stub; upsert the full record) ----
        const now = new Date().toISOString();
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                user_id: userId,
                tenant_id: tenantId,
                email: loginEmail,
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dateOfBirth,
                gender,
                phone: body.phone?.trim() || '',
                address: body.address?.trim() || '',
                city: body.city?.trim() || '',
                postcode: body.postcode?.trim() || '',
                emergency_contact_name: body.emergencyName?.trim() || '',
                emergency_contact_phone: body.emergencyPhone?.trim() || '',
                medical_info: body.medicalInfo?.trim() || null,
                role,
                belt_rank: beltRank,
                stripes,
                is_child: isChild,
                parent_guardian_id: guardianProfileId,
                profile_image_url: profileImageUrl,
                waiver_accepted: !!body.waiverAccepted,
                waiver_accepted_at: body.waiverAccepted ? now : null,
                best_practice_accepted: !!body.bestPracticeAccepted,
                best_practice_accepted_at: body.bestPracticeAccepted ? now : null,
            }, { onConflict: 'user_id' })
            .select('id')
            .single();
        if (profileError || !profile) {
            console.error('[create-user] profile error:', profileError);
            await cleanup();
            return NextResponse.json({ success: false, error: `Failed to create profile: ${profileError?.message || 'unknown error'}` }, { status: 500 });
        }

        // ---- 3. Tenant membership row (role source of truth) ----
        const { error: tmError } = await supabaseAdmin
            .from('tenant_members')
            .upsert({ tenant_id: tenantId, user_id: userId, role, is_active: true }, { onConflict: 'tenant_id,user_id' });
        if (tmError) {
            console.error('[create-user] tenant_members error:', tmError);
            await cleanup();
            return NextResponse.json({ success: false, error: 'Failed to add the member to your club' }, { status: 500 });
        }

        // Staff roles also need an instructors record (mirrors the Edit Member flow)
        if (role === 'instructor' || role === 'professor') {
            const { error: instructorError } = await supabaseAdmin
                .from('instructors')
                .upsert({ user_id: userId, tenant_id: tenantId, is_active: true }, { onConflict: 'user_id' });
            if (instructorError) console.warn('[create-user] instructors row not created:', instructorError.message);
        }

        // ---- 4. Membership (optional) ----
        let membershipCreated = false;
        if (wantsMembership) {
            const { error: membershipError } = await supabaseAdmin.from('memberships').insert({
                user_id: userId,
                tenant_id: tenantId,
                location_id: body.locationId,
                membership_type_id: body.membershipTypeId || null,
                status: body.membershipStatus === 'pending' ? 'pending' : 'active',
                start_date: new Date().toISOString().split('T')[0],
            });
            if (membershipError) {
                console.error('[create-user] membership error:', membershipError);
                await cleanup();
                return NextResponse.json({ success: false, error: `Failed to create membership: ${membershipError.message}` }, { status: 500 });
            }
            membershipCreated = true;
        }

        // ---- 5. Emails (adults only; children have no inbox — guardian gets nothing automatic here) ----
        const emails = { welcome: false, setPassword: false };
        if (!isChild && (body.sendWelcomeEmail || body.sendSetPasswordEmail)) {
            const branding = await getTenantBranding(tenantId);
            const clubName = branding?.name || 'ClubForge';
            const from = `${clubName} <noreply@clubforgehq.com>`;
            const replyTo = branding?.contactEmail || undefined;
            const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'clubforgehq.com';
            const origin = `https://${host}`;

            if (body.sendWelcomeEmail) {
                try {
                    const rendered = await renderEmailFromDatabase('welcome', {
                        firstName: escapeHtml(firstName),
                        locationName: escapeHtml(locationName),
                        membershipType: escapeHtml(membershipTypeName),
                    }, tenantId, branding || undefined);
                    const html = rendered?.html || renderWelcomeEmail({
                        firstName: escapeHtml(firstName),
                        locationName: escapeHtml(locationName),
                        membershipType: escapeHtml(membershipTypeName),
                        clubName,
                        dashboardUrl: `${origin}/dashboard`,
                    });
                    const subject = rendered?.subject || `Welcome to ${clubName}, ${firstName}!`;
                    const result = await sendEmail({ to: email, subject, html, from, replyTo });
                    emails.welcome = result.success;
                } catch (err) {
                    console.warn('[create-user] welcome email failed:', err instanceof Error ? err.message : err);
                }
            }

            if (body.sendSetPasswordEmail) {
                try {
                    const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                        type: 'recovery',
                        email,
                        options: { redirectTo: `${origin}/reset-password` },
                    });
                    const actionLink = link?.properties?.action_link;
                    if (linkError || !actionLink) throw new Error(linkError?.message || 'no link');
                    const html = `
                        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
                            <h2 style="margin:0 0 12px">Your ${escapeHtml(clubName)} member account</h2>
                            <p>Hi ${escapeHtml(firstName)},</p>
                            <p>${escapeHtml(clubName)} has created a member account for you${email ? ` using <strong>${escapeHtml(email)}</strong>` : ''}.
                               Choose your password to sign in:</p>
                            <p style="margin:24px 0"><a href="${actionLink}" style="background:#c5a456;color:#000;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">Set my password</a></p>
                            <p style="color:#666;font-size:13px">This link expires after a short time. If it has expired, use “Forgot password?” on the sign-in page at <a href="${origin}/login">${escapeHtml(host)}</a>.</p>
                            <p>See you soon,<br/>The ${escapeHtml(clubName)} Team</p>
                        </div>`;
                    const result = await sendEmail({
                        to: email,
                        subject: `Set your password for ${clubName}`,
                        html,
                        from,
                        replyTo,
                    });
                    emails.setPassword = result.success;
                } catch (err) {
                    console.warn('[create-user] set-password email failed:', err instanceof Error ? err.message : err);
                }
            }
        }

        console.log(`[create-user] admin ${auth.userId} created ${isChild ? 'child' : role} ${userId} in tenant ${tenantId}`);

        return NextResponse.json({
            success: true,
            user: { id: userId, email: isChild ? null : email },
            profileId: profile.id,
            isChild,
            guardianEmail,
            membershipCreated,
            emails,
            // Only returned when the admin did not choose a password themselves
            temporaryPassword: generatedPassword,
        });
    } catch (error) {
        console.error('[create-user] Error:', error);
        return NextResponse.json({ success: false, error: safeErrorResponse(error, 'Server error') }, { status: 500 });
    }
}
