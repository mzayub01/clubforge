// ===============================================
// ClubForge - User Role API
// Returns the authenticated user's role for the login redirect.
//
// Resolved for the club the request is on (subdomain / custom domain), so an
// admin of club A signing in on club B's site is treated as whatever they are
// in club B — not bounced to an admin page they can't use. Platform admins
// always go to /platform. With no tenant context (apex domain) the earliest
// active membership is used.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { getTenantId } from '@/lib/tenant';

export async function GET(request: NextRequest) {
    try {
        // Rate limit: 30 requests per minute
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { success: allowed } = rateLimit(`auth-role:${ip}`, { maxRequests: 30, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[/api/auth/role] Auth error:', authError.message);
            return NextResponse.json({ role: 'member', debug: 'auth_error' });
        }
        if (!user) {
            return NextResponse.json({ role: 'member', debug: 'no_user' });
        }

        const adminSupabase = createAdminClient();

        // Platform admins first
        const { data: platformAdmin } = await adminSupabase
            .from('platform_admins')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
        if (platformAdmin) {
            return NextResponse.json({ role: 'platform_admin', tenantId: null });
        }

        // Role in the club this request is for
        const requestTenantId = await getTenantId();
        if (requestTenantId) {
            const { data: tenantMember } = await adminSupabase
                .from('tenant_members')
                .select('role, tenant_id')
                .eq('user_id', user.id)
                .eq('tenant_id', requestTenantId)
                .eq('is_active', true)
                .maybeSingle();

            if (tenantMember) {
                return NextResponse.json({ role: tenantMember.role, tenantId: tenantMember.tenant_id });
            }

            // Guardians and legacy members can have a profile here without a
            // tenant_members row — they are members of this club.
            const { data: profile } = await adminSupabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .eq('tenant_id', requestTenantId)
                .maybeSingle();

            return NextResponse.json({
                role: 'member',
                tenantId: requestTenantId,
                debug: profile ? 'profile_only' : 'not_a_member_here',
            });
        }

        // No tenant context (apex domain): earliest active membership anywhere
        const { data: anyMember, error: queryError } = await adminSupabase
            .from('tenant_members')
            .select('role, tenant_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (queryError) {
            console.error('[/api/auth/role] tenant_members query error:', queryError.message);
            return NextResponse.json({ role: 'member', debug: 'query_error' });
        }

        return NextResponse.json({
            role: anyMember?.role || 'member',
            tenantId: anyMember?.tenant_id || null,
        });
    } catch (error) {
        console.error('[/api/auth/role] Unexpected error:', error);
        return NextResponse.json({ role: 'member', debug: 'catch_error' });
    }
}
