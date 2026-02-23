'use client';

// ===============================================
// ClubForge - Advanced Reports & Analytics (Pro)
// Rich insights beyond the basic dashboard stats
// ===============================================

import { useState, useEffect, useMemo } from 'react';
import {
    BarChart3, Users, TrendingUp, TrendingDown,
    Calendar, CheckCircle, AlertCircle, Clock,
    Award, CreditCard, Activity, ArrowUpRight,
    RefreshCw
} from 'lucide-react';
import { adminFetch, adminCount } from '@/lib/admin-api';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import UpgradePrompt from '@/components/admin/UpgradePrompt';

// ── Helpers ──────────────────────────────────────

function percent(a: number, b: number) {
    if (b === 0) return 0;
    return Math.round((a / b) * 100);
}

function sparkBar(value: number, max: number, color = 'var(--color-gold)') {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: color, transition: 'width 0.5s ease' }} />
        </div>
    );
}

// ── Component ────────────────────────────────────

export default function AdminReportsPage() {
    const { can } = useFeatureGate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Raw data
    const [members, setMembers] = useState<any[]>([]);
    const [memberships, setMemberships] = useState<any[]>([]);
    const [membershipTypes, setMembershipTypes] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    const fetchAll = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [membersRes, membershipsRes, typesRes, classesRes, attendanceRes, eventsRes] = await Promise.all([
            adminFetch('profiles', { order: [{ column: 'created_at', ascending: false }] }),
            adminFetch('memberships', { select: '*, membership_type:membership_types(name, price)' }),
            adminFetch('membership_types'),
            adminFetch('classes', { filters: [{ column: 'is_active', value: true }] }),
            adminFetch('attendance', { order: [{ column: 'class_date', ascending: false }], limit: 500 }),
            adminFetch('events', { order: [{ column: 'start_date', ascending: false }] }),
        ]);

        setMembers(membersRes.data || []);
        setMemberships(membershipsRes.data || []);
        setMembershipTypes(typesRes.data || []);
        setClasses(classesRes.data || []);
        setAttendance(attendanceRes.data || []);
        setEvents(eventsRes.data || []);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { fetchAll(); }, []);

    // ── Derived analytics ────────────────────────

    const analytics = useMemo(() => {
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

        // ── Members ──
        const thisMonthMembers = members.filter(m => m.created_at?.startsWith(thisMonth));
        const lastMonthMembers = members.filter(m => m.created_at?.startsWith(lastMonthStr));
        const memberGrowth = thisMonthMembers.length - lastMonthMembers.length;

        // ── Belt distribution ──
        const beltCounts: Record<string, number> = {};
        members.forEach(m => {
            const belt = m.belt_rank || 'white';
            beltCounts[belt] = (beltCounts[belt] || 0) + 1;
        });
        const beltDistribution = Object.entries(beltCounts).sort((a, b) => b[1] - a[1]);

        // ── Memberships ──
        const activeMemberships = memberships.filter(m => m.status === 'active');
        const expiredMemberships = memberships.filter(m => m.status === 'expired' || m.status === 'cancelled');
        const churnRate = memberships.length > 0 ? percent(expiredMemberships.length, memberships.length) : 0;

        // ── Revenue by type ──
        const revenueByType: Record<string, { count: number; revenue: number }> = {};
        activeMemberships.forEach(m => {
            const typeName = m.membership_type?.name || 'Unknown';
            const price = m.membership_type?.price || 0;
            if (!revenueByType[typeName]) revenueByType[typeName] = { count: 0, revenue: 0 };
            revenueByType[typeName].count++;
            revenueByType[typeName].revenue += price;
        });
        const mrr = activeMemberships.reduce((sum, m) => sum + (m.membership_type?.price || 0), 0);

        // ── Attendance ──
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const recentAttendance = attendance.filter(a => a.class_date >= last30Days);

        // Attendance by day of week
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const attendanceByDay: Record<string, number> = {};
        dayNames.forEach(d => { attendanceByDay[d] = 0; });
        recentAttendance.forEach(a => {
            const d = new Date(a.class_date);
            attendanceByDay[dayNames[d.getDay()]]++;
        });
        const peakDay = Object.entries(attendanceByDay).sort((a, b) => b[1] - a[1])[0];
        const maxDayCount = Math.max(...Object.values(attendanceByDay));

        // Attendance by class (top 5)
        const attendanceByClass: Record<string, number> = {};
        recentAttendance.forEach(a => {
            const className = a.class_id || 'Unknown';
            attendanceByClass[className] = (attendanceByClass[className] || 0) + 1;
        });

        // Average attendance per session
        const classDates = new Set(recentAttendance.map(a => a.class_date));
        const avgPerSession = classDates.size > 0 ? Math.round(recentAttendance.length / classDates.size) : 0;

        // ── Member tenure ──
        const tenureMonths = members.map(m => {
            const created = new Date(m.created_at);
            return Math.floor((now.getTime() - created.getTime()) / (30 * 24 * 60 * 60 * 1000));
        });
        const avgTenure = tenureMonths.length > 0 ? Math.round(tenureMonths.reduce((a, b) => a + b, 0) / tenureMonths.length) : 0;

        // ── New members trend (last 6 months) ──
        const monthlySignups: { month: string; count: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-GB', { month: 'short' });
            monthlySignups.push({
                month: label,
                count: members.filter(m => m.created_at?.startsWith(key)).length,
            });
        }
        const maxSignups = Math.max(...monthlySignups.map(m => m.count), 1);

        return {
            totalMembers: members.length,
            thisMonthMembers: thisMonthMembers.length,
            memberGrowth,
            beltDistribution,
            activeMemberships: activeMemberships.length,
            churnRate,
            revenueByType,
            mrr,
            totalClasses: classes.length,
            recentAttendance: recentAttendance.length,
            avgPerSession,
            attendanceByDay,
            peakDay,
            maxDayCount,
            avgTenure,
            monthlySignups,
            maxSignups,
            totalEvents: events.length,
        };
    }, [members, memberships, classes, attendance, events]);

    // Belt colours
    const beltColors: Record<string, string> = {
        white: '#e8e8e8', blue: '#3b82f6', purple: '#8b5cf6',
        brown: '#92400e', black: '#1e1e1e', grey: '#6b7280',
        yellow: '#eab308', orange: '#f97316', green: '#22c55e',
    };

    if (!can('advanced_reports')) {
        return <UpgradePrompt feature="Advanced Reports & Analytics" description="Unlock membership trends, attendance analytics, revenue breakdowns, and member engagement insights." />;
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
    };

    const sectionTitle = (text: string) => (
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)', marginTop: 'var(--space-8)' }}>{text}</h3>
    );

    return (
        <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="dashboard-title">Advanced Reports</h1>
                    <p className="dashboard-subtitle">In-depth analytics across your club</p>
                </div>
                <button
                    className="btn btn-ghost"
                    onClick={() => fetchAll(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {/* ── Top KPI Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                {[
                    { label: 'Total Members', value: analytics.totalMembers, icon: Users, color: 'var(--color-gold)' },
                    { label: 'New This Month', value: analytics.thisMonthMembers, icon: TrendingUp, color: 'var(--color-green)', delta: analytics.memberGrowth },
                    { label: 'Active Memberships', value: analytics.activeMemberships, icon: CreditCard, color: '#818cf8' },
                    { label: 'Monthly Revenue', value: `£${analytics.mrr.toLocaleString()}`, icon: Activity, color: 'var(--color-gold)' },
                    { label: 'Churn Rate', value: `${analytics.churnRate}%`, icon: TrendingDown, color: analytics.churnRate > 20 ? 'var(--color-red)' : 'var(--color-green)' },
                    { label: 'Avg Tenure', value: `${analytics.avgTenure} mo`, icon: Clock, color: '#818cf8' },
                ].map(kpi => (
                    <div key={kpi.label} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                            <kpi.icon size={16} color={kpi.color} />
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                        </div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{kpi.value}</div>
                        {(kpi as any).delta !== undefined && (
                            <span style={{ fontSize: 'var(--text-xs)', color: (kpi as any).delta >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                                {(kpi as any).delta >= 0 ? '↑' : '↓'} {Math.abs((kpi as any).delta)} vs last month
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* ── New Members Trend ── */}
            {sectionTitle('New Members — Last 6 Months')}
            <div style={cardStyle}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', height: 160, padding: 'var(--space-4) 0' }}>
                    {analytics.monthlySignups.map(m => (
                        <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{m.count}</span>
                            <div style={{
                                width: '100%',
                                maxWidth: 48,
                                height: `${Math.max((m.count / analytics.maxSignups) * 120, 4)}px`,
                                background: 'linear-gradient(to top, var(--color-gold), rgba(197,164,86,0.6))',
                                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                transition: 'height 0.5s ease',
                            }} />
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{m.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Two-Column Layout ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>

                {/* Belt Distribution */}
                <div>
                    {sectionTitle('Belt Distribution')}
                    <div style={cardStyle}>
                        {analytics.beltDistribution.map(([belt, count]) => {
                            const baseColor = belt.split('-')[0]; // handle composite belts like 'grey-white'
                            return (
                                <div key={belt} style={{ marginBottom: 'var(--space-3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                        <span style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize', fontWeight: 500 }}>{belt.replace('-', ' ')}</span>
                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{count} ({percent(count, analytics.totalMembers)}%)</span>
                                    </div>
                                    {sparkBar(count, analytics.totalMembers, beltColors[baseColor] || 'var(--color-gold)')}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Revenue by Membership Type */}
                <div>
                    {sectionTitle('Revenue by Membership Type')}
                    <div style={cardStyle}>
                        {Object.entries(analytics.revenueByType).length === 0 ? (
                            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-6)' }}>No active memberships</p>
                        ) : (
                            Object.entries(analytics.revenueByType).map(([name, info]) => (
                                <div key={name} style={{ marginBottom: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{name}</span>
                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gold)', fontWeight: 600 }}>
                                            £{info.revenue.toLocaleString()}/mo
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                                        <span>{info.count} active</span>
                                        <span>{percent(info.revenue, analytics.mrr)}% of MRR</span>
                                    </div>
                                    {sparkBar(info.revenue, analytics.mrr, '#818cf8')}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Attendance Analytics ── */}
            {sectionTitle('Attendance — Last 30 Days')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div style={cardStyle}>
                    <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>By Day of Week</h4>
                    {Object.entries(analytics.attendanceByDay).map(([day, count]) => (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                            <span style={{ width: 32, fontSize: 'var(--text-sm)', fontWeight: 500 }}>{day}</span>
                            <div style={{ flex: 1 }}>{sparkBar(count, analytics.maxDayCount, 'var(--color-green)')}</div>
                            <span style={{ width: 32, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'right' }}>{count}</span>
                        </div>
                    ))}
                    {analytics.peakDay && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)' }}>
                            Peak day: <strong>{analytics.peakDay[0]}</strong> with {analytics.peakDay[1]} check-ins
                        </p>
                    )}
                </div>

                <div style={cardStyle}>
                    <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>Quick Stats</h4>
                    {[
                        { label: 'Total Check-ins (30d)', value: analytics.recentAttendance, icon: CheckCircle },
                        { label: 'Avg per Session', value: analytics.avgPerSession, icon: Activity },
                        { label: 'Active Classes', value: analytics.totalClasses, icon: Calendar },
                        { label: 'Total Events', value: analytics.totalEvents, icon: Calendar },
                    ].map(stat => (
                        <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                                background: 'rgba(197,164,86,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <stat.icon size={20} color="var(--color-gold)" />
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{stat.value}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
