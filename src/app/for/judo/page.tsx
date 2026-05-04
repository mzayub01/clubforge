import Link from 'next/link';
import { Users, Calendar, CheckCircle2, CreditCard, ArrowRight, BarChart3, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';
import RelatedDisciplines from '@/components/RelatedDisciplines';
import RelatedFeatures from '@/components/RelatedFeatures';

export const metadata = {
    title: 'Judo Club Management Software — Belt Grading, Scheduling & Payments | ClubForge',
    description: 'Management software for judo clubs and dojos. Track kyu/dan belt gradings, schedule randori and ne-waza classes, automate membership payments, and manage attendance. Free 14-day trial.',
    alternates: { canonical: 'https://clubforgehq.com/for/judo' },
    openGraph: {
        title: 'Judo Club Management Software — ClubForge',
        description: 'Track kyu/dan gradings, schedule classes, automate payments, and manage your judo club.',
        url: 'https://clubforgehq.com/for/judo',
    },
    keywords: ['judo club software', 'judo club management software', 'judo grading software', 'judo belt tracking', 'judo class scheduling', 'judo software UK', 'judo membership software', 'judo dojo management'],
};

const faqs = [
    { question: 'Does ClubForge support the judo kyu/dan grading system?', answer: 'Yes. Define your full kyu-to-dan structure — from 6th kyu (white/red belt) through to shodan and beyond. Each grading is logged with examiner name, date, and feedback. Students see their complete grading history in their portal.' },
    { question: 'Can I manage junior and senior judo sections separately?', answer: 'Yes. Create separate class types and membership tiers for juniors (mon grades), cadets, juniors, and seniors. Family accounts let parents manage children across multiple age groups.' },
    { question: 'Can I schedule randori, ne-waza, and kata sessions separately?', answer: 'Yes. Create distinct class types for randori, ne-waza, kata, beginners, competition squad, and grading preparation — each with own capacity, coach, and recurring time slot.' },
    { question: 'Does it handle BJA licence fees and competition entries?', answer: 'Yes. Charge grading fees and competition entries via Stripe alongside recurring memberships. Event management supports gradings, competitions, and open mat sessions.' },
    { question: 'What is the best software for judo clubs in the UK?', answer: 'ClubForge is the most complete platform for UK judo clubs — combining kyu/dan grading, scheduling, payments, and attendance in one system. From £39/month with GBP pricing and GDPR compliance.' },
];

export default async function JudoPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const features = [
        { icon: Award, title: 'Kyu & Dan Belt Grading', desc: 'Full kyu-to-dan belt tracking built for judo. Define your club\'s grading structure, log every examination with coach feedback, and give judoka full visibility of their progression through their portal.' },
        { icon: Calendar, title: 'Class Scheduling', desc: 'Randori, ne-waza, kata, beginners, kids judo, competition squad, and grading prep — all managed from one timetable with member self-booking.' },
        { icon: Users, title: 'Judoka & Family Management', desc: 'Complete profiles with emergency contacts, medical info, and attendance history. Family accounts for parents managing multiple children across junior and senior sections.' },
        { icon: CreditCard, title: 'Automated Payments', desc: 'Monthly memberships, grading fees, and competition entries via Stripe UK in GBP. All payment collection automated from one dashboard.' },
        { icon: CheckCircle2, title: 'Attendance Tracking', desc: 'One-tap check-in for every session. Track mat time to inform grading decisions — see exactly how many sessions each judoka attended since their last examination.' },
        { icon: BarChart3, title: 'Club Analytics', desc: 'Revenue, retention, class engagement, and grading statistics in real-time. Data-driven decisions for your judo club.' },
    ];
    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[{ name: 'Home', url: 'https://clubforgehq.com' }, { name: 'For Judo Clubs', url: 'https://clubforgehq.com/for/judo' }]} />
            <FAQPageSchema faqs={faqs} />
            <main>
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>🥋 Built For Judo Clubs</p>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
                            Judo Club Management{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Software UK</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>Run your judo club with software that understands kyu/dan gradings, randori scheduling, automated payments, and attendance — so you can focus on developing judoka.</p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px' }}>Community judo clubs, competition academies, and multi-mat dojos.</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial <ArrowRight size={18} /></Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>Everything your judo club needs</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {features.map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(197,164,86,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><item.icon size={24} color="#C5A456" /></div>
                                    <div><h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3><p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.95rem' }}>{item.desc}</p></div>
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
                        <RelatedDisciplines currentHref="/for/judo" />
                        <RelatedFeatures />
                    </div>
                </section>
                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to modernise your judo club?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. Set up in under 10 minutes.</p>
                        <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial <ArrowRight size={18} /></Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
