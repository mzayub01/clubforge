import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { resolveTenantForUser } from '@/lib/tenant';

export async function POST(request: NextRequest) {
    try {
        // Authenticate via regular client (respects auth cookies)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { classId, profileId } = await request.json();

        if (!classId) {
            return NextResponse.json({ error: 'Class ID required' }, { status: 400 });
        }

        // Use provided profileId or fall back to authenticated user
        let targetUserId = profileId || user.id;

        // If checking in for a different profile, validate authorization
        if (profileId && profileId !== user.id) {
            // Use admin client for authorization checks (bypasses RLS)
            const adminSupabaseAuth = await createAdminClient();

            // Check if the caller is an instructor/admin/owner in the tenant
            const callerMembership = await resolveTenantForUser(user.id);
            let isStaff = false;

            if (callerMembership?.tenantId) {
                const { data: callerRole } = await adminSupabaseAuth
                    .from('tenant_members')
                    .select('role')
                    .eq('user_id', user.id)
                    .eq('tenant_id', callerMembership.tenantId)
                    .eq('is_active', true)
                    .single();

                isStaff = callerRole?.role === 'admin' || callerRole?.role === 'owner' || callerRole?.role === 'instructor';
            }

            if (!isStaff) {
                // Not staff — check parent-child relationship.
                // MUST use the admin client here: profiles RLS has no guardian
                // policy, so a guardian cannot read their child's row with the
                // user-scoped client — the child lookup always returned null and
                // every guardian check-in got a spurious 403.
                const { data: parentProfile } = await adminSupabaseAuth
                    .from('profiles')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('is_child', false)
                    .single();

                if (!parentProfile) {
                    return NextResponse.json({ error: 'Not authorized to check in for this profile' }, { status: 403 });
                }

                const { data: childProfile } = await adminSupabaseAuth
                    .from('profiles')
                    .select('id, parent_guardian_id')
                    .eq('user_id', profileId)
                    .eq('is_child', true)
                    .single();

                if (!childProfile || childProfile.parent_guardian_id !== parentProfile.id) {
                    return NextResponse.json({ error: 'Not authorized to check in for this profile' }, { status: 403 });
                }
            }
        }

        // Resolve tenant — required for attendance records to be visible
        const membership = await resolveTenantForUser(targetUserId);
        const tenantId = membership?.tenantId;

        if (!tenantId) {
            console.error('Check-in: Could not resolve tenant for user:', targetUserId);
            return NextResponse.json({ error: 'Could not determine your club. Please contact your admin.' }, { status: 400 });
        }

        // Use admin client for DB operations to bypass RLS
        // (RLS policies require tenant context that client-side calls don't have)
        const adminSupabase = await createAdminClient();

        // Check if already checked in today for this class AND this profile
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await adminSupabase
            .from('attendance')
            .select('id')
            .eq('class_id', classId)
            .eq('user_id', targetUserId)
            .eq('class_date', today)
            .single();

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Already checked in today',
                alreadyCheckedIn: true
            });
        }

        // Create attendance record with tenant_id always set
        const { error } = await adminSupabase
            .from('attendance')
            .insert({
                class_id: classId,
                user_id: targetUserId,
                class_date: today,
                check_in_time: new Date().toISOString(),
                tenant_id: tenantId,
                checked_in_by: user.id,
            });

        if (error) {
            console.error('Check-in error:', error);
            return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Checked in successfully!'
        });
    } catch (error) {
        console.error('Check-in error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
