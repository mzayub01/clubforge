'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
    LayoutDashboard,
    Calendar,
    CheckCircle,
    Video,
    Award,
    Bell,
    User,
    Settings,
    LogOut,
    BookOpen,
    X,
    Menu,
    PartyPopper,
    Users,
    CreditCard,
    MapPin,
    ChevronRight,
    ChevronDown,
    Crown,
    ClipboardList,
    UserPlus,
    Shield,
    GraduationCap,
    PoundSterling,
    Receipt,
    Tag,
    Mail,
    MessageSquare
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';
import ChildSwitcher from '@/components/dashboard/ChildSwitcher';
import { useDashboard } from '@/components/dashboard/DashboardProvider';

interface SidebarProps {
    role: 'member' | 'instructor' | 'professor' | 'admin';
    userRole?: string;
    userName?: string;
    profileImageUrl?: string;
    hasChildren?: boolean;
    tenantLogoUrl?: string;
    tenantName?: string;
}

interface SidebarSection {
    id: string;
    title: string;
    links: { href: string; label: string; icon: React.ComponentType<{ size?: number }> }[];
    defaultOpen?: boolean;
}

// Wrapper component to connect ChildSwitcher with dashboard state
function ChildSwitcherWrapper() {
    const { parentProfile, children, selectedProfileId, setSelectedProfileId, hasParentMembership } = useDashboard();

    if (!parentProfile) return null;

    return (
        <div style={{ marginTop: 'var(--space-3)' }}>
            <ChildSwitcher
                parentProfile={parentProfile}
                children={children}
                hasParentMembership={hasParentMembership}
                selectedProfileId={selectedProfileId}
                onProfileChange={setSelectedProfileId}
            />
        </div>
    );
}

