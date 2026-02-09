// ===============================================
// ClubForge - Platform Tenants API
// CRUD operations for managing all tenants
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Helper: verify the calling user is a platform admin
async function verifyPlatformAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

    return data ? user : null;
}

// GET: List all tenants with aggregated stats
export async function GET() {
    try {
        const user = await verifyPlatformAdmin();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const adminSupabase = createAdminClient();

        // Fetch all tenants
        const { data: tenants, error } = await adminSupabase
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch member counts per tenant
        const { data: memberCounts } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id')
            .eq('is_active', true);

        // Fetch active membership counts per tenant
        const { data: activeMemberships } = await adminSupabase
            .from('memberships')
            .select('tenant_id')
            .eq('status', 'active');

        // Aggregate counts
        const tenantMemberMap: Record<string, number> = {};
        const tenantMembershipMap: Record<string, number> = {};

        memberCounts?.forEach(m => {
            tenantMemberMap[m.tenant_id] = (tenantMemberMap[m.tenant_id] || 0) + 1;
        });

        activeMemberships?.forEach(m => {
            if (m.tenant_id) {
                tenantMembershipMap[m.tenant_id] = (tenantMembershipMap[m.tenant_id] || 0) + 1;
            }
        });

        // Combine
        const enrichedTenants = tenants?.map(t => ({
            ...t,
            member_count: tenantMemberMap[t.id] || 0,
            active_memberships: tenantMembershipMap[t.id] || 0,
        }));

        return NextResponse.json({ tenants: enrichedTenants });
    } catch (error) {
        console.error('[Platform Tenants API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
    }
}

// PATCH: Update a tenant's status or subscription tier
export async function PATCH(request: NextRequest) {
    try {
        const user = await verifyPlatformAdmin();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { tenantId, ...updates } = body;

        if (!tenantId) {
            return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
        }

        // Only allow specific fields to be updated
        const allowedFields = ['is_active', 'subscription_tier', 'subscription_status', 'name'];
        const filteredUpdates: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (key in updates) {
                filteredUpdates[key] = updates[key];
            }
        }

        if (Object.keys(filteredUpdates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const adminSupabase = createAdminClient();
        const { data: tenant, error } = await adminSupabase
            .from('tenants')
            .update(filteredUpdates)
            .eq('id', tenantId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ tenant });
    } catch (error) {
        console.error('[Platform Tenants API] PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
    }
}
