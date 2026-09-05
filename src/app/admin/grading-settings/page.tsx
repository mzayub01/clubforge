'use client';

import { useState, useEffect } from 'react';
import {
    Award, Shield, Loader2, CheckCircle, AlertCircle,
    Plus, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { RANK_PRESETS } from '@/lib/rank-presets';

interface RankLevel {
    id: string;
    name: string;
    color_hex: string;
    bar_color_hex: string;
    sort_order: number;
}

interface RankSchema {
    id: string;
    name: string;
    has_stripes: boolean;
    max_stripes: number;
    is_default: boolean;
    sort_order: number;
    rank_levels: RankLevel[];
}

export default function GradingSettingsPage() {
    const [beltEnabled, setBeltEnabled] = useState(true);
    const [schemas, setSchemas] = useState<RankSchema[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addingPreset, setAddingPreset] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [expandedSchema, setExpandedSchema] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch tenant settings
            const settingsRes = await fetch('/api/admin/settings');
            const settingsData = await settingsRes.json();
            const settings = settingsData.tenant?.settings || {};
            setBeltEnabled(settings.belt_progress_enabled !== false);

            // Fetch rank schemas
            const schemasRes = await fetch('/api/rank-schemas?include_levels=true');
            const schemasData = await schemasRes.json();
            setSchemas(schemasData.schemas || []);
        } catch (err) {
            console.error('Error fetching grading settings:', err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const toggleBeltProgress = async () => {
        setSaving(true);
        setError('');
        try {
            const newValue = !beltEnabled;
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: 'features',
                    data: { belt_progress_enabled: newValue },
                }),
            });
            if (!res.ok) throw new Error('Failed to save');
            setBeltEnabled(newValue);
            setSuccess(newValue ? 'Belt progress enabled' : 'Belt progress disabled');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const addPresetSchema = async (presetId: string) => {
        setAddingPreset(true);
        setError('');
        try {
            const res = await fetch('/api/rank-schemas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preset_id: presetId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create');
            setSchemas(prev => [...prev, data.schema]);
            setSuccess(`${data.schema.name} schema added`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add schema');
        } finally {
            setAddingPreset(false);
        }
    };

    const deleteSchema = async (schemaId: string) => {
        if (!confirm('Are you sure you want to remove this rank schema?')) return;
        setError('');
        try {
            const res = await fetch(`/api/rank-schemas?id=${schemaId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setSchemas(prev => prev.filter(s => s.id !== schemaId));
            setSuccess('Schema removed');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove');
        }
    };

    // Figure out which presets are already added
    const addedPresetNames = schemas.map(s => s.name);
    const availablePresets = RANK_PRESETS.filter(p => !addedPresetNames.includes(p.name));

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)', gap: 'var(--space-3)' }}>
                <Loader2 size={24} className="animate-spin" />
                <span>Loading grading settings...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="dashboard-header">
                <h1 className="dashboard-title">Grading & Rank Settings</h1>
                <p className="dashboard-subtitle">
                    Configure belt/rank systems for your club
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

            {/* Belt Progress Toggle */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Shield size={20} color="var(--color-gold)" />
                        Feature Toggle
                    </h3>
                </div>
                <div className="card-body">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-3)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                    }}>
                        <div>
                            <p style={{ fontWeight: '600', margin: 0 }}>Belt / Rank Progression</p>
                            <p style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-secondary)',
                                margin: 0,
                                marginTop: '4px',
                            }}>
                                {beltEnabled
                                    ? 'Members can track belt progress. Grading features are visible.'
                                    : 'Rank badges, the Rank Progress page and grading are hidden from all members and staff.'}
                            </p>
                        </div>
                        <button
                            onClick={toggleBeltProgress}
                            disabled={saving}
                            style={{
                                position: 'relative',
                                width: '52px',
                                height: '28px',
                                borderRadius: '14px',
                                border: 'none',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                background: beltEnabled ? 'var(--color-gold)' : 'var(--border-medium)',
                                transition: 'background 0.3s ease',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '2px',
                                left: beltEnabled ? '26px' : '2px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'white',
                                transition: 'left 0.3s ease',
                                boxShadow: 'var(--shadow-sm)',
                            }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Rank Schemas Section */}
            {beltEnabled && (
                <>
                    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Award size={20} color="var(--color-gold)" />
                                Active Rank Schemas
                            </h3>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {schemas.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: 'var(--space-8)',
                                    color: 'var(--text-secondary)',
                                }}>
                                    <Award size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.3 }} />
                                    <p style={{ margin: 0 }}>No rank schemas configured yet.</p>
                                    <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                                        Add a preset below to get started.
                                    </p>
                                </div>
                            ) : (
                                schemas.map((schema, index) => (
                                    <div key={schema.id} style={{
                                        borderBottom: index < schemas.length - 1 ? '1px solid var(--border-light)' : 'none',
                                    }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: 'var(--space-4)',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setExpandedSchema(expandedSchema === schema.id ? null : schema.id)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                {/* Color dots preview */}
                                                <div style={{ display: 'flex', gap: '3px' }}>
                                                    {schema.rank_levels.slice(0, 6).map(level => (
                                                        <div key={level.id} style={{
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            background: level.color_hex,
                                                            border: level.color_hex === '#F5F5F5' ? '1px solid var(--border-medium)' : 'none',
                                                        }} />
                                                    ))}
                                                    {schema.rank_levels.length > 6 && (
                                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                                            +{schema.rank_levels.length - 6}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '600', margin: 0 }}>
                                                        {schema.name}
                                                        {schema.is_default && (
                                                            <span style={{
                                                                marginLeft: 'var(--space-2)',
                                                                fontSize: 'var(--text-xs)',
                                                                background: 'var(--color-gold)',
                                                                color: 'var(--color-black)',
                                                                padding: '2px 8px',
                                                                borderRadius: 'var(--radius-full)',
                                                            }}>
                                                                Default
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p style={{
                                                        fontSize: 'var(--text-sm)',
                                                        color: 'var(--text-secondary)',
                                                        margin: 0,
                                                    }}>
                                                        {schema.rank_levels.length} levels
                                                        {schema.has_stripes && ` • Up to ${schema.max_stripes} stripes`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteSchema(schema.id);
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: 'var(--space-1)',
                                                        color: 'var(--text-tertiary)',
                                                    }}
                                                    title="Remove schema"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                {expandedSchema === schema.id ? (
                                                    <ChevronUp size={18} color="var(--text-tertiary)" />
                                                ) : (
                                                    <ChevronDown size={18} color="var(--text-tertiary)" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded rank levels */}
                                        {expandedSchema === schema.id && (
                                            <div style={{
                                                padding: '0 var(--space-4) var(--space-4)',
                                            }}>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                                    gap: 'var(--space-2)',
                                                }}>
                                                    {schema.rank_levels.map((level) => (
                                                        <div key={level.id} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 'var(--space-2)',
                                                            padding: 'var(--space-2) var(--space-3)',
                                                            background: 'var(--bg-secondary)',
                                                            borderRadius: 'var(--radius-md)',
                                                            fontSize: 'var(--text-sm)',
                                                        }}>
                                                            <div style={{
                                                                width: '24px',
                                                                height: '10px',
                                                                borderRadius: 'var(--radius-sm)',
                                                                background: level.color_hex,
                                                                border: level.color_hex === '#F5F5F5' ? '1px solid var(--border-medium)' : 'none',
                                                                flexShrink: 0,
                                                            }} />
                                                            <span>{level.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Add Preset */}
                    {availablePresets.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Plus size={20} color="var(--color-gold)" />
                                    Add Rank Schema
                                </h3>
                            </div>
                            <div className="card-body">
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: 'var(--space-3)',
                                }}>
                                    {availablePresets.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => addPresetSchema(preset.id)}
                                            disabled={addingPreset}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 'var(--space-2)',
                                                padding: 'var(--space-4)',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: 'var(--radius-lg)',
                                                cursor: addingPreset ? 'not-allowed' : 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {/* Mini belt preview */}
                                            <div style={{ display: 'flex', gap: '3px' }}>
                                                {preset.levels.slice(0, 5).map((level, i) => (
                                                    <div key={i} style={{
                                                        width: '16px',
                                                        height: '8px',
                                                        borderRadius: '2px',
                                                        background: level.color_hex,
                                                        border: level.color_hex === '#F5F5F5' ? '1px solid var(--border-medium)' : 'none',
                                                    }} />
                                                ))}
                                                {preset.levels.length > 5 && (
                                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                                        +{preset.levels.length - 5}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '600', margin: 0, fontSize: 'var(--text-sm)' }}>
                                                    {preset.label}
                                                </p>
                                                <p style={{
                                                    fontSize: 'var(--text-xs)',
                                                    color: 'var(--text-secondary)',
                                                    margin: 0,
                                                }}>
                                                    {preset.description}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
