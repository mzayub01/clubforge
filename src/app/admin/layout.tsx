import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';

export default async function AdminLayout({
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

    return (
        <div className="dashboard-layout">
            <DashboardSidebar role="admin" userName={userName} />
            <main className="dashboard-main">
                {children}
            </main>
            <BottomNav role="admin" />
        </div>
    );
}
