'use client';

// ===============================================
// ClubForge - Admin Email Templates (Pro / Elite)
// Edit the automated templates, and create your own custom templates that
// can be sent to members (same audience options as announcements).
// ===============================================

import { useState, useEffect } from 'react';
import { Mail, Edit, Eye, Save, X, CheckCircle, AlertCircle, RefreshCw, Plus, Send, Trash2, Loader2, Sparkles } from 'lucide-react';
import { adminFetch, adminUpdateById, adminInsert, adminDeleteById } from '@/lib/admin-api';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import UpgradePrompt from '@/components/admin/UpgradePrompt';
import ModalPortal from '@/components/admin/ModalPortal';
import type { Location } from '@/lib/types';

interface EmailTemplate {
    id: string;
    template_key: string;
    name: string;
    description: string | null;
    subject: string;
    greeting: string;
    body_intro: string;
    body_details: string | null;
    body_action: string | null;
    body_closing: string;
    signature: string;
    button_text: string | null;
    button_url: string | null;
    is_active: boolean;
    updated_at: string;
}

const TEMPLATE_ICONS: Record<string, string> = {
    welcome: '👋',
    event_confirmation: '🎫',
    membership_activated: '✅',
    payment_failed: '⚠️',
    payment_incomplete: '💳',
    announcement_notification: '📢',
};

const CUSTOM_PREFIX = 'custom_';
const isCustom = (t: { template_key: string }) => t.template_key.startsWith(CUSTOM_PREFIX);
const iconFor = (t: { template_key: string }) => (isCustom(t) ? '✉️' : TEMPLATE_ICONS[t.template_key] || '📧');

const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'template';

function blankCustomTemplate(clubName: string): EmailTemplate {
    return {
        id: '',
        template_key: '',
        name: '',
        description: '',
        subject: '',
        greeting: 'Hi {{firstName}},',
        body_intro: '',
        body_details: '',
        body_action: '',
        body_closing: 'If you have any questions, just reply to this email.',
        signature: `The ${clubName} Team`,
        button_text: '',
        button_url: '',
        is_active: true,
        updated_at: new Date().toISOString(),
    };
}

interface SendForm {
    locationId: string;
    targetAudience: 'all' | 'members' | 'instructors';
    includePending: boolean;
}

