import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveTenantForUser } from '@/lib/tenant';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Resolve tenant + role via tenant_members
        const membership = await resolveTenantForUser(user.id);

        if (!membership || (membership.role !== 'professor' && membership.role !== 'admin')) {
            return NextResponse.json({ success: false, error: 'Not authorized to grade' }, { status: 403 });
        }

        const body = await request.json();
        const {
            userId, classId,
            previousBelt, previousStripes, newBelt, newStripes,
            rankLevelId, previousRankLevelId,
            comments,
        } = body;

        if (!userId || !classId || !newBelt) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Role is validated above, so DB operations use the admin client. The
        // user-scoped client silently failed here: profiles RLS only lets tenant
        // ADMINS update other members, so a PROFESSOR's promotion updated 0 rows
        // (belt never changed) while the route still reported success.
        const adminSupabase = createAdminClient();

        // For professors (not admin), verify access to the class
        if (membership.role === 'professor') {
            const { data: access } = await adminSupabase
                .from('professor_class_access')
                .select('id')
                .eq('professor_user_id', user.id)
                .eq('class_id', classId)
                .single();

            if (!access) {
                return NextResponse.json({ success: false, error: 'Not authorized for this class' }, { status: 403 });
            }
        }

        // Create promotion record (write both legacy + new FK columns)
        const { error: promotionError } = await adminSupabase
            .from('promotions')
            .insert({
                user_id: userId,
                promoted_by: user.id,
                class_id: classId,
                previous_belt: previousBelt,
                previous_stripes: previousStripes,
                new_belt: newBelt,
                new_stripes: newStripes,
                ...(previousRankLevelId && { previous_rank_level_id: previousRankLevelId }),
                ...(rankLevelId && { new_rank_level_id: rankLevelId }),
                comments,
                promotion_date: new Date().toISOString().split('T')[0],
                tenant_id: membership.tenantId,
            });

        if (promotionError) {
            console.error('Error creating promotion:', promotionError);
            return NextResponse.json({ success: false, error: 'Failed to save promotion' }, { status: 500 });
        }

        // Update member's belt rank, stripes, and rank_level_id
        const updatePayload: Record<string, unknown> = {
            belt_rank: newBelt,
            stripes: newStripes,
            updated_at: new Date().toISOString(),
        };
        if (rankLevelId) {
            updatePayload.rank_level_id = rankLevelId;
        }

        const { error: updateError } = await adminSupabase
            .from('profiles')
            .update(updatePayload)
            .eq('user_id', userId);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.json({ success: false, error: 'Failed to update member profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Promotion API error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

