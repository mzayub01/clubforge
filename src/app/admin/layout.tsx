import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/dashboard/BottomNav';

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
