'use client';

// Opens the club's Stripe customer portal (restricted configuration: update
// card, see invoices — no cancel/pause/plan changes). Works for the member's
// own subscription or, for guardians, a child's.

import { useState } from 'react';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';

export default function ManagePaymentButton({ userId, label = 'Manage payment details' }: { userId?: string; label?: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const open = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/stripe/member-portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || 'Could not open the payment portal');
            window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not open the payment portal');
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={open} disabled={loading}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                {label}
                {!loading && <ExternalLink size={12} />}
            </button>
            {error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-red)' }}>{error}</span>}
        </div>
    );
}
