// ===============================================
// ClubForge - User Role API
// Returns the authenticated user's role for login redirect
// ===============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        // Get authenticated user via server client (reads cookies)
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[/api/auth/role] Auth error:', authError.message);
            return NextResponse.json({ role: 'member', debug: 'auth_error' });
        }

        if (!user) {
            console.log('[/api/auth/role] No authenticated user found');
            return NextResponse.json({ role: 'member', debug: 'no_user' });
        }

        console.log('[/api/auth/role] User found:', user.id);

        // Use admin client (service role) to bypass RLS
        const adminSupabase = createAdminClient();

        const { data: tenantMember, error: queryError } = await adminSupabase
            .from('tenant_members')
            .select('role, tenant_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (queryError) {
            console.error('[/api/auth/role] tenant_members query error:', queryError.message);
            return NextResponse.json({ role: 'member', debug: 'query_error', error: queryError.message });
        }

        console.log('[/api/auth/role] tenant_member found:', tenantMember);

        return NextResponse.json({
            role: tenantMember?.role || 'member',
            tenantId: tenantMember?.tenant_id || null,
        });
    } catch (error) {
        console.error('[/api/auth/role] Unexpected error:', error);
        return NextResponse.json({ role: 'member', debug: 'catch_error' });
    }
}
