import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';
import { DashboardProvider } from '@/components/dashboard/DashboardProvider';
import { getTenantId } from '@/lib/tenant';
import { ThemeProvider } from '@/lib/theme-provider';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

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
    // Uses admin client because RLS blocks parent from seeing child profiles
    // (child profiles have different user_ids - phantom auth accounts)
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: childProfiles } = await supabaseAdmin
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

    // If parent has no membership, check if any child has one (guardian scenario)
    let hasAnyActiveMembership = !!parentMembership;
    if (!hasAnyActiveMembership && childProfiles && childProfiles.length > 0) {
        const childUserIds = childProfiles.map(c => c.user_id);
        const { data: childMembership } = await supabaseAdmin
            .from('memberships')
            .select('id')
            .in('user_id', childUserIds)
            .eq('status', 'active')
            .limit(1)
            .single();
        hasAnyActiveMembership = !!childMembership;
    }

    // Get tenant info for sidebar + theming
    const tenantId = await getTenantId();
    let tenantLogoUrl: string | undefined;
    let tenantName: string | undefined;
    let tenantPrimaryColor: string | undefined;
    let tenantTagline: string | undefined;
    let beltProgressEnabled: boolean | undefined;
    if (tenantId) {
        const { data: tenant } = await supabase
            .from('tenants')
            .select('logo_url, name, primary_color, tagline, settings')
            .eq('id', tenantId)
            .single();
        tenantLogoUrl = tenant?.logo_url || undefined;
        tenantName = tenant?.name || undefined;
        tenantPrimaryColor = tenant?.primary_color || undefined;
        tenantTagline = tenant?.tagline || undefined;
        const settings = (tenant?.settings || {}) as Record<string, unknown>;
        beltProgressEnabled = settings.belt_progress_enabled !== false; // default true
    }

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Member';
    const profileImageUrl = profile?.profile_image_url || undefined;
    const hasParentMembership = hasAnyActiveMembership;

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
                beltProgressEnabled={beltProgressEnabled}
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
                        beltProgressEnabled={beltProgressEnabled}
                    />
                    <main className="dashboard-main">
                        {children}
                    </main>
                    <BottomNav role="member" beltProgressEnabled={beltProgressEnabled} />
                </div>
            </DashboardProvider>
        </ThemeProvider>
    );
}
