'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, PartyPopper } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

function LoginPageContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isOnboarded = searchParams.get('onboarded') === 'true';
    const isUpgraded = searchParams.get('upgraded') === 'true';
    const supabase = getSupabaseClient();

    // Tenant branding state
    const [tenantInfo, setTenantInfo] = useState<{
        name: string;
        logoUrl: string | null;
        primaryColor: string;
    } | null>(null);
    const [isTenant, setIsTenant] = useState(false);
    const [tenantLoading, setTenantLoading] = useState(true);

    // Detect tenant subdomain and fetch branding
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            // Get user role via server API (bypasses RLS for reliable lookup)
            const roleRes = await fetch('/api/auth/role');
            const roleData = await roleRes.json();
            console.log('[Login] Role API response:', roleData);
            const role = roleData.role;

            if (role === 'platform_admin') {
                router.push('/platform');
            } else if (role === 'admin') {
                router.push('/admin');
            } else if (role === 'instructor' || role === 'professor') {
                router.push('/instructor');
            } else {
                router.push('/dashboard');
            }
            router.refresh();
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
                {/* Onboarding Success Banner */}
                {isOnboarded && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '12px',
                        padding: 'var(--space-5)',
                        marginBottom: 'var(--space-6)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🎉</div>
                        <h3 style={{ color: '#22c55e', margin: '0 0 var(--space-2) 0', fontSize: '1.1rem' }}>
                            Welcome to ClubForge!
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                            Your club has been created and your payment is confirmed.
                            Your 14-day free trial is now active. Sign in below to get started!
                        </p>
                    </div>
                )}

                {/* Upgrade Success Banner */}
                {isUpgraded && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(197, 164, 86, 0.15), rgba(197, 164, 86, 0.1))',
                        border: '1px solid rgba(197, 164, 86, 0.3)',
                        borderRadius: '12px',
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        textAlign: 'center',
                    }}>
                        <CheckCircle size={24} style={{ color: '#c5a456', marginBottom: '4px' }} />
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>
                            Plan upgraded successfully! Your new features are now active.
                        </p>
                    </div>
                )}

                {/* Logo / Club Branding */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    {tenantLoading ? (
                        /* Placeholder while tenant branding loads — prevents ClubForge logo flash */
                        <div style={{ height: '80px', marginBottom: 'var(--space-4)' }} />
                    ) : isTenant && tenantInfo ? (
                        <>
                            <Link href="/">
                                {tenantInfo.logoUrl ? (
                                    <img
                                        src={tenantInfo.logoUrl}
                                        alt={tenantInfo.name}
                                        style={{ height: '80px', width: 'auto', margin: '0 auto', borderRadius: '16px' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${tenantInfo.primaryColor}30, ${tenantInfo.primaryColor}10)`,
                                        border: `2px solid ${tenantInfo.primaryColor}40`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        fontWeight: 700,
                                        color: tenantInfo.primaryColor,
                                        margin: '0 auto',
                                    }}>
                                        {tenantInfo.name.charAt(0)}
                                    </div>
                                )}
                            </Link>
                            <h1 style={{
                                fontSize: 'var(--text-2xl)',
                                marginTop: 'var(--space-4)',
                            }}>
                                Sign in to {tenantInfo.name}
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                                Enter your member credentials
                            </p>
                        </>
                    ) : (
                        <>
                            <Link href="/">
                                <img
                                    src="/logo-clubforge-final.svg"
                                    alt="ClubForge"
                                    style={{ height: '70px', width: 'auto', margin: '0 auto' }}
                                />
                            </Link>
                            <h1 style={{
                                fontSize: 'var(--text-2xl)',
                                marginTop: 'var(--space-4)',
                            }}>
                                Welcome Back
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                                Sign in to your account
                            </p>
                        </>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        className="alert alert-error"
                        style={{ marginBottom: 'var(--space-4)' }}
                    >
                        {error}
                    </div>
                )}

                {/* Login Form */}
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

                    <div className="form-group">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--space-2)',
                        }}>
                            <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                style={{
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--color-gold)',
                                }}
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock
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
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-tertiary)',
                                    padding: 0,
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
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
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <p style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-6)',
                    color: 'var(--text-secondary)',
                }}>
                    {isTenant ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/register"
                                style={{
                                    color: 'var(--color-gold)',
                                    fontWeight: '600',
                                }}
                            >
                                Join Now
                            </Link>
                        </>
                    ) : (
                        <>
                            Want to create your own club?{' '}
                            <Link
                                href="/get-started"
                                style={{
                                    color: 'var(--color-gold)',
                                    fontWeight: '600',
                                }}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}
