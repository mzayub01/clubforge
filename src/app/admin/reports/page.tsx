'use client';

// ===============================================
// ClubForge - Advanced Reports & Analytics (Pro)
// Rich insights beyond the basic dashboard stats
// ===============================================

import { useState, useEffect, useMemo } from 'react';
import {
    Users, TrendingUp, TrendingDown,
    Calendar, CheckCircle, Clock,
    CreditCard, Activity,
    RefreshCw
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import UpgradePrompt from '@/components/admin/UpgradePrompt';

// ── Helpers ──────────────────────────────────────

function percent(a: number, b: number) {
    if (b === 0) return 0;
    return Math.round((a / b) * 100);
}

function ProgressBar({ value, max, color = 'var(--color-gold)' }: { value: number; max: number; color?: string }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div style={{ width: '100%', height: 8, borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 'var(--radius-full)', background: color, transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
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
    const [classes, setClasses] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    const fetchAll = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [membersRes, membershipsRes, classesRes, attendanceRes, eventsRes] = await Promise.all([
            adminFetch('profiles', { order: [{ column: 'created_at', ascending: false }] }),
            adminFetch('memberships', { select: '*, membership_type:membership_types(name, price)' }),
            adminFetch('classes', { filters: [{ column: 'is_active', value: true }] }),
            adminFetch('attendance', { order: [{ column: 'class_date', ascending: false }], limit: 500 }),
            adminFetch('events', { order: [{ column: 'start_date', ascending: false }] }),
        ]);

        setMembers(membersRes.data || []);
        setMemberships(membershipsRes.data || []);
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

        // Members
        const thisMonthMembers = members.filter(m => m.created_at?.startsWith(thisMonth));
        const lastMonthMembers = members.filter(m => m.created_at?.startsWith(lastMonthStr));
        const memberGrowth = thisMonthMembers.length - lastMonthMembers.length;

        // Belt distribution
        const beltCounts: Record<string, number> = {};
        members.forEach(m => {
            const belt = m.belt_rank || 'white';
            beltCounts[belt] = (beltCounts[belt] || 0) + 1;
        });
        const beltDistribution = Object.entries(beltCounts).sort((a, b) => b[1] - a[1]);

        // Memberships
        const activeMemberships = memberships.filter(m => m.status === 'active');
        const expiredMemberships = memberships.filter(m => m.status === 'expired' || m.status === 'cancelled');
        const churnRate = memberships.length > 0 ? percent(expiredMemberships.length, memberships.length) : 0;

        // Revenue by type
        const revenueByType: Record<string, { count: number; revenue: number }> = {};
        activeMemberships.forEach(m => {
            const typeName = m.membership_type?.name || 'Unknown';
            const price = m.membership_type?.price || 0;
            if (!revenueByType[typeName]) revenueByType[typeName] = { count: 0, revenue: 0 };
            revenueByType[typeName].count++;
            revenueByType[typeName].revenue += price;
        });
        const mrr = activeMemberships.reduce((sum, m) => sum + (m.membership_type?.price || 0), 0);

        // Attendance
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const recentAttendance = attendance.filter(a => a.class_date >= last30Days);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const attendanceByDay: Record<string, number> = {};
        dayNames.forEach(d => { attendanceByDay[d] = 0; });
        recentAttendance.forEach(a => {
            const d = new Date(a.class_date);
            attendanceByDay[dayNames[d.getDay()]]++;
        });
        const peakDay = Object.entries(attendanceByDay).sort((a, b) => b[1] - a[1])[0];
        const maxDayCount = Math.max(...Object.values(attendanceByDay), 1);

        // Average attendance per session
        const classDates = new Set(recentAttendance.map(a => a.class_date));
        const avgPerSession = classDates.size > 0 ? Math.round(recentAttendance.length / classDates.size) : 0;

        // Member tenure
        const tenureMonths = members.map(m => {
            const created = new Date(m.created_at);
            return Math.floor((now.getTime() - created.getTime()) / (30 * 24 * 60 * 60 * 1000));
        });
        const avgTenure = tenureMonths.length > 0 ? Math.round(tenureMonths.reduce((a, b) => a + b, 0) / tenureMonths.length) : 0;

        // New members trend (last 6 months)
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

    return (
        <div>
            {/* ── Header ── */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="dashboard-title">Advanced Reports</h1>
                    <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>In-depth analytics across your club</p>
                </div>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => fetchAll(true)}
                    disabled={refreshing}
                    style={{ flexShrink: 0 }}
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing…' : 'Refresh Data'}
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {[
                    { label: 'Total Members', value: analytics.totalMembers, icon: Users, color: 'var(--color-gold)' },
                    { label: 'New This Month', value: analytics.thisMonthMembers, icon: TrendingUp, color: 'var(--color-green)', delta: analytics.memberGrowth },
                    { label: 'Active Memberships', value: analytics.activeMemberships, icon: CreditCard, color: '#818cf8' },
                    { label: 'Monthly Revenue', value: `£${analytics.mrr.toLocaleString()}`, icon: Activity, color: 'var(--color-gold)' },
                    { label: 'Churn Rate', value: `${analytics.churnRate}%`, icon: TrendingDown, color: analytics.churnRate > 20 ? 'var(--color-red)' : 'var(--color-green)' },
                    { label: 'Avg Tenure', value: `${analytics.avgTenure} mo`, icon: Clock, color: '#818cf8' },
                ].map(kpi => (
                    <div key={kpi.label} className="card stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 'var(--radius-lg)',
                                background: `color-mix(in srgb, ${kpi.color} 12%, transparent)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <kpi.icon size={16} color={kpi.color} />
                            </div>
                            <span className="stat-label" style={{ marginBottom: 0 }}>{kpi.label}</span>
                        </div>
                        <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{kpi.value}</div>
                        {(kpi as any).delta !== undefined && (
                            <div className={`stat-change ${(kpi as any).delta >= 0 ? 'positive' : 'negative'}`}>
                                {(kpi as any).delta >= 0 ? '↑' : '↓'} {Math.abs((kpi as any).delta)} vs last month
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── New Members Trend ── */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                    <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600 }}>New Members — Last 6 Months</h4>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', height: 140 }}>
                        {analytics.monthlySignups.map((m, i) => {
                            const isCurrentMonth = i === analytics.monthlySignups.length - 1;
                            return (
                                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: isCurrentMonth ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                                        {m.count}
                                    </span>
                                    <div style={{
                                        width: '100%',
                                        maxWidth: 48,
                                        height: `${Math.max((m.count / analytics.maxSignups) * 100, 4)}px`,
                                        background: isCurrentMonth
                                            ? 'var(--color-gold-gradient)'
                                            : 'linear-gradient(to top, rgba(197,164,86,0.3), rgba(197,164,86,0.15))',
                                        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                        transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    }} />
                                    <span style={{
                                        fontSize: 'var(--text-xs)',
                                        color: isCurrentMonth ? 'var(--color-gold)' : 'var(--text-tertiary)',
                                        fontWeight: isCurrentMonth ? 600 : 400,
                                    }}>
                                        {m.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Two-Column: Belts & Revenue ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>

                {/* Belt Distribution */}
                <div className="card">
                    <div className="card-header">
                        <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600 }}>Belt Distribution</h4>
                    </div>
                    <div className="card-body">
                        {analytics.beltDistribution.length === 0 ? (
                            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>No members yet</p>
                        ) : (
                            analytics.beltDistribution.map(([belt, count]) => {
                                const baseColor = belt.split('-')[0];
                                return (
                                    <div key={belt} style={{ marginBottom: 'var(--space-3)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <div style={{
                                                    width: 12, height: 12, borderRadius: 'var(--radius-full)',
                                                    background: beltColors[baseColor] || 'var(--color-gold)',
                                                    border: baseColor === 'white' ? '1px solid var(--border-medium)' : 'none',
                                                }} />
                                                <span style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize', fontWeight: 500 }}>
                                                    {belt.replace(/-/g, ' ')}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                {count} <span style={{ color: 'var(--text-tertiary)' }}>({percent(count, analytics.totalMembers)}%)</span>
                                            </span>
                                        </div>
                                        <ProgressBar value={count} max={analytics.totalMembers} color={beltColors[baseColor] || 'var(--color-gold)'} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Revenue by Membership Type */}
                <div className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600 }}>Revenue by Plan</h4>
                            <span className="badge badge-gold">£{analytics.mrr.toLocaleString()}/mo</span>
                        </div>
                    </div>
                    <div className="card-body">
                        {Object.entries(analytics.revenueByType).length === 0 ? (
                            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>No active memberships</p>
                        ) : (
                            Object.entries(analytics.revenueByType).map(([name, info]) => (
                                <div key={name} style={{ marginBottom: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{name}</span>
                                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-gold)' }}>
                                            £{info.revenue.toLocaleString()}/mo
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                                        <span>{info.count} active members</span>
                                        <span>{percent(info.revenue, analytics.mrr)}% of MRR</span>
                                    </div>
                                    <ProgressBar value={info.revenue} max={analytics.mrr} color="#818cf8" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Attendance Analytics ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>

                {/* Attendance by Day */}
                <div className="card">
                    <div className="card-header">
                        <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600 }}>Attendance by Day — Last 30 Days</h4>
                    </div>
                    <div className="card-body">
                        {Object.entries(analytics.attendanceByDay).map(([day, count]) => (
                            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                                <span style={{ width: 36, fontSize: 'var(--text-sm)', fontWeight: 500, color: analytics.peakDay?.[0] === day ? 'var(--color-green)' : 'var(--text-primary)' }}>
                                    {day}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <ProgressBar value={count} max={analytics.maxDayCount} color={analytics.peakDay?.[0] === day ? 'var(--color-green)' : 'rgba(45, 125, 70, 0.4)'} />
                                </div>
                                <span style={{ width: 28, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                            </div>
                        ))}
                        {analytics.peakDay && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)', marginBottom: 0 }}>
                                📈 Peak day: <strong>{analytics.peakDay[0]}</strong> with {analytics.peakDay[1]} check-ins
                            </p>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="card">
                    <div className="card-header">
                        <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600 }}>Activity Snapshot</h4>
                    </div>
                    <div className="card-body">
                        {[
                            { label: 'Total Check-ins (30d)', value: analytics.recentAttendance, icon: CheckCircle, color: 'var(--color-green)' },
                            { label: 'Avg per Session', value: analytics.avgPerSession, icon: Activity, color: 'var(--color-gold)' },
                            { label: 'Active Classes', value: analytics.totalClasses, icon: Calendar, color: '#818cf8' },
                            { label: 'Total Events', value: analytics.totalEvents, icon: Calendar, color: '#f59e0b' },
                        ].map(stat => (
                            <div key={stat.label} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                                padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-2)',
                                transition: 'background var(--transition-fast)',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                                    background: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <stat.icon size={22} color={stat.color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>{stat.label}</div>
                                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
