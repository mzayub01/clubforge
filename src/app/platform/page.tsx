'use client';

// ===============================================
// ClubForge - Platform Dashboard
// Hero stats, recent signups, attention items
// ===============================================

import { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    CreditCard,
    TrendingUp,
    AlertTriangle,
    Clock,
    ArrowUpRight,
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

interface TenantSummary {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    subscription_tier: string;
    is_active: boolean;
}

export default function PlatformDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [recentTenants, setRecentTenants] = useState<TenantSummary[]>([]);
    const [expiringTrials, setExpiringTrials] = useState<TenantSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/platform/stats');
            const data = await res.json();
            if (data.stats) setStats(data.stats);
            if (data.recentTenants) setRecentTenants(data.recentTenants);
            if (data.expiringTrials) setExpiringTrials(data.expiringTrials);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const tierColors: Record<string, string> = {
        free: '#71717a',
        starter: '#3b82f6',
        pro: '#a78bfa',
        elite: '#f59e0b',
        enterprise: '#f59e0b',
    };

    if (loading) {
        return (
            <div className="platform-loading">
                <Loader2 size={32} className="spin" />
                <p>Loading platform data...</p>
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
        <div className="platform-dashboard">
            <div className="platform-page-header">
                <h1>Platform Dashboard</h1>
                <p>Overview of ClubForge platform health and metrics</p>
            </div>

            {/* Hero Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa' }}>
                        <Building2 size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.totalTenants || 0}</span>
                        <span className="stat-label">Total Tenants</span>
                    </div>
                    <div className="stat-badge">{stats?.activeTenants || 0} active</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                        <Users size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.totalUsers || 0}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                        <CreditCard size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.activeMemberships || 0}</span>
                        <span className="stat-label">Active Memberships</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                        <TrendingUp size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">
                            {Object.values(stats?.tierBreakdown || {}).reduce((a, b) => a + b, 0)}
                        </span>
                        <span className="stat-label">Subscriptions</span>
                    </div>
                </div>
            </div>

            {/* Tier Breakdown */}
            {stats?.tierBreakdown && Object.keys(stats.tierBreakdown).length > 0 && (
                <div className="section-card">
                    <h2>Subscription Tiers</h2>
                    <div className="tier-bars">
                        {Object.entries(stats.tierBreakdown).map(([tier, count]) => {
                            const total = Object.values(stats.tierBreakdown).reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? (count / total) * 100 : 0;
                            return (
                                <div key={tier} className="tier-row">
                                    <div className="tier-label">
                                        <span
                                            className="tier-dot"
                                            style={{ background: tierColors[tier] || '#71717a' }}
                                        />
                                        <span className="tier-name">{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
                                    </div>
                                    <div className="tier-bar-track">
                                        <div
                                            className="tier-bar-fill"
                                            style={{
                                                width: `${pct}%`,
                                                background: tierColors[tier] || '#71717a',
                                            }}
                                        />
                                    </div>
                                    <span className="tier-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="two-col">
                {/* Recent Signups */}
                <div className="section-card">
                    <div className="section-header">
                        <h2>Recent Signups</h2>
                        <Clock size={16} />
                    </div>
                    {recentTenants.length === 0 ? (
                        <p className="empty-text">No recent signups</p>
                    ) : (
                        <div className="tenant-list">
                            {recentTenants.map(t => (
                                <div key={t.id} className="tenant-row">
                                    <div className="tenant-info">
                                        <span className="tenant-name">{t.name}</span>
                                        <span className="tenant-slug">{t.slug}.clubforgehq.com</span>
                                    </div>
                                    <div className="tenant-meta">
                                        <span
                                            className="tier-pill"
                                            style={{
                                                background: `${tierColors[t.subscription_tier] || '#71717a'}20`,
                                                color: tierColors[t.subscription_tier] || '#71717a',
                                            }}
                                        >
                                            {t.subscription_tier}
                                        </span>
                                        <span className="tenant-date">{formatDate(t.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Attention Required */}
                <div className="section-card">
                    <div className="section-header">
                        <h2>Needs Attention</h2>
                        <AlertTriangle size={16} />
                    </div>
                    {expiringTrials.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">✓</div>
                            <p className="empty-text">All clear — nothing needs attention</p>
                        </div>
                    ) : (
                        <div className="tenant-list">
                            {expiringTrials.map(t => (
                                <div key={t.id} className="tenant-row attention">
                                    <div className="tenant-info">
                                        <span className="tenant-name">{t.name}</span>
                                        <span className="tenant-slug">Trial expires soon</span>
                                    </div>
                                    <ArrowUpRight size={16} className="attention-arrow" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .platform-dashboard {
                    max-width: 1100px;
                }

                .platform-page-header {
                    margin-bottom: 32px;
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

                /* Stats grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    position: relative;
                }

                .stat-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .stat-value {
                    font-size: 26px;
                    font-weight: 700;
                    color: white;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .stat-label {
                    font-size: 13px;
                    color: #71717a;
                }

                .stat-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    font-size: 11px;
                    color: #10b981;
                    background: rgba(16,185,129,0.1);
                    padding: 2px 8px;
                    border-radius: 20px;
                }

                /* Section card */
                .section-card {
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .section-card h2 {
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                    margin: 0 0 16px;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    color: #71717a;
                }

                .section-header h2 {
                    margin: 0;
                }

                /* Tier bars */
                .tier-bars {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .tier-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .tier-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100px;
                    flex-shrink: 0;
                }

                .tier-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .tier-name {
                    font-size: 13px;
                    color: #d4d4d8;
                }

                .tier-bar-track {
                    flex: 1;
                    height: 8px;
                    background: rgba(255,255,255,0.04);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .tier-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                    min-width: 4px;
                }

                .tier-count {
                    font-size: 14px;
                    font-weight: 600;
                    color: #d4d4d8;
                    width: 30px;
                    text-align: right;
                }

                /* Two column layout */
                .two-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .two-col .section-card {
                    margin-bottom: 0;
                }

                /* Tenant list */
                .tenant-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .tenant-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    border-radius: 8px;
                    transition: background 0.15s ease;
                }

                .tenant-row:hover {
                    background: rgba(255,255,255,0.03);
                }

                .tenant-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .tenant-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #e4e4e7;
                }

                .tenant-slug {
                    font-size: 12px;
                    color: #71717a;
                }

                .tenant-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .tier-pill {
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .tenant-date {
                    font-size: 12px;
                    color: #52525b;
                }

                /* Empty state */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 24px;
                    gap: 12px;
                }

                .empty-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(16,185,129,0.1);
                    color: #10b981;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: 700;
                }

                .empty-text {
                    color: #71717a;
                    font-size: 13px;
                    text-align: center;
                    margin: 0;
                }

                .attention-arrow {
                    color: #f59e0b;
                }

                @media (max-width: 900px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .two-col {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 500px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
