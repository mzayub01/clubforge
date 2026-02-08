'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CheckCircle, MapPin, CreditCard, Calendar,
    Palette, PoundSterling, UserPlus, ChevronRight,
    X, Sparkles, Loader2, PartyPopper
} from 'lucide-react';

interface SetupStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    href: string;
    icon: string;
}

interface SetupData {
    steps: SetupStep[];
    completedCount: number;
    totalSteps: number;
    percentage: number;
    clubName: string;
    dismissed: boolean;
    allComplete: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    'check-circle': CheckCircle,
    'map-pin': MapPin,
    'credit-card': CreditCard,
    'calendar': Calendar,
    'palette': Palette,
    'pound-sterling': PoundSterling,
    'user-plus': UserPlus,
};

export default function SetupWizard() {
    const [data, setData] = useState<SetupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(false);
    const [celebrating, setCelebrating] = useState(false);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const res = await fetch('/api/admin/setup-progress');
            const json = await res.json();
            setData(json);
            if (json.dismissed || json.allComplete) {
                setDismissed(true);
            }
            // If just completed all, celebrate
            if (json.allComplete && !json.dismissed) {
                setCelebrating(true);
                // Auto-dismiss after celebration
                setTimeout(() => {
                    handleDismiss('complete');
                }, 5000);
            }
        } catch (err) {
            console.error('Failed to fetch setup progress:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async (action: 'dismiss' | 'complete' = 'dismiss') => {
        setDismissed(true);
        try {
            await fetch('/api/admin/setup-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
        } catch (err) {
            console.error('Failed to dismiss:', err);
        }
    };

    if (loading) return null;
    if (dismissed || !data) return null;

    // Find the next incomplete step
    const nextStep = data.steps.find(s => !s.completed);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(197, 164, 86, 0.08) 0%, rgba(197, 164, 86, 0.03) 100%)',
            border: '1px solid rgba(197, 164, 86, 0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Dismiss button */}
            <button
                onClick={() => handleDismiss()}
                style={{
                    position: 'absolute',
                    top: 'var(--space-3)',
                    right: 'var(--space-3)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    padding: 'var(--space-1)',
                    borderRadius: 'var(--radius-md)',
                }}
                title="Dismiss setup wizard"
            >
                <X size={18} />
            </button>

            {/* Celebration overlay */}
            {celebrating && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: 'var(--radius-xl)',
                    zIndex: 10,
                    animation: 'fadeIn 0.3s ease',
                }}>
                    <PartyPopper size={48} color="var(--color-gold)" style={{ marginBottom: 'var(--space-4)' }} />
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--color-gold)', margin: 0 }}>
                        You&apos;re all set! 🎉
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                        Your club is ready to go. Time to grow!
                    </p>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <Sparkles size={20} color="var(--color-gold)" />
                <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: '700' }}>
                        Set up {data.clubName}
                    </h3>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {data.completedCount} of {data.totalSteps} steps complete
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{
                height: '8px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                marginBottom: 'var(--space-5)',
                overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    width: `${data.percentage}%`,
                    background: 'linear-gradient(90deg, var(--color-gold), #ffd700)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease',
                }} />
            </div>

            {/* Steps */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-3)',
            }}>
                {data.steps.map((step) => {
                    const Icon = ICON_MAP[step.icon] || CheckCircle;
                    const isNext = nextStep?.id === step.id;
                    return (
                        <Link
                            key={step.id}
                            href={step.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-lg)',
                                background: step.completed
                                    ? 'rgba(34, 197, 94, 0.06)'
                                    : isNext
                                        ? 'rgba(197, 164, 86, 0.1)'
                                        : 'var(--bg-secondary)',
                                border: isNext
                                    ? '1px solid rgba(197, 164, 86, 0.3)'
                                    : '1px solid transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                opacity: step.completed ? 0.7 : 1,
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: step.completed
                                    ? 'var(--color-green)'
                                    : isNext
                                        ? 'rgba(197, 164, 86, 0.2)'
                                        : 'var(--bg-tertiary)',
                                flexShrink: 0,
                            }}>
                                {step.completed ? (
                                    <CheckCircle size={18} color="white" />
                                ) : (
                                    <Icon size={18} color={isNext ? 'var(--color-gold)' : 'var(--text-tertiary)'} />
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    margin: 0,
                                    fontWeight: '600',
                                    fontSize: 'var(--text-sm)',
                                    color: step.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    textDecoration: step.completed ? 'line-through' : 'none',
                                }}>
                                    {step.title}
                                </p>
                                <p style={{
                                    margin: 0,
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--text-tertiary)',
                                }}>
                                    {step.description}
                                </p>
                            </div>
                            {!step.completed && (
                                <ChevronRight size={16} color={isNext ? 'var(--color-gold)' : 'var(--text-tertiary)'} />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* CTA for next step */}
            {nextStep && (
                <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                    <Link
                        href={nextStep.href}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-5)',
                            background: 'var(--color-gold)',
                            color: 'var(--color-black)',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: '700',
                            fontSize: 'var(--text-sm)',
                            textDecoration: 'none',
                            transition: 'opacity 0.2s ease',
                        }}
                    >
                        Continue Setup <ChevronRight size={16} />
                    </Link>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
