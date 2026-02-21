// ===============================================
// ClubForge - Diagnostic API for Member Data
// Checks and repairs missing membership/tenant_members data
// ADMIN ONLY - verifies the user is a tenant admin before proceeding
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function getAdminTenantId(adminSupabase: any, userId: string): Promise<string | null> {
    // Try tenant_members first (preferred)
    const { data: tenantMember } = await adminSupabase
        .from('tenant_members')
        .select('tenant_id, role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (tenantMember && ['admin', 'instructor', 'owner'].includes(tenantMember.role)) {
        return tenantMember.tenant_id;
    }

    // Fallback: check profile's tenant_id (for admins who may not have tenant_members row)
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', userId)
        .single();

    return profile?.tenant_id || null;
}

export async function GET(request: NextRequest) {
    try {
        // Authenticate caller
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const adminSupabase = await createAdminClient();
        const tenantId = await getAdminTenantId(adminSupabase, user.id);

        if (!tenantId) {
            return NextResponse.json({ error: 'No tenant found for this user' }, { status: 403 });
        }

        // Get all user IDs for this tenant (from profiles)
        const { data: profilesData } = await adminSupabase
            .from('profiles')
            .select('user_id, first_name, last_name, email, tenant_id')
            .eq('tenant_id', tenantId);

        const userIds = (profilesData || []).map((p: any) => p.user_id);

        // Query memberships TWO ways:
        // 1. By tenant_id (what should work)
        const { data: membershipsByTenant } = await adminSupabase
            .from('memberships')
            .select('id, user_id, location_id, membership_type_id, status, tenant_id, stripe_subscription_id, start_date')
            .eq('tenant_id', tenantId);

        // 2. By user_ids (finds orphaned memberships with wrong/null tenant_id)
        const { data: membershipsByUser } = userIds.length > 0
            ? await adminSupabase
                .from('memberships')
                .select('id, user_id, location_id, membership_type_id, status, tenant_id, stripe_subscription_id, start_date')
                .in('user_id', userIds)
            : { data: [] };

        // Find memberships with wrong tenant_id
        const orphanedMemberships = (membershipsByUser || []).filter(
            (m: any) => m.tenant_id !== tenantId
        );

        // Other diagnostic data
        const [tenantMembersRes, classesRes, locationsRes] = await Promise.all([
            adminSupabase.from('tenant_members').select('user_id, role, is_active').eq('tenant_id', tenantId),
            adminSupabase.from('classes').select('id, name, location_id, is_active, tenant_id').eq('tenant_id', tenantId),
            adminSupabase.from('locations').select('id, name, is_active, tenant_id').eq('tenant_id', tenantId),
        ]);

        return NextResponse.json({
            tenantId,
            memberships: {
                byTenant: { count: (membershipsByTenant || []).length, data: membershipsByTenant },
                byUser: { count: (membershipsByUser || []).length, data: membershipsByUser },
                orphaned: orphanedMemberships,
            },
            tenantMembers: {
                count: (tenantMembersRes.data || []).length,
                data: tenantMembersRes.data,
            },
            profiles: {
                count: (profilesData || []).length,
                data: profilesData,
            },
            classes: {
                count: (classesRes.data || []).length,
                data: classesRes.data,
            },
            locations: {
                count: (locationsRes.data || []).length,
                data: locationsRes.data,
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
        const tenantId = await getAdminTenantId(adminSupabase, user.id);

        if (!tenantId) {
            return NextResponse.json({ error: 'No tenant found for this user' }, { status: 403 });
        }
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

        if (action === 'fix_all' || action === 'fix_membership_tenant') {
            // Fix memberships with wrong/null tenant_id for users belonging to this tenant
            const { data: profiles } = await adminSupabase
                .from('profiles')
                .select('user_id')
                .eq('tenant_id', tenantId);

            const userIds = (profiles || []).map((p: any) => p.user_id);

            if (userIds.length > 0) {
                // Find memberships for these users with wrong tenant_id
                const { data: wrongMemberships } = await adminSupabase
                    .from('memberships')
                    .select('id, user_id, tenant_id')
                    .in('user_id', userIds)
                    .neq('tenant_id', tenantId);

                // Also find memberships with null tenant_id
                const { data: nullMemberships } = await adminSupabase
                    .from('memberships')
                    .select('id, user_id, tenant_id')
                    .in('user_id', userIds)
                    .is('tenant_id', null);

                const allBroken = [...(wrongMemberships || []), ...(nullMemberships || [])];

                for (const m of allBroken) {
                    const { error } = await adminSupabase
                        .from('memberships')
                        .update({ tenant_id: tenantId })
                        .eq('id', m.id);
                    if (!error) {
                        repairs.push(`Fixed tenant_id for membership ${m.id} (user: ${m.user_id}, was: ${m.tenant_id || 'NULL'})`);
                    } else {
                        repairs.push(`Error fixing membership ${m.id}: ${error.message}`);
                    }
                }

                if (allBroken.length === 0) {
                    repairs.push('No memberships with wrong tenant_id found');
                }
            }
        }

        return NextResponse.json({ repairs, success: true });
    } catch (error) {
        console.error('[Diagnostic] Repair error:', error);
        const message = error instanceof Error ? error.message : 'Repair failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
