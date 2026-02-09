'use client';

// ===============================================
// ClubForge - Platform Broadcasts
// Compose and send system-wide announcements
// ===============================================

import { useState, useEffect, useCallback } from 'react';
import {
    Send,
    Megaphone,
    Clock,
    CheckCircle,
    Loader2,
    Calendar,
} from 'lucide-react';

interface Broadcast {
    id: string;
    title: string;
    message: string;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
}

export default function PlatformBroadcastsPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [expiresIn, setExpiresIn] = useState('7'); // days

    const fetchBroadcasts = useCallback(async () => {
        try {
            const res = await fetch('/api/platform/broadcast');
            const data = await res.json();
            if (data.broadcasts) setBroadcasts(data.broadcasts);
        } catch (err) {
            console.error('Failed to fetch broadcasts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBroadcasts();
    }, [fetchBroadcasts]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;

        setSending(true);
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));

            const res = await fetch('/api/platform/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    message: message.trim(),
                    expiresAt: expiresAt.toISOString(),
                }),
            });

            const data = await res.json();
            if (data.broadcast) {
                setBroadcasts(prev => [data.broadcast, ...prev]);
                setTitle('');
                setMessage('');
                setSuccess('Broadcast sent successfully!');
                setTimeout(() => setSuccess(''), 4000);
            }
        } catch (err) {
            console.error('Failed to send broadcast:', err);
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="broadcasts-page">
            <div className="platform-page-header">
                <h1>System Broadcasts</h1>
                <p>Send announcements to all tenant administrators</p>
            </div>

            <div className="broadcasts-layout">
                {/* Compose Form */}
                <div className="compose-card">
                    <div className="compose-header">
                        <Megaphone size={18} />
                        <h2>Compose Broadcast</h2>
                    </div>

                    {success && (
                        <div className="success-banner">
                            <CheckCircle size={16} />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSend}>
                        <div className="form-group">
                            <label htmlFor="broadcast-title">Title</label>
                            <input
                                id="broadcast-title"
                                type="text"
                                placeholder="e.g. Scheduled Maintenance Notice"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="broadcast-message">Message</label>
                            <textarea
                                id="broadcast-message"
                                placeholder="Write your announcement..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={5}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="broadcast-expires">Expires In</label>
                            <div className="expires-row">
                                <select
                                    id="broadcast-expires"
                                    value={expiresIn}
                                    onChange={e => setExpiresIn(e.target.value)}
                                >
                                    <option value="1">1 day</option>
                                    <option value="3">3 days</option>
                                    <option value="7">7 days</option>
                                    <option value="14">14 days</option>
                                    <option value="30">30 days</option>
                                    <option value="90">90 days</option>
                                </select>
                                <Calendar size={16} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="send-btn"
                            disabled={sending || !title.trim() || !message.trim()}
                        >
                            {sending ? (
                                <Loader2 size={16} className="spin" />
                            ) : (
                                <Send size={16} />
                            )}
                            {sending ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </form>
                </div>

                {/* Past Broadcasts */}
                <div className="history-card">
                    <div className="compose-header">
                        <Clock size={18} />
                        <h2>Broadcast History</h2>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <Loader2 size={20} className="spin" />
                        </div>
                    ) : broadcasts.length === 0 ? (
                        <div className="empty-state">
                            <Megaphone size={28} />
                            <p>No broadcasts sent yet</p>
                        </div>
                    ) : (
                        <div className="broadcast-list">
                            {broadcasts.map(b => (
                                <div
                                    key={b.id}
                                    className={`broadcast-item ${isExpired(b.expires_at) ? 'expired' : ''}`}
                                >
                                    <div className="broadcast-meta">
                                        <span className={`broadcast-status ${isExpired(b.expires_at) ? 'expired' : 'active'}`}>
                                            {isExpired(b.expires_at) ? 'Expired' : 'Active'}
                                        </span>
                                        <span className="broadcast-date">{formatDate(b.created_at)}</span>
                                    </div>
                                    <h3 className="broadcast-title">{b.title}</h3>
                                    <p className="broadcast-message">{b.message}</p>
                                    {b.expires_at && (
                                        <span className="broadcast-expires">
                                            {isExpired(b.expires_at) ? 'Expired' : 'Expires'}: {formatDate(b.expires_at)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .broadcasts-page {
                    max-width: 1100px;
                }

                .platform-page-header {
                    margin-bottom: 24px;
                }

                .platform-page-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 6px;
                    letter-spacing: -0.025em;
                }

                .platform-page-header p {
                    font-size: 14px;
                    color: #71717a;
                    margin: 0;
                }

                .broadcasts-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                /* Compose card */
                .compose-card,
                .history-card {
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 20px;
                }

                .compose-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    color: #a78bfa;
                }

                .compose-header h2 {
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                    margin: 0;
                }

                .success-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 8px;
                    color: #10b981;
                    font-size: 13px;
                    margin-bottom: 16px;
                }

                /* Form */
                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    font-size: 12px;
                    color: #a1a1aa;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    font-weight: 500;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 10px 14px;
                    background: #0a0a0f;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: #e4e4e7;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.15s ease;
                    font-family: inherit;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: rgba(167, 139, 250, 0.4);
                }

                .form-group input::placeholder,
                .form-group textarea::placeholder {
                    color: #3f3f46;
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .expires-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #71717a;
                }

                .expires-row select {
                    flex: 1;
                }

                .send-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.15s ease;
                }

                .send-btn:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* History */
                .loading-state {
                    display: flex;
                    justify-content: center;
                    padding: 40px;
                    color: #71717a;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 40px 20px;
                    color: #3f3f46;
                }

                .empty-state p {
                    color: #52525b;
                    font-size: 13px;
                    margin: 0;
                }

                .broadcast-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .broadcast-item {
                    padding: 14px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 8px;
                    transition: background 0.15s ease;
                }

                .broadcast-item:hover {
                    background: rgba(255,255,255,0.04);
                }

                .broadcast-item.expired {
                    opacity: 0.5;
                }

                .broadcast-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 6px;
                }

                .broadcast-status {
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .broadcast-status.active {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }

                .broadcast-status.expired {
                    background: rgba(113, 113, 122, 0.1);
                    color: #71717a;
                }

                .broadcast-date {
                    font-size: 12px;
                    color: #52525b;
                }

                .broadcast-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #e4e4e7;
                    margin: 0 0 4px;
                }

                .broadcast-message {
                    font-size: 13px;
                    color: #a1a1aa;
                    margin: 0;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .broadcast-expires {
                    display: block;
                    font-size: 11px;
                    color: #52525b;
                    margin-top: 8px;
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .broadcasts-layout {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
