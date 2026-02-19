import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveTenantForUser } from '@/lib/tenant';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { belt, stripes, userId, rankLevelId } = await request.json();

        // Validate belt — accept any non-empty string (dynamic schemas may have any belt name)
        if (!belt || typeof belt !== 'string') {
            return NextResponse.json({ error: 'Invalid belt rank' }, { status: 400 });
        }

        // Validate stripes — allow up to 12 for kids/extended schemas
        if (typeof stripes !== 'number' || stripes < 0 || stripes > 12) {
            return NextResponse.json({ error: 'Stripes must be 0-12' }, { status: 400 });
        }

        // Determine which user to update
        let targetUserId = user.id;

        // If userId is provided, check if current user is admin via tenant_members
        if (userId && userId !== user.id) {
            const membership = await resolveTenantForUser(user.id);

            if (!membership || membership.role !== 'admin') {
                return NextResponse.json({ error: 'Only admins can update other users' }, { status: 403 });
            }
            targetUserId = userId;
        }

        // Update the belt (write both legacy columns + rank_level_id)
        const updatePayload: Record<string, unknown> = {
            belt_rank: belt,
            stripes,
        };
        if (rankLevelId) {
            updatePayload.rank_level_id = rankLevelId;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('user_id', targetUserId);

        if (error) {
            console.error('Belt update error:', error);
            return NextResponse.json({ error: 'Failed to update belt' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Belt updated successfully'
        });
    } catch (error) {
        console.error('Belt update error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

