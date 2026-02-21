// ===============================================
// ClubForge - Member Classes API (Server-Side)
// Fetches classes for the authenticated member,
// using admin client to bypass RLS chain issues.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const profileId = searchParams.get('profileId') || user.id;

        const adminSupabase = await createAdminClient();

        // Get user's membership (active or pending)
        const { data: membership } = await adminSupabase
            .from('memberships')
            .select('location_id, membership_type_id, start_date, status, tenant_id')
            .eq('user_id', profileId)
            .in('status', ['active', 'pending'])
            .order('status', { ascending: true })
            .limit(1)
            .single();

        if (!membership) {
            return NextResponse.json({ membership: null, classes: [], attendance: [] });
        }

        // Fetch classes for member's location
        const { data: classesData } = await adminSupabase
            .from('classes')
            .select(`
                *,
                location:locations(name),
                instructor:instructors(*, profile:profiles(first_name, last_name)),
                class_membership_types(membership_type_id)
            `)
            .eq('is_active', true)
            .eq('location_id', membership.location_id)
            .eq('tenant_id', membership.tenant_id)
            .order('day_of_week')
            .order('start_time');

        // Fetch attendance records for this user
        const { data: attendance } = await adminSupabase
            .from('attendance')
            .select('class_id, class_date')
            .eq('user_id', profileId);

        return NextResponse.json({
            membership: {
                location_id: membership.location_id,
                membership_type_id: membership.membership_type_id,
                start_date: membership.start_date,
                status: membership.status,
            },
            classes: classesData || [],
            attendance: attendance || [],
        });
    } catch (error) {
        console.error('[member-classes] Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch classes';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
