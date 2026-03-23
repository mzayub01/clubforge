import Link from 'next/link';
import { Users, Calendar, CheckCircle2, CreditCard, ArrowRight, BarChart3, Building2, Dumbbell } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Fitness Studio Management Software — Gyms, CrossFit & Bootcamps | ClubForge',
    description: 'All-in-one management software for fitness studios, CrossFit boxes, bootcamp gyms, and functional fitness facilities. Class scheduling, member management, Stripe payments, attendance tracking, and multi-location support. Start free trial.',
    alternates: { canonical: 'https://clubforgehq.com/for/fitness-studios' },
    openGraph: {
        title: 'Fitness Studio Management Software — ClubForge',
        description: 'Class scheduling, payments, member management & analytics for fitness studios.',
        url: 'https://clubforgehq.com/for/fitness-studios',
    },
    keywords: [
        'fitness studio management software', 'gym management system',
        'CrossFit gym management software', 'bootcamp gym software',
        'functional fitness software', 'fitness class management',
        'gym management app UK', 'boutique gym software',
        'small gym management software', 'fitness business software',
    ],
};

const faqs = [
    { question: 'Is ClubForge only for martial arts clubs?', answer: 'No. While ClubForge has unique martial arts features like belt tracking, the core platform — member management, class scheduling, Stripe payments, attendance tracking, and multi-location support — works perfectly for any fitness studio, CrossFit box, bootcamp, or group training facility.' },
    { question: 'Can I run different class formats (HIIT, strength, mobility)?', answer: 'Yes. Create any class type you need with its own schedule, capacity limits, instructor, and duration. HIIT on Monday, strength on Wednesday, and mobility on Friday — all on the same timetable.' },
    { question: 'Do I need belt tracking features?', answer: 'Not at all. If belt progression isn\'t relevant to your studio, simply don\'t use it. ClubForge lets you use only the features you need. The core scheduling, payments, member management, and analytics work beautifully on their own.' },
    { question: 'Can members book classes from their phone?', answer: 'Yes. Every member gets a mobile-friendly dashboard where they can view the timetable, book into classes, manage their membership, and track their attendance — without downloading an app.' },
];

export default async function FitnessStudiosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'For Fitness Studios', url: 'https://clubforgehq.com/for/fitness-studios' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
                            💪 Built For Fitness Studios
                        </p>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
                            Fitness Studio Software{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Without the Enterprise Price Tag
                            </span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            Class scheduling, member management, Stripe payments, attendance tracking, and real-time analytics — everything your fitness studio needs to run professionally. Without paying enterprise prices or signing long contracts.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px' }}>
                            For CrossFit boxes, bootcamp gyms, functional fitness facilities, and boutique studios.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>

                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>
                            Everything your studio needs to grow
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: Calendar, title: 'Flexible Class Scheduling', desc: 'HIIT, strength, yoga, mobility, bootcamp — create any class type with its own schedule, capacity limits, and instructor. Members self-book from their portal with real-time availability.' },
                                { icon: Users, title: 'Member Management', desc: 'Complete profiles, self-registration, and automated onboarding. Members manage their own accounts, book classes, and track progress — less admin for you, better experience for them.' },
                                { icon: CreditCard, title: 'Stripe-Powered Billing', desc: 'Monthly memberships, class packs, and drop-in payments via Stripe. Automated billing, failed payment retries, and promo codes. Revenue dashboards showing the health of your business.' },
                                { icon: CheckCircle2, title: 'Attendance & Retention', desc: 'One-tap check-in, attendance trends, and retention risk detection. See which members are consistent, which are dropping off, and which classes are most popular.' },
                                { icon: BarChart3, title: 'Business Analytics', desc: 'Real-time dashboards for revenue, member growth, retention, and class utilisation. Compare month-over-month performance and make data-driven decisions about your schedule and pricing.' },
                                { icon: Building2, title: 'Multi-Location Ready', desc: 'Start with one studio. When you open your second — or third — ClubForge scales with you. Unified reporting, cross-site memberships, and location-specific settings.' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(197,164,86,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <item.icon size={24} color="#C5A456" />
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
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to grow your studio?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. No card required. Cancel anytime.</p>
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
