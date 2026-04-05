// ===============================================
// ClubForge - Complete Registration (Server-Side)
// Creates tenant_members + membership records that
// require service role (admin client) to bypass RLS.
// Called after user signs up via the registration page.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 requests per minute
        const rateLimited = checkRateLimit(request, 'complete-reg', 10);
        if (rateLimited) return rateLimited;

        // Authenticate: the caller must be logged in
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        // Security: the authenticated user must match the userId in the body
        if (user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden: User mismatch' }, { status: 403 });
        }

        const adminSupabase = await createAdminClient();

        // Verify the tenant exists and is active
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('id')
            .eq('id', tenantId)
            .eq('is_active', true)
            .single();

        if (!tenant) {
            return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 });
        }

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
        return NextResponse.json({ error: safeErrorResponse(error, 'Registration completion failed') }, { status: 500 });
    }
}
