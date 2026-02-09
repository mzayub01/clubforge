'use client';

// ===============================================
// Platform Broadcast Banner
// Dismissible alert shown at top of admin dashboard
// for active platform-wide announcements
// ===============================================

import { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';

interface Broadcast {
    id: string;
    title: string;
    message: string;
    created_at: string;
}

export default function PlatformBroadcastBanner() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load dismissed IDs from localStorage
        try {
            const stored = localStorage.getItem('dismissed_broadcasts');
            if (stored) setDismissed(new Set(JSON.parse(stored)));
        } catch { /* ignore */ }

        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        try {
            const res = await fetch('/api/platform/broadcasts/active');
            const data = await res.json();
            if (data.broadcasts) setBroadcasts(data.broadcasts);
        } catch {
            // Silently fail — banner is non-critical
        }
    };

    const dismiss = (id: string) => {
        const updated = new Set(dismissed);
        updated.add(id);
        setDismissed(updated);
        try {
            localStorage.setItem('dismissed_broadcasts', JSON.stringify([...updated]));
        } catch { /* ignore */ }
    };

    const visible = broadcasts.filter(b => !dismissed.has(b.id));

    if (visible.length === 0) return null;

    return (
        <div className="broadcast-banner-container">
            {visible.map(b => (
                <div key={b.id} className="broadcast-banner">
                    <div className="broadcast-banner-icon">
                        <Megaphone size={16} />
                    </div>
                    <div className="broadcast-banner-content">
                        <strong>{b.title}</strong>
                        <span>{b.message}</span>
                    </div>
                    <button
                        className="broadcast-banner-close"
                        onClick={() => dismiss(b.id)}
                        aria-label="Dismiss"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}

            <style jsx>{`
                .broadcast-banner-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .broadcast-banner {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(167, 139, 250, 0.08));
                    border: 1px solid rgba(167, 139, 250, 0.2);
                    border-radius: 10px;
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .broadcast-banner-icon {
                    flex-shrink: 0;
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    background: rgba(167, 139, 250, 0.15);
                    color: #a78bfa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 1px;
                }

                .broadcast-banner-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .broadcast-banner-content strong {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary, #e4e4e7);
                }

                .broadcast-banner-content span {
                    font-size: 12px;
                    color: var(--text-secondary, #a1a1aa);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .broadcast-banner-close {
                    flex-shrink: 0;
                    background: none;
                    border: none;
                    color: var(--text-muted, #71717a);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.15s ease;
                }

                .broadcast-banner-close:hover {
                    background: rgba(255,255,255,0.08);
                    color: var(--text-primary, #e4e4e7);
                }
            `}</style>
        </div>
    );
}
