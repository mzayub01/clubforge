'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
    user?: {
        id: string;
        email: string;
        role?: string;
    } | null;
}

export default function Navbar({ user }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href);
    };

    // Determine if we're on a dark hero page (homepage)
    const isDarkHero = pathname === '/' && !isScrolled;

    const navLinks = user
        ? [
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/admin', label: 'Admin', show: true },
        ]
        : [
            { href: '/#features', label: 'Features' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/demo', label: 'Demo' },
            { href: '/about', label: 'About' },
        ];

    return (
        <nav
            className="navbar"
            style={{
                background: isScrolled
                    ? 'var(--bg-glass-dark)'
                    : isDarkHero
                        ? 'transparent'
                        : 'var(--bg-glass-dark)',
                borderBottom: isScrolled ? 'var(--glass-border)' : 'none',
                transition: 'all 0.3s ease',
            }}
        >
            <div className="navbar-container">
                {/* Logo */}
                <Link href="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
                    <Image
                        src="/logo-simple.png"
                        alt="ClubForge"
                        width={120}
                        height={48}
                        style={{ height: '40px', width: 'auto' }}
                        priority
                    />
                    <span
                        style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: '700',
                            fontFamily: 'var(--font-display)',
                            color: 'var(--color-gold)',
                        }}
                    >
                        ClubForge
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="navbar-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`navbar-link ${isActive(link.href) ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link href="/dashboard" className="btn btn-ghost btn-sm">
                                Dashboard
                            </Link>
                            <button onClick={handleSignOut} className="btn btn-outline btn-sm">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="btn btn-ghost btn-sm"
                                style={{ display: 'none' }}
                                id="desktop-login"
                            >
                                Log In
                            </Link>
                            <style>{`@media (min-width: 768px) { #desktop-login { display: inline-flex !important; } }`}</style>
                            <Link href="/register" className="btn btn-primary btn-sm">
                                Start Free Trial
                                <ChevronRight size={16} />
                            </Link>
                        </>
                    )}

                    {/* Mobile menu button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-primary)',
                        borderBottom: '1px solid var(--border-light)',
                        padding: 'var(--space-4) var(--space-6)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                display: 'block',
                                padding: 'var(--space-3) 0',
                                color: isActive(link.href) ? 'var(--color-gold)' : 'var(--text-primary)',
                                fontWeight: '500',
                                borderBottom: '1px solid var(--border-light)',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div style={{ paddingTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                        {user ? (
                            <button onClick={handleSignOut} className="btn btn-outline" style={{ width: '100%' }}>
                                Sign Out
                            </button>
                        ) : (
                            <>
                                <Link href="/login" className="btn btn-outline" style={{ flex: 1 }}>
                                    Log In
                                </Link>
                                <Link href="/register" className="btn btn-primary" style={{ flex: 1 }}>
                                    Start Free Trial
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
