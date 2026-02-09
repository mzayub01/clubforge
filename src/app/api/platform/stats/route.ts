// ===============================================
// ClubForge - Platform Stats API
// Global analytics across all tenants
// ===============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifyPlatformAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

    return data ? user : null;
}

export async function GET() {
    try {
        const user = await verifyPlatformAdmin();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const adminSupabase = createAdminClient();

        // Total tenants
        const { count: totalTenants } = await adminSupabase
            .from('tenants')
            .select('*', { count: 'exact', head: true });

        // Active tenants
        const { count: activeTenants } = await adminSupabase
            .from('tenants')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // Total users (unique across all tenants)
        const { count: totalUsers } = await adminSupabase
            .from('tenant_members')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // Active memberships
        const { count: activeMemberships } = await adminSupabase
            .from('memberships')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // Subscription tier breakdown
        const { data: tierData } = await adminSupabase
            .from('tenants')
            .select('subscription_tier')
            .eq('is_active', true);

        const tierBreakdown: Record<string, number> = {};
        tierData?.forEach(t => {
            const tier = t.subscription_tier || 'free';
            tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
        });

        // Recent signups (tenants created in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: recentTenants } = await adminSupabase
            .from('tenants')
            .select('id, name, slug, created_at, subscription_tier, is_active')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(10);

        // Tenants with trials expiring in next 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const { data: expiringTrials } = await adminSupabase
            .from('tenants')
            .select('id, name, slug, trial_ends_at, subscription_status')
            .eq('subscription_status', 'trialing')
            .lte('trial_ends_at', sevenDaysFromNow.toISOString())
            .order('trial_ends_at', { ascending: true });

        // Monthly signups over last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const { data: signupTimeline } = await adminSupabase
            .from('tenants')
            .select('created_at')
            .gte('created_at', sixMonthsAgo.toISOString())
            .order('created_at', { ascending: true });

        const monthlySignups: Record<string, number> = {};
        signupTimeline?.forEach(t => {
            const month = t.created_at.substring(0, 7); // YYYY-MM
            monthlySignups[month] = (monthlySignups[month] || 0) + 1;
        });

        return NextResponse.json({
            stats: {
                totalTenants: totalTenants || 0,
                activeTenants: activeTenants || 0,
                totalUsers: totalUsers || 0,
                activeMemberships: activeMemberships || 0,
                tierBreakdown,
                monthlySignups,
            },
            recentTenants: recentTenants || [],
            expiringTrials: expiringTrials || [],
        });
    } catch (error) {
        console.error('[Platform Stats API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
