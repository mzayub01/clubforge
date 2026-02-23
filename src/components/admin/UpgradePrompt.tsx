'use client';

import Link from 'next/link';
import { Lock, ArrowUpRight, Sparkles } from 'lucide-react';
import { useFeatureGate } from '@/hooks/useFeatureGate';

interface UpgradePromptProps {
    /** Display name of the feature, e.g. "Event Management" */
    feature: string;
    /** Optional description */
    description?: string;
}

/**
 * Shows a styled "Upgrade your plan" card when the current tier
 * doesn't have access to a feature. Used as a page-level gate.
 */
export default function UpgradePrompt({ feature, description }: UpgradePromptProps) {
    const { tier } = useFeatureGate();

    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    return (
        <div>
            <div className="dashboard-header">
                <h1 className="dashboard-title">{feature}</h1>
            </div>

            <div
                className="glass-card"
                style={{
                    maxWidth: '560px',
                    margin: 'var(--space-8) auto',
                    textAlign: 'center',
                    padding: 'var(--space-10) var(--space-8)',
                }}
            >
                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(197, 164, 86, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-5)',
                    }}
                >
                    <Lock size={28} color="var(--color-gold)" />
                </div>

                <h2 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-xl)' }}>
                    Upgrade to unlock {feature}
                </h2>

                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)', lineHeight: 1.6 }}>
                    {description || `${feature} is available on the Pro plan and above.`}
                </p>

                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                    Your current plan: <span className="badge badge-green" style={{ marginLeft: 'var(--space-1)' }}>{tierLabel}</span>
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/admin/settings" className="btn btn-primary">
                        <Sparkles size={16} />
                        Upgrade Plan
                        <ArrowUpRight size={16} />
                    </Link>
                    <Link href="/pricing" className="btn btn-ghost" target="_blank">
                        Compare Plans
                    </Link>
                </div>
            </div>
        </div>
    );
}
