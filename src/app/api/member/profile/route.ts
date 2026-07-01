import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Fields returned to the client for a profile (own or child).
const PROFILE_FIELDS =
    'id, user_id, first_name, last_name, email, date_of_birth, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, medical_info, belt_rank, stripes, is_child, profile_image_url, created_at, stripe_customer_id';

// Fields a member (or a guardian on behalf of their child) is allowed to update.
const UPDATABLE_FIELDS = [
    'first_name', 'last_name', 'phone', 'address', 'city', 'postcode',
    'emergency_contact_name', 'emergency_contact_phone', 'medical_info',
    'belt_rank', 'stripes', 'profile_image_url',
];

/**
 * Resolves the profile id the caller is allowed to act on for `targetUserId`.
 * Returns the profile id if the caller is the target themselves or the
 * parent/guardian of the (child) target, otherwise null.
 */
async function resolvePermittedProfileId(
    supabaseAdmin: ReturnType<typeof createAdminClient>,
    callerUserId: string,
    targetUserId: string,
): Promise<string | null> {
    if (targetUserId === callerUserId) {
        const { data } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', callerUserId)
            .single();
        return data?.id ?? null;
    }

    // Verify caller is the parent/guardian of the target child
    const { data: parentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', callerUserId)
        .eq('is_child', false)
        .single();

    if (!parentProfile) return null;

    const { data: childProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('parent_guardian_id', parentProfile.id)
        .eq('is_child', true)
        .single();

    return childProfile?.id ?? null;
}

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

        // Own profile — return directly
        if (targetUserId === user.id) {
            const { data } = await supabaseAdmin
                .from('profiles')
                .select(PROFILE_FIELDS)
                .eq('user_id', user.id)
                .single();

            return NextResponse.json({ profile: data });
        }

        // Child's profile — verify parent relationship
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
            .select(PROFILE_FIELDS)
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

/**
 * PATCH /api/member/profile
 * Body: { userId: string, updates: Record<string, unknown> }
 *
 * Updates a profile. Allowed when the caller is the target themselves or the
 * parent/guardian of the (child) target. Only whitelisted fields are applied.
 * Runs via the admin client so guardians can edit children (RLS has no
 * guardian policy on profiles).
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const targetUserId: string | undefined = body?.userId;
        const updates: Record<string, unknown> | undefined = body?.updates;

        if (!targetUserId || !updates || typeof updates !== 'object') {
            return NextResponse.json({ error: 'Missing userId or updates' }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();
        const profileId = await resolvePermittedProfileId(supabaseAdmin, user.id, targetUserId);

        if (!profileId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Whitelist the fields that may be updated
        const safeUpdates: Record<string, unknown> = {};
        for (const key of UPDATABLE_FIELDS) {
            if (key in updates) safeUpdates[key] = updates[key];
        }

        if (Object.keys(safeUpdates).length === 0) {
            return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update(safeUpdates)
            .eq('id', profileId);

        if (error) {
            console.error('[profile API] Update error:', error);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[profile API] PATCH Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
