'use client';

// ===============================================
// ClubForge - Platform Tenants Management
// Searchable, filterable table: activity, trial, Stripe Connect, status
// ===============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search,
    ChevronDown,
    ToggleLeft,
    ToggleRight,
    ExternalLink,
    Loader2,
    Users,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    XCircle,
} from 'lucide-react';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    owner_user_id: string | null;
    logo_url: string | null;
    primary_color: string;
    contact_email: string | null;
    subscription_tier: string;
    subscription_status: string;
    trial_ends_at: string | null;
    stripe_account_id: string | null;
    stripe_customer_id: string | null;
    stripe_connect_enabled: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    member_count: number;
    active_memberships: number;
    // Activity signals (computed by the API)
    owner_email: string | null;
    owner_last_sign_in_at: string | null;
    last_sign_in_at: string | null;
    last_check_in_at: string | null;
    last_activity_at: string | null;
    stripe_status: 'connected' | 'pending' | 'none';
}

type StatusFilter =
    | 'all' | 'active' | 'inactive'
    | 'trialing' | 'trial_ended' | 'past_due' | 'cancelled'
    | 'stripe_connected' | 'stripe_not_connected';

type SortKey = 'last_activity' | 'trial_ending' | 'created' | 'name' | 'members';

const TIERS = ['free', 'starter', 'pro', 'elite', 'enterprise'];
const DAY_MS = 86_400_000;

const time = (s: string | null | undefined) => (s ? new Date(s).getTime() : 0);
const daysUntil = (s: string) => Math.ceil((new Date(s).getTime() - Date.now()) / DAY_MS);

const formatDate = (dateStr: string | null) =>
    dateStr
        ? new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';

const formatDateTime = (dateStr: string | null) =>
    dateStr
        ? new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Never';

const formatRelative = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / DAY_MS);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
};

type Tone = 'ok' | 'warn' | 'bad' | 'muted';

const isTrialing = (t: TenantData) => t.subscription_status === 'trialing';
const trialEnded = (t: TenantData) => isTrialing(t) && !!t.trial_ends_at && daysUntil(t.trial_ends_at) < 0;

function trialInfo(t: TenantData): { label: string; tone: Tone } {
    if (!isTrialing(t)) return { label: '—', tone: 'muted' };
    if (!t.trial_ends_at) return { label: 'No end date', tone: 'muted' };
    const days = daysUntil(t.trial_ends_at);
    if (days < 0) return { label: `Ended ${-days}d ago`, tone: 'bad' };
    if (days === 0) return { label: 'Ends today', tone: 'bad' };
    if (days <= 7) return { label: `${days}d left · ${formatDate(t.trial_ends_at)}`, tone: 'warn' };
    return { label: `${days}d left · ${formatDate(t.trial_ends_at)}`, tone: 'ok' };
}

function activityTone(dateStr: string | null): Tone {
    if (!dateStr) return 'bad';
    const days = (Date.now() - new Date(dateStr).getTime()) / DAY_MS;
    if (days <= 14) return 'ok';
    if (days <= 45) return 'warn';
    return 'bad';
}

const STRIPE_LABEL: Record<TenantData['stripe_status'], { label: string; tone: Tone }> = {
    connected: { label: 'Connected', tone: 'ok' },
    pending: { label: 'Pending setup', tone: 'warn' },
    none: { label: 'Not connected', tone: 'muted' },
};

const SUB_STATUS_LABEL: Record<string, string> = {
    active: 'Paid',
    trialing: 'Trial',
    past_due: 'Past due',
    cancelled: 'Cancelled',
};

