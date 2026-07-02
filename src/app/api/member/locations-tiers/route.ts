import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getTenantId, resolveTenantForUser } from '@/lib/tenant';

// Returns locations and membership types for the authenticated user's tenant.
// Used by the "Complete Your Membership" flow on the member dashboard.
// Uses admin client to bypass RLS (which requires current_tenant_id() session var
// that client-side calls don't have).
export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Resolve the club the user is browsing. Prefer the tenant context set by
        // middleware from the subdomain/custom domain — the same reliable,
        // membership-independent method the public registration endpoint uses. This
        // is catalog data (locations + tiers), so it must not depend on the user
        // having a tenant_members row (guardians often don't). Fall back to the
        // user's own membership only if there's no request tenant context.
        let tenantId = await getTenantId();
        if (!tenantId) {
            tenantId = (await resolveTenantForUser(user.id))?.tenantId ?? null;
        }

        if (!tenantId) {
            console.warn('[member/locations-tiers] No tenant resolved for user', user.id);
            return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
        }

        const adminSupabase = await createAdminClient();

        // Fetch active locations for this tenant
        const { data: locations } = await adminSupabase
            .from('locations')
            .select('id, name')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .order('name');

        if (!locations || locations.length === 0) {
            console.warn('[member/locations-tiers] Tenant', tenantId, 'has no active locations (user', user.id, ')');
        }

        // Fetch active membership types (non-multisite) for this tenant
        const { data: tiers } = await adminSupabase
            .from('membership_types')
            .select('id, name, price, description, stripe_price_id, location_id')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .or('is_multisite.is.null,is_multisite.eq.false');

        return NextResponse.json({
            tenantId,
            locations: locations || [],
            tiers: tiers || [],
        });
    } catch (error) {
        console.error('[member/locations-tiers] Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
