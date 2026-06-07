'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

interface TenantBranding {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
}

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [checking, setChecking] = useState(true);

    const router = useRouter();
    const supabase = getSupabaseClient();

    useEffect(() => {
        // Listen for the PASSWORD_RECOVERY event from the email link
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'PASSWORD_RECOVERY') {
                    // Supabase has verified the recovery token and established a session
                    setSessionReady(true);
                    setChecking(false);
                }
            }
        );

        // Also check if there's already a session (user may have already clicked the link)
        const checkExistingSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSessionReady(true);
            }
            setChecking(false);
        };

        // Give the auth listener a moment to process the URL hash, then check
        const timer = setTimeout(checkExistingSession, 1500);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [supabase]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            setSuccess(true);

            // Sign out and redirect to login after 3 seconds
            await supabase.auth.signOut();
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
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
                <h2 style={{ marginBottom: 'var(--space-4)' }}>Password Updated!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                    Your password has been successfully reset. Redirecting you to login...
                </p>
                <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                    Go to Login
                </Link>
            </div>
        );
    }

    if (checking) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto var(--space-4)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Verifying your reset link...</p>
            </div>
        );
    }

    if (!sessionReady) {
        return (
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    This page requires a valid password reset link. Please click the link in your email to continue.
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                    If your link has expired, you can request a new one.
                </p>
                <Link href="/forgot-password" className="btn btn-primary" style={{ width: '100%' }}>
                    Request New Reset Link
                </Link>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {error}
                </div>
            )}

            <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                <CheckCircle size={18} />
                Identity verified! Now set your new password.
            </div>

            <form onSubmit={handleResetPassword}>
                <div className="form-group">
                    <label className="form-label" htmlFor="password">
                        New Password
                    </label>
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
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
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
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                    <label className="form-label" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
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
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{ paddingLeft: '42px' }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: 'var(--space-6)' }}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner" style={{ width: '20px', height: '20px' }} />
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
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
                        Set a new password for your account
                    </p>
                </div>

                <Suspense fallback={
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
