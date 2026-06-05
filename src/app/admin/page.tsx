import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import {
    Users, MapPin, Calendar, CheckCircle,
    TrendingUp, PoundSterling, UserPlus,
    AlertCircle, ChevronRight, Activity,
    ArrowUpRight, Clock, CreditCard
} from 'lucide-react';
import SetupWizard from '@/components/admin/SetupWizard';

export const metadata = {
    title: 'Admin Dashboard | ClubForge',
    description: 'Admin dashboard for ClubForge',
};

export default async function AdminDashboard() {
    // Get authenticated user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });
    const { data: { user } } = await supabase.auth.getUser();

    // Get tenant info
    const admin = createAdminClient();
    const { data: membership } = await admin
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', user!.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .single();

    const tenantId = membership?.tenant_id;

    // Get owner's first name
    const { data: profile } = await admin
        .from('profiles')
        .select('first_name')
        .eq('user_id', user!.id)
        .single();

    const firstName = profile?.first_name || 'there';

    // Fetch stats in parallel
    const [
        { count: totalMembers },
        { count: activeMembers },
        { count: totalClasses },
        { count: todayAttendance },
        { count: waitlistCount },
        revenueResult,
        { data: recentActivity },
    ] = await Promise.all([
        admin.from('profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        admin.from('memberships').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'active'),
        admin.from('classes').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
        admin.from('attendance').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId)
            .gte('class_date', new Date().toISOString().split('T')[0]),
        admin.from('waitlist').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        admin.from('memberships')
            .select('membership_type:membership_types(price)')
            .eq('tenant_id', tenantId)
            .eq('status', 'active'),
        admin.from('memberships')
            .select('id, created_at, user_id, membership_type:membership_types(name)')
            .eq('tenant_id', tenantId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    // Calculate MRR
    const allActiveMemberships = revenueResult?.data || [];
    const mrr = allActiveMemberships.reduce((sum: number, m: any) => {
        return sum + (m.membership_type?.price || 0);
    }, 0);

    // Attach profile data to recent activity (can't join profiles in PostgREST — no direct FK)
    const recentUserIds = (recentActivity || []).map((item: any) => item.user_id).filter(Boolean);
    let recentProfileMap: Record<string, any> = {};
    if (recentUserIds.length > 0) {
        const { data: recentProfiles } = await admin
            .from('profiles')
            .select('user_id, first_name, last_name')
            .in('user_id', recentUserIds);
        (recentProfiles || []).forEach((p: any) => { recentProfileMap[p.user_id] = p; });
    }
    const recentActivityWithProfiles = (recentActivity || []).map((item: any) => ({
        ...item,
        profile: recentProfileMap[item.user_id] || null,
    }));

    const stats = [
        {
            label: 'Total Members',
            value: totalMembers || 0,
            icon: Users,
            color: 'var(--color-gold)',
            href: '/admin/members',
        },
        {
            label: 'Active Memberships',
            value: activeMembers || 0,
            icon: CheckCircle,
            color: 'var(--color-green)',
            href: '/admin/memberships',
        },
        {
            label: 'Active Classes',
            value: totalClasses || 0,
            icon: Calendar,
            color: '#818cf8',
            href: '/admin/classes',
        },
        {
            label: 'Monthly Revenue',
            value: `£${mrr.toLocaleString()}`,
            icon: PoundSterling,
            color: 'var(--color-gold)',
            href: '/admin/finance',
        },
    ];

    // Context-aware quick actions
    const quickActions = [
        ...(totalClasses === 0 ? [{
            href: '/admin/classes',
            label: 'Create Your First Class',
            description: 'Set up a recurring class schedule',
            icon: Calendar,
            color: '#818cf8',
            priority: true,
        }] : []),
        ...(totalMembers === 0 || (totalMembers && totalMembers < 3) ? [{
            href: '/admin/invite',
            label: 'Invite Members',
            description: 'Share your registration link',
            icon: UserPlus,
            color: 'var(--color-green)',
            priority: true,
        }] : []),
        {
            href: '/admin/members',
            label: 'Manage Members',
            description: `${totalMembers || 0} registered`,
            icon: Users,
            color: 'var(--color-gold)',
            priority: false,
        },
        {
            href: '/admin/classes',
            label: 'Manage Classes',
            description: `${totalClasses || 0} active classes`,
            icon: Calendar,
            color: '#818cf8',
            priority: false,
        },
        {
            href: '/admin/finance',
            label: 'View Finance',
            description: `£${mrr}/mo revenue`,
            icon: PoundSterling,
            color: 'var(--color-gold)',
            priority: false,
        },
        {
            href: '/admin/settings',
            label: 'Club Settings',
            description: 'Branding, payments & more',
            icon: Activity,
            color: 'var(--text-secondary)',
            priority: false,
        },
    ].slice(0, 6);

    // Get current hour for greeting
    const hour = new Date().getUTCHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div>
            {/* Personalised Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {greeting}, {firstName}! 👋
                </h1>
                <p className="dashboard-subtitle">
                    Here&apos;s what&apos;s happening with your club today.
                </p>
            </div>

            {/* Setup Wizard — only shown until dismissed */}
            <SetupWizard />

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="stat-card glass-card"
                        style={{ textDecoration: 'none', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-lg)',
                                background: stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <stat.icon size={24} color="var(--color-black)" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Alerts */}
            {(waitlistCount ?? 0) > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--space-6)' }}>
                    <AlertCircle size={20} />
                    <div>
                        <strong>{waitlistCount} people</strong> on the waitlist.
                        <Link href="/admin/waitlist" style={{ marginLeft: 'var(--space-2)', color: 'inherit', textDecoration: 'underline' }}>
                            View waitlist →
                        </Link>
                    </div>
                </div>
            )}

            {/* Today's Snapshot */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '700',
                    marginBottom: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                }}>
                    <Clock size={20} color="var(--color-gold)" />
                    Today&apos;s Snapshot
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-4)',
                }}>
                    <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--space-1) 0' }}>
                            Check-ins Today
                        </p>
                        <p style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', margin: 0, color: 'var(--color-gold)' }}>
                            {todayAttendance || 0}
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--space-1) 0' }}>
                            Active Memberships
                        </p>
                        <p style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', margin: 0, color: 'var(--color-green)' }}>
                            {activeMembers || 0}
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--space-1) 0' }}>
                            Monthly Revenue
                        </p>
                        <p style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', margin: 0, color: 'var(--color-gold)' }}>
                            £{mrr}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
            }}>
                ⚡ Quick Actions
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-8)',
            }}>
                {quickActions.map((action) => (
                    <Link
                        key={action.href + action.label}
                        href={action.href}
                        className="glass-card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-4)',
                            textDecoration: 'none',
                            border: action.priority ? '1px solid rgba(197, 164, 86, 0.3)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-lg)',
                            background: action.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <action.icon size={20} color="var(--color-black)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: '600', fontSize: 'var(--text-sm)', margin: 0, color: 'var(--text-primary)' }}>
                                {action.label}
                            </p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                                {action.description}
                            </p>
                        </div>
                        <ArrowUpRight size={16} color="var(--text-tertiary)" />
                    </Link>
                ))}
            </div>

            {/* Recent Activity */}
            {recentActivityWithProfiles && recentActivityWithProfiles.length > 0 && (
                <div>
                    <h2 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: '700',
                        marginBottom: 'var(--space-4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                    }}>
                        <Activity size={20} color="var(--color-gold)" />
                        Recent Members
                    </h2>
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        {recentActivityWithProfiles.map((item: any, i: number) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    borderBottom: i < recentActivityWithProfiles.length - 1 ? '1px solid var(--border-light)' : 'none',
                                }}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'rgba(197, 164, 86, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--color-gold)',
                                }}>
                                    {(item.profile as any)?.first_name?.[0] || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '600', fontSize: 'var(--text-sm)', margin: 0 }}>
                                        {(item.profile as any)?.first_name} {(item.profile as any)?.last_name}
                                    </p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                                        {(item.membership_type as any)?.name || 'Member'} · Joined {new Date(item.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <CreditCard size={16} color="var(--text-tertiary)" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
