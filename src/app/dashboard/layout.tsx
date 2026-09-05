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

    // Parent's OWN active membership — controls the default profile and the
    // membership stat card (i.e. a member who has actually paid).
    const { data: parentMembership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    // Does the parent have ANY membership row of their own, regardless of status?
    // This distinguishes a *pure guardian* (no membership at all) from a member
    // whose own payment is still pending. A pending member must keep their
    // "complete payment" banner, so they must NOT be treated as guardian-only.
    const { data: parentAnyMembership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    // Get tenant info for sidebar + theming
    const tenantId = await getTenantId();
    let tenantLogoUrl: string | undefined;
    let tenantName: string | undefined;
    let tenantPrimaryColor: string | undefined;
    let tenantTagline: string | undefined;
    let beltProgressEnabled: boolean | undefined;
    if (tenantId) {
        // Admin client: members can no longer read `tenants` directly (migration 014).
        const { data: tenant } = await supabaseAdmin
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
    // hasParentMembership = parent's OWN active membership (false for guardians)
    // This controls the default profile in DashboardProvider:
    // - true → default to parent's profile
    // - false → default to first child's profile
    const hasParentMembership = !!parentMembership;
    // isGuardianOnly = parent has NO membership row of their own AND has children.
    // Keyed off "any membership" (not active-only) so a parent with a *pending*
    // membership is still treated as a member and keeps their own payment banner.
    const isGuardianOnly = !parentAnyMembership && (childProfiles?.length || 0) > 0;

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
                isGuardianOnly={isGuardianOnly}
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
