import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';
import { ThemeProvider } from '@/lib/theme-provider';

export default async function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user role from tenant_members (multi-tenant model)
    const adminSupabase = createAdminClient();
    const { data: tenantMember } = await adminSupabase
        .from('tenant_members')
        .select('role, tenant_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

    // Instructors, professors, and admins can access instructor pages
    if (!['instructor', 'professor', 'admin'].includes(tenantMember?.role || '')) {
        redirect('/dashboard');
    }

    // Get user name from profiles
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Instructor';

    // Get tenant info for sidebar + theming
    let tenantLogoUrl: string | undefined;
    let tenantName: string | undefined;
    let tenantPrimaryColor: string | undefined;
    let tenantTagline: string | undefined;
    let beltProgressEnabled: boolean | undefined;
    if (tenantMember?.tenant_id) {
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('logo_url, name, primary_color, tagline, settings')
            .eq('id', tenantMember.tenant_id)
            .single();
        tenantLogoUrl = tenant?.logo_url || undefined;
        tenantName = tenant?.name || undefined;
        tenantPrimaryColor = tenant?.primary_color || undefined;
        tenantTagline = tenant?.tagline || undefined;
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
            <div className="dashboard-layout">
                <DashboardSidebar role="instructor" userName={userName} tenantLogoUrl={tenantLogoUrl} tenantName={tenantName} beltProgressEnabled={beltProgressEnabled} />
                <main className="dashboard-main">
                    {children}
                </main>
                <BottomNav role="instructor" />
            </div>
        </ThemeProvider>
    );
}
