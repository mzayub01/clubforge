import Link from 'next/link';
import { CheckCircle2, ArrowRight, Smartphone, BarChart3, Users, Clock, Heart, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Gym Attendance Tracking Software — One-Tap Check-In | ClubForge',
    description: 'Effortless gym attendance tracking: one-tap check-in, parent-child support, retention reports, and analytics. See who shows up, identify at-risk members, and improve retention. Start your free trial.',
    alternates: { canonical: 'https://clubforgehq.com/features/attendance-tracking' },
    openGraph: {
        title: 'Gym Attendance Tracking Software — ClubForge',
        description: 'One-tap check-in, retention reports & analytics. See who shows up.',
        url: 'https://clubforgehq.com/features/attendance-tracking',
    },
    keywords: [
        'gym attendance tracking app', 'class check-in software', 'gym check-in system',
        'martial arts attendance tracking', 'fitness class attendance software',
        'member check-in app', 'gym retention software', 'attendance reports gym',
    ],
};

const faqs = [
    { question: 'How do members check in?', answer: 'Members tap one button on their phone to check into a class. Parents can check in their children. Coaches can also manually check in members from the class roster on the admin dashboard.' },
    { question: 'Can I see attendance trends over time?', answer: 'Yes. ClubForge provides attendance analytics including weekly/monthly trends, per-class averages, per-member frequency, and retention indicators. You can identify members who are attending less often and may be at risk of leaving.' },
    { question: 'Does it work for parent-child check-ins?', answer: 'Absolutely. Parents can check their children into classes directly from their family account. Each child\'s attendance is tracked individually, so you have accurate per-person records.' },
    { question: 'Can I track attendance for specific belt progression decisions?', answer: 'Yes. Attendance data is connected to the belt progression system. Coaches can see how many classes a student has attended since their last grading, helping make data-informed promotion decisions.' },
];

export default async function AttendanceTrackingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Features', url: 'https://clubforgehq.com/features' },
                { name: 'Attendance Tracking', url: 'https://clubforgehq.com/features/attendance-tracking' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: '#FAFBFC', padding: '140px 24px 80px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C5A456', fontSize: '14px', fontWeight: '600', textDecoration: 'none', marginBottom: '24px' }}>← All Features</Link>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <CheckCircle2 size={32} color="#10B981" />
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: '800', lineHeight: '1.1', color: '#0F172A', marginBottom: '20px' }}>
                            Attendance Tracking{' '}
                            <span style={{ background: 'linear-gradient(135deg, #10B981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>That Drives Retention</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: '1.7', marginBottom: '32px', maxWidth: '650px' }}>
                            Know exactly who shows up, how often, and when they&apos;re dropping off. One-tap check-in for members, automatic tracking for you, and retention insights that help you keep every student.
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
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>See the full picture of your club&apos;s attendance</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: Smartphone, title: 'One-Tap Check-In', desc: 'Members check into class with a single tap on their phone. No QR codes, no sign-in sheets, no hardware. Parents check their children in just as easily from their family account.' },
                                { icon: BarChart3, title: 'Attendance Analytics', desc: 'See weekly and monthly trends, per-class averages, and individual member frequency. Visual dashboards show you the health of your club at a glance — no spreadsheet exports needed.' },
                                { icon: Heart, title: 'Retention Risk Detection', desc: 'Identify members whose attendance is dropping before they leave. ClubForge highlights at-risk members so you can intervene with a personal check-in, not find out they left months later.' },
                                { icon: Users, title: 'Parent-Child Support', desc: 'Parents check in their children from their family account. Each child\'s attendance is tracked individually with accurate per-person records shared across both parent and coach views.' },
                                { icon: Clock, title: 'Attendance Streaks', desc: 'Members see their own attendance streaks, total classes, and weekly stats on their dashboard. This gamification drives engagement and makes members proud of their consistency.' },
                                { icon: Zap, title: 'Connected to Progression', desc: 'Attendance data feeds directly into the belt progression system. Coaches see class counts since last grading, making promotion decisions data-driven rather than guesswork.' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <item.icon size={24} color="#10B981" />
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

                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Start tracking attendance properly</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. One-tap check-in from day one.</p>
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
