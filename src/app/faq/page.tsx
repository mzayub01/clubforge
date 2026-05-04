import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FAQPageSchema, BreadcrumbSchema } from '@/components/structured-data';
import { createClient } from '@/lib/supabase/server';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqItems: FAQItem[] = [
    // General Questions
    {
        category: 'General Questions',
        question: 'What is ClubForge?',
        answer: 'ClubForge is a martial arts club management platform that allows academies to manage memberships, automate payments, track attendance, and monitor belt progression in one system.',
    },
    {
        category: 'General Questions',
        question: 'Who is ClubForge for?',
        answer: 'ClubForge is designed for Brazilian Jiu-Jitsu (BJJ) academies, MMA gyms, karate dojos, judo clubs and other martial arts schools.',
    },
    {
        category: 'General Questions',
        question: 'Is ClubForge suitable for small gyms?',
        answer: 'Yes, ClubForge is suitable for both small academies and multi-location gyms, with scalable features that grow with your club.',
    },
    {
        category: 'General Questions',
        question: 'How long does it take to set up ClubForge?',
        answer: 'Most clubs can set up their branded portal, schedule, and memberships in under 5–10 minutes.',
    },
    {
        category: 'General Questions',
        question: 'Is it difficult to use?',
        answer: 'No, ClubForge is designed to be simple and intuitive for both owners and members. Most users can get started immediately, but support is available if needed.',
    },

    // Payments & Memberships
    {
        category: 'Payments & Memberships',
        question: 'Does ClubForge handle membership payments?',
        answer: 'Yes, ClubForge includes automated billing and subscription payments, allowing clubs to manage memberships and reduce missed or failed payments.',
    },
    {
        category: 'Payments & Memberships',
        question: 'Can members pay by card?',
        answer: 'Yes, ClubForge supports secure online card payments and recurring subscriptions via Stripe.',
    },
    {
        category: 'Payments & Memberships',
        question: 'Will I still need separate payment software?',
        answer: 'No, payments are fully integrated into ClubForge, so you don\'t need separate tools.',
    },
    {
        category: 'Payments & Memberships',
        question: 'Can I cancel anytime?',
        answer: 'Yes, you can cancel your ClubForge subscription at any time from your admin settings. There are no long-term contracts. After cancellation, your data is retained for 90 days in case you wish to come back.',
    },

    // Attendance & Scheduling
    {
        category: 'Attendance & Scheduling',
        question: 'How do members check in to classes?',
        answer: 'Members can check in using a simple one-tap mobile system, and attendance is tracked automatically.',
    },
    {
        category: 'Attendance & Scheduling',
        question: 'Does ClubForge include class scheduling?',
        answer: 'Yes, you can create and manage class schedules, which update instantly across your website and member portal.',
    },
    {
        category: 'Attendance & Scheduling',
        question: 'Can I track attendance over time?',
        answer: 'Yes, ClubForge provides attendance tracking and reporting so you can monitor engagement and retention.',
    },

    // Belt & Progression
    {
        category: 'Belt & Progression',
        question: 'Does ClubForge support belt tracking?',
        answer: 'Yes, ClubForge includes built-in belt and rank progression systems for BJJ, Karate, Judo and other disciplines, with grading history and instructor feedback.',
    },
    {
        category: 'Belt & Progression',
        question: 'Can instructors record grading feedback?',
        answer: 'Yes, instructors can add grading history and feedback for each student, with a full audit trail for promotions.',
    },

    // Members & Families
    {
        category: 'Members & Families',
        question: 'Is ClubForge suitable for kids classes and family accounts?',
        answer: 'Yes, ClubForge supports family accounts, allowing parents to manage multiple children under one login.',
    },
    {
        category: 'Members & Families',
        question: 'Can members update their own details?',
        answer: 'Yes, members can manage their profile, payments and activity through the member portal.',
    },

    // Features & Functionality
    {
        category: 'Features & Functionality',
        question: 'Does ClubForge support multiple locations?',
        answer: 'Yes, you can manage multiple academies or locations from one system with unified reporting and cross-site member management.',
    },
    {
        category: 'Features & Functionality',
        question: 'Can I run events like gradings and seminars?',
        answer: 'Yes, ClubForge includes event management tools for seminars, competitions and gradings.',
    },
    {
        category: 'Features & Functionality',
        question: 'Can I upload training videos?',
        answer: 'Yes, you can create a member-only video library for drills, curriculum and training content.',
    },

    // Comparison Questions
    {
        category: 'How ClubForge Compares',
        question: 'What is the best martial arts management software?',
        answer: 'The best software is one that combines payments, attendance tracking, and progression systems in one platform. ClubForge is designed specifically for martial arts academies rather than generic fitness gyms.',
    },
    {
        category: 'How ClubForge Compares',
        question: 'How is ClubForge different from generic gym software?',
        answer: 'Unlike generic gym software, ClubForge is built specifically for martial arts, with built-in belt progression, attendance tracking, and a fully integrated system for managing clubs.',
    },
    {
        category: 'How ClubForge Compares',
        question: 'Do I need separate tools for scheduling, payments and attendance?',
        answer: 'No, ClubForge combines all of these into one system, removing the need for multiple tools.',
    },
    {
        category: 'How ClubForge Compares',
        question: 'What software do BJJ gyms use?',
        answer: 'While some gyms use general fitness tools, platforms like ClubForge are designed specifically for martial arts, offering better support for belt progression, attendance tracking, and unified grading operations.',
    },

    // UK-Specific SEO Questions
    {
        category: 'UK & Location',
        question: 'What is the best BJJ gym software in the UK?',
        answer: 'ClubForge is used by martial arts academies across the UK to manage memberships, payments, attendance and belt progression in one platform.',
    },
    {
        category: 'UK & Location',
        question: 'Can ClubForge be used by UK martial arts clubs?',
        answer: 'Yes, ClubForge is designed for UK-based academies and supports local payment systems and operations.',
    },
];

