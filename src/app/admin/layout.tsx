import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';
import { ThemeProvider } from '@/lib/theme-provider';
import PlatformBroadcastBanner from '@/components/platform/PlatformBroadcastBanner';
import { FeatureGateProvider } from '@/components/providers/FeatureGateProvider';
import type { SubscriptionTier } from '@/lib/feature-gate';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Use a lightweight auth check — no tenant context needed for admin layout
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        redirect('/login');
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
        },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Use admin client (service role) to check tenant_members role
    const adminSupabase = createAdminClient();
    const { data: tenantMember, error: tmError } = await adminSupabase
        .from('tenant_members')
        .select('role, tenant_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

    console.log('[AdminLayout] user:', user.id, 'tenantMember:', tenantMember, 'error:', tmError?.message);

    // Platform admin override: if user isn't a tenant admin, check if they're a platform admin
    let isPlatformAdmin = false;
    let resolvedTenantId = tenantMember?.tenant_id || null;
    let resolvedRole = tenantMember?.role || null;

    if (tenantMember?.role !== 'admin') {
        const { data: platformAdmin } = await adminSupabase
            .from('platform_admins')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (platformAdmin) {
            isPlatformAdmin = true;
            resolvedRole = 'admin';
            // Resolve tenant from subdomain header (set by middleware)
            const headerStore = await headers();
            resolvedTenantId = headerStore.get('x-tenant-id') || null;
            console.log('[AdminLayout] Platform admin access, tenant from header:', resolvedTenantId);

            if (!resolvedTenantId) {
                // Platform admin without tenant context — redirect to platform dashboard
                redirect('/platform');
            }
        } else {
            redirect('/dashboard');
        }
    }

    // Get user name from profiles
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Admin';

    // Get tenant info for sidebar + theming
    let tenantLogoUrl: string | undefined;
    let tenantName: string | undefined;
    let tenantPrimaryColor: string | undefined;
    let tenantTagline: string | undefined;
    let subscriptionTier: SubscriptionTier = 'starter';
    let beltProgressEnabled: boolean | undefined;
    if (resolvedTenantId) {
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('logo_url, name, primary_color, tagline, subscription_tier, settings')
            .eq('id', resolvedTenantId)
            .single();
        tenantLogoUrl = tenant?.logo_url || undefined;
        tenantName = tenant?.name || undefined;
        tenantPrimaryColor = tenant?.primary_color || undefined;
        tenantTagline = tenant?.tagline || undefined;
        subscriptionTier = (tenant?.subscription_tier as SubscriptionTier) || 'starter';
        const settings = (tenant?.settings || {}) as Record<string, unknown>;
        beltProgressEnabled = settings.belt_progress_enabled !== false;
    }

    return (
        <ThemeProvider
            primaryColor={tenantPrimaryColor}
            logoUrl={tenantLogoUrl}
            clubName={tenantName}
            tagline={tenantTagline}
        >
            <FeatureGateProvider tier={subscriptionTier}>
                <div className="dashboard-layout">
                    <DashboardSidebar role="admin" userName={userName} tenantLogoUrl={tenantLogoUrl} tenantName={tenantName} beltProgressEnabled={beltProgressEnabled} />
                    <main className="dashboard-main">
                        <PlatformBroadcastBanner />
                        {children}
                    </main>
                    <BottomNav role="admin" />
                </div>
            </FeatureGateProvider>
        </ThemeProvider>
    );
}
