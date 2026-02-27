'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Mail, ArrowRight } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

interface TenantBranding {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
}

export default function WaitlistConfirmationPage() {
    const [position, setPosition] = useState<number | null>(null);
    const [membershipName, setMembershipName] = useState<string>('');
    const [locationName, setLocationName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Tenant branding state
    const [tenantInfo, setTenantInfo] = useState<TenantBranding | null>(null);
    const [isTenant, setIsTenant] = useState(false);
    const [tenantLoading, setTenantLoading] = useState(true);

    const supabase = getSupabaseClient();

    useEffect(() => {
        const hostname = window.location.hostname;
        const isSubdomain = hostname.includes('.') && !hostname.startsWith('www.');
        const isLocalSubdomain = hostname.endsWith('.localhost') && hostname !== 'localhost';

        if (isSubdomain || isLocalSubdomain) {
            setIsTenant(true);
            fetch('/api/tenant/public')
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.tenant) setTenantInfo(data.tenant);
                })
                .catch(() => { })
                .finally(() => setTenantLoading(false));
        } else {
            setTenantLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWaitlistInfo();
    }, []);

    const fetchWaitlistInfo = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: waitlistEntry } = await supabase
                .from('waitlist')
                .select('position, location:locations(name), membership_type:membership_types(name)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (waitlistEntry) {
                setPosition(waitlistEntry.position);
                setLocationName((waitlistEntry.location as any)?.name || '');
                setMembershipName((waitlistEntry.membership_type as any)?.name || '');
            }
        } catch (err) {
            console.error('Error fetching waitlist info:', err);
        } finally {
            setLoading(false);
        }
    };

    const displayName = isTenant && tenantInfo ? tenantInfo.name : 'ClubForge';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6)',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        }}>
            <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                {/* Logo / Club Branding */}
                {tenantLoading ? (
                    <div style={{ height: '60px', marginBottom: 'var(--space-8)' }} />
                ) : isTenant && tenantInfo ? (
                    <Link href="/">
                        {tenantInfo.logoUrl ? (
                            <img
                                src={tenantInfo.logoUrl}
                                alt={tenantInfo.name}
                                style={{ height: '60px', width: 'auto', margin: '0 auto var(--space-8)', borderRadius: '16px' }}
                            />
                        ) : (
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '16px',
                                background: `linear-gradient(135deg, ${tenantInfo.primaryColor}30, ${tenantInfo.primaryColor}10)`,
                                border: `2px solid ${tenantInfo.primaryColor}40`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: tenantInfo.primaryColor,
                                margin: '0 auto var(--space-8)',
                            }}>
                                {tenantInfo.name.charAt(0)}
                            </div>
                        )}
                    </Link>
                ) : (
                    <Link href="/">
                        <img
                            src="/logo-clubforge-final.svg"
                            alt="ClubForge"
                            style={{ height: '60px', width: 'auto', margin: '0 auto var(--space-8)' }}
                        />
                    </Link>
                )}

                {/* Success Card */}
                <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                    {/* Icon */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(197, 164, 86, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-6)',
                    }}>
                        <Clock size={40} color="var(--color-gold)" />
                    </div>

                    <h1 style={{
                        fontSize: 'var(--text-2xl)',
                        marginBottom: 'var(--space-4)',
                    }}>
                        You're on the Waitlist!
                    </h1>

                    {loading ? (
                        <div className="spinner" style={{ margin: '0 auto' }} />
                    ) : (
                        <>
                            <p style={{
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--space-6)',
                                fontSize: 'var(--text-lg)',
                            }}>
                                Thank you for registering with {displayName}.
                            </p>

                            {position && (
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    padding: 'var(--space-5)',
                                    borderRadius: 'var(--radius-lg)',
                                    marginBottom: 'var(--space-6)',
                                }}>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: 'var(--text-lg)' }}>
                                        Your Position: <span style={{ color: 'var(--color-gold)' }}>#{position}</span>
                                    </p>
                                    {locationName && (
                                        <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                            {locationName} {membershipName && `• ${membershipName}`}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid var(--color-green)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--space-4)',
                                marginBottom: 'var(--space-6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                textAlign: 'left',
                            }}>
                                <Mail size={24} color="var(--color-green)" style={{ flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                                    We'll notify you by email as soon as a spot becomes available. Keep an eye on your inbox!
                                </p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-3)',
                            }}>
                                <Link href="/" className="btn btn-primary" style={{ width: '100%' }}>
                                    Return to Homepage
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* Additional Info */}
                <p style={{
                    marginTop: 'var(--space-6)',
                    color: 'var(--text-tertiary)',
                    fontSize: 'var(--text-sm)',
                }}>
                    Questions? Contact us at{' '}
                    <a href="mailto:support@clubforgehq.com" style={{ color: 'var(--color-gold)' }}>
                        support@clubforgehq.com
                    </a>
                </p>
            </div>
        </div>
    );
}
