// ===============================================
// ClubForge - Diagnostic API for Member Data
// Checks and repairs missing membership/tenant_members data
// ADMIN ONLY - verifies the user is a tenant admin before proceeding
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        // Authenticate caller
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const adminSupabase = await createAdminClient();

        // Check if caller is an admin
        const { data: callerTenantMember } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id, role')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .in('role', ['admin', 'owner'])
            .single();

        if (!callerTenantMember) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const tenantId = callerTenantMember.tenant_id;

        // Collect diagnostic data for this tenant
        const [membershipsRes, tenantMembersRes, profilesRes, classesRes, locationsRes] = await Promise.all([
            adminSupabase.from('memberships').select('*, profile:profiles(first_name, last_name, email)').eq('tenant_id', tenantId),
            adminSupabase.from('tenant_members').select('user_id, role, is_active').eq('tenant_id', tenantId),
            adminSupabase.from('profiles').select('user_id, first_name, last_name, email, tenant_id').eq('tenant_id', tenantId),
            adminSupabase.from('classes').select('id, name, location_id, is_active, tenant_id').eq('tenant_id', tenantId),
            adminSupabase.from('locations').select('id, name, is_active, tenant_id').eq('tenant_id', tenantId),
        ]);

        // Find orphaned profiles (profiles with this tenant_id but no tenant_members row)
        const tenantMemberUserIds = new Set((tenantMembersRes.data || []).map((tm: any) => tm.user_id));
        const membershipUserIds = new Set((membershipsRes.data || []).map((m: any) => m.user_id));
        const orphanedProfiles = (profilesRes.data || []).filter((p: any) => !tenantMemberUserIds.has(p.user_id));
        const profilesWithoutMembership = (profilesRes.data || []).filter((p: any) => !membershipUserIds.has(p.user_id));

        return NextResponse.json({
            tenantId,
            memberships: {
                count: (membershipsRes.data || []).length,
                data: membershipsRes.data,
            },
            tenantMembers: {
                count: (tenantMembersRes.data || []).length,
                data: tenantMembersRes.data,
            },
            profiles: {
                count: (profilesRes.data || []).length,
                data: profilesRes.data,
            },
            classes: {
                count: (classesRes.data || []).length,
                data: classesRes.data,
            },
            locations: {
                count: (locationsRes.data || []).length,
                data: locationsRes.data,
            },
            issues: {
                orphanedProfiles: orphanedProfiles.length > 0 ? orphanedProfiles : 'None',
                profilesWithoutMembership: profilesWithoutMembership.length > 0 ? profilesWithoutMembership : 'None',
            },
        });
    } catch (error) {
        console.error('[Diagnostic] Error:', error);
        const message = error instanceof Error ? error.message : 'Diagnostic failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST: Repair missing data
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const adminSupabase = await createAdminClient();

        // Check if caller is an admin
        const { data: callerTenantMember } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id, role')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .in('role', ['admin', 'owner'])
            .single();

        if (!callerTenantMember) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const tenantId = callerTenantMember.tenant_id;
        const body = await request.json();
        const { action, targetUserId, locationId, membershipTypeId } = body;

        const repairs: string[] = [];

        if (action === 'fix_all' || action === 'fix_tenant_members') {
            // Find all profiles for this tenant without tenant_members rows
            const { data: profiles } = await adminSupabase
                .from('profiles')
                .select('user_id, first_name, last_name')
                .eq('tenant_id', tenantId);

            for (const profile of (profiles || [])) {
                const { data: existing } = await adminSupabase
                    .from('tenant_members')
                    .select('id')
                    .eq('user_id', profile.user_id)
                    .eq('tenant_id', tenantId)
                    .single();

                if (!existing) {
                    const { error } = await adminSupabase.from('tenant_members').insert({
                        user_id: profile.user_id,
                        tenant_id: tenantId,
                        role: 'member',
                        is_active: true,
                    });
                    if (!error) {
                        repairs.push(`Created tenant_members for ${profile.first_name} ${profile.last_name}`);
                    } else {
                        repairs.push(`Error creating tenant_members for ${profile.first_name}: ${error.message}`);
                    }
                }
            }
        }

        if (action === 'create_membership' && targetUserId && locationId) {
            // Create a pending membership for a specific user
            const { data: existing } = await adminSupabase
                .from('memberships')
                .select('id')
                .eq('user_id', targetUserId)
                .eq('tenant_id', tenantId)
                .single();

            if (!existing) {
                const { error } = await adminSupabase.from('memberships').insert({
                    user_id: targetUserId,
                    location_id: locationId,
                    membership_type_id: membershipTypeId || null,
                    status: 'active',
                    start_date: new Date().toISOString().split('T')[0],
                    tenant_id: tenantId,
                });
                if (!error) {
                    repairs.push(`Created membership for user ${targetUserId}`);
                } else {
                    repairs.push(`Error: ${error.message}`);
                }
            } else {
                repairs.push(`Membership already exists for user ${targetUserId}`);
            }
        }

        return NextResponse.json({ repairs, success: true });
    } catch (error) {
        console.error('[Diagnostic] Repair error:', error);
        const message = error instanceof Error ? error.message : 'Repair failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
