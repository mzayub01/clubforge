import Link from 'next/link';
import { Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight, Shield, Layers, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Martial Arts Club Management Software — Karate, Taekwondo, Judo & More | ClubForge',
    description: 'The all-in-one management system built for martial arts schools. Belt progression tracking, class scheduling, Stripe payments, attendance, and member portals. Designed for karate, taekwondo, judo, kung fu, and all martial arts clubs. Start free trial.',
    alternates: { canonical: 'https://clubforgehq.com/for/martial-arts' },
    openGraph: {
        title: 'Martial Arts Club Management Software — ClubForge',
        description: 'Belt tracking, class scheduling, payments, attendance — built specifically for martial arts.',
        url: 'https://clubforgehq.com/for/martial-arts',
    },
    keywords: [
        'martial arts management software', 'martial arts school software',
        'karate dojo management software', 'taekwondo club software',
        'judo club management', 'kung fu school software',
        'martial arts software UK', 'dojo management software',
        'martial arts student management', 'martial arts club software',
        'karate school management system',
    ],
};

const faqs = [
    { question: 'Is ClubForge designed specifically for martial arts?', answer: 'Yes. ClubForge was born inside a working martial arts academy. Belt progression, grading feedback, coach audit trails, and multi-discipline support are native features — not afterthoughts bolted onto generic gym software.' },
    { question: 'Does it support all martial arts disciplines?', answer: 'Yes. Define your own belt/rank structure for any discipline — karate, taekwondo, judo, kung fu, hapkido, or custom systems. You control the rank names, colours, order, and promotion criteria.' },
    { question: 'Can I manage children and family accounts?', answer: 'Absolutely. Parents create one account and add their children. They can check kids into classes, view each child\'s belt progression, and receive a single consolidated bill. A huge time-saver for clubs with kids\' programmes.' },
    { question: 'How does ClubForge compare to NEST Management or Kicksite?', answer: 'ClubForge offers native belt progression with coach feedback and audit trails (unique to ClubForge), modern Stripe-powered billing, a self-service member portal, and multi-location support — all at a more affordable price point. No long contracts or setup fees.' },
];

export default async function MartialArtsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'For Martial Arts', url: 'https://clubforgehq.com/for/martial-arts' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
                            🥋 Built For Martial Arts
                        </p>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
                            The Management System{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Built Inside a Dojo
                            </span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            ClubForge wasn&apos;t designed in a boardroom. It was built inside a working martial arts academy — by operators who needed belt tracking, grading workflows, and member management that generic gym software couldn&apos;t provide.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px' }}>
                            For karate, taekwondo, judo, kung fu, kickboxing, hapkido, and every martial art with a structured ranking system.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>

                {/* Why Generic Software Fails */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>
                            Why generic gym software doesn&apos;t work for martial arts
                        </h2>
                        <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.7' }}>
                            Most gym management tools are built for general fitness — treadmills, personal training, and spin classes. They don&apos;t understand belt systems, grading ceremonies, or the parent-child dynamics of a kids&apos; martial arts programme.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
                            {[
                                'No belt or rank tracking',
                                'No grading history or coach feedback',
                                'No audit trail for promotions',
                                'Family accounts bolted on, not native',
                                'No understanding of martial arts structures',
                                'Priced for large commercial gyms',
                            ].map((pain) => (
                                <div key={pain} style={{ padding: '16px 20px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                    <p style={{ color: '#DC2626', fontSize: '13px', margin: 0, fontWeight: '500' }}>✗ {pain}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features for MA */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>
                            Built for how martial arts clubs actually run
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {[
                                { icon: Award, title: 'Belt & Rank Progression', desc: 'Define your belt system, run gradings, record coach feedback, and give members visibility into their journey. Complete audit trails for every promotion.', link: '/features/belt-progression' },
                                { icon: Calendar, title: 'Class Scheduling', desc: 'Recurring timetables, one-off seminars, instructor assignment, capacity limits. Kids classes, adult classes, open mats — all managed in one place.', link: '/features/class-scheduling' },
                                { icon: Users, title: 'Family Accounts', desc: 'Parents manage all their children from one login. One bill, individual check-ins, separate belt progression per child. Built for clubs with kids programmes.', link: '/features/member-management' },
                                { icon: CheckCircle2, title: 'Attendance Tracking', desc: 'One-tap check-in for members and parents. Attendance data feeds into belt progression decisions. See who trains, how often, and who\'s slipping.', link: '/features/attendance-tracking' },
                                { icon: CreditCard, title: 'Stripe Payments', desc: 'Automated subscriptions, event payments, promo codes. Members pay online; you track revenue. No more cash in envelopes or manual bank transfers.', link: '/features/payments-billing' },
                                { icon: BarChart3, title: 'Reports & Analytics', desc: 'Retention trends, attendance analytics, revenue forecasting. Data-driven decisions for your club, not gut feelings.' },
                            ].map((item) => (
                                <div key={item.title} style={{ padding: '28px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #F1F5F9' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(197,164,86,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                        <item.icon size={24} color="#C5A456" />
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3>
                                    <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.9rem', marginBottom: item.link ? '12px' : '0' }}>{item.desc}</p>
                                    {item.link && (
                                        <Link href={item.link} style={{ color: '#C5A456', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>
                                            Learn more →
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Disciplines */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
                            Works with every martial art
                        </h2>
                        <p style={{ color: '#64748B', marginBottom: '32px' }}>
                            ClubForge supports any discipline with a structured ranking system.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                            {['Karate', 'Taekwondo', 'Judo', 'Kung Fu', 'Kickboxing', 'Hapkido', 'Aikido', 'Krav Maga', 'Capoeira', 'Wing Chun', 'Muay Thai'].map((d) => (
                                <span key={d} style={{ padding: '10px 20px', borderRadius: '100px', background: '#F1F5F9', color: '#334155', fontWeight: '600', fontSize: '14px' }}>
                                    {d}
                                </span>
                            ))}
                        </div>
                        <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '16px' }}>
                            Looking for BJJ or MMA? See our dedicated pages for <Link href="/for/bjj" style={{ color: '#C5A456' }}>BJJ academies</Link> and <Link href="/for/boxing-mma" style={{ color: '#C5A456' }}>boxing & MMA gyms</Link>.
                        </p>
                    </div>
                </section>

                {/* FAQ */}
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
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to run your martial arts club professionally?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. No card required. Set up in under 10 minutes.</p>
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
