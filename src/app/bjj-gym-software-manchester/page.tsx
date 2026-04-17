import Link from 'next/link';
import {
    Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight,
    BarChart3, Shield, Swords, MapPin, Zap, Ticket,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema } from '@/components/structured-data';

export const metadata = {
    title: 'BJJ & Martial Arts Gym Software Manchester | ClubForge',
    description: 'ClubForge is a martial arts club management platform used by academies across Manchester and the UK. Built for BJJ, MMA, Karate and combat sports gyms — manage memberships, automate payments, track attendance and run your operations from one system.',
    alternates: { canonical: 'https://clubforgehq.com/bjj-gym-software-manchester' },
    openGraph: {
        title: 'BJJ & Martial Arts Gym Software Manchester | ClubForge',
        description: 'The all-in-one management platform for martial arts academies in Manchester. Memberships, payments, attendance, belt progression — one system.',
        url: 'https://clubforgehq.com/bjj-gym-software-manchester',
    },
    keywords: [
        'BJJ gym software Manchester',
        'martial arts gym software Manchester',
        'martial arts club management Manchester',
        'gym management software Manchester',
        'MMA gym software Manchester',
        'combat sports software Manchester',
        'BJJ academy management Manchester',
        'martial arts membership software Manchester',
        'gym billing software Manchester',
        'club management system Manchester',
    ],
};

export default async function ManchesterPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Manchester', url: 'https://clubforgehq.com/bjj-gym-software-manchester' },
            ]} />

            <main>
                {/* Responsive overrides */}
                <style>{`
                    @media (max-width: 768px) {
                        .cf-mcr-features-grid { grid-template-columns: 1fr !important; }
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
                        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)',
                        top: '-200px', right: '-100px', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
                        bottom: '-150px', left: '-80px', pointerEvents: 'none',
                    }} />
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
                                Used by gyms across Manchester
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                            fontWeight: '800', lineHeight: '1.1', marginBottom: '20px',
                            color: '#FFFFFF',
                        }}>
                            BJJ & Martial Arts Club Management Software in{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>Manchester</span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            ClubForge is a martial arts club management platform used by academies across Manchester and the UK.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.7' }}>
                            Built for BJJ, MMA, Karate and combat sports gyms, it helps clubs manage memberships, automate payments, track attendance and run their operations from one system.
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

                {/* ==================== WHAT YOU GET ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            Replace the juggle
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Instead of spreadsheets, WhatsApp groups and multiple tools
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#64748B', textAlign: 'center',
                            marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: '1.7',
                        }}>
                            ClubForge gives you everything in one platform:
                        </p>

                        <div className="cf-mcr-features-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px',
                        }}>
                            {[
                                { icon: CreditCard, title: 'Automated Payments', desc: 'Automated payments and subscriptions via Stripe — no more chasing invoices' },
                                { icon: CheckCircle2, title: 'One-click Check-ins', desc: 'One-click class check-ins from any device with attendance records' },
                                { icon: BarChart3, title: 'Attendance Reporting', desc: 'Attendance tracking and reporting with retention insights' },
                                { icon: Award, title: 'Belt Progression', desc: 'Belt progression with full grading history and coach feedback' },
                                { icon: Users, title: 'Family Accounts', desc: 'Family accounts for kids classes — one login, multiple children' },
                                { icon: Calendar, title: 'Live Schedules', desc: 'Live class schedules, events, and capacity management' },
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

                {/* ==================== WHY CLUBFORGE ==================== */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)',
                    padding: '80px 24px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(197,164,86,0.04) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                        }}>
                            Purpose-built
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#FFFFFF', marginBottom: '20px', lineHeight: '1.2',
                        }}>
                            Designed specifically for martial arts academies
                        </h2>
                        <p style={{
                            fontSize: '1.05rem', color: '#94A3B8', lineHeight: '1.7',
                            marginBottom: '0', maxWidth: '600px', margin: '0 auto',
                        }}>
                            ClubForge helps Manchester-based gyms reduce admin, improve retention, and deliver a more professional experience — without the workarounds of generic gym software.
                        </p>
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
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Manchester</span>
                        </div>
                        <h2 style={{
                            color: '#0F172A',
                            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                            fontWeight: '800', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Ready to professionalise your Manchester gym?
                        </h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.7' }}>
                            14-day free trial. No card required. Set up in under 10 minutes.
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
                                { href: '/martial-arts-software-london', label: 'London' },
                                { href: '/gym-management-birmingham', label: 'Birmingham' },
                                { href: '/martial-arts-software-leeds', label: 'Leeds' },
                                { href: '/bjj-gym-software-liverpool', label: 'Liverpool' },
                                { href: '/martial-arts-software-newcastle', label: 'Newcastle' },
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
