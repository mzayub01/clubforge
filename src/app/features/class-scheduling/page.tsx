import Link from 'next/link';
import { Calendar, Clock, Users, ArrowRight, Settings, Smartphone, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Class Scheduling Software for Gyms & Martial Arts Schools | ClubForge',
    description: 'Effortless class scheduling for gyms and dojos: recurring timetables, instructor assignment, capacity limits, waitlists, and member booking. Automate your entire class schedule. Start free trial.',
    alternates: { canonical: 'https://clubforgehq.com/features/class-scheduling' },
    openGraph: {
        title: 'Gym Class Scheduling Software — ClubForge',
        description: 'Recurring classes, instructor assignment, capacity limits, waitlists — fully automated.',
        url: 'https://clubforgehq.com/features/class-scheduling',
    },
    keywords: [
        'class scheduling software for gyms', 'martial arts class scheduling', 'gym booking software',
        'class timetable software', 'gym class booking system', 'dojo class scheduling',
        'fitness class scheduling app', 'gym scheduling software UK', 'martial arts booking system',
    ],
};

const faqs = [
    { question: 'Can I set up recurring classes?', answer: 'Yes. Create a class once with its day, time, instructor, duration, and capacity — ClubForge automatically repeats it every week. Editing the template updates all future instances.' },
    { question: 'How do members book into classes?', answer: 'Members see the full timetable on their dashboard with available spots. They tap to book, and you see the updated roster. If a class is full, they can join the waitlist and get notified when a spot opens.' },
    { question: 'Can different instructors teach different classes?', answer: 'Absolutely. Assign any staff member as the instructor for each class. Instructors see only their assigned classes and can manage attendance for those sessions.' },
    { question: 'What happens when a class is full?', answer: 'Members see the class is at capacity and can join a waitlist. When a spot opens, the next person in line is notified automatically. You control the maximum capacity per class.' },
];

export default async function ClassSchedulingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Features', url: 'https://clubforgehq.com/features' },
                { name: 'Class Scheduling', url: 'https://clubforgehq.com/features/class-scheduling' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: '#FAFBFC', padding: '140px 24px 80px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C5A456', fontSize: '14px', fontWeight: '600', textDecoration: 'none', marginBottom: '24px' }}>← All Features</Link>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Calendar size={32} color="#8B5CF6" />
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: '800', lineHeight: '1.1', color: '#0F172A', marginBottom: '20px' }}>
                            Class Scheduling{' '}
                            <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Made Effortless</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: '1.7', marginBottom: '32px', maxWidth: '650px' }}>
                            Create your timetable once. ClubForge handles the rest — recurring classes, instructor assignment, capacity limits, waitlists, and member self-booking. Your schedule runs itself.
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
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>
                            Your entire timetable, fully automated
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: RefreshCw, title: 'Recurring Timetable', desc: 'Create a class once — set the day, time, instructor, room, and capacity. ClubForge repeats it every week automatically. Edit the template and all future sessions update.' },
                                { icon: Users, title: 'Instructor Assignment', desc: 'Assign coaches to specific classes. Each instructor sees only their classes and can manage attendance for their sessions. Swap instructors for individual sessions when needed.' },
                                { icon: Settings, title: 'Capacity Limits & Waitlists', desc: 'Set maximum capacity per class. When full, members can join a waitlist and receive automatic notifications when a spot opens. You control the experience.' },
                                { icon: Smartphone, title: 'Member Self-Booking', desc: 'Members see the full timetable on their portal with real-time availability. They book their spot with one tap. No messages, no calls — they manage themselves.' },
                                { icon: Clock, title: 'Flexible Scheduling', desc: 'Run morning fundamentals, lunchtime open mats, after-school kids classes, and evening advanced sessions. Support for different class types, durations, and age groups.' },
                                { icon: Calendar, title: 'One-Off Events & Special Classes', desc: 'Besides recurring classes, schedule one-off workshops, seminars, grading sessions, and guest instructor events. All handled within the same system.' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(139,92,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <item.icon size={24} color="#8B5CF6" />
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
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to automate your class schedule?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.7' }}>Start a 14-day free trial. Set up your timetable in minutes.</p>
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
