// ===============================================
// ClubForge — Setup Progress API
// GET: Returns setup completion status for the owner's club
// POST: Dismiss the setup wizard
// ===============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface SetupStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    href: string;
    icon: string;
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const admin = createAdminClient();

        // Get the owner's tenant
        const { data: membership } = await admin
            .from('tenant_members')
            .select('tenant_id')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .eq('is_active', true)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'Not a club admin' }, { status: 403 });
        }

        const tenantId = membership.tenant_id;

        // Fetch all data needed to compute progress in parallel
        const [
            tenantResult,
            locationsResult,
            membershipTypesResult,
            classesResult,
            membersResult,
            rankSchemasResult,
        ] = await Promise.all([
            admin.from('tenants').select('name, logo_url, brand_color, stripe_connect_enabled, onboarding_completed_at, onboarding_dismissed_at, settings').eq('id', tenantId).single(),
            admin.from('locations').select('id, address').eq('tenant_id', tenantId).eq('is_active', true),
            admin.from('membership_types').select('id').eq('tenant_id', tenantId).eq('is_active', true),
            admin.from('classes').select('id').eq('tenant_id', tenantId).eq('is_active', true),
            admin.from('tenant_members').select('id').eq('tenant_id', tenantId).eq('is_active', true).neq('role', 'admin'),
            admin.from('rank_schemas').select('id').eq('tenant_id', tenantId).eq('is_active', true),
        ]);

        const tenant = tenantResult.data;
        const locations = locationsResult.data || [];
        const membershipTypes = membershipTypesResult.data || [];
        const classes = classesResult.data || [];
        const nonAdminMembers = membersResult.data || [];
        const rankSchemas = rankSchemasResult.data || [];
        const tenantSettings = (tenant as any)?.settings || {};
        // Grading is configured if they've either added schemas OR explicitly disabled belt progression
        const gradingConfigured = rankSchemas.length > 0 || tenantSettings.belt_progress_enabled === false;

        // Has a location with an address filled in
        const hasLocationWithAddress = locations.some((l: any) => l.address && l.address.trim().length > 0);

        const steps: SetupStep[] = [
            {
                id: 'account',
                title: 'Create Your Account',
                description: 'Sign up and create your club',
                completed: true, // always done if we got here
                href: '/admin',
                icon: 'check-circle',
            },
            {
                id: 'location',
                title: 'Add Location Details',
                description: 'Add your address and contact details',
                completed: hasLocationWithAddress,
                href: '/admin/locations',
                icon: 'map-pin',
            },
            {
                id: 'membership-plans',
                title: 'Create Membership Plans',
                description: 'Set up pricing for your members',
                completed: membershipTypes.length > 0,
                href: '/admin/membership-types',
                icon: 'credit-card',
            },
            {
                id: 'classes',
                title: 'Create Your First Class',
                description: 'Schedule a recurring class',
                completed: classes.length > 0,
                href: '/admin/classes',
                icon: 'calendar',
            },
            {
                id: 'branding',
                title: 'Brand Your Club',
                description: 'Upload a logo and pick your brand colour',
                completed: !!(tenant?.logo_url),
                href: '/admin/settings',
                icon: 'palette',
            },
            {
                id: 'grading',
                title: 'Configure Grading',
                description: 'Choose a belt/rank schema or disable grading',
                completed: gradingConfigured,
                href: '/admin/grading-settings',
                icon: 'award',
            },
            {
                id: 'stripe',
                title: 'Connect Payments',
                description: 'Enable Stripe to collect member payments',
                completed: !!(tenant?.stripe_connect_enabled),
                href: '/admin/settings',
                icon: 'pound-sterling',
            },
            {
                id: 'invite',
                title: 'Invite Your First Member',
                description: 'Share your registration link',
                completed: nonAdminMembers.length > 0,
                href: '/admin/invite',
                icon: 'user-plus',
            },
        ];

        const completedCount = steps.filter(s => s.completed).length;
        const totalSteps = steps.length;
        const percentage = Math.round((completedCount / totalSteps) * 100);

        return NextResponse.json({
            steps,
            completedCount,
            totalSteps,
            percentage,
            clubName: tenant?.name || 'Your Club',
            dismissed: !!(tenant?.onboarding_dismissed_at),
            allComplete: completedCount === totalSteps,
        });
    } catch (error) {
        console.error('[setup-progress] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch setup progress' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const admin = createAdminClient();
        const body = await request.json();

        const { data: membership } = await admin
            .from('tenant_members')
            .select('tenant_id')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .eq('is_active', true)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'Not a club admin' }, { status: 403 });
        }

        if (body.action === 'dismiss') {
            await admin
                .from('tenants')
                .update({ onboarding_dismissed_at: new Date().toISOString() })
                .eq('id', membership.tenant_id);
        } else if (body.action === 'complete') {
            await admin
                .from('tenants')
                .update({ onboarding_completed_at: new Date().toISOString() })
                .eq('id', membership.tenant_id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[setup-progress] POST error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
