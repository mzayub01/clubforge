// ===============================================
// DojoHub - Public Registration Data API
// GET /api/tenant/register
// Returns tenant, locations, and membership data for registration
// No auth required — this is public-facing data
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractSlugFromHost, TENANT_SLUG_HEADER } from '@/lib/tenant';

export async function GET(request: NextRequest) {
    try {
        const slug = request.headers.get(TENANT_SLUG_HEADER)
            || extractSlugFromHost(request.headers.get('host') || '');

        if (!slug) {
            return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Fetch tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name, slug, logo_url, primary_color, tagline, stripe_account_id, stripe_connect_enabled, settings')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (tenantError || !tenant) {
            return NextResponse.json({ error: 'Club not found' }, { status: 404 });
        }

        // 2. Fetch locations
        const { data: locations } = await supabase
            .from('locations')
            .select('id, name, settings')
            .eq('tenant_id', tenant.id)
            .eq('is_active', true);

        // 3. Fetch membership types
        const { data: membershipTypes } = await supabase
            .from('membership_types')
            .select('*')
            .eq('tenant_id', tenant.id)
            .eq('is_active', true);

        // 4. Fetch capacity configs for all locations
        const locationIds = (locations || []).map(l => l.id);
        let capacityConfigs: Record<string, unknown>[] = [];
        if (locationIds.length > 0) {
            const { data: configs } = await supabase
                .from('location_membership_configs')
                .select('*')
                .in('location_id', locationIds);
            capacityConfigs = configs || [];
        }

        // 5. Fetch current membership counts per location+type for capacity checking
        let membershipCounts: { location_id: string; membership_type_id: string; count: number }[] = [];
        if (locationIds.length > 0) {
            // Get counts grouped by location_id and membership_type_id
            const { data: memberships } = await supabase
                .from('memberships')
                .select('location_id, membership_type_id')
                .in('location_id', locationIds)
                .in('status', ['active', 'pending']);

            // Aggregate counts
            const countMap: Record<string, number> = {};
            (memberships || []).forEach((m: { location_id: string; membership_type_id: string }) => {
                const key = `${m.location_id}:${m.membership_type_id}`;
                countMap[key] = (countMap[key] || 0) + 1;
            });

            membershipCounts = Object.entries(countMap).map(([key, count]) => {
                const [location_id, membership_type_id] = key.split(':');
                return { location_id, membership_type_id, count };
            });
        }

        return NextResponse.json({
            tenant,
            locations: locations || [],
            membershipTypes: membershipTypes || [],
            capacityConfigs,
            membershipCounts,
        });
    } catch (err) {
        console.error('Registration data API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
