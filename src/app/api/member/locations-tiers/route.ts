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

        const adminSupabase = await createAdminClient();

        // Resolve the user's tenant. Prefer tenant_members (authoritative), but fall
        // back to the user's profile.tenant_id. Some members never get a tenant_members
        // row — e.g. free / no-Stripe registrations (the row is only created by the
        // Stripe success handlers) and guardians — which would otherwise make the
        // "Complete Your Membership" flow fail with "No tenant found".
        const membership = await resolveTenantForUser(user.id);
        let tenantId = membership?.tenantId;

        if (!tenantId) {
            const { data: prof } = await adminSupabase
                .from('profiles')
                .select('tenant_id')
                .eq('user_id', user.id)
                .single();
            tenantId = prof?.tenant_id || undefined;
            if (tenantId) {
                console.warn('[member/locations-tiers] tenant resolved via profile fallback for user', user.id);
            }
        }

        if (!tenantId) {
            return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
        }

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
            tenantId,
            locations: locations || [],
            tiers: tiers || [],
        });
    } catch (error) {
        console.error('[member/locations-tiers] Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
