// ===============================================
// ClubForge - Platform Broadcast API
// Send announcements to all tenant admins
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

// GET: List past broadcasts (stored as platform-level announcements)
export async function GET() {
    try {
        const user = await verifyPlatformAdmin();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const adminSupabase = createAdminClient();

        // Fetch all announcements where tenant_id is NULL (platform-wide)
        const { data: broadcasts, error } = await adminSupabase
            .from('announcements')
            .select('*')
            .is('tenant_id', null)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ broadcasts: broadcasts || [] });
    } catch (error) {
        console.error('[Platform Broadcast API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 });
    }
}

// POST: Create a new platform broadcast
export async function POST(request: NextRequest) {
    try {
        const user = await verifyPlatformAdmin();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, message, expiresAt } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
        }

        const adminSupabase = createAdminClient();

        // Create platform-wide announcement (tenant_id = null)
        const { data: broadcast, error } = await adminSupabase
            .from('announcements')
            .insert({
                title,
                message,
                tenant_id: null,
                target_audience: 'all',
                is_active: true,
                expires_at: expiresAt || null,
                created_by: user.id,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ broadcast });
    } catch (error) {
        console.error('[Platform Broadcast API] POST error:', error);
        return NextResponse.json({ error: 'Failed to create broadcast' }, { status: 500 });
    }
}
