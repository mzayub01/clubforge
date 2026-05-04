'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import PromoBanner from './PromoBanner';

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

    // Homepage uses light hero, other pages use dark
    const isHomepage = pathname === '/';
    const isLightHero = isHomepage && !isScrolled;

    const navLinks = user
        ? [
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/admin', label: 'Admin', show: true },
        ]
        : [
            { href: '/#features', label: 'Features' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/blog', label: 'Blog' },
            { href: '/faq', label: 'FAQ' },
            { href: '/demo', label: 'Demo' },
            { href: '/about', label: 'About' },
        ];

    return (
        <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        {!user && <PromoBanner />}
        <nav
            className="navbar"
            style={{
                position: 'relative',
                background: isScrolled
                    ? 'rgba(255, 255, 255, 0.85)'
                    : isLightHero
                        ? 'transparent'
                        : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
                WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
                borderBottom: isScrolled ? '1px solid rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.3s ease',
                boxShadow: isScrolled ? '0 1px 12px rgba(15, 23, 42, 0.06)' : 'none',
            }}
        >
            <div className="navbar-container">
                {/* Logo */}
                <Link href="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
                    <Image
                        src="/logo-clubforge-final.svg"
                        alt="ClubForge"
                        width={200}
                        height={52}
                        style={{
                            height: '36px', width: 'auto',
                        }}
                        priority
                    />
                </Link>

                {/* Desktop Nav Links */}
                <div className="navbar-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`navbar-link ${isActive(link.href) ? 'active' : ''}`}
                            style={{
                                color: isActive(link.href) ? '#C5A456' : '#334155',
                                fontWeight: '500',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ color: '#334155' }}>
                                Dashboard
                            </Link>
                            <button onClick={handleSignOut} className="btn btn-outline btn-sm" style={{
                                borderColor: '#E2E8F0', color: '#334155',
                            }}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="btn btn-ghost btn-sm"
                                style={{ display: 'none', color: '#334155' }}
                                id="desktop-login"
                            >
                                Log In
                            </Link>
                            <style>{`@media (min-width: 768px) { #desktop-login { display: inline-flex !important; } }`}</style>
                            <Link href="/get-started" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                color: '#0F172A', padding: '8px 20px', borderRadius: '10px',
                                fontSize: '14px', fontWeight: '700', textDecoration: 'none',
                            }}>
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
                        style={{
                            color: '#334155',
                        }}
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
                        background: '#FFFFFF',
                        borderBottom: '1px solid #F1F5F9',
                        padding: '16px 24px',
                        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
                    }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                display: 'block',
                                padding: '12px 0',
                                color: isActive(link.href) ? '#C5A456' : '#334155',
                                fontWeight: '500',
                                borderBottom: '1px solid #F1F5F9',
                                textDecoration: 'none',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div style={{ paddingTop: '16px', display: 'flex', gap: '12px' }}>
                        {user ? (
                            <button onClick={handleSignOut} className="btn btn-outline" style={{ width: '100%' }}>
                                Sign Out
                            </button>
                        ) : (
                            <>
                                <Link href="/login" style={{
                                    flex: 1, textAlign: 'center', textDecoration: 'none',
                                    padding: '12px', borderRadius: '10px',
                                    border: '1px solid #E2E8F0', color: '#334155',
                                    fontWeight: '600', fontSize: '14px',
                                }}>
                                    Log In
                                </Link>
                                <Link href="/get-started" style={{
                                    flex: 1, textAlign: 'center', textDecoration: 'none',
                                    padding: '12px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                    color: '#0F172A', fontWeight: '700', fontSize: '14px',
                                }}>
                                    Start Free Trial
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
        </div>
    );
}
