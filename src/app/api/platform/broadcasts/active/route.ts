// ===============================================
// ClubForge - Platform Broadcasts API (Public)
// Fetches active, non-expired platform broadcasts
// for display in tenant admin dashboards.
// ===============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        // Verify user is authenticated
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ broadcasts: [] });
        }

        const adminSupabase = createAdminClient();

        // Fetch active platform-wide announcements (tenant_id = null)
        const { data: broadcasts, error } = await adminSupabase
            .from('announcements')
            .select('id, title, message, created_at, expires_at')
            .is('tenant_id', null)
            .eq('is_active', true)
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('[Platform Broadcasts Public] Error:', error);
            return NextResponse.json({ broadcasts: [] });
        }

        return NextResponse.json({ broadcasts: broadcasts || [] });
    } catch {
        return NextResponse.json({ broadcasts: [] });
    }
}
