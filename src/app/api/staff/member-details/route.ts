// ===============================================
// ClubForge - Staff: member details for instructors
// GET /api/staff/member-details?userId=
//
// What an instructor needs when something happens in class: contact (the
// guardian's for a child), emergency contact, medical notes, memberships
// and recent attendance. Tenant-checked; admin client because instructors
// can't read a child's guardian row through RLS.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff, checkRateLimit } from '@/lib/auth-guard';
import { isChildDummyEmail } from '@/lib/member-contact';

export async function GET(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'staff-member-details', 60);
        if (rateLimited) return rateLimited;

        const auth = await requireStaff();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }

        const userId = request.nextUrl.searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

        const admin = createAdminClient();
        const { data: profile } = await admin
            .from('profiles')
            .select('id, user_id, tenant_id, first_name, last_name, email, phone, date_of_birth, gender, address, city, postcode, emergency_contact_name, emergency_contact_phone, medical_info, is_child, parent_guardian_id, belt_rank, stripes, profile_image_url, waiver_accepted, created_at')
            .eq('user_id', userId)
            .maybeSingle();
        if (!profile || profile.tenant_id !== auth.tenantId) {
            return NextResponse.json({ error: 'Member not found in your club' }, { status: 404 });
        }

        let guardian: { name: string; email: string | null; phone: string | null } | null = null;
        if (profile.parent_guardian_id) {
            const { data: g } = await admin
                .from('profiles')
                .select('first_name, last_name, email, phone')
                .eq('id', profile.parent_guardian_id)
                .maybeSingle();
            if (g) {
                guardian = {
                    name: `${g.first_name || ''} ${g.last_name || ''}`.trim(),
                    email: g.email && !isChildDummyEmail(g.email) ? g.email : null,
                    phone: g.phone || null,
                };
            }
        }

        const [{ data: memberships }, { data: attendance }] = await Promise.all([
            admin
                .from('memberships')
                .select('id, status, start_date, end_date, location:locations(name), membership_type:membership_types(name)')
                .eq('user_id', userId)
                .eq('tenant_id', auth.tenantId)
                .order('created_at', { ascending: false }),
            admin
                .from('attendance')
                .select('id, class_date, check_in_time, class:classes(name)')
                .eq('user_id', userId)
                .eq('tenant_id', auth.tenantId)
                .order('class_date', { ascending: false })
                .limit(8),
        ]);

        const contactEmail = isChildDummyEmail(profile.email) ? (guardian?.email || null) : profile.email;

        return NextResponse.json({
            member: {
                userId: profile.user_id,
                firstName: profile.first_name,
                lastName: profile.last_name,
                isChild: !!profile.is_child,
                contactEmail,
                contactViaGuardian: isChildDummyEmail(profile.email),
                phone: profile.phone || null,
                dateOfBirth: profile.date_of_birth,
                gender: profile.gender || null,
                address: [profile.address, profile.city, profile.postcode].filter(Boolean).join(', ') || null,
                emergencyContactName: profile.emergency_contact_name || null,
                emergencyContactPhone: profile.emergency_contact_phone || null,
                medicalInfo: profile.medical_info || null,
                beltRank: profile.belt_rank,
                stripes: profile.stripes || 0,
                profileImageUrl: profile.profile_image_url || null,
                waiverAccepted: !!profile.waiver_accepted,
                memberSince: profile.created_at,
            },
            guardian,
            memberships: (memberships || []).map((m: any) => ({
                id: m.id,
                status: m.status,
                startDate: m.start_date,
                endDate: m.end_date,
                location: m.location?.name || null,
                type: m.membership_type?.name || null,
            })),
            recentAttendance: (attendance || []).map((a: any) => ({
                id: a.id,
                date: a.class_date,
                className: a.class?.name || null,
            })),
        });
    } catch (error) {
        console.error('[staff/member-details] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
