'use client';

// ===============================================
// ClubForge - Data Export (Pro)
// Download club data as CSV or JSON
// ===============================================

import { useState } from 'react';
import {
    Download, FileText, FileJson, Users, CreditCard,
    CheckCircle, Calendar, AlertCircle, Loader2
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import UpgradePrompt from '@/components/admin/UpgradePrompt';

// ── Export definitions ───────────────────────────

interface ExportDef {
    id: string;
    label: string;
    description: string;
    table: string;
    select?: string;
    icon: React.ComponentType<{ size?: number }>;
    columns: { key: string; label: string }[];
}

const EXPORTS: ExportDef[] = [
    {
        id: 'members',
        label: 'Members',
        description: 'All registered members and their profile data',
        table: 'profiles',
        icon: Users,
        columns: [
            { key: 'first_name', label: 'First Name' },
            { key: 'last_name', label: 'Last Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'date_of_birth', label: 'Date of Birth' },
            { key: 'belt_rank', label: 'Belt Rank' },
            { key: 'address', label: 'Address' },
            { key: 'city', label: 'City' },
            { key: 'postcode', label: 'Postcode' },
            { key: 'emergency_contact_name', label: 'Emergency Contact' },
            { key: 'emergency_contact_phone', label: 'Emergency Phone' },
            { key: 'medical_conditions', label: 'Medical Conditions' },
            { key: 'waiver_accepted', label: 'Waiver Accepted' },
            { key: 'created_at', label: 'Joined' },
        ],
    },
    {
        id: 'memberships',
        label: 'Memberships',
        description: 'Active and historical membership records',
        table: 'memberships',
        select: '*, membership_type:membership_types(name, price)',
        icon: CreditCard,
        columns: [
            { key: 'user_id', label: 'User ID' },
            { key: 'membership_type.name', label: 'Type' },
            { key: 'membership_type.price', label: 'Price (£)' },
            { key: 'status', label: 'Status' },
            { key: 'start_date', label: 'Start Date' },
            { key: 'end_date', label: 'End Date' },
            { key: 'stripe_subscription_id', label: 'Stripe ID' },
            { key: 'created_at', label: 'Created' },
        ],
    },
    {
        id: 'attendance',
        label: 'Attendance',
        description: 'Class attendance records',
        table: 'attendance',
        icon: CheckCircle,
        columns: [
            { key: 'user_id', label: 'User ID' },
            { key: 'class_id', label: 'Class ID' },
            { key: 'class_date', label: 'Date' },
            { key: 'status', label: 'Status' },
            { key: 'created_at', label: 'Recorded' },
        ],
    },
    {
        id: 'events',
        label: 'Events',
        description: 'All events and their details',
        table: 'events',
        icon: Calendar,
        columns: [
            { key: 'title', label: 'Title' },
            { key: 'event_type', label: 'Type' },
            { key: 'start_date', label: 'Start Date' },
            { key: 'end_date', label: 'End Date' },
            { key: 'start_time', label: 'Start Time' },
            { key: 'end_time', label: 'End Time' },
            { key: 'max_capacity', label: 'Capacity' },
            { key: 'price', label: 'Price (pence)' },
            { key: 'is_members_only', label: 'Members Only' },
            { key: 'created_at', label: 'Created' },
        ],
    },
];

// ── Helpers ──────────────────────────────────────

function getNestedValue(obj: any, path: string): string {
    const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

function toCsv(data: any[], columns: { key: string; label: string }[]): string {
    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
        columns.map(c => {
            const val = getNestedValue(row, c.key);
            // Escape quotes and wrap in quotes
            return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
    );
    return '\uFEFF' + [header, ...rows].join('\n'); // BOM for Excel
}

function downloadBlob(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Component ────────────────────────────────────

export default function AdminDataExportPage() {
    const { can } = useFeatureGate();
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const canCsv = can('data_export_csv');
    const canJson = can('data_export_json');

    if (!canCsv && !canJson) {
        return <UpgradePrompt feature="Data Export" description="Download your club's data as CSV or JSON files for analysis, reporting, and backup." />;
    }

    const handleExport = async (exportDef: ExportDef, format: 'csv' | 'json') => {
        setError('');
        setSuccess('');
        setDownloading(`${exportDef.id}-${format}`);

        try {
            const options: any = {};
            if (exportDef.select) options.select = exportDef.select;

            const { data, error: fetchError } = await adminFetch(exportDef.table, options);

            if (fetchError) {
                setError(`Failed to export ${exportDef.label}: ${fetchError}`);
                setDownloading(null);
                return;
            }

            const timestamp = new Date().toISOString().split('T')[0];

            if (format === 'csv') {
                const csv = toCsv(data, exportDef.columns);
                downloadBlob(csv, `${exportDef.id}_${timestamp}.csv`, 'text/csv;charset=utf-8;');
            } else {
                // JSON — export only the columns we defined plus raw data
                const json = JSON.stringify(data, null, 2);
                downloadBlob(json, `${exportDef.id}_${timestamp}.json`, 'application/json');
            }

            setSuccess(`${exportDef.label} exported as ${format.toUpperCase()}`);
        } catch (err) {
            setError(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <h1 className="dashboard-title">Data Export</h1>
                <p className="dashboard-subtitle">Download your club data as CSV or JSON</p>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                {EXPORTS.map(exp => {
                    const isDownloading = downloading?.startsWith(exp.id);

                    return (
                        <div
                            key={exp.id}
                            className="card"
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <div className="card-body" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                                        background: 'rgba(197,164,86,0.1)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <exp.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 'var(--text-md)' }}>{exp.label}</h3>
                                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                            {exp.description}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                                    {exp.columns.length} fields: {exp.columns.map(c => c.label).join(', ')}
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
                                    {canCsv && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            style={{ flex: 1 }}
                                            onClick={() => handleExport(exp, 'csv')}
                                            disabled={!!isDownloading}
                                        >
                                            {downloading === `${exp.id}-csv` ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <FileText size={14} />
                                            )}
                                            CSV
                                        </button>
                                    )}
                                    {canJson && (
                                        <button
                                            className="btn btn-outline btn-sm"
                                            style={{ flex: 1 }}
                                            onClick={() => handleExport(exp, 'json')}
                                            disabled={!!isDownloading}
                                        >
                                            {downloading === `${exp.id}-json` ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <FileJson size={14} />
                                            )}
                                            JSON
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
