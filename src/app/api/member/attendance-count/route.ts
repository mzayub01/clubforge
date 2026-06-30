import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');

        if (!targetUserId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Security Check: Ensure user is requesting their own data OR their child's data
        if (user.id !== targetUserId) {
            // Check if authenticated user is parent of target user
            const { data: parentProfile } = await adminClient
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .eq('is_child', false)
                .single();

            const { data: childProfile } = parentProfile
                ? await adminClient
                    .from('profiles')
                    .select('id')
                    .eq('user_id', targetUserId)
                    .eq('parent_guardian_id', parentProfile.id)
                    .eq('is_child', true)
                    .single()
                : { data: null };

            if (!childProfile) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Fetch attendance count
        const { count, error } = await adminClient
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', targetUserId);

        if (error) {
            console.error('[Attendance Count API] Error fetching count:', error);
            return NextResponse.json({ error: 'Failed to fetch attendance count' }, { status: 500 });
        }

        return NextResponse.json({ count: count || 0 });

    } catch (error) {
        console.error('[Attendance Count API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
