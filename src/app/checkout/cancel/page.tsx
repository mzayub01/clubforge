'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ClubInfo {
    name: string;
    contactEmail: string | null;
    logoUrl: string | null;
}

/**
 * Shown when a Stripe Checkout is abandoned. On a club subdomain this is a
 * MEMBER cancelling a membership payment, so help and retry links must point
 * at the club (not ClubForge support / pricing). On the apex domain it is a
 * club owner abandoning a plan checkout.
 */
export default function CheckoutCancelPage() {
    const [club, setClub] = useState<ClubInfo | null>(null);

    useEffect(() => {
        // Returns 400 on the apex domain (no tenant context) → stays null.
        fetch('/api/tenant/public')
            .then(r => (r.ok ? r.json() : null))
            .then(j => {
                if (j?.tenant?.name) {
                    setClub({
                        name: j.tenant.name,
                        contactEmail: j.tenant.contactEmail || null,
                        logoUrl: j.tenant.logoUrl || null,
                    });
                }
            })
            .catch(() => { /* platform defaults */ });
    }, []);

    const contactEmail = club?.contactEmail || 'support@clubforgehq.com';
    const contactName = club?.name || 'us';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6)',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        }}>
            <div className="glass-card animate-slide-up" style={{
                maxWidth: '500px',
                textAlign: 'center',
                padding: 'var(--space-10)',
            }}>
                <Link href="/">
                    {club?.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={club.logoUrl}
                            alt={club.name}
                            style={{ height: '50px', width: 'auto', margin: '0 auto var(--space-6)', display: 'block' }}
                        />
                    ) : (
                        <Image
                            src="/logo-clubforge-final.svg"
                            alt={club?.name || 'ClubForge'}
                            width={200}
                            height={52}
                            style={{ height: '50px', width: 'auto', margin: '0 auto var(--space-6)' }}
                        />
                    )}
                </Link>

                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-6)',
                }}>
                    <XCircle size={40} color="white" />
                </div>

                <h1 style={{
                    fontSize: 'var(--text-2xl)',
                    marginBottom: 'var(--space-2)',
                }}>
                    Payment Cancelled
                </h1>

                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-8)',
                    fontSize: 'var(--text-lg)',
                }}>
                    Your payment was not completed. No charges have been made.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <Link href={club ? '/dashboard/membership' : '/pricing'} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                        <RefreshCw size={18} />
                        Try Again
                    </Link>

                    <Link href="/dashboard" className="btn btn-ghost" style={{ width: '100%' }}>
                        <ArrowLeft size={18} />
                        Go to Dashboard
                    </Link>
                </div>

                <p style={{
                    marginTop: 'var(--space-6)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-tertiary)',
                }}>
                    Need help? Contact {contactName} at{' '}
                    <a href={`mailto:${contactEmail}`} style={{ color: 'var(--color-gold)' }}>{contactEmail}</a>
                </p>
            </div>
        </div>
    );
}
