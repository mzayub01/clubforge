import Link from 'next/link';
import {
    Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight,
    Shield, Swords, MapPin, Zap, MessageSquare, Palette,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema } from '@/components/structured-data';
import CityFAQ from '@/components/CityFAQ';

export const metadata = {
    title: 'Martial Arts Gym Management Software Birmingham | ClubForge',
    description: 'ClubForge is an all-in-one management system for martial arts gyms in Birmingham. Whether you run a BJJ academy, MMA gym, karate dojo or judo club — manage memberships, payments, attendance, belt progression and more from one platform.',
    alternates: { canonical: 'https://clubforgehq.com/gym-management-birmingham' },
    openGraph: {
        title: 'Martial Arts Gym Management Software Birmingham | ClubForge',
        description: 'The all-in-one management system for martial arts gyms in Birmingham. Memberships, payments, attendance, belt progression — one platform.',
        url: 'https://clubforgehq.com/gym-management-birmingham',
    },
    keywords: [
        'gym management software Birmingham',
        'martial arts gym software Birmingham',
        'martial arts club management Birmingham',
        'BJJ academy software Birmingham',
        'MMA gym management Birmingham',
        'karate dojo software Birmingham',
        'judo club management Birmingham',
        'gym membership software Birmingham',
        'gym billing software Birmingham',
        'club management platform Birmingham',
    ],
};

export default async function BirminghamPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Birmingham', url: 'https://clubforgehq.com/gym-management-birmingham' },
            ]} />

            <main>
                {/* Responsive overrides */}
                <style>{`
                    @media (max-width: 768px) {
                        .cf-bham-manage-grid { grid-template-columns: 1fr !important; }
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
                        top: '-200px', left: '-100px', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
                        bottom: '-100px', right: '-80px', pointerEvents: 'none',
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
                                Helping Birmingham gyms scale
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                            fontWeight: '800', lineHeight: '1.1', marginBottom: '20px',
                            color: '#FFFFFF',
                        }}>
                            Martial Arts Software for{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Birmingham Gyms</span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            ClubForge is a powerful platform for martial arts gyms in Birmingham.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px', maxWidth: '620px', lineHeight: '1.7' }}>
                            Run your academy more efficiently — built specifically for martial arts clubs, helping Birmingham gyms scale without admin overload.
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
                                <Palette size={15} color="#C5A456" /> Your branding
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Zap size={15} color="#C5A456" /> Set up in minutes
                            </span>
                        </div>
                    </div>
                </section>

                {/* ==================== WHAT YOU CAN MANAGE ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            All-in-one platform
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '48px', lineHeight: '1.2',
                        }}>
                            ClubForge helps you manage
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { icon: CreditCard, text: 'Automated membership payments' },
                                { icon: CheckCircle2, text: 'One-click check-ins' },
                                { icon: Award, text: 'Attendance tracking and reporting' },
                                { icon: Award, text: 'Belt progression and grading history' },
                                { icon: Calendar, text: 'Events and member communication' },
                            ].map((item) => (
                                <div key={item.text} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '20px 24px', borderRadius: '14px',
                                    background: '#FAFBFC', border: '1px solid #F1F5F9',
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: 'rgba(197,164,86,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <item.icon size={20} color="#C5A456" />
                                    </div>
                                    <p style={{ color: '#0F172A', fontWeight: '600', fontSize: '1rem', margin: 0 }}>{item.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* White-label callout */}
                        <div style={{
                            marginTop: '32px', padding: '24px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(197,164,86,0.06) 0%, rgba(197,164,86,0.02) 100%)',
                            border: '1px solid rgba(197,164,86,0.15)',
                            display: 'flex', alignItems: 'center', gap: '16px',
                        }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'rgba(197,164,86,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Palette size={22} color="#C5A456" />
                            </div>
                            <div>
                                <p style={{ color: '#0F172A', fontWeight: '700', fontSize: '0.95rem', margin: '0 0 4px' }}>
                                    Everything runs under your club&apos;s branding
                                </p>
                                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0, lineHeight: '1.6' }}>
                                    Your logo, your colours, your domain. Members see your brand — not ours.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== STREAMLINE CALLOUT ==================== */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)',
                    padding: '80px 24px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(197,164,86,0.04) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                        }}>
                            Built for Birmingham
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#FFFFFF', marginBottom: '20px', lineHeight: '1.2',
                        }}>
                            Streamline operations. Reduce admin time.
                        </h2>
                        <p style={{
                            fontSize: '1.05rem', color: '#94A3B8', lineHeight: '1.7',
                            maxWidth: '600px', margin: '0 auto',
                        }}>
                            Perfect for growing academies in Birmingham looking to streamline operations and reduce admin time. Stop juggling tools — start running your club professionally.
                        </p>
                    </div>
                </section>

                <CityFAQ city="Birmingham" />

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
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Birmingham</span>
                        </div>
                        <h2 style={{
                            color: '#0F172A',
                            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                            fontWeight: '800', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Ready to simplify your gym operations?
                        </h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.7' }}>
                            14-day free trial. No card required. Full platform access from day one.
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
                                { href: '/bjj-gym-software-manchester', label: 'Manchester' },
                                { href: '/martial-arts-software-leeds', label: 'Leeds' },
                                { href: '/bjj-gym-software-liverpool', label: 'Liverpool' },
                                { href: '/martial-arts-software-nottingham', label: 'Nottingham' },
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
