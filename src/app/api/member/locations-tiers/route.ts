import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { resolveTenantForUser } from '@/lib/tenant';

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

        // Resolve the user's tenant
        const membership = await resolveTenantForUser(user.id);
        const tenantId = membership?.tenantId;

        if (!tenantId) {
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

        // Fetch active membership types (non-multisite) for this tenant
        const { data: tiers } = await adminSupabase
            .from('membership_types')
            .select('id, name, price, description, stripe_price_id, location_id')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .or('is_multisite.is.null,is_multisite.eq.false');

        return NextResponse.json({
            locations: locations || [],
            tiers: tiers || [],
        });
    } catch (error) {
        console.error('[member/locations-tiers] Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
