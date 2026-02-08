// ===============================================
// ClubForge - Public Tenant Data API
// GET /api/tenant/public
// Returns tenant branding + public info for the current subdomain
// No auth required — this is public-facing data
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractSlugFromHost, TENANT_SLUG_HEADER } from '@/lib/tenant';

export async function GET(request: NextRequest) {
    try {
        // Get tenant slug from header (set by middleware) or from host
        const slug = request.headers.get(TENANT_SLUG_HEADER)
            || extractSlugFromHost(request.headers.get('host') || '');

        if (!slug) {
            return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Fetch tenant branding
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name, slug, logo_url, primary_color, tagline, contact_email, contact_phone, settings, created_at')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (tenantError || !tenant) {
            return NextResponse.json({ error: 'Club not found' }, { status: 404 });
        }

        // 2. Fetch public class schedule
        const { data: classes } = await supabase
            .from('classes')
            .select('id, name, day_of_week, start_time, end_time, location_id')
            .eq('tenant_id', tenant.id)
            .eq('is_active', true)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });

        // 3. Fetch locations
        const { data: locations } = await supabase
            .from('locations')
            .select('id, name, address, city, postcode')
            .eq('tenant_id', tenant.id)
            .eq('is_active', true);

        // 4. Fetch member count (approximate, for social proof)
        const { count: memberCount } = await supabase
            .from('tenant_members')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .eq('is_active', true);

        return NextResponse.json({
            tenant: {
                name: tenant.name,
                slug: tenant.slug,
                logoUrl: tenant.logo_url,
                primaryColor: tenant.primary_color || '#c5a456',
                tagline: tenant.tagline,
                contactEmail: tenant.contact_email,
                contactPhone: tenant.contact_phone,
                createdAt: tenant.created_at,
            },
            classes: (classes || []).map(c => ({
                id: c.id,
                name: c.name,
                dayOfWeek: c.day_of_week,
                startTime: c.start_time,
                endTime: c.end_time,
                locationId: c.location_id,
            })),
            locations: (locations || []).map(l => ({
                id: l.id,
                name: l.name,
                address: l.address,
                city: l.city,
                postcode: l.postcode,
            })),
            memberCount: memberCount || 0,
        });
    } catch (err) {
        console.error('Public tenant API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