export const metadata = {
    title: 'FAQ — Martial Arts Club Management Software Questions Answered | ClubForge',
    description: 'Answers to the most common questions about ClubForge martial arts club management software. Learn about belt tracking, membership payments, class scheduling, attendance, and more for BJJ, MMA, Karate & Judo academies.',
    alternates: {
        canonical: 'https://clubforgehq.com/faq',
    },
    openGraph: {
        title: 'ClubForge FAQ — Martial Arts Club Management Software',
        description: 'Everything gym owners need to know about ClubForge. Belt tracking, payments, scheduling, attendance & more.',
        url: 'https://clubforgehq.com/faq',
    },
    keywords: [
        'ClubForge FAQ',
        'martial arts software questions',
        'gym management software FAQ',
        'BJJ software questions',
        'belt tracking software FAQ',
        'gym membership software FAQ',
    ],
};

export default async function FAQPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const categories = [...new Set(faqItems.map(item => item.category))];

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <FAQPageSchema faqs={faqItems.map(f => ({ question: f.question, answer: f.answer }))} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'FAQ', url: 'https://clubforgehq.com/faq' },
            ]} />

            <main>
                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
                    padding: '140px 24px 80px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                            fontWeight: '800',
                            lineHeight: '1.1',
                            marginBottom: '20px',
                            color: '#FFFFFF',
                        }}>
                            Martial Arts Club Management Software — FAQ
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: '1.1rem', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto' }}>
                            ClubForge is an all-in-one martial arts club management software designed for BJJ, MMA, Karate, Judo and combat sports academies. Below are answers to the most common questions from gym owners.
                        </p>
                    </div>
                </section>

                {/* FAQ Content — Server-rendered with CSS-only accordions */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {categories.map((category) => (
                            <div key={category} style={{ marginBottom: '48px' }}>
                                <h2 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    marginBottom: '20px',
                                    color: '#0F172A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}>
                                    <span style={{
                                        width: '4px',
                                        height: '24px',
                                        borderRadius: '2px',
                                        background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                        display: 'inline-block',
                                    }} />
                                    {category}
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {faqItems
                                        .filter(item => item.category === category)
                                        .map((item, idx) => (
                                            <details
                                                key={idx}
                                                style={{
                                                    border: '1px solid #F1F5F9',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    background: '#FFFFFF',
                                                }}
                                            >
                                                <summary
                                                    style={{
                                                        padding: '18px 20px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.95rem',
                                                        fontWeight: '600',
                                                        color: '#0F172A',
                                                        listStyle: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <span>{item.question}</span>
                                                    <span style={{
                                                        color: '#94A3B8',
                                                        fontSize: '18px',
                                                        fontWeight: '400',
                                                        flexShrink: 0,
                                                        marginLeft: '16px',
                                                        transition: 'transform 0.2s ease',
                                                    }}>+</span>
                                                </summary>
                                                <div style={{
                                                    padding: '0 20px 18px',
                                                    borderTop: '1px solid #F1F5F9',
                                                    paddingTop: '14px',
                                                }}>
                                                    <p style={{
                                                        color: '#64748B',
                                                        margin: 0,
                                                        lineHeight: '1.7',
                                                        fontSize: '0.9rem',
                                                    }}>
                                                        {item.answer}
                                                    </p>
                                                </div>
                                            </details>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={{
                    background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)',
                    padding: '80px 24px',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
                            Still have questions?
                        </h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>
                            Book a demo with our team or start a free trial and explore for yourself.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: '#0F172A', color: '#FFFFFF',
                                padding: '14px 32px', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
                            }}>
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <Link href="/demo" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'transparent', color: '#0F172A',
                                border: '2px solid rgba(15,23,42,0.3)',
                                padding: '14px 32px', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: '600', textDecoration: 'none',
                            }}>
                                Book a Demo
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
