import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/member/memberships?userId=xxx
 * 
 * Fetches memberships for a user. If the requesting user is the parent/guardian
 * of the target user, returns the child's memberships (bypassing RLS).
 * This allows guardians to view their children's membership details.
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targetUserId = request.nextUrl.searchParams.get('userId') || user.id;

        // If requesting own memberships, use regular client (RLS enforced)
        if (targetUserId === user.id) {
            const { data } = await supabase
                .from('memberships')
                .select(`
                    id, status, start_date, stripe_subscription_id, created_at,
                    location:locations(id, name),
                    membership_type:membership_types(id, name, price, description)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            return NextResponse.json({ memberships: data || [] });
        }

        // Requesting someone else's memberships — verify parent relationship
        const supabaseAdmin = createAdminClient();

        // Get the requesting user's profile
        const { data: parentProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_child', false)
            .single();

        if (!parentProfile) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Verify the target user is a child of this parent
        const { data: childProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', targetUserId)
            .eq('parent_guardian_id', parentProfile.id)
            .eq('is_child', true)
            .single();

        if (!childProfile) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch child's memberships via admin client (bypasses RLS)
        const { data } = await supabaseAdmin
            .from('memberships')
            .select(`
                id, status, start_date, stripe_subscription_id, created_at,
                location:locations(id, name),
                membership_type:membership_types(id, name, price, description)
            `)
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

        return NextResponse.json({ memberships: data || [] });

    } catch (error) {
        console.error('[memberships API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
