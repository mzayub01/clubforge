import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';
import { DashboardProvider } from '@/components/dashboard/DashboardProvider';
import { getTenantId } from '@/lib/tenant';
import { ThemeProvider } from '@/lib/theme-provider';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, role, profile_image_url')
        .eq('user_id', user.id)
        .single();

    // Get linked children (profiles where parent_guardian_id = profile.id)
    // parent_guardian_id is a FK to profiles.id, not profiles.user_id
    const { data: childProfiles } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, profile_image_url')
        .eq('parent_guardian_id', profile?.id || '');

    // Check if parent has an active membership
    const { data: parentMembership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    // Get tenant info for sidebar + theming
    const tenantId = await getTenantId();
    let tenantLogoUrl: string | undefined;
    let tenantName: string | undefined;
    let tenantPrimaryColor: string | undefined;
    let tenantTagline: string | undefined;
    if (tenantId) {
        const { data: tenant } = await supabase
            .from('tenants')
            .select('logo_url, name, primary_color, tagline')
            .eq('id', tenantId)
            .single();
        tenantLogoUrl = tenant?.logo_url || undefined;
        tenantName = tenant?.name || undefined;
        tenantPrimaryColor = tenant?.primary_color || undefined;
        tenantTagline = tenant?.tagline || undefined;
    }

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Member';
    const profileImageUrl = profile?.profile_image_url || undefined;
    const hasParentMembership = !!parentMembership;

    return (
        <ThemeProvider
            primaryColor={tenantPrimaryColor}
            logoUrl={tenantLogoUrl}
            clubName={tenantName}
            tagline={tenantTagline}
        >
            <DashboardProvider
                initialParentProfile={{
                    id: profile?.id || '',
                    user_id: user.id,
                    first_name: profile?.first_name || '',
                    last_name: profile?.last_name || '',
                    profile_image_url: profile?.profile_image_url || undefined,
                }}
                initialChildren={childProfiles || []}
                initialHasParentMembership={hasParentMembership}
            >
                <div className="dashboard-layout">
                    <DashboardSidebar
                        role="member"
                        userRole={profile?.role || 'member'}
                        userName={userName}
                        profileImageUrl={profileImageUrl}
                        hasChildren={(childProfiles?.length || 0) > 0}
                        tenantLogoUrl={tenantLogoUrl}
                        tenantName={tenantName}
                    />
                    <main className="dashboard-main">
                        {children}
                    </main>
                    <BottomNav role="member" />
                </div>
            </DashboardProvider>
        </ThemeProvider>
    );
}
