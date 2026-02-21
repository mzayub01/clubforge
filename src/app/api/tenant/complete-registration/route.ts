// ===============================================
// ClubForge - Complete Registration (Server-Side)
// Creates tenant_members + membership records that
// require service role (admin client) to bypass RLS.
// Called after user signs up via the registration page.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            tenantId,
            locationId,
            membershipTypeId,
            status, // 'active' for free, 'pending' for paid
        } = body;

        if (!userId || !tenantId || !locationId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const adminSupabase = await createAdminClient();

        // 1. Ensure tenant_members row exists (required for RLS policies)
        const { data: existingTenantMember } = await adminSupabase
            .from('tenant_members')
            .select('id')
            .eq('user_id', userId)
            .eq('tenant_id', tenantId)
            .single();

        if (!existingTenantMember) {
            const { error: tmError } = await adminSupabase.from('tenant_members').insert({
                user_id: userId,
                tenant_id: tenantId,
                role: 'member',
                is_active: true,
            });
            if (tmError) {
                console.error('[complete-registration] Failed to create tenant_members:', tmError.message);
            }
        }

        // 2. Set tenant_id on the user's profile
        await adminSupabase
            .from('profiles')
            .update({ tenant_id: tenantId })
            .eq('user_id', userId);

        // 3. Create membership
        const { data: existingMembership } = await adminSupabase
            .from('memberships')
            .select('id')
            .eq('user_id', userId)
            .eq('location_id', locationId)
            .eq('tenant_id', tenantId)
            .single();

        if (!existingMembership) {
            const { error: membershipError } = await adminSupabase.from('memberships').insert({
                user_id: userId,
                location_id: locationId,
                membership_type_id: membershipTypeId || null,
                status: status || 'pending',
                start_date: new Date().toISOString().split('T')[0],
                tenant_id: tenantId,
            });
            if (membershipError) {
                console.error('[complete-registration] Failed to create membership:', membershipError.message);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[complete-registration] Error:', error);
        const message = error instanceof Error ? error.message : 'Registration completion failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
