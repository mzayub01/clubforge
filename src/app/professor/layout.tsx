import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function ProfessorLayout({
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

    // Only professors and admins can access professor pages
    if (!['professor', 'admin'].includes(tenantMember?.role || '')) {
        redirect('/dashboard');
    }

    // Get user name from profiles
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Professor';

    // Get tenant info for beltProgressEnabled
    let beltProgressEnabled: boolean | undefined;
    if (tenantMember?.tenant_id) {
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('settings')
            .eq('id', tenantMember.tenant_id)
            .single();
        const settings = (tenant?.settings || {}) as Record<string, unknown>;
        beltProgressEnabled = settings.belt_progress_enabled !== false;
    }

    return (
        <div className="dashboard-layout">
            <DashboardSidebar role="professor" userName={userName} beltProgressEnabled={beltProgressEnabled} />
            <main className="dashboard-main">
                {children}
            </main>
            <BottomNav role="professor" />
        </div>
    );
}
