import Link from 'next/link';
import { Building2, ArrowRight, BarChart3, Users, Settings, Shield, Globe, Layers } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';
import RelatedDisciplines from '@/components/RelatedDisciplines';
import RelatedFeatures from '@/components/RelatedFeatures';

export const metadata = {
    title: 'Multi-Location Gym Management Software | ClubForge',
    description: 'Manage multiple gym locations from one dashboard. Cross-site memberships, unified reporting, location-specific settings, and tenant isolation. Scale your club to 2, 5, or 50 venues without complexity. Start free trial.',
    alternates: { canonical: 'https://clubforgehq.com/features/multi-location' },
    openGraph: {
        title: 'Multi-Location Gym Management Software — ClubForge',
        description: 'One dashboard, many venues. Unified reporting and cross-site memberships.',
        url: 'https://clubforgehq.com/features/multi-location',
    },
    keywords: [
        'multi-location gym software', 'multi-site club management', 'gym franchise software',
        'multi-venue gym management', 'gym chain management software',
        'multi-location martial arts software', 'franchise gym management',
        'manage multiple gym locations', 'multi-site fitness software',
    ],
};

const faqs = [
    { question: 'How many locations can I manage?', answer: 'It depends on your plan. Starter supports 1 location, Pro supports up to 3, and Elite offers unlimited locations. Each location gets its own settings, classes, and staff assignments, all managed from one unified dashboard.' },
    { question: 'Can members train at multiple locations?', answer: 'Yes. Members with cross-site access can book into classes at any of your locations. Their profile, attendance history, and belt progression travels with them — one member, many venues.' },
    { question: 'Do I get separate reporting per location?', answer: 'Yes. View reports for individual locations or aggregate them across all sites. Revenue, attendance, membership growth, and retention — filtered by location or viewed as a whole operation.' },
    { question: 'Can different locations have different class schedules?', answer: 'Absolutely. Each location has its own timetable, instructor assignments, and class offerings. A downtown studio can run lunchtime classes while your suburban location focuses on evening and weekend sessions.' },
];

export default async function MultiLocationPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Features', url: 'https://clubforgehq.com/features' },
                { name: 'Multi-Location', url: 'https://clubforgehq.com/features/multi-location' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: '#FAFBFC', padding: '140px 24px 80px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C5A456', fontSize: '14px', fontWeight: '600', textDecoration: 'none', marginBottom: '24px' }}>← All Features</Link>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Building2 size={32} color="#F97316" />
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: '800', lineHeight: '1.1', color: '#0F172A', marginBottom: '20px' }}>
                            Multi-Location{' '}
                            <span style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Without the Complexity</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: '1.7', marginBottom: '32px', maxWidth: '650px' }}>
                            One dashboard, many venues. Manage cross-site memberships, unified reporting, and location-specific settings — without juggling separate systems. Scale to 2, 5, or 50 locations without chaos.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid #E2E8F0', color: '#334155', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>

                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>Scale your operation with confidence</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: Layers, title: 'Unified Dashboard', desc: 'See all your locations from one login. Switch between venues or view aggregate data. Revenue, membership counts, attendance, and class schedules — everything in one place.' },
                                { icon: Users, title: 'Cross-Site Memberships', desc: 'Members can train at any of your locations with a single membership. Their profile, belt rank, and attendance history follows them. One member record, multiple venues.' },
                                { icon: BarChart3, title: 'Per-Location & Aggregate Reporting', desc: 'View reports for individual locations or see the full picture across all sites. Compare venue performance, track growth, and identify your strongest and weakest locations.' },
                                { icon: Settings, title: 'Location-Specific Settings', desc: 'Each venue gets its own class schedule, instructors, capacity limits, and operational settings. A city-centre studio runs differently from a suburban academy — and ClubForge supports both.' },
                                { icon: Shield, title: 'Data Isolation & Security', desc: 'Full tenant isolation with row-level security means each location\'s data is strictly separated. Staff see only what they need. Owners see everything. Role-based access at every level.' },
                                { icon: Globe, title: 'Ready When You Are', desc: 'You don\'t need to plan for multi-location from day one. Start with one venue. When you open your second (or third, or tenth), ClubForge is already built for it. No migration, no new tools.' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(249,115,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <item.icon size={24} color="#F97316" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3>
                                        <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.95rem' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ background: '#FAFBFC', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {faqs.map((faq) => (
                                <div key={faq.question} style={{ padding: '24px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #F1F5F9' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>{faq.question}</h3>
                                    <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ background: '#FFFFFF', padding: '60px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <RelatedFeatures currentHref="/features/multi-location" />
                        <RelatedDisciplines currentHref="" maxItems={4} />
                    </div>
                </section>

                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to scale your club?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>Start free with one location. Add more whenever you&apos;re ready.</p>
                        <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
