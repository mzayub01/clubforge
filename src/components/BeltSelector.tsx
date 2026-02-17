'use client';

import { useState } from 'react';
import BJJBelt from './BJJBelt';
import { type RankLevel } from '@/hooks/useRankSchemas';

interface BeltSelectorProps {
    currentBelt: string;
    currentStripes: number;
    onSave: (belt: string, stripes: number) => Promise<void>;
    disabled?: boolean;
    /** Dynamic rank levels from tenant schema */
    rankLevels?: RankLevel[];
    /** Whether belts have stripes */
    hasStripes?: boolean;
    /** Max stripes for the schema */
    maxStripes?: number;
}

// Legacy fallback
const LEGACY_BELTS = ['white', 'blue', 'purple', 'brown', 'black'];

export default function BeltSelector({
    currentBelt,
    currentStripes,
    onSave,
    disabled,
    rankLevels,
    hasStripes = true,
    maxStripes = 4,
}: BeltSelectorProps) {
    const [belt, setBelt] = useState(currentBelt);
    const [stripes, setStripes] = useState(currentStripes);
    const [saving, setSaving] = useState(false);
    const [showEditor, setShowEditor] = useState(false);

    const hasChanges = belt !== currentBelt || stripes !== currentStripes;

    // Use dynamic levels if available, otherwise legacy
    const beltOptions = rankLevels
        ? rankLevels.map(l => ({
            value: l.name.toLowerCase().replace(/\//g, '-'),
            label: l.name,
            color: l.color_hex,
        }))
        : LEGACY_BELTS.map(b => ({ value: b, label: b, color: undefined }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(belt, stripes);
            setShowEditor(false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setBelt(currentBelt);
        setStripes(currentStripes);
        setShowEditor(false);
    };

    if (!showEditor) {
        return (
            <div
                onClick={() => !disabled && setShowEditor(true)}
                style={{
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'inline-block',
                }}
                title={disabled ? undefined : 'Click to change belt'}
            >
                <BJJBelt belt={currentBelt} stripes={currentStripes} size="md" showLabel rankLevels={rankLevels} />
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <h4 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-base)' }}>Update Belt Rank</h4>

            {/* Belt Preview */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                <BJJBelt belt={belt} stripes={stripes} size="lg" showLabel rankLevels={rankLevels} />
            </div>

            {/* Belt Selection */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Belt Color</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {beltOptions.map((b) => (
                        <button
                            key={b.value}
                            onClick={() => setBelt(b.value)}
                            style={{
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-md)',
                                border: belt === b.value ? '2px solid var(--color-gold)' : '1px solid var(--border-light)',
                                background: belt === b.value ? 'var(--bg-secondary)' : 'transparent',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: belt === b.value ? '600' : '400',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-1)',
                            }}
                        >
                            {b.color && (
                                <span style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: b.color,
                                    border: b.color === '#F5F5F5' ? '1px solid var(--border-medium)' : 'none',
                                    flexShrink: 0,
                                }} />
                            )}
                            {b.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stripes Selection — only if schema supports stripes */}
            {hasStripes && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="form-label">Stripes (0-{maxStripes})</label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {Array.from({ length: maxStripes + 1 }, (_, i) => i).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStripes(s)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    border: stripes === s ? '2px solid var(--color-gold)' : '1px solid var(--border-light)',
                                    background: stripes === s ? 'var(--bg-secondary)' : 'transparent',
                                    cursor: 'pointer',
                                    fontWeight: stripes === s ? '600' : '400',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={handleCancel} disabled={saving}>
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
}
