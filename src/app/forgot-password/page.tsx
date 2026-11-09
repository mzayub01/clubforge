'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface TenantBranding {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Tenant branding state
    const [tenantInfo, setTenantInfo] = useState<TenantBranding | null>(null);
    const [isTenant, setIsTenant] = useState(false);
    const [tenantLoading, setTenantLoading] = useState(true);

    useEffect(() => {
        const hostname = window.location.hostname;
        const isSubdomain = hostname.includes('.') && !hostname.startsWith('www.');
        const isLocalSubdomain = hostname.endsWith('.localhost') && hostname !== 'localhost';

        if (isSubdomain || isLocalSubdomain) {
            setIsTenant(true);
            fetch('/api/tenant/public')
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.tenant) {
                        setTenantInfo(data.tenant);
                        document.title = `Reset Password | ${data.tenant.name}`;
                    }
                })
                .catch(() => { })
                .finally(() => setTenantLoading(false));
        } else {
            setTenantLoading(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Server route: generates the link and emails it through Resend with
            // the club's branding. (Supabase's own mailer only delivers to the
            // project's team members, so it is never used for members.)
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(
                    res.status === 429
                        ? 'Too many attempts. Please wait a little while before trying again.'
                        : data?.error || "We couldn't send the email right now. Please try again shortly.",
                );
                return;
            }

            setSuccess(true);
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-6)',
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            }}
        >
            <div
                className="glass-card animate-slide-up"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: 'var(--space-8)',
                }}
            >
                {/* Logo / Club Branding */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    {tenantLoading ? (
                        <div style={{ height: '70px', marginBottom: 'var(--space-4)' }} />
                    ) : isTenant && tenantInfo ? (
                        <>
                            <Link href="/">
                                {tenantInfo.logoUrl ? (
                                    <img
                                        src={tenantInfo.logoUrl}
                                        alt={tenantInfo.name}
                                        style={{ height: '70px', width: 'auto', margin: '0 auto', borderRadius: '16px' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${tenantInfo.primaryColor}30, ${tenantInfo.primaryColor}10)`,
                                        border: `2px solid ${tenantInfo.primaryColor}40`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        fontWeight: 700,
                                        color: tenantInfo.primaryColor,
                                        margin: '0 auto',
                                    }}>
                                        {tenantInfo.name.charAt(0)}
                                    </div>
                                )}
                            </Link>
                        </>
                    ) : (
                        <Link href="/">
                            <img
                                src="/logo-clubforge-final.svg"
                                alt="ClubForge"
                                style={{ height: '70px', width: 'auto', margin: '0 auto' }}
                            />
                        </Link>
                    )}
                    <h1 style={{
                        fontSize: 'var(--text-2xl)',
                        marginTop: 'var(--space-4)',
                    }}>
                        Reset Password
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                        {success
                            ? "Check your email for the reset link"
                            : "Enter your email to receive a password reset link"
                        }
                    </p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(45, 125, 70, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--space-6)',
                        }}>
                            <CheckCircle size={32} color="var(--color-green)" />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                            If there&apos;s an account for <strong>{email}</strong>, we&apos;ve sent it a
                            password reset link{tenantInfo ? <> from <strong>{tenantInfo.name}</strong></> : null}.
                            Open the email and tap the button to choose a new password.
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                            Nothing after a couple of minutes? Check your spam or junk folder, and make sure
                            this is the address your account was registered with.
                        </p>
                        <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                            <ArrowLeft size={18} />
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Error Message */}
                        {error && (
                            <div
                                className="alert alert-error"
                                style={{ marginBottom: 'var(--space-4)' }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail
                                        size={18}
                                        style={{
                                            position: 'absolute',
                                            left: '14px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-tertiary)',
                                        }}
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        className="form-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ paddingLeft: '42px' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: 'var(--space-4)' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner" style={{ width: '20px', height: '20px' }} />
                                ) : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Back to Login */}
                        <p style={{
                            textAlign: 'center',
                            marginTop: 'var(--space-6)',
                            color: 'var(--text-secondary)',
                        }}>
                            Remember your password?{' '}
                            <Link
                                href="/login"
                                style={{
                                    color: 'var(--color-gold)',
                                    fontWeight: '600',
                                }}
                            >
                                Sign In
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
