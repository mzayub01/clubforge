// ===============================================
// ClubForge - Platform Auth Check API
// Verifies if the current user is a platform admin
// ===============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ isPlatformAdmin: false });
        }

        const adminSupabase = createAdminClient();
        const { data: platformAdmin } = await adminSupabase
            .from('platform_admins')
            .select('id')
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({
            isPlatformAdmin: !!platformAdmin,
            userId: user.id,
            email: user.email,
        });
    } catch {
        return NextResponse.json({ isPlatformAdmin: false }, { status: 500 });
    }
}
