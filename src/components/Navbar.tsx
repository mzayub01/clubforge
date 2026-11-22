'use client';

// ===============================================
// ClubForge - marketing navigation
//
// Pages may pass `user` when they already know who is signed in. Statically
// rendered pages (the homepage) pass nothing: the bar then checks the Supabase
// session in the browser, so the page itself never touches cookies and can be
// served from the CDN. Supabase is loaded on demand to keep it out of the
// first bundle.
// ===============================================

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import s from './Navbar.module.css';

interface NavUser {
    id: string;
    email: string;
    role?: string;
}

interface NavbarProps {
    /** Omit to let the bar detect the session in the browser. */
    user?: NavUser | null;
}

interface NavLink {
    href: string;
    label: string;
}

const FEATURES: NavLink[] = [
    { href: '/features/member-management', label: 'Member management' },
    { href: '/features/class-scheduling', label: 'Class scheduling' },
    { href: '/features/belt-progression', label: 'Belt progression' },
    { href: '/features/attendance-tracking', label: 'Attendance tracking' },
    { href: '/features/payments-billing', label: 'Payments and billing' },
    { href: '/features/multi-location', label: 'Multi-location' },
];

const BUILT_FOR: NavLink[] = [
    { href: '/for/bjj', label: 'BJJ academies' },
    { href: '/for/karate', label: 'Karate dojos' },
    { href: '/for/judo', label: 'Judo clubs' },
    { href: '/for/taekwondo', label: 'Taekwondo clubs' },
    { href: '/for/boxing-mma', label: 'Boxing and MMA gyms' },
    { href: '/for/boxing', label: 'Boxing clubs' },
    { href: '/for/kickboxing', label: 'Kickboxing clubs' },
    { href: '/for/fitness-studios', label: 'Fitness studios' },
];

const RESOURCES: NavLink[] = [
    { href: '/blog', label: 'Blog' },
    { href: '/faq', label: 'FAQ' },
    { href: '/about', label: 'About' },
    { href: '/demo', label: 'Book a demo' },
];

const GROUPS: { id: string; label: string; links: NavLink[]; all?: NavLink }[] = [
    { id: 'features', label: 'Features', links: FEATURES, all: { href: '/features', label: 'All features' } },
    { id: 'built-for', label: 'Built for', links: BUILT_FOR, all: { href: '/for/martial-arts', label: 'All martial arts clubs' } },
    { id: 'resources', label: 'Resources', links: RESOURCES },
];

