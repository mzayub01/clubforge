// ===============================================
// ClubForge - User Role API
// Returns the authenticated user's role for login redirect
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
    try {
        // Rate limit: 30 requests per minute
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { success: allowed } = rateLimit(`auth-role:${ip}`, { maxRequests: 30, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

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

        // Check if the user is a platform admin first
        const { data: platformAdmin } = await adminSupabase
            .from('platform_admins')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (platformAdmin) {
            console.log('[/api/auth/role] Platform admin found:', user.id);
            return NextResponse.json({
                role: 'platform_admin',
                tenantId: null,
            });
        }

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
