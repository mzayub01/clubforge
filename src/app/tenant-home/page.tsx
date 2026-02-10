'use client';

// ===============================================
// ClubForge - Tenant Welcome Page
// Premium branded landing page for a club's subdomain
// Features: hero section, feature highlights, class schedule,
// locations, contact info, and ClubForge footer
// ===============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar, MapPin, Clock, Users, ChevronRight,
    Shield, Loader2, ExternalLink, Mail, Phone,
    Star, Award, Zap, Target, Trophy, Heart
} from 'lucide-react';
import styles from './tenant-home.module.css';

// -----------------------------------------------
// Types
// -----------------------------------------------
interface TenantInfo {
    name: string;
    slug: string;
    logoUrl: string | null;
    primaryColor: string;
    tagline: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    createdAt: string;
}

interface ClassInfo {
    id: string;
    name: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    locationId: string;
}

interface LocationInfo {
    id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

export default function TenantHomePage() {
    const [tenant, setTenant] = useState<TenantInfo | null>(null);
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [locations, setLocations] = useState<LocationInfo[]>([]);
    const [memberCount, setMemberCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/tenant/public')
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => {
                setTenant(data.tenant);
                setClasses(data.classes || []);
                setLocations(data.locations || []);
                setMemberCount(data.memberCount || 0);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    // ── Loading State ──
    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <Loader2 size={32} className={styles.spinner} />
            </div>
        );
    }

    // ── Error State ──
    if (error || !tenant) {
        return (
            <div className={styles.errorScreen}>
                <Shield size={48} className={styles.errorIcon} />
                <h1 className={styles.errorTitle}>Club Not Found</h1>
                <p className={styles.errorMessage}>
                    This club doesn&apos;t exist or is no longer active.
                </p>
                <a href="https://clubforgehq.com" className={styles.errorLink}>
                    Visit ClubForge <ExternalLink size={14} />
                </a>
            </div>
        );
    }

    const primaryColor = tenant.primaryColor || '#C5A456';

    // Group classes by day
    const classesByDay: Record<number, ClassInfo[]> = {};
    classes.forEach(c => {
        if (!classesByDay[c.dayOfWeek]) classesByDay[c.dayOfWeek] = [];
        classesByDay[c.dayOfWeek].push(c);
    });

    // Location lookup
    const locationMap: Record<string, LocationInfo> = {};
    locations.forEach(l => { locationMap[l.id] = l; });

    // Unique class names for highlighting
    const uniqueClassNames = [...new Set(classes.map(c => c.name))];
    const totalClassesPerWeek = classes.length;

    // Apply club's primary color as CSS custom property
    const pageStyle = {
        '--club-color': primaryColor,
        '--club-glow': `${primaryColor}40`,
        '--club-glow-pale': `${primaryColor}18`,
        '--club-color-dark': primaryColor,
    } as React.CSSProperties;

    return (
        <div className={styles.page} style={pageStyle}>

            {/* ============== HERO SECTION ============== */}
            <section className={styles.hero}>
                {/* Background decorations */}
                <div className={styles.heroBgGlow} />
                <div className={styles.heroGridPattern} />
                <div className={styles.heroAccentOrb1} />
                <div className={styles.heroAccentOrb2} />
                <div className={styles.heroDecorLine} />

                <div className={styles.heroContent}>
                    {/* Club Logo */}
                    {tenant.logoUrl ? (
                        <div className={styles.logoContainer}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={tenant.logoUrl}
                                alt={`${tenant.name} logo`}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    ) : (
                        <div className={styles.logoPlaceholder}>
                            {tenant.name.charAt(0)}
                        </div>
                    )}

                    {/* Club Name */}
                    <h1 className={styles.clubName}>
                        {tenant.name}
                    </h1>

                    {/* Tagline */}
                    {tenant.tagline && (
                        <p className={styles.tagline}>
                            {tenant.tagline}
                        </p>
                    )}

                    {/* Stats Bar */}
                    <div className={styles.statsBar}>
                        {memberCount > 0 && (
                            <div className={styles.statItem}>
                                <Users size={16} />
                                <span><strong>{memberCount}</strong> member{memberCount !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {totalClassesPerWeek > 0 && (
                            <div className={styles.statItem}>
                                <Calendar size={16} />
                                <span><strong>{totalClassesPerWeek}</strong> class{totalClassesPerWeek !== 1 ? 'es' : ''}/week</span>
                            </div>
                        )}
                        {locations.length > 0 && (
                            <div className={styles.statItem}>
                                <MapPin size={16} />
                                <span><strong>{locations.length}</strong> location{locations.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* CTA Buttons */}
                    <div className={styles.ctaGroup}>
                        <Link href="/register" className={styles.ctaPrimary}>
                            Join {tenant.name}
                            <ChevronRight size={20} />
                        </Link>

                        <Link href="/login" className={styles.ctaSecondary}>
                            Already a member? Log in
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============== FEATURE HIGHLIGHTS ============== */}
            <section className={styles.featuresSection}>
                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Target size={22} />
                        </div>
                        <h3 className={styles.featureTitle}>Track Progress</h3>
                        <p className={styles.featureDesc}>Monitor your training journey with belt tracking and attendance records</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Calendar size={22} />
                        </div>
                        <h3 className={styles.featureTitle}>Easy Check-in</h3>
                        <p className={styles.featureDesc}>Digital class check-in — no paper sign-in sheets needed</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Trophy size={22} />
                        </div>
                        <h3 className={styles.featureTitle}>Grading System</h3>
                        <p className={styles.featureDesc}>See your grading history and upcoming belt promotions at a glance</p>
                    </div>
                </div>
            </section>

            {/* ============== PROGRAMS / CLASS TYPES ============== */}
            {uniqueClassNames.length > 0 && (
                <section className={styles.programsSection}>
                    <h2 className={styles.sectionTitle}>
                        <Star size={22} className={styles.sectionIcon} />
                        Our Programs
                    </h2>
                    <div className={styles.programsGrid}>
                        {uniqueClassNames.map((name, idx) => {
                            const icons = [Award, Zap, Target, Trophy, Heart, Star];
                            const Icon = icons[idx % icons.length];
                            const classCount = classes.filter(c => c.name === name).length;
                            return (
                                <div key={name} className={styles.programCard}>
                                    <div className={styles.programIcon}>
                                        <Icon size={24} />
                                    </div>
                                    <div className={styles.programInfo}>
                                        <h3 className={styles.programName}>{name}</h3>
                                        <p className={styles.programMeta}>{classCount} session{classCount !== 1 ? 's' : ''}/week</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ============== CLASS SCHEDULE ============== */}
            {classes.length > 0 && (
                <section className={styles.scheduleSection}>
                    <h2 className={styles.sectionTitle}>
                        <Calendar size={22} className={styles.sectionIcon} />
                        Weekly Schedule
                    </h2>

                    <div className={styles.scheduleList}>
                        {Object.entries(classesByDay)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([day, dayClasses]) => (
                                <div key={day} className={styles.dayCard}>
                                    <div className={styles.dayHeader}>
                                        <span className={styles.dayName}>{DAY_NAMES[Number(day)]}</span>
                                        <span className={styles.dayCount}>{dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''}</span>
                                    </div>
                                    {dayClasses.map((cls, idx) => (
                                        <div
                                            key={cls.id}
                                            className={idx < dayClasses.length - 1 ? styles.classRowBorder : styles.classRow}
                                        >
                                            <div>
                                                <div className={styles.className}>{cls.name}</div>
                                                {locationMap[cls.locationId] && (
                                                    <div className={styles.classLocation}>
                                                        <MapPin size={11} />
                                                        {locationMap[cls.locationId].name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.classTime}>
                                                <Clock size={13} />
                                                {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                    </div>
                </section>
            )}

            {/* ============== LOCATIONS ============== */}
            {locations.length > 0 && (
                <section className={styles.locationsSection}>
                    <h2 className={styles.sectionTitle}>
                        <MapPin size={22} className={styles.sectionIcon} />
                        {locations.length === 1 ? 'Our Location' : 'Our Locations'}
                    </h2>

                    <div className={locations.length === 1 ? styles.locationGridSingle : styles.locationGridMulti}>
                        {locations.map(loc => (
                            <div key={loc.id} className={styles.locationCard}>
                                <div className={styles.locationIconWrap}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div className={styles.locationName}>{loc.name}</div>
                                    <div className={styles.locationAddress}>
                                        {loc.address && <div>{loc.address}</div>}
                                        {(loc.city || loc.postcode) && (
                                            <div>{[loc.city, loc.postcode].filter(Boolean).join(', ')}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ============== BOTTOM CTA / CONTACT ============== */}
            <section className={styles.bottomCta}>
                <div className={styles.bottomCtaInner}>
                    <h2 className={styles.bottomCtaTitle}>Ready to start your journey?</h2>
                    <p className={styles.bottomCtaSubtitle}>
                        Join {tenant.name} today and become part of our community.
                    </p>
                    <Link href="/register" className={styles.ctaPrimary} style={{ maxWidth: '320px' }}>
                        Join Now
                        <ChevronRight size={20} />
                    </Link>

                    {/* Contact Info */}
                    {(tenant.contactEmail || tenant.contactPhone) && (
                        <div className={styles.contactLinks}>
                            {tenant.contactEmail && (
                                <a href={`mailto:${tenant.contactEmail}`} className={styles.contactLink}>
                                    <Mail size={16} />
                                    {tenant.contactEmail}
                                </a>
                            )}
                            {tenant.contactPhone && (
                                <a href={`tel:${tenant.contactPhone}`} className={styles.contactLink}>
                                    <Phone size={16} />
                                    {tenant.contactPhone}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ============== FOOTER ============== */}
            <footer className={styles.footer}>
                <a
                    href="https://clubforgehq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footerLink}
                >
                    Powered by{' '}
                    <span className={styles.footerBrand}>ClubForge</span>
                </a>
            </footer>
        </div>
    );
}
