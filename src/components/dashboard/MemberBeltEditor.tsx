'use client';

import { useState } from 'react';
import BJJBelt from '@/components/BJJBelt';
import { ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { useRankSchemas, type RankLevel } from '@/hooks/useRankSchemas';

interface MemberBeltEditorProps {
    initialBelt: string;
    initialStripes: number;
    isChild?: boolean;
}

export default function MemberBeltEditor({ initialBelt, initialStripes, isChild = false }: MemberBeltEditorProps) {
    const { getSchemaForMember, loading: schemasLoading } = useRankSchemas();
    const [belt, setBelt] = useState(initialBelt);
    const [stripes, setStripes] = useState(initialStripes);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const schema = getSchemaForMember(isChild);
    const rankLevels = schema.rank_levels;
    const hasStripes = schema.has_stripes;
    const maxStripes = schema.max_stripes;

    const hasChanges = belt !== initialBelt || stripes !== initialStripes;

    // Build belt options from schema levels
    const beltOptions = rankLevels.map(l => ({
        value: l.name.toLowerCase().replace(/\//g, '-'),
        label: l.name,
        color: l.color_hex,
    }));

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/profile/belt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ belt, stripes }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Belt updated successfully!' });
                setIsEditing(false);
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to save changes' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass-card" style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
            background: 'linear-gradient(135deg, var(--bg-glass) 0%, rgba(197, 164, 86, 0.1) 100%)',
        }}>
            {/* Belt Display */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
                <BJJBelt belt={belt} stripes={stripes} size="lg" isChild={isChild} rankLevels={rankLevels} />
            </div>

            <h2 style={{
                marginBottom: 'var(--space-2)',
                textTransform: 'capitalize',
                fontSize: 'var(--text-3xl)',
            }}>
                {belt.replace(/-/g, '/')} Belt
                {stripes > 0 && hasStripes && (
                    <span style={{ fontSize: 'var(--text-xl)', color: 'var(--text-secondary)' }}>
                        {' '}• {stripes} stripe{stripes > 1 ? 's' : ''}
                    </span>
                )}
            </h2>

            {message && (
                <div style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)',
                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? 'var(--color-green)' : 'var(--color-red)',
                }}>
                    {message.text}
                </div>
            )}

            {!isEditing ? (
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsEditing(true)}
                    style={{ marginTop: 'var(--space-2)' }}
                >
                    <ChevronDown size={16} />
                    Update Belt
                </button>
            ) : (
                <div style={{ marginTop: 'var(--space-4)' }}>
                    {/* Belt Selection */}
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            Belt Color
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {schemasLoading ? (
                                <Loader2 size={16} className="spinner" />
                            ) : (
                                beltOptions.map((b) => (
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
                                        <span style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: b.color,
                                            border: b.color === '#F5F5F5' ? '1px solid var(--border-medium)' : 'none',
                                            flexShrink: 0,
                                        }} />
                                        {b.label}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Stripes Selection — only if schema supports stripes */}
                    {hasStripes && (
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                Stripes (0-{maxStripes})
                            </label>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => {
                                setBelt(initialBelt);
                                setStripes(initialStripes);
                                setIsEditing(false);
                            }}
                            disabled={saving}
                        >
                            <ChevronUp size={16} />
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="spinner" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    Save Belt
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
