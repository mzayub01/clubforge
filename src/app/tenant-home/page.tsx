'use client';

// ===============================================
// ClubForge - Tenant Welcome Page
// The branded landing page for a club's subdomain
// Shows club branding, "Join" + "Log in" CTAs, and public class schedule
// ===============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Calendar, MapPin, Clock, Users, ChevronRight,
    Shield, Loader2, ExternalLink, Mail, Phone
} from 'lucide-react';

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
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-primary, #0a0a0a)',
            }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#c5a456' }} />
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-primary, #0a0a0a)',
                color: '#fff',
                padding: '2rem',
                textAlign: 'center',
            }}>
                <Shield size={48} style={{ color: '#c5a456', marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Club Not Found</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                    This club doesn&apos;t exist or is no longer active.
                </p>
                <a
                    href="https://clubforgehq.com"
                    style={{
                        marginTop: '1.5rem',
                        color: '#c5a456',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    Visit ClubForge <ExternalLink size={14} />
                </a>
            </div>
        );
    }

    const primaryColor = tenant.primaryColor || '#c5a456';

    // Group classes by day
    const classesByDay: Record<number, ClassInfo[]> = {};
    classes.forEach(c => {
        if (!classesByDay[c.dayOfWeek]) classesByDay[c.dayOfWeek] = [];
        classesByDay[c.dayOfWeek].push(c);
    });

    // Location lookup
    const locationMap: Record<string, LocationInfo> = {};
    locations.forEach(l => { locationMap[l.id] = l; });

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
        }}>
            {/* ============== HERO SECTION ============== */}
            <section style={{
                minHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background accent */}
                <div style={{
                    position: 'absolute',
                    top: '-30%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${primaryColor}15 0%, transparent 70%)`,
                    pointerEvents: 'none',
                }} />

                {/* Club Logo */}
                {tenant.logoUrl ? (
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        marginBottom: '1.5rem',
                        border: `2px solid ${primaryColor}40`,
                        boxShadow: `0 0 40px ${primaryColor}20`,
                        position: 'relative',
                    }}>
                        <Image
                            src={tenant.logoUrl}
                            alt={`${tenant.name} logo`}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                ) : (
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '24px',
                        marginBottom: '1.5rem',
                        background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
                        border: `2px solid ${primaryColor}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: 700,
                        color: primaryColor,
                    }}>
                        {tenant.name.charAt(0)}
                    </div>
                )}

                {/* Club Name */}
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: 800,
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                }}>
                    {tenant.name}
                </h1>

                {/* Tagline */}
                {tenant.tagline && (
                    <p style={{
                        fontSize: '1.15rem',
                        color: 'rgba(255,255,255,0.6)',
                        maxWidth: '500px',
                        lineHeight: 1.6,
                        marginBottom: '0.5rem',
                    }}>
                        {tenant.tagline}
                    </p>
                )}

                {/* Social proof */}
                {memberCount > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.9rem',
                        marginBottom: '2rem',
                        marginTop: '0.5rem',
                    }}>
                        <Users size={16} />
                        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                    </div>
                )}

                {/* CTAs */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '100%',
                    maxWidth: '360px',
                    marginTop: memberCount > 0 ? '0' : '2rem',
                    position: 'relative',
                }}>
                    <Link
                        href="/register"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                            color: '#000',
                            borderRadius: '14px',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: `0 4px 20px ${primaryColor}40`,
                        }}
                    >
                        Join {tenant.name}
                        <ChevronRight size={20} />
                    </Link>

                    <Link
                        href="/login"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 2rem',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: 500,
                            textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Already a member? Log in
                    </Link>
                </div>
            </section>

            {/* ============== CLASS SCHEDULE ============== */}
            {classes.length > 0 && (
                <section style={{
                    padding: '3rem 1.5rem',
                    maxWidth: '700px',
                    margin: '0 auto',
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontFamily: 'var(--font-heading)',
                    }}>
                        <Calendar size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: primaryColor }} />
                        Class Schedule
                    </h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}>
                        {Object.entries(classesByDay)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([day, dayClasses]) => (
                                <div key={day} style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}>
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        background: `${primaryColor}12`,
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        color: primaryColor,
                                    }}>
                                        {DAY_NAMES[Number(day)]}
                                    </div>
                                    {dayClasses.map((cls, idx) => (
                                        <div key={cls.id} style={{
                                            padding: '0.75rem 1rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: idx < dayClasses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{cls.name}</div>
                                                {locationMap[cls.locationId] && (
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        color: 'rgba(255,255,255,0.45)',
                                                        marginTop: '2px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                    }}>
                                                        <MapPin size={11} />
                                                        {locationMap[cls.locationId].name}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                fontSize: '0.85rem',
                                                color: 'rgba(255,255,255,0.6)',
                                                whiteSpace: 'nowrap',
                                            }}>
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
                <section style={{
                    padding: '2rem 1.5rem 3rem',
                    maxWidth: '700px',
                    margin: '0 auto',
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontFamily: 'var(--font-heading)',
                    }}>
                        <MapPin size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: primaryColor }} />
                        {locations.length === 1 ? 'Our Location' : 'Our Locations'}
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: locations.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem',
                    }}>
                        {locations.map(loc => (
                            <div key={loc.id} style={{
                                background: 'rgba(255,255,255,0.04)',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{loc.name}</div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: 'rgba(255,255,255,0.5)',
                                    lineHeight: 1.6,
                                }}>
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
                <section style={{
                    padding: '2rem 1.5rem',
                    maxWidth: '700px',
                    margin: '0 auto',
                    textAlign: 'center',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                    }}>
                        {tenant.contactEmail && (
                            <a
                                href={`mailto:${tenant.contactEmail}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'rgba(255,255,255,0.6)',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s',
                                }}
                            >
                                <Mail size={16} />
                                {tenant.contactEmail}
                            </a>
                        )}
                        {tenant.contactPhone && (
                            <a
                                href={`tel:${tenant.contactPhone}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'rgba(255,255,255,0.6)',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s',
                                }}
                            >
                                <Phone size={16} />
                                {tenant.contactPhone}
                            </a>
                        )}
                    </div>
                </section>
            )}

            {/* ============== FOOTER ============== */}
            <footer style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                marginTop: '2rem',
            }}>
                <a
                    href="https://clubforgehq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255,255,255,0.3)',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        transition: 'color 0.2s',
                    }}
                >
                    Powered by <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>ClubForge</span>
                </a>
            </footer>

            {/* Spin animation for loader */}
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
