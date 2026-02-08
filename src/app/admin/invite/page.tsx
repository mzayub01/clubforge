'use client';

import { useState, useEffect } from 'react';
import {
    Copy, Check, QrCode, Share2, Mail,
    MessageCircle, ExternalLink, Smartphone, Link as LinkIcon
} from 'lucide-react';

export default function InviteMembersPage() {
    const [registrationUrl, setRegistrationUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        // Build registration URL from current hostname
        const baseUrl = window.location.origin;
        setRegistrationUrl(`${baseUrl}/register`);
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(registrationUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = registrationUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareViaWhatsApp = () => {
        const text = encodeURIComponent(`Join our club! Register here: ${registrationUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent('Join Our Club');
        const body = encodeURIComponent(`Hi!\n\nWe'd love for you to join our club. Register here:\n\n${registrationUrl}\n\nSee you on the mat! 🥋`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    };

    const shareNative = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Our Club',
                    text: 'Register to join our club!',
                    url: registrationUrl,
                });
            } catch {
                // User cancelled sharing
            }
        }
    };

    // QR Code URL using a free API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}&bgcolor=0F172A&color=C5A456&format=png`;

    return (
        <div>
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    📣 Invite Members
                </h1>
                <p className="dashboard-subtitle">
                    Share your registration link to grow your club.
                </p>
            </div>

            {/* Registration Link Card */}
            <div className="glass-card" style={{
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-6)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                    <LinkIcon size={20} color="var(--color-gold)" />
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', margin: 0 }}>
                        Your Registration Link
                    </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                    Anyone with this link can register as a member of your club.
                </p>

                <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    alignItems: 'stretch',
                }}>
                    <div style={{
                        flex: 1,
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'monospace',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-gold)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {registrationUrl || 'Loading...'}
                    </div>
                    <button
                        onClick={handleCopy}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-3) var(--space-5)',
                            background: copied ? 'var(--color-green)' : 'var(--color-gold)',
                            color: 'var(--color-black)',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: '700',
                            fontSize: 'var(--text-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                    </button>
                </div>
            </div>

            {/* Share Options */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
            }}>
                {/* WhatsApp */}
                <button
                    onClick={shareViaWhatsApp}
                    className="glass-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-4)',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-lg)',
                        background: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <MessageCircle size={22} color="white" />
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', fontSize: 'var(--text-sm)', margin: 0 }}>WhatsApp</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>Share via message</p>
                    </div>
                    <ExternalLink size={16} color="var(--text-tertiary)" style={{ marginLeft: 'auto' }} />
                </button>

                {/* Email */}
                <button
                    onClick={shareViaEmail}
                    className="glass-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-4)',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Mail size={22} color="var(--color-black)" />
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', fontSize: 'var(--text-sm)', margin: 0 }}>Email</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>Send invitation email</p>
                    </div>
                    <ExternalLink size={16} color="var(--text-tertiary)" style={{ marginLeft: 'auto' }} />
                </button>

                {/* Native Share (mobile) */}
                {'share' in (typeof navigator !== 'undefined' ? navigator : {}) && (
                    <button
                        onClick={shareNative}
                        className="glass-card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-4)',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-lg)',
                            background: '#818cf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Share2 size={22} color="white" />
                        </div>
                        <div>
                            <p style={{ fontWeight: '600', fontSize: 'var(--text-sm)', margin: 0 }}>More Options</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>Share via other apps</p>
                        </div>
                        <ExternalLink size={16} color="var(--text-tertiary)" style={{ marginLeft: 'auto' }} />
                    </button>
                )}
            </div>

            {/* QR Code Section */}
            <div className="glass-card" style={{
                padding: 'var(--space-6)',
                textAlign: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <QrCode size={20} color="var(--color-gold)" />
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', margin: 0 }}>
                        QR Code
                    </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                    Print this or display it at your venue — members can scan to register instantly.
                </p>

                {!showQR ? (
                    <button
                        onClick={() => setShowQR(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-3) var(--space-5)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                            fontSize: 'var(--text-sm)',
                            cursor: 'pointer',
                        }}
                    >
                        <Smartphone size={16} />
                        Generate QR Code
                    </button>
                ) : (
                    <div style={{
                        display: 'inline-block',
                        padding: 'var(--space-4)',
                        background: 'white',
                        borderRadius: 'var(--radius-xl)',
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrCodeUrl}
                            alt="Registration QR Code"
                            width={250}
                            height={250}
                            style={{ display: 'block' }}
                        />
                    </div>
                )}
            </div>

            {/* Tips */}
            <div style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-5)',
                background: 'rgba(197, 164, 86, 0.06)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(197, 164, 86, 0.15)',
            }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: '0 0 var(--space-3) 0', color: 'var(--color-gold)' }}>
                    💡 Tips for growing your club
                </h3>
                <ul style={{
                    margin: 0,
                    paddingLeft: 'var(--space-5)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.8',
                }}>
                    <li>Share your link in your club&apos;s WhatsApp group</li>
                    <li>Print the QR code and put it at your reception desk</li>
                    <li>Add the link to your Instagram bio</li>
                    <li>Send an email to existing members with the link</li>
                    <li>Post on social media with your registration link</li>
                </ul>
            </div>
        </div>
    );
}