export default function AdminEmailTemplatesPage() {
    const { can } = useFeatureGate();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tenantName, setTenantName] = useState('ClubForge');
    const [tenantLogo, setTenantLogo] = useState('/logo-clubforge-final.svg');
    const [tenantColor, setTenantColor] = useState('#c5a456');

    // Custom-template sending
    const [locations, setLocations] = useState<Location[]>([]);
    const [sendingTemplate, setSendingTemplate] = useState<EmailTemplate | null>(null);
    const [sendForm, setSendForm] = useState<SendForm>({ locationId: '', targetAudience: 'all', includePending: false });
    const [recipientCount, setRecipientCount] = useState<number | null>(null);
    const [countLoading, setCountLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<string>('');
    const [deletingTemplate, setDeletingTemplate] = useState<EmailTemplate | null>(null);

    useEffect(() => {
        fetchTemplates();
        // Fetch tenant branding
        adminFetch<{ name: string; logo_url: string | null; primary_color: string | null }>('tenants', { limit: 1 })
            .then(({ data }) => {
                if (data?.[0]) {
                    setTenantName(data[0].name || 'ClubForge');
                    if (data[0].logo_url) setTenantLogo(data[0].logo_url);
                    if (data[0].primary_color) setTenantColor(data[0].primary_color);
                }
            });
        adminFetch<Location>('locations', { filters: [{ column: 'is_active', value: true }], order: [{ column: 'name' }] })
            .then(({ data }) => setLocations(data || []));
    }, []);

    // Live recipient preview for the send modal (dry run of the real pipeline)
    useEffect(() => {
        if (!sendingTemplate) return;
        let cancelled = false;
        setCountLoading(true);
        fetch('/api/email/announcement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                countOnly: true,
                templateKey: sendingTemplate.template_key,
                locationId: sendForm.locationId || null,
                targetAudience: sendForm.targetAudience,
                includePending: sendForm.includePending,
            }),
        })
            .then(res => (res.ok ? res.json() : null))
            .then(data => { if (!cancelled) setRecipientCount(typeof data?.recipients === 'number' ? data.recipients : null); })
            .catch(() => { if (!cancelled) setRecipientCount(null); })
            .finally(() => { if (!cancelled) setCountLoading(false); });
        return () => { cancelled = true; };
    }, [sendingTemplate, sendForm.locationId, sendForm.targetAudience, sendForm.includePending]);

    const fetchTemplates = async () => {
        setLoading(true);
        const { data, error } = await adminFetch<EmailTemplate>('email_templates', {
            order: [{ column: 'name' }],
        });

        if (error) {
            console.error('Error fetching templates:', error);
            setError('Failed to load email templates');
        } else {
            setTemplates(data || []);
        }
        setLoading(false);
    };

    const flash = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSave = async () => {
        if (!editingTemplate) return;
        const custom = !editingTemplate.id || isCustom(editingTemplate);

        if (custom && !editingTemplate.name.trim()) { setError('Give the template a name'); return; }
        if (!editingTemplate.subject.trim()) { setError('Subject line is required'); return; }
        if (!editingTemplate.body_intro.trim()) { setError('Introduction is required'); return; }

        setSaving(true);
        setError('');

        const fields = {
            subject: editingTemplate.subject,
            greeting: editingTemplate.greeting || 'Hi {{firstName}},',
            body_intro: editingTemplate.body_intro,
            body_details: editingTemplate.body_details || null,
            body_action: editingTemplate.body_action || null,
            body_closing: editingTemplate.body_closing || '',
            signature: editingTemplate.signature || `The ${tenantName} Team`,
            button_text: editingTemplate.button_text || null,
            button_url: editingTemplate.button_url || null,
            is_active: editingTemplate.is_active,
            ...(custom ? { name: editingTemplate.name.trim(), description: editingTemplate.description || null } : {}),
        };

        const { error } = editingTemplate.id
            ? await adminUpdateById('email_templates', editingTemplate.id, fields)
            : await adminInsert('email_templates', {
                ...fields,
                template_key: `${CUSTOM_PREFIX}${slugify(editingTemplate.name)}_${Date.now().toString(36)}`,
            });

        if (error) {
            console.error('Error saving template:', error);
            setError('Failed to save template');
        } else {
            flash(editingTemplate.id ? 'Template saved' : 'Custom template created');
            setEditingTemplate(null);
            fetchTemplates();
        }

        setSaving(false);
    };

    const handleDelete = async () => {
        if (!deletingTemplate || !isCustom(deletingTemplate)) return;
        setSaving(true);
        const { error } = await adminDeleteById('email_templates', deletingTemplate.id);
        setSaving(false);
        if (error) {
            setError('Failed to delete template');
        } else {
            flash('Template deleted');
            setDeletingTemplate(null);
            fetchTemplates();
        }
    };

    const openSend = (template: EmailTemplate) => {
        setSendForm({ locationId: '', targetAudience: 'all', includePending: false });
        setSendResult('');
        setRecipientCount(null);
        setSendingTemplate(template);
    };

    const handleSend = async () => {
        if (!sendingTemplate) return;
        setSending(true);
        setSendResult('');
        try {
            const res = await fetch('/api/email/announcement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateKey: sendingTemplate.template_key,
                    locationId: sendForm.locationId || null,
                    targetAudience: sendForm.targetAudience,
                    includePending: sendForm.includePending,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send');
            setSendResult(`Sent to ${data.sent ?? 0} recipient${data.sent === 1 ? '' : 's'}${data.failed ? `, ${data.failed} failed` : ''}.`);
            if (data.sent > 0) flash(`"${sendingTemplate.name}" sent to ${data.sent} member${data.sent === 1 ? '' : 's'}`);
        } catch (err) {
            setSendResult(err instanceof Error ? err.message : 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const updateField = (field: keyof EmailTemplate, value: string | boolean) => {
        if (!editingTemplate) return;
        setEditingTemplate({ ...editingTemplate, [field]: value });
    };

    const renderPreview = (template: EmailTemplate) => {
        // Replace placeholders with sample data for preview
        const sampleData: Record<string, string> = {
            '{{firstName}}': 'Ahmed',
            '{{clubName}}': tenantName,
            '{{locationName}}': 'Fats Gym',
            '{{membershipType}}': 'Adult Membership',
            '{{eventTitle}}': 'Annual Club Competition 2026',
            '{{eventDate}}': 'Saturday, 15th February 2026',
            '{{eventTime}}': '10:00 AM',
            '{{eventLocation}}': 'Main Training Hall',
            '{{ticketType}}': 'General Admission',
            '{{amountPaid}}': '£25.00',
            '{{price}}': '£30/month',
            '{{startDate}}': '5th January 2026',
            '{{amountDue}}': '£30.00',
            '{{attemptCount}}': '1',
            '{{nextAttemptDate}}': '12th January 2026',
            '{{paymentLink}}': '#',
            // Announcement template placeholders
            '{{announcementTitle}}': 'Important Class Update',
            '{{announcementMessage}}': 'This is a sample announcement message that will be sent to members.',
        };

        const replacePlaceholders = (text: string) => {
            let result = text;
            Object.entries(sampleData).forEach(([key, value]) => {
                result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
            });
            // Convert markdown-style bold to HTML
            result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            return result;
        };

        return (
            <div style={{
                background: '#f8f9fa',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                maxHeight: '70vh',
                overflow: 'auto',
            }}>
                <div style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-8)',
                    maxWidth: '600px',
                    margin: '0 auto',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={tenantLogo}
                            alt={tenantName}
                            style={{ height: '60px', width: 'auto' }}
                        />
                    </div>

                    {/* Subject */}
                    <h2 style={{
                        fontSize: 'var(--text-xl)',
                        textAlign: 'center',
                        marginBottom: 'var(--space-4)',
                        color: '#1a1a1a',
                    }}>
                        {replacePlaceholders(template.subject) || 'Subject line'}
                    </h2>

                    {/* Greeting */}
                    <p style={{ marginBottom: 'var(--space-4)', color: '#4a4a4a' }}>
                        {replacePlaceholders(template.greeting)}
                    </p>

                    {/* Body Intro */}
                    <p style={{ marginBottom: 'var(--space-4)', color: '#4a4a4a', whiteSpace: 'pre-line' }}
                        dangerouslySetInnerHTML={{ __html: replacePlaceholders(template.body_intro) }}
                    />

                    {/* Body Details */}
                    {template.body_details && (
                        <div style={{
                            background: '#f8f9fa',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-4)',
                            marginBottom: 'var(--space-4)',
                            whiteSpace: 'pre-line',
                        }}
                            dangerouslySetInnerHTML={{ __html: replacePlaceholders(template.body_details) }}
                        />
                    )}

                    {/* Body Action */}
                    {template.body_action && (
                        <p style={{ marginBottom: 'var(--space-4)', color: '#4a4a4a', whiteSpace: 'pre-line' }}
                            dangerouslySetInnerHTML={{ __html: replacePlaceholders(template.body_action) }}
                        />
                    )}

                    {/* Button */}
                    {template.button_text && (
                        <div style={{ textAlign: 'center', margin: 'var(--space-6) 0' }}>
                            <span style={{
                                display: 'inline-block',
                                background: `linear-gradient(135deg, ${tenantColor}, ${tenantColor}cc)`,
                                color: '#000',
                                padding: 'var(--space-3) var(--space-6)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                            }}>
                                {template.button_text}
                            </span>
                        </div>
                    )}

                    {/* Body Closing */}
                    <p style={{ marginBottom: 'var(--space-4)', color: '#4a4a4a', whiteSpace: 'pre-line' }}
                        dangerouslySetInnerHTML={{ __html: replacePlaceholders(template.body_closing) }}
                    />

                    {/* Signature */}
                    <p style={{ color: '#4a4a4a' }}>
                        Best regards,<br />
                        <strong>{template.signature}</strong>
                    </p>

                    {/* Footer */}
                    <div style={{
                        borderTop: '1px solid #e5e5e5',
                        marginTop: 'var(--space-6)',
                        paddingTop: 'var(--space-4)',
                        textAlign: 'center',
                        color: '#888',
                        fontSize: 'var(--text-sm)',
                    }}>
                        <p style={{ margin: '0 0 4px' }}>{tenantName}</p>
                        <p style={{ margin: 0 }}>Powered by ClubForge</p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    if (!can('email_templates')) return <UpgradePrompt feature="Custom Email Templates" description="Design branded email templates for your member communications, and create your own templates to send to members." />;

    const systemTemplates = templates.filter(t => !isCustom(t));
    const customTemplates = templates.filter(isCustom);
    const editingIsCustom = !!editingTemplate && (!editingTemplate.id || isCustom(editingTemplate));

    const renderCard = (template: EmailTemplate) => (
        <div key={template.id} className="card">
            <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-2xl)' }}>{iconFor(template)}</span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{template.name}</h3>
                            <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                                <span className={`badge ${template.is_active ? 'badge-green' : 'badge-gray'}`}>
                                    {template.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {isCustom(template) && <span className="badge badge-gold">Custom</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {template.description && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                        {template.description}
                    </p>
                )}

                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>Subject</p>
                    <p style={{ fontSize: 'var(--text-sm)', margin: 0, fontWeight: '500' }}>{template.subject}</p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setPreviewTemplate(template)}>
                        <Eye size={16} /> Preview
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setEditingTemplate(template)}>
                        <Edit size={16} /> Edit
                    </button>
                    {isCustom(template) && (
                        <>
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ flex: 1 }}
                                onClick={() => openSend(template)}
                                disabled={!template.is_active}
                                title={template.is_active ? 'Send this template to members' : 'Activate the template to send it'}
                            >
                                <Send size={16} /> Send
                            </button>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeletingTemplate(template)} title="Delete template" aria-label="Delete template">
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
                    Last updated: {new Date(template.updated_at).toLocaleDateString('en-GB')}
                </p>
            </div>
        </div>
    );

    return (
        <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <div>
                    <h1 className="dashboard-title">Email Templates</h1>
                    <p className="dashboard-subtitle">Customise your automated emails, or create your own templates to send to members</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-ghost" onClick={fetchTemplates}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => { setError(''); setEditingTemplate(blankCustomTemplate(tenantName)); }}>
                        <Plus size={18} /> New Template
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {/* Custom templates */}
            <h2 style={{ fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: '0 0 var(--space-3)' }}>
                <Sparkles size={18} color="var(--color-gold)" /> Your templates
            </h2>
            {customTemplates.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
                    <Mail size={40} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-3)' }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No custom templates yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                        Create reusable emails — a term-dates notice, a grading reminder, a kit order — and send them to
                        everyone, one location, or just instructors. Child members&apos; emails go to their guardians automatically.
                    </p>
                    <button className="btn btn-primary" onClick={() => { setError(''); setEditingTemplate(blankCustomTemplate(tenantName)); }}>
                        <Plus size={18} /> Create your first template
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                    {customTemplates.map(renderCard)}
                </div>
            )}

            {/* System templates */}
            <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 var(--space-3)' }}>Automated emails</h2>
            {systemTemplates.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <Mail size={48} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-4)' }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No Email Templates</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Run the database migration to create default templates.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-4)' }}>
                    {systemTemplates.map(renderCard)}
                </div>
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => setPreviewTemplate(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {iconFor(previewTemplate)} {previewTemplate.name || 'New template'} Preview
                            </h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setPreviewTemplate(null)} aria-label="Close" title="Close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: 0 }}>
                            {renderPreview(previewTemplate)}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setPreviewTemplate(null)}>
                                Close
                            </button>
                            {!editingTemplate && (
                                <button className="btn btn-primary" onClick={() => {
                                    setEditingTemplate(previewTemplate);
                                    setPreviewTemplate(null);
                                }}>
                                    <Edit size={16} />
                                    Edit Template
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}

            {/* Edit / Create Modal */}
            {editingTemplate && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => setEditingTemplate(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingTemplate.id ? `${iconFor(editingTemplate)} Edit ${editingTemplate.name}` : '✉️ New custom template'}
                            </h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setEditingTemplate(null)} aria-label="Close" title="Close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflow: 'auto' }}>
                            <div style={{
                                background: 'rgba(197, 164, 86, 0.1)',
                                border: '1px solid var(--color-gold)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-3)',
                                marginBottom: 'var(--space-4)',
                                fontSize: 'var(--text-sm)',
                            }}>
                                <strong>💡 Tip:</strong>{' '}
                                {editingIsCustom ? (
                                    <>Use <code>{`{{firstName}}`}</code> and <code>{`{{clubName}}`}</code> for personalisation. Use <code>**text**</code> for bold. Line breaks are kept.</>
                                ) : (
                                    <>Use placeholders like <code>{`{{firstName}}`}</code>, <code>{`{{locationName}}`}</code>, <code>{`{{membershipType}}`}</code> for dynamic content. Use <code>**text**</code> for bold.</>
                                )}
                            </div>

                            {editingIsCustom && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Template name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editingTemplate.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            placeholder="e.g. Term dates reminder"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description (internal)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editingTemplate.description || ''}
                                            onChange={(e) => updateField('description', e.target.value)}
                                            placeholder="What is this template for?"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Subject Line</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editingTemplate.subject}
                                    onChange={(e) => updateField('subject', e.target.value)}
                                    placeholder={editingIsCustom ? 'e.g. {{clubName}} — Spring term dates' : undefined}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Greeting</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editingTemplate.greeting}
                                    onChange={(e) => updateField('greeting', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Introduction</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={editingTemplate.body_intro}
                                    onChange={(e) => updateField('body_intro', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Details (appears in highlighted box)</label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    value={editingTemplate.body_details || ''}
                                    onChange={(e) => updateField('body_details', e.target.value)}
                                    placeholder="Use emoji + **Label:** Value format"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Action/Instructions</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={editingTemplate.body_action || ''}
                                    onChange={(e) => updateField('body_action', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Closing Message</label>
                                <textarea
                                    className="form-input"
                                    rows={2}
                                    value={editingTemplate.body_closing}
                                    onChange={(e) => updateField('body_closing', e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Button Text</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingTemplate.button_text || ''}
                                        onChange={(e) => updateField('button_text', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Button URL</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingTemplate.button_url || ''}
                                        onChange={(e) => updateField('button_url', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Signature</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editingTemplate.signature}
                                    onChange={(e) => updateField('signature', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={editingTemplate.is_active}
                                        onChange={(e) => updateField('is_active', e.target.checked)}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    {editingIsCustom ? 'Template is active (can be sent)' : 'Template is active (emails will be sent)'}
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setPreviewTemplate(editingTemplate)}>
                                <Eye size={16} />
                                Preview
                            </button>
                            <button className="btn btn-ghost" onClick={() => setEditingTemplate(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <span className="spinner" style={{ width: '16px', height: '16px' }} />
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {editingTemplate.id ? 'Save Changes' : 'Create Template'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}

            {/* Send Modal (custom templates) */}
            {sendingTemplate && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => !sending && setSendingTemplate(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Send size={18} /> Send &ldquo;{sendingTemplate.name}&rdquo;
                            </h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setSendingTemplate(null)} disabled={sending} aria-label="Close" title="Close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <select
                                    className="form-input"
                                    value={sendForm.locationId}
                                    onChange={e => setSendForm({ ...sendForm, locationId: e.target.value })}
                                    disabled={sending}
                                >
                                    <option value="">All locations</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Audience</label>
                                <select
                                    className="form-input"
                                    value={sendForm.targetAudience}
                                    onChange={e => setSendForm({ ...sendForm, targetAudience: e.target.value as SendForm['targetAudience'] })}
                                    disabled={sending}
                                >
                                    <option value="all">Everyone with an active membership</option>
                                    <option value="members">Members only</option>
                                    <option value="instructors">Instructors only</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={sendForm.includePending}
                                        onChange={e => setSendForm({ ...sendForm, includePending: e.target.checked })}
                                        disabled={sending}
                                    />
                                    <span>Also include members whose payment is still pending</span>
                                </label>
                            </div>

                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-3)',
                                fontSize: 'var(--text-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                            }}>
                                {countLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                {countLoading
                                    ? 'Counting recipients…'
                                    : recipientCount === null
                                        ? 'Recipient count unavailable'
                                        : `${recipientCount} recipient${recipientCount === 1 ? '' : 's'} (child members are emailed via their guardian, duplicates removed)`}
                            </div>

                            {sendResult && (
                                <div className={`alert ${sendResult.startsWith('Sent') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: 'var(--space-3)' }}>
                                    {sendResult.startsWith('Sent') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {sendResult}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setPreviewTemplate(sendingTemplate)} disabled={sending}>
                                <Eye size={16} /> Preview
                            </button>
                            <button className="btn btn-ghost" onClick={() => setSendingTemplate(null)} disabled={sending}>
                                {sendResult.startsWith('Sent') ? 'Done' : 'Cancel'}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSend}
                                disabled={sending || countLoading || recipientCount === 0 || sendResult.startsWith('Sent')}
                            >
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {sending ? 'Sending…' : `Send${recipientCount ? ` to ${recipientCount}` : ''}`}
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}

            {/* Delete confirm (custom templates only) */}
            {deletingTemplate && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => setDeletingTemplate(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete template?</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setDeletingTemplate(null)} aria-label="Close" title="Close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ margin: 0 }}>
                                &ldquo;{deletingTemplate.name}&rdquo; will be permanently deleted. Emails already sent are not affected.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setDeletingTemplate(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}
        </div>
    );
}