export default function Navbar({ user }: NavbarProps) {
    const [sessionUser, setSessionUser] = useState<NavUser | null>(user ?? null);
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const currentUser = user !== undefined ? user : sessionUser;

    // No `user` prop: find out in the browser whether someone is signed in.
    useEffect(() => {
        if (user !== undefined) return;
        let cancelled = false;
        (async () => {
            try {
                const { getSupabaseClient } = await import('@/lib/supabase/client');
                const { data } = await getSupabaseClient().auth.getSession();
                const found = data.session?.user;
                if (!cancelled && found?.email) setSessionUser({ id: found.id, email: found.email });
            } catch {
                // Not signed in, or Supabase is not configured: stay signed out.
            }
        })();
        return () => { cancelled = true; };
    }, [user]);

    // Escape closes whatever is open.
    useEffect(() => {
        if (!openGroup && !sheetOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setOpenGroup(null); setSheetOpen(false); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [openGroup, sheetOpen]);

    const handleSignOut = async () => {
        try {
            const { getSupabaseClient } = await import('@/lib/supabase/client');
            await getSupabaseClient().auth.signOut();
        } finally {
            setSessionUser(null);
            setSheetOpen(false);
            router.push('/');
            router.refresh();
        }
    };

    const isActive = (href: string) => (href === '/' ? pathname === '/' : !!pathname?.startsWith(href));
    const groupActive = (links: NavLink[], all?: NavLink) =>
        links.some(l => isActive(l.href)) || (all ? isActive(all.href) : false);

    const hoverOpen = (id: string) => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpenGroup(id);
    };
    const hoverClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpenGroup(null), 140);
    };
    const closeAll = () => { setOpenGroup(null); setSheetOpen(false); };

    return (
        <header className={s.bar}>
            <div className={s.inner}>
                <Link href="/" className={s.logo} onClick={closeAll}>
                    <Image src="/logo-clubforge-final.svg" alt="ClubForge" width={200} height={52} priority />
                </Link>

                <nav className={s.links} aria-label="Main">
                    {GROUPS.slice(0, 2).map(group => (
                        <NavGroup
                            key={group.id}
                            group={group}
                            open={openGroup === group.id}
                            active={groupActive(group.links, group.all)}
                            onToggle={() => setOpenGroup(openGroup === group.id ? null : group.id)}
                            onEnter={() => hoverOpen(group.id)}
                            onLeave={hoverClose}
                            onClose={() => setOpenGroup(null)}
                        />
                    ))}
                    <Link href="/pricing" className={`${s.link} ${isActive('/pricing') ? s.active : ''}`}>Pricing</Link>
                    <Link href="/#tour" className={s.link}>See it in action</Link>
                    <NavGroup
                        group={GROUPS[2]}
                        open={openGroup === 'resources'}
                        active={groupActive(RESOURCES)}
                        onToggle={() => setOpenGroup(openGroup === 'resources' ? null : 'resources')}
                        onEnter={() => hoverOpen('resources')}
                        onLeave={hoverClose}
                        onClose={() => setOpenGroup(null)}
                    />
                </nav>

                <div className={s.actions}>
                    {currentUser ? (
                        <>
                            <button type="button" onClick={handleSignOut} className={`${s.link} ${s.login}`}>Sign out</button>
                            <Link href="/dashboard" className={s.cta}>Dashboard</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={`${s.link} ${s.login}`}>Log in</Link>
                            <Link href="/get-started" className={s.cta}>Start free trial</Link>
                        </>
                    )}
                    <button
                        type="button"
                        className={s.burger}
                        onClick={() => setSheetOpen(!sheetOpen)}
                        aria-expanded={sheetOpen}
                        aria-controls="site-menu"
                        aria-label={sheetOpen ? 'Close menu' : 'Open menu'}
                    >
                        {sheetOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {sheetOpen && (
                <nav id="site-menu" className={s.sheet} aria-label="Menu">
                    {/* The trial / dashboard button stays in the bar above, so only the second action lives here. */}
                    <div className={s.sheetActions}>
                        {currentUser
                            ? <button type="button" onClick={handleSignOut}>Sign out</button>
                            : <Link href="/login" onClick={closeAll}>Log in</Link>}
                    </div>
                    <div className={s.sheetTop}>
                        <Link href="/pricing" className={s.row} onClick={closeAll}>Pricing</Link>
                        <Link href="/#tour" className={s.row} onClick={closeAll}>See it in action</Link>
                    </div>
                    {GROUPS.map(group => (
                        <div key={group.id}>
                            <h2>{group.label}</h2>
                            <ul>
                                {group.links.map(link => (
                                    <li key={link.href}><Link href={link.href} className={s.row} onClick={closeAll}>{link.label}</Link></li>
                                ))}
                                {group.all && (
                                    <li><Link href={group.all.href} className={s.row} onClick={closeAll}>{group.all.label}</Link></li>
                                )}
                            </ul>
                        </div>
                    ))}
                </nav>
            )}
        </header>
    );
}

function NavGroup({ group, open, active, onToggle, onEnter, onLeave, onClose }: {
    group: { id: string; label: string; links: NavLink[]; all?: NavLink };
    open: boolean;
    active: boolean;
    onToggle: () => void;
    onEnter: () => void;
    onLeave: () => void;
    onClose: () => void;
}) {
    return (
        <div
            className={s.group}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onClose(); }}
        >
            <button
                type="button"
                className={`${s.trigger} ${active ? s.active : ''}`}
                aria-expanded={open}
                aria-controls={`nav-${group.id}`}
                onClick={onToggle}
            >
                {group.label}
                <ChevronDown size={15} aria-hidden="true" />
            </button>
            {/* Always in the HTML (crawlable, works before hydration); `hidden` until opened. */}
            <ul id={`nav-${group.id}`} className={s.menu} hidden={!open}>
                {group.links.map(link => (
                    <li key={link.href}><Link href={link.href} onClick={onClose}>{link.label}</Link></li>
                ))}
                {group.all && (
                    <li className={s.all}><Link href={group.all.href} onClick={onClose}>{group.all.label}</Link></li>
                )}
            </ul>
        </div>
    );
}
