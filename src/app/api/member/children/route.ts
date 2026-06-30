import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/member/children
 * 
 * Returns the authenticated user's linked child profiles.
 * Uses admin client to bypass RLS (child profiles have different user_ids).
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = createAdminClient();

        // Get parent's profile ID
        const { data: parentProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!parentProfile) {
            return NextResponse.json({ children: [] });
        }

        // Fetch children linked to this parent
        const { data: children } = await supabaseAdmin
            .from('profiles')
            .select('id, user_id, first_name, last_name, profile_image_url, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone')
            .eq('parent_guardian_id', parentProfile.id)
            .eq('is_child', true);

        return NextResponse.json({ children: children || [] });

    } catch (error) {
        console.error('[children API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
