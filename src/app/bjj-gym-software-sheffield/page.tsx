import Link from 'next/link';
import {
    Award, Users, CheckCircle2, CreditCard, ArrowRight,
    Shield, MapPin, Zap, Swords, TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema } from '@/components/structured-data';

export const metadata = {
    title: 'BJJ Gym Management Software Sheffield | ClubForge',
    description: 'ClubForge is a complete system for BJJ and martial arts academies in Sheffield. One-click check-ins, attendance tracking, belt progression, automated payments and member portals — all in one platform.',
    alternates: { canonical: 'https://clubforgehq.com/bjj-gym-software-sheffield' },
    openGraph: {
        title: 'BJJ Gym Management Software Sheffield | ClubForge',
        description: 'Complete management system for BJJ and martial arts academies in Sheffield.',
        url: 'https://clubforgehq.com/bjj-gym-software-sheffield',
    },
    keywords: [
        'BJJ gym management software Sheffield',
        'martial arts software Sheffield',
        'martial arts club management Sheffield',
        'gym management software Sheffield',
        'MMA gym software Sheffield',
        'martial arts membership software Sheffield',
        'gym billing software Sheffield',
        'martial arts attendance Sheffield',
        'club management system Sheffield',
        'BJJ academy software Sheffield',
    ],
};

export default async function SheffieldPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Sheffield', url: 'https://clubforgehq.com/bjj-gym-software-sheffield' },
            ]} />

            <main>
                <style>{`
                    @media (max-width: 768px) {
                        .cf-shef-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>

                {/* ==================== HERO ==================== */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
                    padding: '140px 24px 80px', color: '#FFFFFF',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)', top: '-200px', left: '-100px', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)', bottom: '-100px', right: '-80px', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'rgba(197,164,86,0.12)', padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(197,164,86,0.2)' }}>
                            <MapPin size={14} color="#C5A456" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#C5A456', letterSpacing: '0.03em' }}>Helping Sheffield academies grow</span>
                        </div>

                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', color: '#FFFFFF' }}>
                            BJJ & Martial Arts Software in{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sheffield</span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            ClubForge is a complete system for BJJ and martial arts academies in Sheffield.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.7' }}>
                            Designed around how clubs actually run, not how generic gym software thinks they should.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 24px rgba(197, 164, 86, 0.35)' }}>Book a Demo <ArrowRight size={18} /></Link>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Start Free Trial</Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginTop: '40px', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={15} color="#C5A456" /> Stripe-secured</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Swords size={15} color="#C5A456" /> Martial arts first</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={15} color="#C5A456" /> Quick setup</span>
                        </div>
                    </div>
                </section>

                {/* ==================== FEATURES ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px', lineHeight: '1.2' }}>
                            Designed around how clubs actually run
                        </h2>

                        <div className="cf-shef-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            {[
                                { icon: CheckCircle2, title: 'One-click Check-ins', desc: 'Members check in from their phone — you see who showed up instantly' },
                                { icon: TrendingUp, title: 'Attendance Tracking', desc: 'Track attendance trends and identify members at risk of dropping off' },
                                { icon: Award, title: 'Belt Progression', desc: 'Full belt and rank system with grading history and coach notes' },
                                { icon: CreditCard, title: 'Automated Payments', desc: 'Stripe-powered subscriptions — stop chasing monthly payments' },
                                { icon: Users, title: 'Member Portals', desc: 'Members see their rank, schedule, and attendance from their own dashboard' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '24px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(197,164,86,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

                {/* ==================== CALLOUT ==================== */}
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)', padding: '64px 24px' }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: '800', color: '#FFFFFF', marginBottom: '16px', lineHeight: '1.3' }}>
                            Helping Sheffield academies save time and improve retention.
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#94A3B8', lineHeight: '1.7' }}>Less admin. More coaching. Better member experience.</p>
                    </div>
                </section>

                {/* ==================== CTA ==================== */}
                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'rgba(15,23,42,0.1)', padding: '8px 16px', borderRadius: '100px' }}>
                            <MapPin size={14} color="#0F172A" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Sheffield</span>
                        </div>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>Ready to level up your Sheffield academy?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. No card required.</p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Book a Demo <ArrowRight size={18} /></Link>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#0F172A', border: '2px solid rgba(15,23,42,0.3)', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Start Free Trial</Link>
                        </div>
                    </div>
                </section>

                {/* Internal linking */}
                <section style={{ background: '#FAFBFC', padding: '48px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                        <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500', margin: 0 }}>Also available in other cities</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {[
                                { href: '/martial-arts-software-london', label: 'London' },
                                { href: '/martial-arts-software-leeds', label: 'Leeds' },
                                { href: '/bjj-gym-software-manchester', label: 'Manchester' },
                                { href: '/martial-arts-software-nottingham', label: 'Nottingham' },
                                { href: '/gym-management-birmingham', label: 'Birmingham' },
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
