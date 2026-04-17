'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Shield } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'clubforge_cookie_consent';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Small delay so it doesn't flash on page load
        const timer = setTimeout(() => {
            const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (!consent) {
                setVisible(true);
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                width: '100%',
                maxWidth: '560px',
                padding: '0 16px',
                animation: 'cookieSlideUp 0.4s ease-out',
            }}
        >
            <style>{`
                @keyframes cookieSlideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>

            <div
                style={{
                    background: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={handleDecline}
                    aria-label="Close cookie banner"
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '28px',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '4px',
                    }}
                >
                    <X size={16} />
                </button>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(197,164,86,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                        }}
                    >
                        <Shield size={18} color="#C5A456" />
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{
                            color: '#E2E8F0',
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            margin: '0 0 16px',
                            paddingRight: '16px',
                        }}>
                            We use cookies to improve your experience and analyse site traffic. By continuing, you agree to our{' '}
                            <Link
                                href="/privacy"
                                style={{ color: '#C5A456', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                            >
                                Privacy Policy
                            </Link>.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleAccept}
                                style={{
                                    background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                    color: '#0F172A',
                                    border: 'none',
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    fontSize: '0.8125rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                Accept All
                            </button>

                            <button
                                onClick={handleDecline}
                                style={{
                                    background: 'transparent',
                                    color: '#94A3B8',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    fontSize: '0.8125rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                Essential Only
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