function CollapsibleSection({
    section,
    pathname,
    onLinkClick,
}: {
    section: SidebarSection;
    pathname: string;
    onLinkClick: () => void;
}) {
    const STORAGE_KEY = `sidebar-section-${section.id}`;
    const hasActiveLink = section.links.some(link => pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));

    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === 'undefined') return section.defaultOpen ?? false;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) return stored === 'true';
        // Auto-open if section has the active link
        return hasActiveLink || (section.defaultOpen ?? false);
    });

    // Auto-open when navigating to a link in this section
    useEffect(() => {
        if (hasActiveLink && !isOpen) {
            setIsOpen(true);
        }
    }, [hasActiveLink]);

    const toggleOpen = useCallback(() => {
        setIsOpen(prev => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, [STORAGE_KEY]);

    // Single link section (no collapsing needed)
    if (section.links.length === 1) {
        const link = section.links[0];
        return (
            <div className="sidebar-section" style={{ marginBottom: 'var(--space-1)' }}>
                <Link
                    href={link.href}
                    className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                    onClick={onLinkClick}
                >
                    <link.icon size={20} />
                    <span style={{ flex: 1 }}>{link.label}</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="sidebar-section" style={{ marginBottom: 'var(--space-1)' }}>
            <button
                onClick={toggleOpen}
                className="sidebar-section-header"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    borderRadius: 'var(--radius-md)',
                    transition: 'color 0.2s ease',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {section.title}
                    {hasActiveLink && !isOpen && (
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-gold)',
                            display: 'inline-block',
                        }} />
                    )}
                </span>
                <ChevronDown
                    size={14}
                    style={{
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease',
                        opacity: 0.5,
                    }}
                />
            </button>
            <div style={{
                overflow: 'hidden',
                maxHeight: isOpen ? `${section.links.length * 48}px` : '0',
                transition: 'max-height 0.25s ease',
            }}>
                {section.links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                        onClick={onLinkClick}
                    >
                        <link.icon size={20} />
                        <span style={{ flex: 1 }}>{link.label}</span>
                        <ChevronRight size={16} style={{ opacity: 0.3 }} className="sidebar-link-arrow" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function DashboardSidebar({ role, userRole, userName = 'Member', profileImageUrl, hasChildren = false, tenantLogoUrl, tenantName }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = getSupabaseClient();
    const [isOpen, setIsOpen] = useState(false);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSignOut = async () => {
        setIsOpen(false);
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const { hasParentMembership } = useDashboard();

    // ---- MEMBER LINKS (flat like before) ----
    const memberLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/classes', label: 'Classes', icon: Calendar },
        { href: '/dashboard/attendance', label: 'Attendance', icon: CheckCircle },
        { href: '/dashboard/progress', label: 'Belt Progress', icon: Award },
        { href: '/dashboard/videos', label: 'Video Library', icon: Video },
        { href: '/dashboard/naseeha', label: 'Weekly Wisdom', icon: BookOpen },
        { href: '/dashboard/events', label: 'Events', icon: PartyPopper },
        { href: '/dashboard/announcements', label: 'Announcements', icon: Bell },
        { href: '/dashboard/membership', label: 'Membership', icon: CreditCard },
        { href: '/dashboard/payments', label: 'Payment History', icon: Receipt },
        { href: '/dashboard/add-child', label: 'Add Child', icon: UserPlus },
    ];

    const instructorLinks = [
        { href: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/instructor/classes', label: 'My Classes', icon: Calendar },
        { href: '/admin/class-roster', label: 'Class Roster', icon: ClipboardList },
        { href: '/instructor/attendance', label: 'Attendance', icon: CheckCircle },
        { href: '/instructor/students', label: 'Students', icon: User },
        { href: '/instructor/naseeha', label: 'Weekly Wisdom', icon: BookOpen },
    ];

    const professorLinks = [
        { href: '/professor', label: 'Grading', icon: Award },
    ];

    // ---- ADMIN SECTIONS (new grouped layout) ----
    const adminSections: SidebarSection[] = [
        {
            id: 'overview',
            title: 'Overview',
            links: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
            defaultOpen: true,
        },
        {
            id: 'members',
            title: 'Members',
            links: [
                { href: '/admin/members', label: 'All Members', icon: Users },
                { href: '/admin/memberships', label: 'Memberships', icon: CreditCard },
                { href: '/admin/waitlist', label: 'Waitlist', icon: Users },
                { href: '/admin/instructors', label: 'Instructors', icon: Award },
                { href: '/admin/professor-access', label: 'Professor Access', icon: GraduationCap },
                { href: '/admin/invite', label: 'Invite Members', icon: UserPlus },
            ],
            defaultOpen: false,
        },
        {
            id: 'club',
            title: 'Your Club',
            links: [
                { href: '/admin/locations', label: 'Locations', icon: MapPin },
                { href: '/admin/membership-types', label: 'Membership Plans', icon: CreditCard },
                { href: '/admin/classes', label: 'Classes', icon: Calendar },
                { href: '/admin/class-roster', label: 'Class Roster', icon: ClipboardList },
                { href: '/professor', label: 'Grading', icon: Award },
            ],
            defaultOpen: true,
        },
        {
            id: 'engagement',
            title: 'Engagement',
            links: [
                { href: '/admin/announcements', label: 'Announcements', icon: Bell },
                { href: '/admin/events', label: 'Events', icon: PartyPopper },
                { href: '/admin/videos', label: 'Videos', icon: Video },
                { href: '/admin/naseeha', label: 'Weekly Wisdom', icon: BookOpen },
                { href: '/admin/email-templates', label: 'Email Templates', icon: Mail },
                { href: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
            ],
            defaultOpen: false,
        },
        {
            id: 'money',
            title: 'Money',
            links: [
                { href: '/admin/finance', label: 'Finance', icon: PoundSterling },
                { href: '/admin/attendance', label: 'Attendance', icon: CheckCircle },
            ],
            defaultOpen: false,
        },
    ];

    // Quick access links based on user's actual role (only shown in member dashboard)
    const quickAccessLinks = role === 'member' ? [
        ...(userRole === 'admin' ? [{ href: '/admin', label: 'Admin Dashboard', icon: Shield }] : []),
        ...(userRole === 'admin' || userRole === 'professor' ? [{ href: '/professor', label: 'Professor Grading', icon: GraduationCap }] : []),
        ...(userRole === 'instructor' ? [{ href: '/instructor', label: 'Instructor Dashboard', icon: Award }] : []),
    ] : [];

    const closeSidebar = () => setIsOpen(false);

    // Determine if we should use grouped admin layout
    const useGroupedLayout = role === 'admin';
    const flatLinks = role === 'instructor' ? instructorLinks : role === 'professor' ? professorLinks : memberLinks;

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="dashboard-mobile-header">
                <button
                    onClick={() => setIsOpen(true)}
                    className="dashboard-mobile-menu-btn"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    {tenantLogoUrl ? (
                        <img
                            src={tenantLogoUrl}
                            alt={tenantName || 'Club'}
                            style={{ height: '32px', width: 'auto', borderRadius: '6px' }}
                        />
                    ) : (
                        <Image
                            src="/logo-clubforge-final.svg"
                            alt="ClubForge"
                            width={200}
                            height={52}
                            style={{ height: '32px', width: 'auto' }}
                        />
                    )}
                </Link>
                <Link href="/dashboard/profile" className="dashboard-mobile-profile-btn">
                    <User size={20} />
                </Link>
            </div>

            {/* Overlay */}
            <div
                className={`dashboard-sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {tenantLogoUrl ? (
                                <img
                                    src={tenantLogoUrl}
                                    alt={tenantName || 'Club'}
                                    style={{ height: '36px', width: 'auto', borderRadius: '8px' }}
                                />
                            ) : (
                                <Image
                                    src="/logo-clubforge-final.svg"
                                    alt="ClubForge"
                                    width={200}
                                    height={52}
                                    style={{ height: '36px', width: 'auto' }}
                                />
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="sidebar-close-btn"
                            aria-label="Close menu"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-3)',
                        background: 'rgba(197, 164, 86, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                    }}>
                        <Avatar
                            src={profileImageUrl}
                            firstName={userName.split(' ')[0]}
                            lastName={userName.split(' ')[1] || ''}
                            size="md"
                        />
                        <div>
                            <p style={{ fontWeight: '600', fontSize: 'var(--text-sm)', margin: 0 }}>{userName}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, textTransform: 'capitalize' }}>
                                {role === 'admin' ? '👑 Club Owner' : role}
                            </p>
                        </div>
                    </div>

                    {/* Child Switcher */}
                    {hasChildren && <ChildSwitcherWrapper />}
                </div>

                <nav className="sidebar-nav">
                    {useGroupedLayout ? (
                        /* ===== ADMIN: Grouped collapsible sections ===== */
                        <>
                            {adminSections.map((section) => (
                                <CollapsibleSection
                                    key={section.id}
                                    section={section}
                                    pathname={pathname}
                                    onLinkClick={closeSidebar}
                                />
                            ))}
                        </>
                    ) : (
                        /* ===== NON-ADMIN: Flat link list ===== */
                        <>
                            <div className="sidebar-section">
                                <span className="sidebar-section-title">Menu</span>
                                {flatLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                                        onClick={closeSidebar}
                                    >
                                        <link.icon size={20} />
                                        <span style={{ flex: 1 }}>{link.label}</span>
                                        <ChevronRight size={16} style={{ opacity: 0.3 }} className="sidebar-link-arrow" />
                                    </Link>
                                ))}
                            </div>

                            {quickAccessLinks.length > 0 && (
                                <div className="sidebar-section">
                                    <span className="sidebar-section-title">Quick Access</span>
                                    {quickAccessLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                                            onClick={closeSidebar}
                                            style={{ background: 'rgba(197, 164, 86, 0.08)' }}
                                        >
                                            <link.icon size={20} color="var(--color-gold)" />
                                            <span style={{ flex: 1 }}>{link.label}</span>
                                            <ChevronRight size={16} style={{ opacity: 0.3 }} className="sidebar-link-arrow" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Settings link for admin */}
                    {useGroupedLayout && (
                        <div className="sidebar-section" style={{ marginTop: 'var(--space-2)' }}>
                            <Link
                                href="/admin/settings"
                                className={`sidebar-link ${pathname === '/admin/settings' ? 'active' : ''}`}
                                onClick={closeSidebar}
                            >
                                <Settings size={20} />
                                <span style={{ flex: 1 }}>Settings</span>
                                <ChevronRight size={16} style={{ opacity: 0.3 }} className="sidebar-link-arrow" />
                            </Link>
                        </div>
                    )}

                    <div className="sidebar-section sidebar-account-section" style={{ marginTop: 'auto' }}>
                        <span className="sidebar-section-title">Account</span>
                        <Link
                            href="/dashboard/profile"
                            className={`sidebar-link ${pathname === '/dashboard/profile' ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <User size={20} />
                            <span style={{ flex: 1 }}>Profile</span>
                            <ChevronRight size={16} style={{ opacity: 0.3 }} className="sidebar-link-arrow" />
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="sidebar-link"
                            style={{
                                width: '100%',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: 'var(--color-red)',
                            }}
                        >
                            <LogOut size={20} />
                            <span style={{ flex: 1 }}>Sign Out</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <style jsx>{`
                .dashboard-mobile-header {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: var(--bg-glass-dark);
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur);
                    border-bottom: 1px solid var(--border-light);
                    padding: 0 var(--space-4);
                    align-items: center;
                    justify-content: space-between;
                    z-index: 50;
                }
                
                .dashboard-mobile-menu-btn,
                .dashboard-mobile-profile-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    border: none;
                    background: transparent;
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    color: var(--text-primary);
                    transition: background var(--transition-fast);
                }
                
                .dashboard-mobile-menu-btn:hover,
                .dashboard-mobile-profile-btn:hover {
                    background: var(--bg-tertiary);
                }
                
                .dashboard-mobile-profile-btn {
                    background: rgba(197, 164, 86, 0.1);
                    color: var(--color-gold);
                }
                
                .dashboard-sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0);
                    z-index: 55;
                    pointer-events: none;
                    transition: background 0.3s ease;
                }
                
                .dashboard-sidebar-overlay.open {
                    background: rgba(0, 0, 0, 0.5);
                    pointer-events: auto;
                }
                
                .sidebar-close-btn {
                    display: none;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: transparent;
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    color: var(--text-primary);
                    transition: background var(--transition-fast);
                }
                
                .sidebar-close-btn:hover {
                    background: var(--bg-tertiary);
                }
                
                @media (max-width: 1024px) {
                    .dashboard-mobile-header {
                        display: flex;
                    }
                    
                    .dashboard-sidebar-overlay {
                        display: block;
                    }
                    
                    .sidebar-close-btn {
                        display: flex;
                    }
                    
                    :global(.sidebar) {
                        transform: translateX(-100%);
                        z-index: 60;
                    }
                    
                    :global(.sidebar.open) {
                        transform: translateX(0);
                    }
                    
                    :global(.dashboard-main) {
                        margin-left: 0;
                        padding-top: 76px;
                    }
                }
                
                @supports (padding-top: env(safe-area-inset-top)) {
                    .dashboard-mobile-header {
                        padding-top: env(safe-area-inset-top);
                        height: calc(60px + env(safe-area-inset-top));
                    }
                    
                    @media (max-width: 1024px) {
                        :global(.dashboard-main) {
                            padding-top: calc(76px + env(safe-area-inset-top));
                        }
                    }
                }
            `}</style>
        </>
    );
}
