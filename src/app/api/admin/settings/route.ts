// ===============================================
// DojoHub - Admin Settings API
// PUT /api/admin/settings
// Updates tenant settings using admin client (bypasses RLS)
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';


export async function PUT(request: NextRequest) {
    try {
        // 1. Verify the user is authenticated
        const cookieStore = await cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Create a server-side client to check auth (reads the user's session cookie)
        const { createClient } = await import('@/lib/supabase/server');
        let user;
        try {
            const supabase = await createClient();
            const { data } = await supabase.auth.getUser();
            user = data.user;
        } catch {
            // Fallback: try getting user directly
            const supabase = createServerClient(supabaseUrl, supabaseKey, {
                global: {
                    headers: {
                        cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; '),
                    },
                },
                auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data } = await supabase.auth.getUser();
            user = data.user;
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verify user is an admin
        const adminSupabase = createAdminClient();
        const { data: tenantMember } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id, role')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        if (!tenantMember || tenantMember.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const tenantId = tenantMember.tenant_id;

        // 3. Parse the request body
        const body = await request.json();
        const { section, data } = body;

        if (!section || !data) {
            return NextResponse.json({ error: 'Missing section or data' }, { status: 400 });
        }

        // 4. Perform the update using admin client (bypasses RLS)
        let updatePayload: Record<string, unknown> = {};

        if (section === 'general') {
            updatePayload = {
                name: data.name,
                contact_email: data.contactEmail || null,
                contact_phone: data.contactPhone || null,
                tagline: data.tagline || null,
            };
        } else if (section === 'branding') {
            // Get current settings first to merge
            const { data: currentTenant } = await adminSupabase
                .from('tenants')
                .select('settings')
                .eq('id', tenantId)
                .single();

            const currentSettings = (currentTenant?.settings || {}) as Record<string, unknown>;
            const mergedSettings = {
                ...currentSettings,
                waiver_text: data.waiverText || undefined,
                etiquette_text: data.etiquetteText || undefined,
                registration_message: data.registrationMessage || undefined,
                require_profile_photo: data.requireProfilePhoto,
                membership_location_mode: data.membershipLocationMode || 'per_location',
            };

            updatePayload = {
                primary_color: data.primaryColor,
                settings: mergedSettings,
            };
        } else if (section === 'logo') {
            updatePayload = {
                logo_url: data.logoUrl,
            };
        } else {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        const { error: updateError } = await adminSupabase
            .from('tenants')
            .update(updatePayload)
            .eq('id', tenantId);

        if (updateError) {
            console.error('Settings update error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 5. Return the updated tenant data
        const { data: updatedTenant } = await adminSupabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single();

        return NextResponse.json({ success: true, tenant: updatedTenant });

    } catch (err) {
        console.error('Settings API error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET: Fetch tenant settings (avoids RLS issues on client)
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const { createClient } = await import('@/lib/supabase/server');
        let user;
        try {
            const supabase = await createClient();
            const { data } = await supabase.auth.getUser();
            user = data.user;
        } catch {
            const supabase = createServerClient(supabaseUrl, supabaseKey, {
                global: {
                    headers: {
                        cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; '),
                    },
                },
                auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data } = await supabase.auth.getUser();
            user = data.user;
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminSupabase = createAdminClient();

        const { data: tenantMember } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id, role')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        if (!tenantMember || tenantMember.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const tenantId = tenantMember.tenant_id;

        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single();

        // Fetch stats
        const [
            { count: totalMembers },
            { count: activeMembers },
            { count: totalClasses },
            { count: totalLocations },
            { count: totalEvents },
            { count: totalVideos },
        ] = await Promise.all([
            adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
            adminSupabase.from('memberships').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'active'),
            adminSupabase.from('classes').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
            adminSupabase.from('locations').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
            adminSupabase.from('events').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
            adminSupabase.from('videos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        ]);

        return NextResponse.json({
            tenant,
            stats: {
                totalMembers: totalMembers || 0,
                activeMembers: activeMembers || 0,
                totalClasses: totalClasses || 0,
                totalLocations: totalLocations || 0,
                totalEvents: totalEvents || 0,
                totalVideos: totalVideos || 0,
            }
        });
    } catch (err) {
        console.error('Settings GET error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