export default function PlatformTenantsPage() {
    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('all');
    const [sort, setSort] = useState<SortKey>('last_activity');
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
                setTenants(prev => prev.map(t => (t.id === tenantId ? { ...t, ...data.tenant } : t)));
            }
        } catch (err) {
            console.error('Failed to update tenant:', err);
        } finally {
            setUpdating(null);
        }
    };

    // Summary counts (over all tenants, independent of search/filter)
    const counts = useMemo(() => ({
        all: tenants.length,
        active: tenants.filter(t => t.is_active).length,
        inactive: tenants.filter(t => !t.is_active).length,
        trialing: tenants.filter(t => isTrialing(t) && !trialEnded(t)).length,
        trial_ended: tenants.filter(trialEnded).length,
        past_due: tenants.filter(t => t.subscription_status === 'past_due').length,
        stripe_connected: tenants.filter(t => t.stripe_status === 'connected').length,
        stripe_not_connected: tenants.filter(t => t.stripe_status !== 'connected').length,
    }), [tenants]);

    const matchesFilter = (t: TenantData) => {
        switch (filter) {
            case 'active': return t.is_active;
            case 'inactive': return !t.is_active;
            case 'trialing': return isTrialing(t) && !trialEnded(t);
            case 'trial_ended': return trialEnded(t);
            case 'past_due': return t.subscription_status === 'past_due';
            case 'cancelled': return t.subscription_status === 'cancelled';
            case 'stripe_connected': return t.stripe_status === 'connected';
            case 'stripe_not_connected': return t.stripe_status !== 'connected';
            default: return true;
        }
    };

    const visibleTenants = useMemo(() => {
        const q = search.toLowerCase();
        const filtered = tenants.filter(t =>
            matchesFilter(t) && (
                t.name.toLowerCase().includes(q) ||
                t.slug.toLowerCase().includes(q) ||
                (t.contact_email && t.contact_email.toLowerCase().includes(q)) ||
                (t.owner_email && t.owner_email.toLowerCase().includes(q))
            )
        );
        return [...filtered].sort((a, b) => {
            switch (sort) {
                case 'last_activity': return time(b.last_activity_at) - time(a.last_activity_at);
                case 'trial_ending': {
                    const ta = isTrialing(a) && a.trial_ends_at ? time(a.trial_ends_at) : Number.POSITIVE_INFINITY;
                    const tb = isTrialing(b) && b.trial_ends_at ? time(b.trial_ends_at) : Number.POSITIVE_INFINITY;
                    return ta - tb;
                }
                case 'name': return a.name.localeCompare(b.name);
                case 'members': return b.member_count - a.member_count;
                default: return time(b.created_at) - time(a.created_at);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenants, search, filter, sort]);

    const tierColors: Record<string, string> = {
        free: '#71717a',
        starter: '#3b82f6',
        pro: '#a78bfa',
        elite: '#f59e0b',
        enterprise: '#f59e0b',
    };

    const toggleFilter = (key: StatusFilter) => setFilter(prev => (prev === key ? 'all' : key));

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

    const StripeIcon = ({ status }: { status: TenantData['stripe_status'] }) =>
        status === 'connected' ? <CheckCircle2 size={14} />
            : status === 'pending' ? <AlertCircle size={14} />
                : <XCircle size={14} />;

    return (
        <div className="tenants-page">
            <div className="platform-page-header">
                <h1>Tenant Management</h1>
                <p>Activity, trials, Stripe Connect and status for every ClubForge tenant</p>
            </div>

            {/* Summary chips — click to filter */}
            <div className="summary-chips">
                {([
                    ['active', 'Active', counts.active, 'ok'],
                    ['inactive', 'Inactive', counts.inactive, 'bad'],
                    ['trialing', 'On trial', counts.trialing, 'warn'],
                    ['trial_ended', 'Trial ended', counts.trial_ended, 'bad'],
                    ['past_due', 'Past due', counts.past_due, 'bad'],
                    ['stripe_connected', 'Stripe connected', counts.stripe_connected, 'ok'],
                    ['stripe_not_connected', 'No Stripe', counts.stripe_not_connected, 'muted'],
                ] as [StatusFilter, string, number, Tone][]).map(([key, label, count, tone]) => (
                    <button
                        key={key}
                        className={`chip tone-${tone} ${filter === key ? 'selected' : ''}`}
                        onClick={() => toggleFilter(key)}
                        type="button"
                    >
                        <span className="chip-count">{count}</span>
                        <span className="chip-label">{label}</span>
                    </button>
                ))}
            </div>

            {/* Search + sort */}
            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search by name, slug, contact or owner email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <label className="sort-wrapper">
                    <span>Sort</span>
                    <select value={sort} onChange={e => setSort(e.target.value as SortKey)}>
                        <option value="last_activity">Last used</option>
                        <option value="trial_ending">Trial ending soonest</option>
                        <option value="created">Newest</option>
                        <option value="members">Most members</option>
                        <option value="name">Name</option>
                    </select>
                </label>
                <span className="result-count">
                    {visibleTenants.length} of {tenants.length}
                    {filter !== 'all' && (
                        <button className="clear-filter" onClick={() => setFilter('all')} type="button">clear filter</button>
                    )}
                </span>
            </div>

            {/* Tenant table */}
            <div className="tenants-table">
                <div className="table-header">
                    <span className="col-name">Club</span>
                    <span className="col-tier">Tier</span>
                    <span className="col-members">Members</span>
                    <span className="col-status">Status</span>
                    <span className="col-stripe">Stripe</span>
                    <span className="col-trial">Trial ends</span>
                    <span className="col-last">Last used</span>
                    <span className="col-actions" />
                </div>

                <div className="table-body">
                    {visibleTenants.length === 0 && (
                        <div className="empty-row">No tenants match this filter.</div>
                    )}
                    {visibleTenants.map(tenant => {
                        const trial = trialInfo(tenant);
                        const stripe = STRIPE_LABEL[tenant.stripe_status];
                        const expanded = expandedTenant === tenant.id;
                        return (
                            <div key={tenant.id}>
                                <div
                                    className={`table-row ${expanded ? 'expanded' : ''}`}
                                    onClick={() => setExpandedTenant(expanded ? null : tenant.id)}
                                >
                                    <div className="col-name">
                                        <div className="tenant-color-dot" style={{ background: tenant.primary_color }} />
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
                                        <div className="status-stack">
                                            <span>{tenant.is_active ? 'Active' : 'Inactive'}</span>
                                            <span className={`status-sub ${tenant.subscription_status === 'past_due' || trialEnded(tenant) ? 'tone-bad' : ''}`}>
                                                {SUB_STATUS_LABEL[tenant.subscription_status] || tenant.subscription_status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`col-stripe tone-${stripe.tone}`}>
                                        <StripeIcon status={tenant.stripe_status} />
                                        <span>{stripe.label}</span>
                                    </div>

                                    <div className={`col-trial tone-${trial.tone}`}>{trial.label}</div>

                                    <div className={`col-last tone-${activityTone(tenant.last_activity_at)}`} title={formatDateTime(tenant.last_activity_at)}>
                                        {formatRelative(tenant.last_activity_at)}
                                    </div>

                                    <div className="col-actions">
                                        <ChevronDown
                                            size={16}
                                            style={{
                                                transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                                                transition: 'transform 0.2s ease',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Expanded detail panel */}
                                {expanded && (
                                    <div className="tenant-detail">
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Owner</span>
                                                <span className="detail-value">{tenant.owner_email || 'Unknown'}</span>
                                                <span className="detail-hint">Last sign-in {formatRelative(tenant.owner_last_sign_in_at).toLowerCase()}</span>
                                            </div>
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
                                                <span className="detail-label">Created</span>
                                                <span className="detail-value">{formatDate(tenant.created_at)}</span>
                                                <span className="detail-hint">Updated {formatRelative(tenant.updated_at).toLowerCase()}</span>
                                            </div>

                                            <div className="detail-item">
                                                <span className="detail-label">Subscription</span>
                                                <span className="detail-value">
                                                    {SUB_STATUS_LABEL[tenant.subscription_status] || tenant.subscription_status}
                                                    {' · '}
                                                    <span style={{ textTransform: 'capitalize' }}>{tenant.subscription_tier}</span>
                                                </span>
                                                <span className="detail-hint">
                                                    {tenant.stripe_customer_id ? 'Billing customer on file' : 'No billing customer yet'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Trial ends</span>
                                                <span className={`detail-value tone-${trial.tone}`}>
                                                    {tenant.trial_ends_at ? formatDate(tenant.trial_ends_at) : '—'}
                                                </span>
                                                {isTrialing(tenant) && <span className="detail-hint">{trial.label}</span>}
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Stripe Connect</span>
                                                <span className={`detail-value tone-${stripe.tone}`}>
                                                    <StripeIcon status={tenant.stripe_status} /> {stripe.label}
                                                </span>
                                                <span className="detail-hint mono">{tenant.stripe_account_id || 'No connected account'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Activity</span>
                                                <span className="detail-value">Sign-in {formatRelative(tenant.last_sign_in_at).toLowerCase()}</span>
                                                <span className="detail-hint">Check-in {formatRelative(tenant.last_check_in_at).toLowerCase()}</span>
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
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .tenants-page {
                    max-width: 1320px;
                }

                .platform-page-header {
                    margin-bottom: 20px;
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

                /* Tone colours (shared by chips, cells, detail values) */
                .tone-ok { color: #10b981; }
                .tone-warn { color: #f59e0b; }
                .tone-bad { color: #ef4444; }
                .tone-muted { color: #71717a; }

                /* Summary chips */
                .summary-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 14px;
                }

                .chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 7px 12px;
                    border-radius: 999px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: #16161d;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.15s ease;
                }

                .chip:hover { border-color: rgba(255,255,255,0.18); }

                .chip.selected {
                    border-color: currentColor;
                    background: rgba(255,255,255,0.05);
                }

                .chip-count {
                    font-size: 14px;
                    font-weight: 700;
                    font-variant-numeric: tabular-nums;
                }

                .chip-label {
                    color: #a1a1aa;
                }

                .chip.selected .chip-label { color: #e4e4e7; }

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
                    min-width: 120px;
                    background: none;
                    border: none;
                    color: #e4e4e7;
                    font-size: 14px;
                    outline: none;
                }

                .search-bar input::placeholder {
                    color: #52525b;
                }

                .sort-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #71717a;
                }

                .sort-wrapper select {
                    padding: 5px 8px;
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: #0a0a0f;
                    color: #d4d4d8;
                    font-size: 12px;
                    cursor: pointer;
                }

                .result-count {
                    font-size: 12px;
                    color: #52525b;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .clear-filter {
                    background: none;
                    border: none;
                    color: #a78bfa;
                    font-size: 12px;
                    cursor: pointer;
                    padding: 0;
                }

                /* Table */
                .tenants-table {
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .table-header,
                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 0.8fr 0.7fr 1fr 1.1fr 1.4fr 0.9fr 40px;
                    gap: 8px;
                    align-items: center;
                }

                .table-header {
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
                    padding: 14px 20px;
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

                .empty-row {
                    padding: 32px 20px;
                    text-align: center;
                    color: #52525b;
                    font-size: 13px;
                }

                .col-name {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
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
                    min-width: 0;
                }

                .tenant-display-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #e4e4e7;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .tenant-display-slug {
                    font-size: 12px;
                    color: #52525b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
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
                    gap: 8px;
                    font-size: 13px;
                    color: #a1a1aa;
                }

                .status-stack {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.25;
                }

                .status-sub {
                    font-size: 11px;
                    color: #52525b;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .status-dot.active { background: #10b981; }
                .status-dot.inactive { background: #ef4444; }

                .col-stripe {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                }

                .col-trial,
                .col-last {
                    font-size: 13px;
                    font-variant-numeric: tabular-nums;
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
                    min-width: 0;
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
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .detail-hint {
                    font-size: 12px;
                    color: #71717a;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .detail-hint.mono {
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                    font-size: 11px;
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

                @media (max-width: 1100px) {
                    .table-header,
                    .table-row {
                        grid-template-columns: 2fr 1fr 1.1fr 1.4fr 0.9fr 40px;
                    }
                    .col-tier,
                    .col-members {
                        display: none;
                    }
                }

                @media (max-width: 800px) {
                    .table-header,
                    .table-row {
                        grid-template-columns: 2fr 1fr 1fr 40px;
                    }
                    .col-stripe,
                    .col-trial {
                        display: none;
                    }
                    .detail-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .sort-wrapper span { display: none; }
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
