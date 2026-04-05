import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';

// Columns that should NEVER be returned to the client from the tenants table
const SENSITIVE_FIELDS = ['stripe_customer_id', 'stripe_subscription_id', 'stripe_account_id'];

function stripSensitive(tenant: any) {
    if (!tenant) return tenant;
    const cleaned = { ...tenant };
    for (const field of SENSITIVE_FIELDS) {
        delete cleaned[field];
    }
    return cleaned;
}


export async function PUT(request: NextRequest) {
    try {
        // Rate limit: 10 per minute
        const rateLimited = checkRateLimit(request, 'admin-settings-put', 10);
        if (rateLimited) return rateLimited;

        // Require admin authentication
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const tenantId = auth.tenantId;
        const adminSupabase = createAdminClient();

        // Parse the request body
        const body = await request.json();
        const { section, data } = body;

        if (!section || !data) {
            return NextResponse.json({ error: 'Missing section or data' }, { status: 400 });
        }

        // Perform the update using admin client (bypasses RLS)
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
        } else if (section === 'features') {
            // Get current settings first to merge
            const { data: currentTenant } = await adminSupabase
                .from('tenants')
                .select('settings')
                .eq('id', tenantId)
                .single();

            const currentSettings = (currentTenant?.settings || {}) as Record<string, unknown>;
            const mergedSettings = {
                ...currentSettings,
                belt_progress_enabled: data.belt_progress_enabled ?? currentSettings.belt_progress_enabled,
            };

            updatePayload = {
                settings: mergedSettings,
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
            return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
        }

        // Return the updated tenant data (strip sensitive fields)
        const { data: updatedTenant } = await adminSupabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single();

        return NextResponse.json({ success: true, tenant: stripSensitive(updatedTenant) });

    } catch (err) {
        console.error('Settings API error:', err);
        return NextResponse.json(
            { error: safeErrorResponse(err, 'Internal server error') },
            { status: 500 }
        );
    }
}

// GET: Fetch tenant settings
export async function GET(request: NextRequest) {
    try {
        // Rate limit: 20 per minute
        const rateLimited = checkRateLimit(request, 'admin-settings-get', 20);
        if (rateLimited) return rateLimited;

        // Require admin authentication
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const tenantId = auth.tenantId;
        const adminSupabase = createAdminClient();

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
            tenant: stripSensitive(tenant),
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
            { error: safeErrorResponse(err, 'Internal server error') },
            { status: 500 }
        );
    }
}
