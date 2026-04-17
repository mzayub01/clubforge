import Link from 'next/link';
import {
    Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight,
    BarChart3, Shield, Swords, MapPin, XCircle, Zap, ClipboardList,
    UserCheck, Video, Ticket, Play,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Martial Arts Club Management Software London | ClubForge',
    description: 'ClubForge is a complete club management system built specifically for BJJ, MMA, Karate, and martial arts academies in London. Manage memberships, payments, attendance, and belt progression — all in one place.',
    alternates: { canonical: 'https://clubforgehq.com/martial-arts-software-london' },
    openGraph: {
        title: 'Martial Arts Club Management Software London | ClubForge',
        description: 'The all-in-one management platform for martial arts academies in London. Memberships, payments, attendance, belt progression — one system.',
        url: 'https://clubforgehq.com/martial-arts-software-london',
    },
    keywords: [
        'martial arts club management software London',
        'BJJ gym software London',
        'martial arts academy software London',
        'gym management software London',
        'club management system London',
        'MMA gym software London',
        'karate dojo management London',
        'martial arts membership software London',
        'gym billing software London',
        'martial arts attendance tracking London',
    ],
};

export default async function LondonPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'London', url: 'https://clubforgehq.com/martial-arts-software-london' },
            ]} />

            <main>
                {/* Responsive overrides */}
                <style>{`
                    @media (max-width: 768px) {
                        .cf-city-features-grid { grid-template-columns: 1fr !important; }
                        .cf-city-pain-grid { grid-template-columns: 1fr !important; }
                        .cf-city-why-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>

                {/* ==================== HERO ==================== */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
                    padding: '140px 24px 80px',
                    color: '#FFFFFF',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Background accents */}
                    <div style={{
                        position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)',
                        top: '-250px', right: '-150px', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
                        bottom: '-200px', left: '-100px', pointerEvents: 'none',
                    }} />
                    {/* Subtle grid */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }} />

                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        {/* Location badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            marginBottom: '24px', background: 'rgba(197,164,86,0.12)',
                            padding: '8px 16px', borderRadius: '100px',
                            border: '1px solid rgba(197,164,86,0.2)',
                        }}>
                            <MapPin size={14} color="#C5A456" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#C5A456', letterSpacing: '0.03em' }}>
                                Serving academies across London
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                            fontWeight: '800', lineHeight: '1.1', marginBottom: '20px',
                            color: '#FFFFFF',
                        }}>
                            Martial Arts Club Management Software in{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>London</span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            Running a martial arts academy in London comes with unique challenges — from managing high member volumes to keeping classes organised across busy schedules.
                        </p>
                        <p style={{ fontSize: '1rem', color: '#64748B', marginBottom: '16px', maxWidth: '650px', lineHeight: '1.7' }}>
                            ClubForge is a complete club management system built specifically for BJJ, MMA, Karate, and martial arts academies in London.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.7' }}>
                            Manage your entire academy from one platform — memberships, payments, attendance, and belt progression — all in one place.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/demo" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                color: '#0F172A', padding: '14px 32px', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
                                boxShadow: '0 4px 24px rgba(197, 164, 86, 0.35)',
                            }}>
                                Book a Demo <ArrowRight size={18} />
                            </Link>
                            <Link href="/get-started" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF',
                                padding: '14px 32px', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: '600', textDecoration: 'none',
                            }}>Start Free Trial</Link>
                        </div>

                        {/* Trust bar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
                            marginTop: '40px', color: '#64748B', fontSize: '13px', fontWeight: '500',
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Shield size={15} color="#C5A456" /> Stripe-secured payments
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Swords size={15} color="#C5A456" /> Built for martial arts
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Zap size={15} color="#C5A456" /> Set up in minutes
                            </span>
                        </div>
                    </div>
                </section>

                {/* ==================== THE PROBLEM ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#EF4444',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            The Problem
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Most martial arts clubs in London are still juggling
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#64748B', textAlign: 'center',
                            marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7',
                        }}>
                            This creates admin overload and leads to missed payments, poor visibility, and member drop-off.
                        </p>

                        <div className="cf-city-pain-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px',
                        }}>
                            {[
                                { icon: ClipboardList, text: 'Spreadsheets for member tracking' },
                                { icon: Users, text: 'WhatsApp groups for communication' },
                                { icon: CreditCard, text: 'Separate tools for payments and scheduling' },
                                { icon: Calendar, text: 'Outdated class timetables' },
                            ].map((item) => (
                                <div key={item.text} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '20px 24px', borderRadius: '14px',
                                    background: '#FEF2F2', border: '1px solid #FECACA',
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <item.icon size={20} color="#EF4444" />
                                    </div>
                                    <p style={{ color: '#991B1B', fontWeight: '600', fontSize: '0.95rem', margin: 0 }}>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== THE SOLUTION ==================== */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#10B981',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            The Solution
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            ClubForge replaces all of that with{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>one system</span>
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#64748B', textAlign: 'center',
                            marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7',
                        }}>
                            Designed for martial arts academies. With ClubForge, London-based clubs can:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { icon: CreditCard, text: 'Automate membership payments' },
                                { icon: CheckCircle2, text: 'Track attendance with one-click check-ins' },
                                { icon: Award, text: 'Manage belt and rank progression' },
                                { icon: Calendar, text: 'Run classes with live schedules' },
                                { icon: Users, text: 'Communicate with members easily' },
                            ].map((item) => (
                                <div key={item.text} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '18px 24px', borderRadius: '14px',
                                    background: '#FFFFFF', border: '1px solid #E2E8F0',
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <item.icon size={20} color="#10B981" />
                                    </div>
                                    <p style={{ color: '#0F172A', fontWeight: '600', fontSize: '0.95rem', margin: 0 }}>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== FEATURES (SEO-RICH) ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            Features
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '48px', lineHeight: '1.2',
                        }}>
                            Built for martial arts academies in London
                        </h2>

                        <div className="cf-city-features-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '20px',
                        }}>
                            {[
                                { icon: CreditCard, title: 'Automated Billing', desc: 'Automated membership billing and payment tracking via Stripe' },
                                { icon: CheckCircle2, title: 'Mobile Check-ins', desc: 'One-click mobile check-ins with attendance tracking and reporting' },
                                { icon: Award, title: 'Belt Progression', desc: 'Built-in belt and rank progression systems with full grading history' },
                                { icon: Users, title: 'Family Accounts', desc: 'Family accounts for kids classes — parents manage everything from one login' },
                                { icon: Calendar, title: 'Live Scheduling', desc: 'Live class scheduling with real-time updates and capacity management' },
                                { icon: Ticket, title: 'Events Management', desc: 'Events management for gradings, seminars, and competitions' },
                                { icon: Video, title: 'Training Content', desc: 'Member portal with training videos and exclusive content for your students' },
                                { icon: BarChart3, title: 'Analytics', desc: 'Attendance analytics, retention reports, and revenue dashboards' },
                            ].map((item) => (
                                <div key={item.title} style={{
                                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                                    padding: '24px', borderRadius: '16px',
                                    border: '1px solid #F1F5F9', background: '#FAFBFC',
                                }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: 'rgba(197,164,86,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <item.icon size={22} color="#C5A456" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>{item.title}</h3>
                                        <p style={{ color: '#64748B', margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== WHY NOT GENERIC GYM SOFTWARE ==================== */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)',
                    padding: '80px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(197,164,86,0.04) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            Why ClubForge?
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#FFFFFF', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Why not generic gym software?
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#94A3B8', textAlign: 'center',
                            marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: '1.7',
                        }}>
                            Most gym management software is built for general fitness businesses.
                            ClubForge is designed specifically for martial arts academies. That means:
                        </p>

                        <div className="cf-city-why-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '20px',
                        }}>
                            {[
                                { icon: XCircle, title: 'No workarounds for belt tracking', desc: 'Purpose-built belt and rank progression — not a hacked-together field in a generic CRM.' },
                                { icon: Zap, title: 'No disconnected systems', desc: 'Payments, scheduling, attendance, progression — all in one integrated platform.' },
                                { icon: Shield, title: 'No unnecessary complexity', desc: 'Just a platform that fits how your martial arts club actually runs.' },
                            ].map((item) => (
                                <div key={item.title} style={{
                                    padding: '28px 24px', borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    textAlign: 'center',
                                }}>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '14px',
                                        background: 'rgba(197,164,86,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 16px',
                                    }}>
                                        <item.icon size={24} color="#C5A456" />
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>{item.title}</h3>
                                    <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== CTA ==================== */}
                <section style={{
                    background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)',
                    padding: '80px 24px',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            marginBottom: '20px', background: 'rgba(15,23,42,0.1)',
                            padding: '8px 16px', borderRadius: '100px',
                        }}>
                            <MapPin size={14} color="#0F172A" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>London</span>
                        </div>
                        <h2 style={{
                            color: '#0F172A',
                            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                            fontWeight: '800', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Run a martial arts academy in London?
                        </h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.7' }}>
                            Simplify your operations with one platform built for how your club actually works. 14-day free trial included.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/demo" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: '#0F172A', color: '#FFFFFF',
                                padding: '14px 32px', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
                            }}>
                                Book a Demo <ArrowRight size={18} />
                            </Link>
                            <Link href="/get-started" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'transparent', color: '#0F172A',
                                border: '2px solid rgba(15,23,42,0.3)',
                                padding: '14px 32px', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: '600', textDecoration: 'none',
                            }}>
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Internal linking */}
                <section style={{ background: '#FAFBFC', padding: '48px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{
                        maxWidth: '800px', margin: '0 auto', textAlign: 'center',
                        display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center',
                    }}>
                        <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500', margin: 0 }}>
                            Also available in other cities
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {[
                                { href: '/bjj-gym-software-manchester', label: 'Manchester' },
                                { href: '/gym-management-birmingham', label: 'Birmingham' },
                                { href: '/martial-arts-software-leeds', label: 'Leeds' },
                                { href: '/bjj-gym-software-liverpool', label: 'Liverpool' },
                                { href: '/martial-arts-software-bristol', label: 'Bristol' },
                            ].map((city, i) => (
                                <span key={city.href}>{i > 0 && <span style={{ color: '#E2E8F0', marginRight: '16px' }}>·</span>}<Link href={city.href} style={{ fontSize: '14px', color: '#C5A456', fontWeight: '600', textDecoration: 'none' }}>{city.label}</Link></span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                            <Link href="/" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Home</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/features" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Features</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/pricing" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Pricing</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/demo" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
