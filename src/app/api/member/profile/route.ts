import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/member/profile?userId=xxx
 * 
 * Fetches a profile for a user. If the requesting user is the parent/guardian
 * of the target user, returns the child's profile (bypassing RLS).
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targetUserId = request.nextUrl.searchParams.get('userId') || user.id;

        const supabaseAdmin = createAdminClient();

        // If requesting own profile, return directly
        if (targetUserId === user.id) {
            const { data } = await supabaseAdmin
                .from('profiles')
                .select('id, first_name, last_name, email, stripe_customer_id')
                .eq('user_id', user.id)
                .single();

            return NextResponse.json({ profile: data });
        }

        // Requesting child's profile — verify parent relationship
        const { data: parentProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_child', false)
            .single();

        if (!parentProfile) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: childProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, first_name, last_name, email, stripe_customer_id')
            .eq('user_id', targetUserId)
            .eq('parent_guardian_id', parentProfile.id)
            .eq('is_child', true)
            .single();

        if (!childProfile) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ profile: childProfile });

    } catch (error) {
        console.error('[profile API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
