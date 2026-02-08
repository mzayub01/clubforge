'use client';

// ===============================================
// ClubForge - Tenant Welcome Page
// Premium light-theme branded landing page for a club's subdomain
// Shows club branding, "Join" + "Log in" CTAs, and public class schedule
// ===============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar, MapPin, Clock, Users, ChevronRight,
    Shield, Loader2, ExternalLink, Mail, Phone
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

    // Apply club's primary color as CSS custom property
    const pageStyle = {
        '--club-color': primaryColor,
        '--club-glow': `${primaryColor}40`,
        '--club-glow-pale': `${primaryColor}18`,
    } as React.CSSProperties;

    return (
        <div className={styles.page} style={pageStyle}>

            {/* ============== HERO SECTION ============== */}
            <section className={styles.hero}>
                {/* Background decorations */}
                <div className={styles.heroBgGlow} />
                <div className={styles.heroAccentTopRight} />
                <div className={styles.heroAccentBottomLeft} />
                <div className={styles.heroDecorLine} />

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

                {/* Social proof - member count */}
                {memberCount > 0 && (
                    <div className={styles.memberBadge}>
                        <Users size={16} />
                        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                    </div>
                )}

                {/* CTA Buttons */}
                <div className={styles.ctaGroup} style={{ marginTop: memberCount > 0 ? '0' : '2rem' }}>
                    <Link href="/register" className={styles.ctaPrimary}>
                        Join {tenant.name}
                        <ChevronRight size={20} />
                    </Link>

                    <Link href="/login" className={styles.ctaSecondary}>
                        Already a member? Log in
                    </Link>
                </div>
            </section>

            {/* ============== CLASS SCHEDULE ============== */}
            {classes.length > 0 && (
                <section className={styles.scheduleSection}>
                    <h2 className={styles.sectionTitle}>
                        <Calendar size={22} className={styles.sectionIcon} />
                        Class Schedule
                    </h2>

                    <div className={styles.scheduleList}>
                        {Object.entries(classesByDay)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([day, dayClasses]) => (
                                <div key={day} className={styles.dayCard}>
                                    <div className={styles.dayHeader}>
                                        {DAY_NAMES[Number(day)]}
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
                                <div className={styles.locationName}>{loc.name}</div>
                                <div className={styles.locationAddress}>
                                    {loc.address && <div>{loc.address}</div>}
                                    {(loc.city || loc.postcode) && (
                                        <div>{[loc.city, loc.postcode].filter(Boolean).join(', ')}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ============== CONTACT ============== */}
            {(tenant.contactEmail || tenant.contactPhone) && (
                <section className={styles.contactSection}>
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
                </section>
            )}

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
