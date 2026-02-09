import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';
import { ThemeProvider } from '@/lib/theme-provider';
import PlatformBroadcastBanner from '@/components/platform/PlatformBroadcastBanner';
import { FeatureGateProvider } from '@/components/providers/FeatureGateProvider';
import type { SubscriptionTier } from '@/lib/feature-gate';

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

    if (tenantMember?.role !== 'admin') {
        redirect('/dashboard');
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
    if (tenantMember?.tenant_id) {
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('logo_url, name, primary_color, tagline, subscription_tier')
            .eq('id', tenantMember.tenant_id)
            .single();
        tenantLogoUrl = tenant?.logo_url || undefined;
        tenantName = tenant?.name || undefined;
        tenantPrimaryColor = tenant?.primary_color || undefined;
        tenantTagline = tenant?.tagline || undefined;
        subscriptionTier = (tenant?.subscription_tier as SubscriptionTier) || 'starter';
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
                    <DashboardSidebar role="admin" userName={userName} tenantLogoUrl={tenantLogoUrl} tenantName={tenantName} />
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
