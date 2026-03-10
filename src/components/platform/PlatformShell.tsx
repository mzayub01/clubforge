'use client';

// ===============================================
// ClubForge - Platform Shell (Client Component)
// Sidebar + header for platform admin pages
// ===============================================

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    BarChart3,
    Megaphone,
    Tag,
    Mail,
    LogOut,
    Menu,
    X,
    Shield,
    ChevronRight,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface PlatformShellProps {
    userEmail: string;
    children: React.ReactNode;
}

const navItems = [
    { href: '/platform', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/platform/tenants', label: 'Tenants', icon: Building2 },
    { href: '/platform/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/platform/promo-codes', label: 'Promo Codes', icon: Tag },
    { href: '/platform/mail-merge', label: 'Mail Merge', icon: Mail },
    { href: '/platform/broadcasts', label: 'Broadcasts', icon: Megaphone },
];

export default function PlatformShell({ userEmail, children }: PlatformShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const isActive = (href: string) => {
        if (href === '/platform') return pathname === '/platform';
        return pathname.startsWith(href);
    };

    return (
        <div className="platform-layout">
            {/* Mobile header */}
            <header className="platform-mobile-header">
                <button
                    className="platform-menu-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="platform-header-brand">
                    <Shield size={18} />
                    <span>ClubForge Platform</span>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`platform-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="platform-sidebar-header">
                    <div className="platform-logo">
                        <div className="platform-logo-icon">
                            <Shield size={24} />
                        </div>
                        <div className="platform-logo-text">
                            <span className="platform-logo-title">ClubForge</span>
                            <span className="platform-logo-subtitle">Platform Admin</span>
                        </div>
                    </div>
                </div>

                <nav className="platform-nav">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <button
                                key={item.href}
                                className={`platform-nav-item ${active ? 'active' : ''}`}
                                onClick={() => {
                                    router.push(item.href);
                                    setSidebarOpen(false);
                                }}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                                {active && <ChevronRight size={16} className="platform-nav-arrow" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="platform-sidebar-footer">
                    <div className="platform-user-info">
                        <div className="platform-user-avatar">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="platform-user-details">
                            <span className="platform-user-email">{userEmail}</span>
                            <span className="platform-user-role">Platform Admin</span>
                        </div>
                    </div>
                    <button className="platform-signout-btn" onClick={handleSignOut}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="platform-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="platform-main">
                {children}
            </main>

            <style jsx>{`
                .platform-layout {
                    display: flex;
                    min-height: 100vh;
                    background: #0a0a0f;
                    color: #e4e4e7;
                }

                /* Mobile header */
                .platform-mobile-header {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 56px;
                    background: #111118;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    align-items: center;
                    padding: 0 16px;
                    gap: 12px;
                    z-index: 100;
                }

                .platform-menu-btn {
                    background: none;
                    border: none;
                    color: #a1a1aa;
                    cursor: pointer;
                    padding: 6px;
                }

                .platform-header-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    font-size: 15px;
                    color: #a78bfa;
                }

                /* Sidebar */
                .platform-sidebar {
                    width: 260px;
                    min-height: 100vh;
                    background: #111118;
                    border-right: 1px solid rgba(255,255,255,0.06);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    z-index: 200;
                }

                .platform-sidebar-header {
                    padding: 24px 20px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .platform-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .platform-logo-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .platform-logo-text {
                    display: flex;
                    flex-direction: column;
                }

                .platform-logo-title {
                    font-weight: 700;
                    font-size: 16px;
                    color: white;
                    letter-spacing: -0.02em;
                }

                .platform-logo-subtitle {
                    font-size: 11px;
                    color: #a78bfa;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    font-weight: 500;
                }

                /* Nav */
                .platform-nav {
                    flex: 1;
                    padding: 12px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .platform-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: none;
                    background: none;
                    color: #a1a1aa;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    width: 100%;
                    text-align: left;
                    transition: all 0.15s ease;
                }

                .platform-nav-item:hover {
                    background: rgba(167, 139, 250, 0.08);
                    color: #e4e4e7;
                }

                .platform-nav-item.active {
                    background: rgba(167, 139, 250, 0.12);
                    color: #a78bfa;
                }

                .platform-nav-arrow {
                    margin-left: auto;
                    opacity: 0.6;
                }

                /* Footer */
                .platform-sidebar-footer {
                    padding: 16px 12px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }

                .platform-user-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                    padding: 0 4px;
                }

                .platform-user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 13px;
                    color: white;
                }

                .platform-user-details {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .platform-user-email {
                    font-size: 12px;
                    color: #d4d4d8;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .platform-user-role {
                    font-size: 11px;
                    color: #71717a;
                }

                .platform-signout-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: none;
                    background: none;
                    color: #71717a;
                    cursor: pointer;
                    font-size: 13px;
                    width: 100%;
                    transition: all 0.15s ease;
                }

                .platform-signout-btn:hover {
                    background: rgba(239, 68, 68, 0.08);
                    color: #ef4444;
                }

                /* Overlay */
                .platform-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 150;
                }

                /* Main content */
                .platform-main {
                    flex: 1;
                    margin-left: 260px;
                    padding: 32px;
                    min-height: 100vh;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .platform-mobile-header {
                        display: flex;
                    }

                    .platform-sidebar {
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }

                    .platform-sidebar.open {
                        transform: translateX(0);
                    }

                    .platform-overlay {
                        display: block;
                    }

                    .platform-main {
                        margin-left: 0;
                        padding: 72px 16px 24px;
                    }
                }
            `}</style>
        </div>
    );
}
