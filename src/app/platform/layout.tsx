// ===============================================
// ClubForge - Platform Admin Layout
// Server-side auth guard + dedicated sidebar
// ===============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import PlatformShell from '@/components/platform/PlatformShell';

export const metadata = {
    title: 'ClubForge Platform Admin',
    description: 'Platform management dashboard for ClubForge operators',
};

export default async function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Verify authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify platform admin
    const adminSupabase = createAdminClient();
    const { data: platformAdmin } = await adminSupabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!platformAdmin) {
        redirect('/dashboard');
    }

    return (
        <PlatformShell userEmail={user.email || ''}>
            {children}
        </PlatformShell>
    );
}
