'use client';

// ===============================================
// ClubForge - Platform Analytics
// Global charts, tier breakdown, top tenants
// ===============================================

import { useState, useEffect, useCallback } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Building2,
    Loader2,
} from 'lucide-react';

interface PlatformStats {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    activeMemberships: number;
    tierBreakdown: Record<string, number>;
    monthlySignups: Record<string, number>;
}

interface TenantData {
    id: string;
    name: string;
    slug: string;
    member_count: number;
    active_memberships: number;
    subscription_tier: string;
    primary_color: string;
    created_at: string;
}

export default function PlatformAnalyticsPage() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, tenantsRes] = await Promise.all([
                fetch('/api/platform/stats'),
                fetch('/api/platform/tenants'),
            ]);
            const statsData = await statsRes.json();
            const tenantsData = await tenantsRes.json();
            if (statsData.stats) setStats(statsData.stats);
            if (tenantsData.tenants) setTenants(tenantsData.tenants);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const tierColors: Record<string, string> = {
        free: '#71717a',
        starter: '#3b82f6',
        pro: '#a78bfa',
        elite: '#f59e0b',
        enterprise: '#f59e0b',
    };

    // Top tenants by member count
    const topTenants = [...tenants]
        .sort((a, b) => b.member_count - a.member_count)
        .slice(0, 8);

    // Monthly signups for chart
    const signupMonths = Object.keys(stats?.monthlySignups || {}).sort();
    const maxSignups = Math.max(1, ...Object.values(stats?.monthlySignups || {}));

    if (loading) {
        return (
            <div className="platform-loading">
                <Loader2 size={32} className="spin" />
                <p>Loading analytics...</p>
                <style jsx>{`
                    .platform-loading {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 400px;
                        gap: 12px;
                        color: #71717a;
                    }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="platform-page-header">
                <h1>Platform Analytics</h1>
                <p>Insights across all ClubForge tenants</p>
            </div>

            {/* Summary stats */}
            <div className="summary-row">
                <div className="summary-item">
                    <Building2 size={18} />
                    <div>
                        <span className="summary-value">{stats?.activeTenants || 0}</span>
                        <span className="summary-label">Active Clubs</span>
                    </div>
                </div>
                <div className="summary-item">
                    <Users size={18} />
                    <div>
                        <span className="summary-value">{stats?.totalUsers || 0}</span>
                        <span className="summary-label">Total Users</span>
                    </div>
                </div>
                <div className="summary-item">
                    <TrendingUp size={18} />
                    <div>
                        <span className="summary-value">{stats?.activeMemberships || 0}</span>
                        <span className="summary-label">Active Memberships</span>
                    </div>
                </div>
                <div className="summary-item">
                    <BarChart3 size={18} />
                    <div>
                        <span className="summary-value">
                            {signupMonths.length > 0
                                ? stats?.monthlySignups?.[signupMonths[signupMonths.length - 1]] || 0
                                : 0
                            }
                        </span>
                        <span className="summary-label">Signups This Month</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                {/* Signup Timeline */}
                <div className="chart-card full-width">
                    <h2>Tenant Signups (Last 6 Months)</h2>
                    {signupMonths.length === 0 ? (
                        <p className="empty-text">No signup data yet</p>
                    ) : (
                        <div className="bar-chart">
                            {signupMonths.map(month => {
                                const count = stats?.monthlySignups?.[month] || 0;
                                const height = (count / maxSignups) * 100;
                                const label = new Date(month + '-01').toLocaleDateString('en-GB', {
                                    month: 'short',
                                    year: '2-digit',
                                });
                                return (
                                    <div key={month} className="bar-group">
                                        <span className="bar-count">{count}</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{ height: `${Math.max(height, 4)}%` }}
                                            />
                                        </div>
                                        <span className="bar-label">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Tier Breakdown (Pie-like) */}
                <div className="chart-card">
                    <h2>Subscription Tiers</h2>
                    {stats?.tierBreakdown && Object.keys(stats.tierBreakdown).length > 0 ? (
                        <div className="tier-breakdown">
                            <div className="tier-donut">
                                {Object.entries(stats.tierBreakdown).map(([tier, count], i) => {
                                    const total = Object.values(stats.tierBreakdown).reduce((a, b) => a + b, 0);
                                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                    return (
                                        <div key={tier} className="tier-segment" style={{ '--delay': `${i * 100}ms` } as React.CSSProperties}>
                                            <div className="tier-segment-bar">
                                                <div
                                                    className="tier-segment-fill"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: tierColors[tier] || '#71717a',
                                                    }}
                                                />
                                            </div>
                                            <div className="tier-segment-info">
                                                <span
                                                    className="tier-segment-dot"
                                                    style={{ background: tierColors[tier] || '#71717a' }}
                                                />
                                                <span className="tier-segment-name">
                                                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                                </span>
                                                <span className="tier-segment-count">{count}</span>
                                                <span className="tier-segment-pct">{pct}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="empty-text">No tier data</p>
                    )}
                </div>

                {/* Top Tenants */}
                <div className="chart-card">
                    <h2>Top Clubs by Members</h2>
                    {topTenants.length === 0 ? (
                        <p className="empty-text">No tenants yet</p>
                    ) : (
                        <div className="top-tenants">
                            {topTenants.map((tenant, i) => (
                                <div key={tenant.id} className="top-tenant-row">
                                    <span className="top-rank">#{i + 1}</span>
                                    <div
                                        className="top-color"
                                        style={{ background: tenant.primary_color }}
                                    />
                                    <div className="top-info">
                                        <span className="top-name">{tenant.name}</span>
                                        <span className="top-slug">{tenant.slug}</span>
                                    </div>
                                    <div className="top-stats">
                                        <span className="top-members">
                                            <Users size={12} /> {tenant.member_count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .analytics-page {
                    max-width: 1100px;
                }

                .platform-page-header {
                    margin-bottom: 24px;
                }

                .platform-page-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 6px;
                    letter-spacing: -0.025em;
                }

                .platform-page-header p {
                    font-size: 14px;
                    color: #71717a;
                    margin: 0;
                }

                /* Summary row */
                .summary-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .summary-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px;
                    color: #a78bfa;
                }

                .summary-item div {
                    display: flex;
                    flex-direction: column;
                }

                .summary-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: white;
                    line-height: 1;
                }

                .summary-label {
                    font-size: 12px;
                    color: #71717a;
                    margin-top: 2px;
                }

                /* Charts grid */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .chart-card {
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 20px;
                }

                .chart-card.full-width {
                    grid-column: 1 / -1;
                }

                .chart-card h2 {
                    font-size: 15px;
                    font-weight: 600;
                    color: #d4d4d8;
                    margin: 0 0 16px;
                }

                /* Bar chart */
                .bar-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 12px;
                    height: 180px;
                    padding-top: 20px;
                }

                .bar-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    height: 100%;
                }

                .bar-count {
                    font-size: 12px;
                    font-weight: 600;
                    color: #a78bfa;
                }

                .bar-track {
                    flex: 1;
                    width: 100%;
                    max-width: 40px;
                    background: rgba(167, 139, 250, 0.08);
                    border-radius: 4px 4px 0 0;
                    display: flex;
                    align-items: flex-end;
                    overflow: hidden;
                }

                .bar-fill {
                    width: 100%;
                    background: linear-gradient(180deg, #a78bfa, #7c3aed);
                    border-radius: 4px 4px 0 0;
                    transition: height 0.6s ease;
                }

                .bar-label {
                    font-size: 11px;
                    color: #71717a;
                }

                /* Tier breakdown */
                .tier-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .tier-segment {
                    animation: fadeIn 0.3s ease forwards;
                    animation-delay: var(--delay);
                    opacity: 0;
                }

                @keyframes fadeIn {
                    to { opacity: 1; }
                }

                .tier-segment-bar {
                    height: 8px;
                    background: rgba(255,255,255,0.04);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 6px;
                }

                .tier-segment-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.6s ease;
                }

                .tier-segment-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tier-segment-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .tier-segment-name {
                    font-size: 13px;
                    color: #d4d4d8;
                    flex: 1;
                }

                .tier-segment-count {
                    font-size: 14px;
                    font-weight: 600;
                    color: #e4e4e7;
                }

                .tier-segment-pct {
                    font-size: 12px;
                    color: #71717a;
                    width: 36px;
                    text-align: right;
                }

                /* Top tenants */
                .top-tenants {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .top-tenant-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 10px;
                    border-radius: 6px;
                    transition: background 0.15s ease;
                }

                .top-tenant-row:hover {
                    background: rgba(255,255,255,0.03);
                }

                .top-rank {
                    font-size: 12px;
                    color: #52525b;
                    width: 28px;
                    font-weight: 600;
                }

                .top-color {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .top-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .top-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: #e4e4e7;
                }

                .top-slug {
                    font-size: 11px;
                    color: #52525b;
                }

                .top-members {
                    font-size: 13px;
                    color: #a1a1aa;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .empty-text {
                    color: #52525b;
                    font-size: 13px;
                    text-align: center;
                    padding: 24px;
                    margin: 0;
                }

                @media (max-width: 900px) {
                    .summary-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 500px) {
                    .summary-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
