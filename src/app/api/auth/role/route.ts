// ===============================================
// ClubForge - User Role API
// Returns the authenticated user's role for login redirect
// ===============================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ role: 'anonymous' });
        }

        // Use admin client to bypass RLS and reliably get role
        const adminSupabase = await createAdminClient();

        const { data: tenantMember } = await adminSupabase
            .from('tenant_members')
            .select('role, tenant_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        return NextResponse.json({
            role: tenantMember?.role || 'member',
            tenantId: tenantMember?.tenant_id || null,
        });
    } catch (error) {
        console.error('Role lookup error:', error);
        return NextResponse.json({ role: 'member' });
    }
}
