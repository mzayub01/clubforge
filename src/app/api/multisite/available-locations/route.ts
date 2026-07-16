import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTenantId, resolveTenantForUser } from '@/lib/tenant';

interface MultisiteTier {
    id: string;
    location_id: string;
    name: string;
    description: string | null;
    price: number;
    age_min: number | null;
    age_max: number | null;
    stripe_price_id: string | null;
}

interface AvailableLocation {
    id: string;
    name: string;
    city: string;
    max_capacity: number;
    current_members: number;
    hasCapacity: boolean;
    spotsRemaining: number;
    tiers: MultisiteTier[];
}

function getAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        // Reads use the admin client: profiles/memberships RLS has no guardian
        // policy, so guardians browsing for their child got "Profile not found".
        // Authorisation (self / guardian-of-child / staff) is checked explicitly,
        // and queries are tenant-scoped since the admin client bypasses RLS.
        const admin = createAdminClient();

        if (userId !== user.id) {
            const { data: parentProfile } = await admin
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .eq('is_child', false)
                .single();

            const { data: childProfile } = parentProfile
                ? await admin
                    .from('profiles')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('parent_guardian_id', parentProfile.id)
                    .eq('is_child', true)
                    .single()
                : { data: null };

            if (!childProfile) {
                const callerMembership = await resolveTenantForUser(user.id);
                const isStaff = ['admin', 'instructor', 'professor'].includes(callerMembership?.role || '');
                if (!isStaff) {
                    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
                }
            }
        }

        // Tenant scope: request context first, caller's membership as fallback
        const tenantId = (await getTenantId()) || (await resolveTenantForUser(user.id))?.tenantId;
        if (!tenantId) {
            return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
        }

        // Get user profile to determine age
        const { data: profile, error: profileError } = await admin
            .from('profiles')
            .select('date_of_birth, is_child')
            .eq('user_id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const memberAge = getAge(profile.date_of_birth);

        // Get current active memberships for this user with location names
        const { data: currentMemberships, error: membershipError } = await admin
            .from('memberships')
            .select('id, location_id, status, location:locations(id, name)')
            .eq('user_id', userId)
            .eq('tenant_id', tenantId)
            .eq('status', 'active');

        if (membershipError) {
            return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
        }

        const currentLocationIds = (currentMemberships || []).map(m => m.location_id);
        const currentSiteCount = currentLocationIds.length;
        const currentSites = (currentMemberships || []).map(m => ({
            id: m.location_id,
            name: ((loc => (Array.isArray(loc) ? loc[0] : loc) as { id: string; name: string } | null)(m.location as unknown))?.name || 'Unknown',
        }));

        // Get available locations (multisite enabled, not already a member)
        const { data: locations, error: locationsError } = await admin
            .from('locations')
            .select('id, name, city, max_capacity, current_members')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .eq('allow_multisite', true);

        if (locationsError) {
            return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
        }

        // Filter out locations user is already a member of
        const availableLocationIds = (locations || [])
            .filter(loc => !currentLocationIds.includes(loc.id))
            .map(loc => loc.id);

        if (availableLocationIds.length === 0) {
            return NextResponse.json({
                availableLocations: [],
                currentSiteCount,
                memberAge,
                canAddMore: currentSiteCount < 3,
            });
        }

        // Fetch multisite tiers for available locations
        const { data: multisiteTiers, error: tiersError } = await admin
            .from('membership_types')
            .select('id, location_id, name, description, price, age_min, age_max, stripe_price_id')
            .eq('tenant_id', tenantId)
            .eq('is_multisite', true)
            .eq('is_active', true)
            .in('location_id', availableLocationIds);

        if (tiersError) {
            return NextResponse.json({ error: 'Failed to fetch multisite tiers' }, { status: 500 });
        }

        // Build available locations with their applicable tiers
        const availableLocations: AvailableLocation[] = (locations || [])
            .filter(loc => !currentLocationIds.includes(loc.id))
            .map(loc => {
                // Filter tiers by age eligibility
                const applicableTiers = (multisiteTiers || []).filter(tier => {
                    if (tier.location_id !== loc.id) return false;
                    const minAge = tier.age_min ?? 0;
                    const maxAge = tier.age_max ?? 999;
                    return memberAge >= minAge && memberAge <= maxAge;
                });

                return {
                    id: loc.id,
                    name: loc.name,
                    city: loc.city,
                    max_capacity: loc.max_capacity,
                    current_members: loc.current_members,
                    hasCapacity: loc.current_members < loc.max_capacity,
                    spotsRemaining: loc.max_capacity - loc.current_members,
                    tiers: applicableTiers,
                };
            })
            // Only include locations that have at least one applicable tier
            .filter(loc => loc.tiers.length > 0);

        return NextResponse.json({
            availableLocations,
            currentSiteCount,
            currentSites,
            memberAge,
            canAddMore: currentSiteCount < 3,
        });
    } catch (error) {
        console.error('Error in multisite available-locations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
