'use client';

// ===============================================
// ClubForge - Admin Settings Page
// Tabbed settings: General, Branding, Payments, Subscription
// ===============================================

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Settings, Palette, CreditCard, Crown, Save, CheckCircle, AlertCircle,
    Upload, ExternalLink, Loader2, Database, Mail, Phone, Globe, Tag,
    Shield, Zap
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

type Tab = 'general' | 'branding' | 'payments' | 'subscription';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    contact_email: string | null;
    contact_phone: string | null;
    primary_color: string;
    logo_url: string | null;
    tagline: string | null;
    stripe_account_id: string | null;
    stripe_connect_enabled: boolean;
    subscription_tier: string;
    subscription_status: string;
    trial_ends_at: string | null;
    settings: Record<string, unknown>;
}

interface AppStats {
    totalMembers: number;
    activeMembers: number;
    totalClasses: number;
    totalLocations: number;
}

export default function AdminSettingsPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<Tab>(
        (searchParams.get('tab') as Tab) || 'general'
    );
    const [tenant, setTenant] = useState<TenantData | null>(null);
    const [stats, setStats] = useState<AppStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [connectLoading, setConnectLoading] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [tagline, setTagline] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#c5a456');
    const [waiverText, setWaiverText] = useState('');
    const [etiquetteText, setEtiquetteText] = useState('');
    const [registrationMessage, setRegistrationMessage] = useState('');
    const [requireProfilePhoto, setRequireProfilePhoto] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const supabase = getSupabaseClient();

    // Check for Stripe Connect return status
    const connectStatus = searchParams.get('connect');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (connectStatus === 'success') {
            setSuccess('Stripe Connect setup complete! You can now accept member payments.');
        } else if (connectStatus === 'pending') {
            setError('Stripe Connect setup is not yet complete. Please finish the onboarding process.');
        } else if (connectStatus === 'error') {
            setError('There was an issue with Stripe Connect setup. Please try again.');
        }
    }, [connectStatus]);

    const fetchData = async () => {
        try {
            // Get current user's tenant
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: tenantMember } = await supabase
                .from('tenant_members')
                .select('tenant_id')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .single();

            if (!tenantMember) return;

            const { data: tenantData } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', tenantMember.tenant_id)
                .single();

            if (tenantData) {
                setTenant(tenantData as TenantData);
                setName(tenantData.name || '');
                setContactEmail(tenantData.contact_email || '');
                setContactPhone(tenantData.contact_phone || '');
                setTagline(tenantData.tagline || '');
                setPrimaryColor(tenantData.primary_color || '#c5a456');
                const settings = (tenantData.settings || {}) as Record<string, unknown>;
                setWaiverText((settings.waiver_text as string) || '');
                setEtiquetteText((settings.etiquette_text as string) || '');
                setRegistrationMessage((settings.registration_message as string) || '');
                setRequireProfilePhoto((settings.require_profile_photo as boolean) || false);
            }

            // Fetch stats
            const [
                { count: totalMembers },
                { count: activeMembers },
                { count: totalClasses },
                { count: totalLocations },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('classes').select('*', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('locations').select('*', { count: 'exact', head: true }).eq('is_active', true),
            ]);

            setStats({
                totalMembers: totalMembers || 0,
                activeMembers: activeMembers || 0,
                totalClasses: totalClasses || 0,
                totalLocations: totalLocations || 0,
            });
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveGeneral = async () => {
        if (!tenant) return;
        setSaving(true);
        setError('');
        try {
            const { error: updateError } = await supabase
                .from('tenants')
                .update({
                    name,
                    contact_email: contactEmail || null,
                    contact_phone: contactPhone || null,
                    tagline: tagline || null,
                })
                .eq('id', tenant.id);

            if (updateError) throw updateError;
            setSuccess('General settings saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const saveBranding = async () => {
        if (!tenant) return;
        setSaving(true);
        setError('');
        try {
            const settings = {
                ...((tenant.settings || {}) as Record<string, unknown>),
                waiver_text: waiverText || undefined,
                etiquette_text: etiquetteText || undefined,
                registration_message: registrationMessage || undefined,
                require_profile_photo: requireProfilePhoto,
            };

            const { error: updateError } = await supabase
                .from('tenants')
                .update({
                    primary_color: primaryColor,
                    settings,
                })
                .eq('id', tenant.id);

            if (updateError) throw updateError;
            setTenant(prev => prev ? { ...prev, primary_color: primaryColor, settings } : null);
            setSuccess('Branding settings saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tenant) return;

        setSaving(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `tenants/${tenant.id}/logo.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('tenant-assets')
                .upload(path, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('tenant-assets')
                .getPublicUrl(path);

            await supabase
                .from('tenants')
                .update({ logo_url: publicUrl })
                .eq('id', tenant.id);

            setTenant(prev => prev ? { ...prev, logo_url: publicUrl } : null);
            setSuccess('Logo updated!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload logo');
        } finally {
            setSaving(false);
        }
    };

    const startStripeConnect = async () => {
        setConnectLoading(true);
        setError('');
        try {
            const res = await fetch('/api/stripe/connect', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setError(data.error || 'Failed to start Stripe setup');
            }
        } catch (err) {
            setError('Failed to start Stripe setup');
        } finally {
            setConnectLoading(false);
        }
    };

    const getTrialDaysRemaining = (): number | null => {
        if (!tenant?.trial_ends_at) return null;
        const trialEnd = new Date(tenant.trial_ends_at);
        const now = new Date();
        const days = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, days);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'general', label: 'General', icon: <Settings size={18} /> },
        { key: 'branding', label: 'Branding', icon: <Palette size={18} /> },
        { key: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
        { key: 'subscription', label: 'Plan', icon: <Crown size={18} /> },
    ];

    const trialDays = getTrialDaysRemaining();

    return (
        <div>
            <div className="dashboard-header">
                <h1 className="dashboard-title">Settings</h1>
                <p className="dashboard-subtitle">
                    Manage your club&apos;s configuration, branding, and payments
                </p>
            </div>

            {success && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}
            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-1)',
                marginBottom: 'var(--space-6)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-1)',
                overflowX: 'auto',
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                            fontWeight: activeTab === tab.key ? '600' : '400',
                            background: activeTab === tab.key ? 'var(--color-gold)' : 'transparent',
                            color: activeTab === tab.key ? 'var(--color-black)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Settings size={20} color="var(--color-gold)" />
                            General Information
                        </h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    <Globe size={16} /> Club Name
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your club name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Club URL</label>
                                <div style={{
                                    padding: 'var(--space-3)',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    fontFamily: 'monospace',
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--text-secondary)',
                                }}>
                                    {tenant?.slug}.clubforgehq.com
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Tag size={16} /> Tagline
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={tagline}
                                    onChange={e => setTagline(e.target.value)}
                                    placeholder="e.g. Train Hard, Stay Humble"
                                    maxLength={100}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Mail size={16} /> Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={contactEmail}
                                        onChange={e => setContactEmail(e.target.value)}
                                        placeholder="hello@yourclub.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Phone size={16} /> Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={contactPhone}
                                        onChange={e => setContactPhone(e.target.value)}
                                        placeholder="07xxx xxx xxx"
                                    />
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-4)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                            }}>
                                {[
                                    { label: 'Members', value: stats?.totalMembers || 0, color: 'var(--color-gold)' },
                                    { label: 'Active', value: stats?.activeMembers || 0, color: 'var(--color-green)' },
                                    { label: 'Classes', value: stats?.totalClasses || 0, color: 'var(--text-primary)' },
                                    { label: 'Locations', value: stats?.totalLocations || 0, color: 'var(--text-primary)' },
                                ].map(stat => (
                                    <div key={stat.label} style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', color: stat.color, margin: 0 }}>
                                            {stat.value}
                                        </p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', margin: 0 }}>
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={saveGeneral}
                                disabled={saving}
                                style={{ marginTop: 'var(--space-2)' }}
                            >
                                {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
                <div className="animate-fade-in" style={{ display: 'grid', gap: 'var(--space-6)' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Palette size={20} color="var(--color-gold)" />
                                Visual Identity
                            </h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                {/* Logo Upload */}
                                <div className="form-group">
                                    <label className="form-label">Club Logo</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'var(--bg-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            border: '2px dashed var(--border-light)',
                                        }}>
                                            {tenant?.logo_url ? (
                                                <img src={tenant.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <Upload size={24} color="var(--text-tertiary)" />
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                ref={logoInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => logoInputRef.current?.click()}
                                                disabled={saving}
                                            >
                                                <Upload size={16} />
                                                {tenant?.logo_url ? 'Change Logo' : 'Upload Logo'}
                                            </button>
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
                                                Recommended: 200×200px, PNG or SVG
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div className="form-group">
                                    <label className="form-label">Brand Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={e => setPrimaryColor(e.target.value)}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                border: 'none',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                padding: 0,
                                            }}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={primaryColor}
                                            onChange={e => setPrimaryColor(e.target.value)}
                                            style={{ maxWidth: '140px', fontFamily: 'monospace' }}
                                        />
                                        {/* Preview */}
                                        <div style={{
                                            flex: 1,
                                            height: '48px',
                                            borderRadius: 'var(--radius-md)',
                                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}88 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontWeight: '600',
                                            fontSize: 'var(--text-sm)',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        }}>
                                            Preview
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={requireProfilePhoto}
                                            onChange={e => setRequireProfilePhoto(e.target.checked)}
                                        />
                                        <span>Require profile photo during member registration</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration Customization */}
                    <div className="card">
                        <div className="card-header">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Shield size={20} color="var(--color-gold)" />
                                Registration Content
                            </h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Welcome Message</label>
                                    <textarea
                                        className="form-input"
                                        rows={2}
                                        value={registrationMessage}
                                        onChange={e => setRegistrationMessage(e.target.value)}
                                        placeholder="Shown at the top of the registration page (optional)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Etiquette / Rules</label>
                                    <textarea
                                        className="form-input"
                                        rows={6}
                                        value={etiquetteText}
                                        onChange={e => setEtiquetteText(e.target.value)}
                                        placeholder="Club etiquette and rules that members must acknowledge"
                                    />
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
                                        Leave empty to skip the etiquette acknowledgement step
                                    </p>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Waiver Text</label>
                                    <textarea
                                        className="form-input"
                                        rows={6}
                                        value={waiverText}
                                        onChange={e => setWaiverText(e.target.value)}
                                        placeholder="Liability waiver text that members must accept"
                                    />
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
                                        Leave empty to use the default general waiver
                                    </p>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={saveBranding}
                                disabled={saving}
                                style={{ marginTop: 'var(--space-4)' }}
                            >
                                {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                                Save Branding
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <CreditCard size={20} color="var(--color-gold)" />
                            Payment Configuration
                        </h3>
                    </div>
                    <div className="card-body">
                        {tenant?.stripe_connect_enabled ? (
                            <>
                                <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                                    <CheckCircle size={18} />
                                    <div>
                                        <strong>Stripe Connected</strong>
                                        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                                            Your Stripe account is connected and ready to accept payments.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Stripe Account</span>
                                        <span className="badge badge-green">Connected</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Platform Fee</span>
                                        <span style={{ fontWeight: '500' }}>2.5% per transaction</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Payouts</span>
                                        <span style={{ fontWeight: '500' }}>Direct to your bank</span>
                                    </div>
                                </div>

                                <a
                                    href="https://dashboard.stripe.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}
                                >
                                    <ExternalLink size={16} />
                                    Open Stripe Dashboard
                                </a>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    textAlign: 'center',
                                    padding: 'var(--space-8)',
                                }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(197, 164, 86, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto var(--space-4)',
                                    }}>
                                        <CreditCard size={28} color="var(--color-gold)" />
                                    </div>

                                    <h3 style={{ marginBottom: 'var(--space-2)' }}>
                                        Connect your Stripe account
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto var(--space-6)' }}>
                                        Accept membership payments directly from your members. Funds go straight
                                        to your bank account with a 2.5% platform fee.
                                    </p>

                                    <button
                                        className="btn btn-primary"
                                        onClick={startStripeConnect}
                                        disabled={connectLoading}
                                        style={{ fontSize: 'var(--text-base)' }}
                                    >
                                        {connectLoading ? (
                                            <Loader2 size={18} className="spin" />
                                        ) : (
                                            <Zap size={18} />
                                        )}
                                        {connectLoading ? 'Setting up...' : 'Connect with Stripe'}
                                    </button>

                                    <p style={{
                                        color: 'var(--text-tertiary)',
                                        fontSize: 'var(--text-xs)',
                                        marginTop: 'var(--space-4)',
                                    }}>
                                        You&apos;ll be redirected to Stripe to complete the setup.
                                        {tenant?.stripe_account_id && ' Your previous progress will be saved.'}
                                    </p>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                                        <strong>What happens without Stripe?</strong>
                                    </p>
                                    <ul style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', paddingLeft: 'var(--space-5)', margin: 0 }}>
                                        <li>Members can still register and join your club</li>
                                        <li>Memberships will be created as &quot;pending&quot; until you manually activate them</li>
                                        <li>You&apos;ll need to collect payments independently</li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
                <div className="card animate-fade-in">
                    <div className="card-header">
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Crown size={20} color="var(--color-gold)" />
                            Your Plan
                        </h3>
                    </div>
                    <div className="card-body">
                        <div style={{
                            padding: 'var(--space-6)',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center',
                            marginBottom: 'var(--space-4)',
                        }}>
                            <span className={`badge ${tenant?.subscription_tier === 'elite' ? 'badge-gold' :
                                    tenant?.subscription_tier === 'pro' ? 'badge-blue' : 'badge-green'
                                }`} style={{ fontSize: 'var(--text-base)', padding: 'var(--space-2) var(--space-4)' }}>
                                {(tenant?.subscription_tier || 'starter').toUpperCase()}
                            </span>

                            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)', marginBottom: 0 }}>
                                Status: <strong style={{ color: tenant?.subscription_status === 'active' ? 'var(--color-green)' : 'var(--color-gold)' }}>
                                    {tenant?.subscription_status || 'unknown'}
                                </strong>
                            </p>

                            {tenant?.subscription_status === 'trialing' && trialDays !== null && (
                                <div style={{
                                    marginTop: 'var(--space-4)',
                                    padding: 'var(--space-3)',
                                    background: trialDays <= 3 ? 'rgba(255, 59, 48, 0.1)' : 'rgba(197, 164, 86, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    color: trialDays <= 3 ? 'var(--color-red)' : 'var(--color-gold)',
                                    fontWeight: '600',
                                }}>
                                    {trialDays === 0
                                        ? 'Your trial has expired'
                                        : `${trialDays} day${trialDays !== 1 ? 's' : ''} remaining in trial`
                                    }
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Members</span>
                                <span style={{ fontWeight: '500' }}>
                                    {stats?.totalMembers || 0} / {
                                        tenant?.subscription_tier === 'elite' ? 'Unlimited' :
                                            tenant?.subscription_tier === 'pro' ? '500' : '50'
                                    }
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Locations</span>
                                <span style={{ fontWeight: '500' }}>
                                    {stats?.totalLocations || 0} / {
                                        tenant?.subscription_tier === 'elite' ? 'Unlimited' :
                                            tenant?.subscription_tier === 'pro' ? '10' : '1'
                                    }
                                </span>
                            </div>
                        </div>

                        {tenant?.subscription_tier !== 'elite' && (
                            <a
                                href="/pricing"
                                className="btn btn-primary"
                                style={{ marginTop: 'var(--space-4)', display: 'flex', textDecoration: 'none' }}
                            >
                                <Zap size={18} />
                                Upgrade Plan
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
