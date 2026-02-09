'use client';

// ===============================================
// ClubForge - Platform Tenants Management
// Searchable table with activate/deactivate + tier change
// ===============================================

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    ChevronDown,
    ToggleLeft,
    ToggleRight,
    ExternalLink,
    Loader2,
    Users,
    CreditCard,
} from 'lucide-react';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    owner_user_id: string;
    logo_url: string | null;
    primary_color: string;
    contact_email: string | null;
    subscription_tier: string;
    subscription_status: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    member_count: number;
    active_memberships: number;
}

const TIERS = ['free', 'starter', 'pro', 'elite', 'enterprise'];

export default function PlatformTenantsPage() {
    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const [expandedTenant, setExpandedTenant] = useState<string | null>(null);

    const fetchTenants = useCallback(async () => {
        try {
            const res = await fetch('/api/platform/tenants');
            const data = await res.json();
            if (data.tenants) setTenants(data.tenants);
        } catch (err) {
            console.error('Failed to fetch tenants:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const updateTenant = async (tenantId: string, updates: Record<string, unknown>) => {
        setUpdating(tenantId);
        try {
            const res = await fetch('/api/platform/tenants', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId, ...updates }),
            });
            const data = await res.json();
            if (data.tenant) {
                setTenants(prev =>
                    prev.map(t =>
                        t.id === tenantId
                            ? { ...t, ...data.tenant }
                            : t
                    )
                );
            }
        } catch (err) {
            console.error('Failed to update tenant:', err);
        } finally {
            setUpdating(null);
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()) ||
        (t.contact_email && t.contact_email.toLowerCase().includes(search.toLowerCase()))
    );

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
                <p>Loading tenants...</p>
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
        <div className="tenants-page">
            <div className="platform-page-header">
                <h1>Tenant Management</h1>
                <p>View and manage all ClubForge tenants</p>
            </div>

            {/* Search bar */}
            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search by name, slug, or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <span className="result-count">{filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Tenant table */}
            <div className="tenants-table">
                <div className="table-header">
                    <span className="col-name">Club</span>
                    <span className="col-tier">Tier</span>
                    <span className="col-members">Members</span>
                    <span className="col-status">Status</span>
                    <span className="col-created">Created</span>
                    <span className="col-actions">Actions</span>
                </div>

                <div className="table-body">
                    {filteredTenants.map(tenant => (
                        <div key={tenant.id}>
                            <div
                                className={`table-row ${expandedTenant === tenant.id ? 'expanded' : ''}`}
                                onClick={() => setExpandedTenant(expandedTenant === tenant.id ? null : tenant.id)}
                            >
                                <div className="col-name">
                                    <div
                                        className="tenant-color-dot"
                                        style={{ background: tenant.primary_color }}
                                    />
                                    <div className="tenant-name-col">
                                        <span className="tenant-display-name">{tenant.name}</span>
                                        <span className="tenant-display-slug">{tenant.slug}.clubforgehq.com</span>
                                    </div>
                                </div>

                                <div className="col-tier">
                                    <span
                                        className="tier-pill"
                                        style={{
                                            background: `${tierColors[tenant.subscription_tier] || '#71717a'}18`,
                                            color: tierColors[tenant.subscription_tier] || '#71717a',
                                        }}
                                    >
                                        {tenant.subscription_tier}
                                    </span>
                                </div>

                                <div className="col-members">
                                    <Users size={14} />
                                    <span>{tenant.member_count}</span>
                                </div>

                                <div className="col-status">
                                    <span className={`status-dot ${tenant.is_active ? 'active' : 'inactive'}`} />
                                    <span>{tenant.is_active ? 'Active' : 'Inactive'}</span>
                                </div>

                                <div className="col-created">
                                    {formatDate(tenant.created_at)}
                                </div>

                                <div className="col-actions">
                                    <ChevronDown
                                        size={16}
                                        style={{
                                            transform: expandedTenant === tenant.id ? 'rotate(180deg)' : 'rotate(0)',
                                            transition: 'transform 0.2s ease',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Expanded detail panel */}
                            {expandedTenant === tenant.id && (
                                <div className="tenant-detail">
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Contact Email</span>
                                            <span className="detail-value">{tenant.contact_email || 'Not set'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Active Memberships</span>
                                            <span className="detail-value">
                                                <CreditCard size={14} /> {tenant.active_memberships}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Brand Colour</span>
                                            <span className="detail-value">
                                                <span className="color-swatch" style={{ background: tenant.primary_color }} />
                                                {tenant.primary_color}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Last Updated</span>
                                            <span className="detail-value">{formatDate(tenant.updated_at)}</span>
                                        </div>
                                    </div>

                                    <div className="detail-actions">
                                        {/* Toggle active status */}
                                        <button
                                            className={`action-btn ${tenant.is_active ? 'deactivate' : 'activate'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateTenant(tenant.id, { is_active: !tenant.is_active });
                                            }}
                                            disabled={updating === tenant.id}
                                        >
                                            {updating === tenant.id ? (
                                                <Loader2 size={16} className="spin" />
                                            ) : tenant.is_active ? (
                                                <ToggleRight size={16} />
                                            ) : (
                                                <ToggleLeft size={16} />
                                            )}
                                            {tenant.is_active ? 'Deactivate' : 'Activate'}
                                        </button>

                                        {/* Change tier */}
                                        <div className="tier-select-wrapper">
                                            <label>Change tier:</label>
                                            <select
                                                value={tenant.subscription_tier}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateTenant(tenant.id, { subscription_tier: e.target.value });
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={updating === tenant.id}
                                            >
                                                {TIERS.map(tier => (
                                                    <option key={tier} value={tier}>
                                                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Visit site */}
                                        <a
                                            className="action-btn visit"
                                            href={`https://${tenant.slug}.clubforgehq.com`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink size={16} />
                                            Visit Site
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .tenants-page {
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

                /* Search */
                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 16px;
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    margin-bottom: 16px;
                    color: #71717a;
                }

                .search-bar input {
                    flex: 1;
                    background: none;
                    border: none;
                    color: #e4e4e7;
                    font-size: 14px;
                    outline: none;
                }

                .search-bar input::placeholder {
                    color: #52525b;
                }

                .result-count {
                    font-size: 12px;
                    color: #52525b;
                    white-space: nowrap;
                }

                /* Table */
                .tenants-table {
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 60px;
                    padding: 12px 20px;
                    background: rgba(255,255,255,0.02);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    font-size: 12px;
                    color: #71717a;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 500;
                }

                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 60px;
                    padding: 14px 20px;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .table-row:hover {
                    background: rgba(255,255,255,0.02);
                }

                .table-row.expanded {
                    background: rgba(167, 139, 250, 0.04);
                    border-bottom-color: transparent;
                }

                .col-name {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .tenant-color-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .tenant-name-col {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .tenant-display-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #e4e4e7;
                }

                .tenant-display-slug {
                    font-size: 12px;
                    color: #52525b;
                }

                .col-members {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    color: #a1a1aa;
                }

                .col-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #a1a1aa;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }

                .status-dot.active { background: #10b981; }
                .status-dot.inactive { background: #ef4444; }

                .col-created {
                    font-size: 13px;
                    color: #71717a;
                }

                .col-actions {
                    display: flex;
                    justify-content: center;
                    color: #71717a;
                }

                .tier-pill {
                    font-size: 11px;
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                /* Expanded detail */
                .tenant-detail {
                    padding: 0 20px 20px;
                    background: rgba(167, 139, 250, 0.04);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 16px;
                    padding: 16px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .detail-label {
                    font-size: 11px;
                    color: #71717a;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .detail-value {
                    font-size: 14px;
                    color: #d4d4d8;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .color-swatch {
                    width: 14px;
                    height: 14px;
                    border-radius: 4px;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .detail-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.04);
                    color: #d4d4d8;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-decoration: none;
                }

                .action-btn:hover {
                    background: rgba(255,255,255,0.08);
                }

                .action-btn.deactivate:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                .action-btn.activate:hover {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: #10b981;
                }

                .action-btn.visit:hover {
                    background: rgba(167, 139, 250, 0.1);
                    border-color: rgba(167, 139, 250, 0.3);
                    color: #a78bfa;
                }

                .tier-select-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tier-select-wrapper label {
                    font-size: 13px;
                    color: #71717a;
                }

                .tier-select-wrapper select {
                    padding: 6px 10px;
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: #0a0a0f;
                    color: #d4d4d8;
                    font-size: 13px;
                    cursor: pointer;
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 900px) {
                    .table-header,
                    .table-row {
                        grid-template-columns: 2fr 1fr 1fr 60px;
                    }
                    .col-members,
                    .col-created {
                        display: none;
                    }
                    .detail-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 600px) {
                    .detail-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            `}</style>
        </div>
    );
}
