import Link from 'next/link';
import { Award, ArrowRight, FileText, Star, History, MessageSquare, ShieldCheck, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';
import RelatedDisciplines from '@/components/RelatedDisciplines';
import RelatedFeatures from '@/components/RelatedFeatures';

export const metadata = {
    title: 'Belt Progression & Grading Tracking Software | ClubForge',
    description: 'The only club management platform with native belt progression tracking. Structured ranking systems, grading history, coach feedback, promotion audit trails, and member-visible progress. Built for BJJ, karate, taekwondo, judo, and all martial arts.',
    alternates: { canonical: 'https://clubforgehq.com/features/belt-progression' },
    openGraph: {
        title: 'Belt Progression Tracking Software — ClubForge',
        description: 'Native belt tracking, grading history, coach feedback & audit trails. No other platform does this.',
        url: 'https://clubforgehq.com/features/belt-progression',
    },
    keywords: [
        'belt progression tracking software', 'martial arts grading system software',
        'BJJ belt tracking software', 'rank progression tracking',
        'karate belt tracking', 'taekwondo grading software', 'judo ranking system',
        'martial arts promotion tracking', 'grading history software',
        'belt rank management software', 'martial arts student progression',
    ],
};

const faqs = [
    { question: 'Does ClubForge support all martial arts belt systems?', answer: 'Yes. You define your own belt/rank structure — whether it\'s the BJJ system (white through black with stripes), karate\'s colored belt system, taekwondo\'s gup/dan system, or any custom structure. You control the ranks, their order, and their colours.' },
    { question: 'Can coaches add feedback after a grading?', answer: 'Yes. After promoting a student, coaches can add written feedback about what the student did well and areas for improvement. This feedback is visible to the student on their member portal, creating a professional grading experience.' },
    { question: 'Is there an audit trail for promotions?', answer: 'Absolutely. Every promotion is logged with: who was promoted, to what rank, by which coach, on what date, and any feedback given. This complete audit trail is essential for governance, insurance, and professional credibility.' },
    { question: 'Can members see their own progression?', answer: 'Yes. Members see their current rank, full grading history, coach feedback, and progress indicators on their personal dashboard. Parents can see their children\'s progression too. This transparency keeps members motivated and engaged.' },
    { question: 'How does this compare to tracking belts in a spreadsheet?', answer: 'Spreadsheets have no audit trail, no coach sign-off, no member visibility, and no integration with attendance. ClubForge connects belt progression to attendance records, creates accountability through coach sign-offs, and gives members visibility — turning grading from admin into a professional system.' },
];

export default async function BeltProgressionPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Features', url: 'https://clubforgehq.com/features' },
                { name: 'Belt Progression', url: 'https://clubforgehq.com/features/belt-progression' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: '#FAFBFC', padding: '140px 24px 80px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C5A456', fontSize: '14px', fontWeight: '600', textDecoration: 'none', marginBottom: '24px' }}>← All Features</Link>
                        <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', color: '#D97706', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
                            🥋 Unique to ClubForge
                        </div>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Award size={32} color="#F59E0B" />
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: '800', lineHeight: '1.1', color: '#0F172A', marginBottom: '20px' }}>
                            Belt Progression &{' '}
                            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Grading Tracking</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            The feature that makes ClubForge different. Native belt progression tracking with structured ranking systems, grading history, coach feedback, and complete audit trails. No other club management platform does this out of the box.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginBottom: '32px' }}>
                            Built for BJJ, karate, taekwondo, judo, kung fu, kickboxing, and every martial art with a ranking system.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid #E2E8F0', color: '#334155', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>

                <section style={{ background: 'linear-gradient(180deg, #0F172A, #1E293B)', padding: '80px 24px', color: '#FFFFFF' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', marginBottom: '20px' }}>
                            Why spreadsheets fail at belt tracking
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: '1rem', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                            Belt progression is one of the most important things in a martial arts club. It deserves better than a spreadsheet.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            {[
                                'No audit trail — who promoted whom, and when?',
                                'No coach sign-off — anyone can edit a spreadsheet',
                                'Members can\'t see their own progress',
                                'No connection to attendance or class participation',
                                'Parents constantly asking "what belt is my child?"',
                                'No grading feedback or improvement notes',
                            ].map((pain) => (
                                <div key={pain} style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', textAlign: 'left' }}>
                                    <p style={{ color: '#FCA5A5', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>✗ {pain}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>
                            Professional belt tracking, built into the system
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: Star, title: 'Custom Rank Structures', desc: 'Define your belt system — BJJ (white to black with stripes), karate colours, taekwondo gup/dan, or any custom ranking. You decide the order, colours, and names. The system enforces progression.' },
                                { icon: History, title: 'Complete Grading History', desc: 'Every promotion is permanently recorded: date, new rank, promoting coach, and context. Members, parents, and coaches can view the full journey from white belt to black belt.' },
                                { icon: MessageSquare, title: 'Coach Feedback & Notes', desc: 'After a grading, coaches add written feedback — what was strong, what needs work. Students see this on their portal, creating a structured development pathway instead of verbal-only feedback.' },
                                { icon: ShieldCheck, title: 'Promotion Audit Trail', desc: 'Every belt change is logged with who made the change, when, and why. Essential for governance, insurance compliance, and professional credibility. No more "who promoted this student?".' },
                                { icon: TrendingUp, title: 'Member-Visible Progress', desc: 'Members see their current rank, progress bar, grading history, and coach feedback on their personal dashboard. Parents see each child\'s journey. Transparency drives engagement and retention.' },
                                { icon: FileText, title: 'Connected to Attendance', desc: 'Belt progression lives alongside attendance data. Coaches can see how many classes a student has attended since their last grading — making promotion decisions data-informed, not guesswork.' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <item.icon size={24} color="#F59E0B" />
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
                        <RelatedFeatures currentHref="/features/belt-progression" />
                        <RelatedDisciplines currentHref="" maxItems={4} />
                    </div>
                </section>

                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Give your belt system the platform it deserves</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.7' }}>Start tracking progression properly. 14-day free trial, no card required.</p>
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
