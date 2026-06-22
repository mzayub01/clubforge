import Link from 'next/link';
import {
    Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight,
    BarChart3, Shield, Swords, MapPin, XCircle, Zap, ClipboardList,
    UserCheck, Video, Ticket, Play, TrendingUp, Globe, Building2,
    Star, Heart, Clock, Smartphone,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Martial Arts Club Management Software London | #1 for BJJ, MMA & Karate | ClubForge',
    description: 'ClubForge is the leading martial arts club management software for London academies. Purpose-built for BJJ, MMA, Karate & Judo clubs. Manage memberships, Stripe payments, attendance tracking & belt progression. Free 14-day trial. Used by clubs across all 32 London boroughs.',
    alternates: { canonical: 'https://clubforgehq.com/martial-arts-software-london' },
    openGraph: {
        title: 'Martial Arts Club Management Software London | ClubForge',
        description: 'The all-in-one management platform for martial arts academies across London. Memberships, Stripe payments, attendance, belt progression — one system for BJJ, MMA, Karate & more.',
        url: 'https://clubforgehq.com/martial-arts-software-london',
        type: 'website',
    },
    keywords: [
        'martial arts club management software London',
        'BJJ gym software London',
        'martial arts academy software London',
        'gym management software London',
        'club management system London',
        'MMA gym software London',
        'karate dojo management London',
        'martial arts membership software London',
        'gym billing software London',
        'martial arts attendance tracking London',
        'judo club software London',
        'taekwondo management software London',
        'martial arts booking system London',
        'belt progression tracking software London',
    ],
};

const faqs = [
    {
        question: 'What is the best martial arts management software in London?',
        answer: 'ClubForge is purpose-built for martial arts academies in London, offering belt progression tracking, automated Stripe payments, attendance monitoring, class scheduling, and family accounts — all in one platform. Unlike generic gym software such as Mindbody or Glofox, ClubForge includes martial arts–specific features like grading history and rank management out of the box.',
    },
    {
        question: 'Can I use ClubForge for a BJJ gym in London?',
        answer: 'Absolutely. ClubForge is designed specifically for BJJ academies, with built-in belt and stripe tracking across all IBJJF ranks (white through coral/red), attendance monitoring per class type (gi, no-gi, open mat), and automated Stripe billing. BJJ clubs across London use ClubForge to manage their entire operation.',
    },
    {
        question: 'How much does martial arts club management software cost in London?',
        answer: 'ClubForge offers a free tier for clubs just getting started, with paid plans from £39/month for clubs with up to 150 members. The Pro plan at £129/month supports up to 750 members and 3 locations — perfect for growing London academies. There are no setup fees, no contracts, and every plan includes a 14-day free trial.',
    },
    {
        question: 'Does ClubForge work for martial arts clubs with multiple locations across London?',
        answer: 'Yes. ClubForge\'s multi-location support lets you manage members, classes, schedules, and payments across all your London venues from a single dashboard. Whether you have academies in East London and South London, or across multiple boroughs, everything stays connected.',
    },
    {
        question: 'How does ClubForge compare to Mindbody or Glofox for martial arts clubs?',
        answer: 'Mindbody and Glofox are built for generic fitness businesses — yoga studios, CrossFit boxes, and personal training studios. They lack martial arts–specific features like belt progression tracking, grading history, and rank management. ClubForge is built from the ground up for martial arts, with UK-based pricing in GBP and Stripe-powered billing.',
    },
    {
        question: 'Can ClubForge handle kids martial arts classes in London?',
        answer: 'Yes. ClubForge includes family accounts that let parents manage multiple children from a single login. Each child has their own attendance record, belt progression, and class enrolments. This is especially popular with London clubs running children\'s BJJ, karate, and judo programmes.',
    },
    {
        question: 'Does ClubForge offer attendance tracking for martial arts clubs?',
        answer: 'ClubForge provides one-click mobile check-ins for every class. Coaches can see real-time attendance, track member consistency over time, and use attendance data to inform grading decisions. Full reporting dashboards show retention trends, class popularity, and member engagement across your London academy.',
    },
    {
        question: 'Is ClubForge suitable for small martial arts clubs in London?',
        answer: 'ClubForge is designed to scale with your club. The free tier is perfect for new clubs just starting out, and the Starter plan at £39/month supports up to 150 members. There are no long-term contracts, so you can upgrade or downgrade as your London club grows.',
    },
];

export default async function LondonPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ClubForge — Martial Arts Software London',
        description: 'Club management software for martial arts academies in London. Manage memberships, payments, attendance, belt progression, and class scheduling.',
        url: 'https://clubforgehq.com/martial-arts-software-london',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Gym Management Software',
        operatingSystem: 'Web',
        areaServed: {
            '@type': 'City',
            name: 'London',
            containedInPlace: { '@type': 'Country', name: 'United Kingdom' },
        },
        offers: {
            '@type': 'AggregateOffer',
            lowPrice: '0',
            highPrice: '349',
            priceCurrency: 'GBP',
            offerCount: '4',
            url: 'https://clubforgehq.com/pricing',
        },
        provider: {
            '@type': 'Organization',
            name: 'ClubForge',
            url: 'https://clubforgehq.com',
        },
    };

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Martial Arts Software London', url: 'https://clubforgehq.com/martial-arts-software-london' },
            ]} />
            <FAQPageSchema faqs={faqs} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />

            <main>
                {/* Responsive overrides */}
                <style>{`
                    @media (max-width: 768px) {
                        .cf-city-features-grid { grid-template-columns: 1fr !important; }
                        .cf-city-pain-grid { grid-template-columns: 1fr !important; }
                        .cf-city-why-grid { grid-template-columns: 1fr !important; }
                        .cf-city-stats-grid { grid-template-columns: 1fr 1fr !important; }
                        .cf-city-compare-grid { grid-template-columns: 1fr !important; }
                        .cf-city-local-grid { grid-template-columns: 1fr !important; }
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
                        position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)',
                        top: '-250px', right: '-150px', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
                        bottom: '-200px', left: '-100px', pointerEvents: 'none',
                    }} />
                    {/* Subtle grid */}
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
                                Serving martial arts academies across all 32 London boroughs
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                            fontWeight: '800', lineHeight: '1.1', marginBottom: '20px',
                            color: '#FFFFFF',
                        }}>
                            Martial Arts Club Management Software in{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>London</span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            London is home to over 500 martial arts clubs — from BJJ academies in Shoreditch to Karate dojos in Croydon. ClubForge is the management platform built specifically for them.
                        </p>
                        <p style={{ fontSize: '1rem', color: '#64748B', marginBottom: '16px', maxWidth: '650px', lineHeight: '1.7' }}>
                            Manage memberships, automate Stripe payments, track attendance, and handle belt progression — all from one system designed for how martial arts clubs actually operate.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.7' }}>
                            No more juggling spreadsheets, WhatsApp groups, and disconnected payment tools. Start your free 14-day trial today.
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
                                <Swords size={15} color="#C5A456" /> Built for martial arts
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Zap size={15} color="#C5A456" /> Set up in minutes
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Globe size={15} color="#C5A456" /> UK-based, UK pricing
                            </span>
                        </div>
                    </div>
                </section>

                {/* ==================== LONDON STATS ==================== */}
                <section style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div className="cf-city-stats-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px',
                        }}>
                            {[
                                { value: '9M+', label: 'London population', icon: Users },
                                { value: '500+', label: 'Martial arts clubs', icon: Swords },
                                { value: '32', label: 'London boroughs served', icon: Building2 },
                                { value: '£0', label: 'Free tier available', icon: Heart },
                            ].map((stat) => (
                                <div key={stat.label} style={{
                                    textAlign: 'center', padding: '24px 16px',
                                    borderRadius: '16px', background: '#FAFBFC',
                                    border: '1px solid #F1F5F9',
                                }}>
                                    <stat.icon size={24} color="#C5A456" style={{ marginBottom: '12px' }} />
                                    <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', margin: '0 0 4px' }}>{stat.value}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== THE LONDON MARTIAL ARTS SCENE ==================== */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            The London Martial Arts Scene
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2',
                        }}>
                            Why London martial arts clubs need purpose-built software
                        </h2>

                        <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem' }}>
                            <p style={{ marginBottom: '16px' }}>
                                London is one of the most vibrant martial arts cities in the world. With a population exceeding 9 million people spread across 32 boroughs, the capital is home to an estimated 500+ martial arts clubs covering every discipline imaginable — from Brazilian Jiu-Jitsu and Muay Thai to traditional Karate, Judo, Taekwondo, and Krav Maga.
                            </p>
                            <p style={{ marginBottom: '16px' }}>
                                The city&apos;s martial arts scene has exploded over the past decade. BJJ alone has seen enormous growth, with academies like Roger Gracie Academy, Mill Hill BJJ, and dozens of smaller clubs establishing themselves across every corner of the capital. MMA gyms have proliferated following the sport&apos;s mainstream acceptance, whilst traditional martial arts continue to thrive in community centres, leisure centres, and dedicated dojos throughout London.
                            </p>
                            <p style={{ marginBottom: '16px' }}>
                                But running a martial arts club in London presents unique challenges. High rents mean clubs need to maximise every class slot and retain every member. The sheer volume of students — many clubs in London manage 200 to 500+ active members — makes manual administration unsustainable. Competition is fierce, with multiple academies often serving the same borough, making professional operations and member experience a key differentiator.
                            </p>
                            <p style={{ marginBottom: '0' }}>
                                That&apos;s exactly why ClubForge was built. Not as another generic gym management tool, but as a purpose-built platform for martial arts clubs that understand the unique workflows of belt progression, grading cycles, competition preparation, and the community-driven nature of martial arts training.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ==================== THE PROBLEM ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#EF4444',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            The Problem
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Most martial arts clubs in London are still juggling
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#64748B', textAlign: 'center',
                            marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7',
                        }}>
                            This creates admin overload, leads to missed payments, poor visibility into your business, and ultimately member drop-off.
                        </p>

                        <div className="cf-city-pain-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px',
                        }}>
                            {[
                                { icon: ClipboardList, text: 'Spreadsheets and paper registers for member tracking' },
                                { icon: Users, text: 'WhatsApp groups and Facebook pages for communication' },
                                { icon: CreditCard, text: 'Separate tools for payments, scheduling, and attendance' },
                                { icon: Calendar, text: 'Outdated class timetables that members can\'t access online' },
                                { icon: Award, text: 'No system for tracking belt progression or grading history' },
                                { icon: TrendingUp, text: 'No visibility into retention, revenue, or attendance trends' },
                            ].map((item) => (
                                <div key={item.text} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '20px 24px', borderRadius: '14px',
                                    background: '#FEF2F2', border: '1px solid #FECACA',
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <item.icon size={20} color="#EF4444" />
                                    </div>
                                    <p style={{ color: '#991B1B', fontWeight: '600', fontSize: '0.95rem', margin: 0 }}>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== THE SOLUTION ==================== */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#10B981',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            The Solution
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            ClubForge replaces all of that with{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>one system</span>
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#64748B', textAlign: 'center',
                            marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7',
                        }}>
                            Designed for martial arts academies — not yoga studios or CrossFit boxes. With ClubForge, London-based clubs can:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { icon: CreditCard, text: 'Automate membership payments via Stripe — no more chasing invoices' },
                                { icon: CheckCircle2, text: 'Track attendance with one-click mobile check-ins' },
                                { icon: Award, text: 'Manage belt and rank progression with full grading history' },
                                { icon: Calendar, text: 'Run classes with live schedules and capacity management' },
                                { icon: Users, text: 'Handle family accounts for kids classes — one parent login, multiple children' },
                                { icon: Video, text: 'Share training content through your branded member portal' },
                                { icon: BarChart3, text: 'Monitor retention, revenue, and attendance with real-time dashboards' },
                            ].map((item) => (
                                <div key={item.text} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '18px 24px', borderRadius: '14px',
                                    background: '#FFFFFF', border: '1px solid #E2E8F0',
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <item.icon size={20} color="#10B981" />
                                    </div>
                                    <p style={{ color: '#0F172A', fontWeight: '600', fontSize: '0.95rem', margin: 0 }}>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== FEATURES (SEO-RICH) ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            Features
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '48px', lineHeight: '1.2',
                        }}>
                            Everything London martial arts clubs need
                        </h2>

                        <div className="cf-city-features-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '20px',
                        }}>
                            {[
                                { icon: CreditCard, title: 'Automated Billing', desc: 'Stripe-powered membership billing with automatic retries, receipts, and payment tracking. No more chasing members for overdue fees.', link: '/features/payments-billing' },
                                { icon: CheckCircle2, title: 'Mobile Check-ins', desc: 'One-click mobile check-ins with QR codes. Track attendance per class, per member, per week — all automatically.', link: '/features/attendance-tracking' },
                                { icon: Award, title: 'Belt Progression', desc: 'Purpose-built belt and rank tracking with full grading history. Support for BJJ, Karate, Judo, Taekwondo belts and custom rank systems.', link: '/features/belt-progression' },
                                { icon: Users, title: 'Member Management', desc: 'Complete member profiles with contact details, membership status, attendance history, and progression records. Family accounts for kids classes.', link: '/features/member-management' },
                                { icon: Calendar, title: 'Class Scheduling', desc: 'Live class scheduling with real-time updates, capacity management, waitlists, and recurring timetable support.', link: '/features/class-scheduling' },
                                { icon: Ticket, title: 'Events & Gradings', desc: 'Organise gradings, seminars, competitions, and open days. Ticket management and attendance tracking built in.' },
                                { icon: Video, title: 'Training Content', desc: 'Member portal with training videos, technique libraries, and exclusive content. Keep members engaged between classes.' },
                                { icon: BarChart3, title: 'Analytics & Reports', desc: 'Attendance analytics, retention reports, revenue dashboards, and member engagement metrics. Data-driven decisions for your club.' },
                            ].map((item) => (
                                <div key={item.title} style={{
                                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                                    padding: '24px', borderRadius: '16px',
                                    border: '1px solid #F1F5F9', background: '#FAFBFC',
                                }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: 'rgba(197,164,86,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <item.icon size={22} color="#C5A456" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>{item.title}</h3>
                                        <p style={{ color: '#64748B', margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>{item.desc}</p>
                                        {'link' in item && item.link && (
                                            <Link href={item.link} style={{ fontSize: '0.85rem', color: '#C5A456', fontWeight: '600', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
                                                Learn more →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== WHY LONDON CLUBS CHOOSE CLUBFORGE ==================== */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            Why London Clubs Choose ClubForge
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2',
                        }}>
                            Built for the challenges London clubs face
                        </h2>

                        <div className="cf-city-local-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '32px',
                        }}>
                            {[
                                { icon: Building2, title: 'Multi-Location Management', desc: 'Many London clubs operate across multiple boroughs. ClubForge lets you manage all your locations — members, classes, payments — from one dashboard.' },
                                { icon: TrendingUp, title: 'Retention in a Competitive Market', desc: 'With 500+ clubs across London, retention is everything. ClubForge\'s attendance tracking and engagement tools help you spot at-risk members before they leave.' },
                                { icon: Users, title: 'High Member Volumes', desc: 'London clubs often manage 200-500+ active members. ClubForge scales effortlessly, handling large rosters without slowing down your operations.' },
                                { icon: Clock, title: 'Time-Saving Automation', desc: 'High rents mean your time is better spent on the mats, not on admin. Automate payments, communications, and reporting to focus on what matters.' },
                            ].map((item) => (
                                <div key={item.title} style={{
                                    padding: '28px 24px', borderRadius: '16px',
                                    background: '#FFFFFF', border: '1px solid #F1F5F9',
                                }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: 'rgba(197,164,86,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '16px',
                                    }}>
                                        <item.icon size={22} color="#C5A456" />
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3>
                                    <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== WHY NOT GENERIC GYM SOFTWARE ==================== */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)',
                    padding: '80px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(197,164,86,0.04) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            ClubForge vs Generic Gym Software
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#FFFFFF', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Why not Mindbody, Glofox, or GymDesk?
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#94A3B8', textAlign: 'center',
                            marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px', lineHeight: '1.7',
                        }}>
                            Generic gym management platforms are built for fitness studios and personal trainers. They lack the features martial arts clubs need and charge premium prices for it.
                        </p>

                        <div className="cf-city-why-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '20px',
                        }}>
                            {[
                                { icon: Award, title: 'Belt progression built in', desc: 'No workarounds. Purpose-built belt and rank tracking with grading history — not a hacked custom field in a generic CRM.' },
                                { icon: Zap, title: 'One integrated platform', desc: 'Payments, scheduling, attendance, progression, communications — all connected. No Zapier glue needed.' },
                                { icon: Shield, title: 'UK-based, UK pricing', desc: 'Priced in GBP with UK support. No USD conversion surprises or US-centric features you\'ll never use.' },
                            ].map((item) => (
                                <div key={item.title} style={{
                                    padding: '28px 24px', borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    textAlign: 'center',
                                }}>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '14px',
                                        background: 'rgba(197,164,86,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 16px',
                                    }}>
                                        <item.icon size={24} color="#C5A456" />
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>{item.title}</h3>
                                    <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Comparison table */}
                        <div style={{ marginTop: '48px', overflowX: 'auto' }}>
                            <table style={{
                                width: '100%', borderCollapse: 'collapse',
                                fontSize: '0.9rem', color: '#94A3B8',
                            }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FFFFFF', fontWeight: '600' }}>Feature</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', color: '#C5A456', fontWeight: '700' }}>ClubForge</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Mindbody</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Glofox</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Belt/Rank Progression', true, false, false],
                                        ['Grading History', true, false, false],
                                        ['UK Pricing (GBP)', true, false, true],
                                        ['Family Accounts', true, true, true],
                                        ['Stripe Payments', true, false, true],
                                        ['Free Tier', true, false, false],
                                        ['Martial Arts–Specific', true, false, false],
                                        ['Multi-Location', true, true, true],
                                    ].map(([feature, cf, mb, gl]) => (
                                        <tr key={feature as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px 16px' }}>{feature as string}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{cf ? '✅' : '❌'}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{mb ? '✅' : '❌'}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{gl ? '✅' : '❌'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* ==================== DISCIPLINES SERVED ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            Every Discipline
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2',
                        }}>
                            Software for every martial art taught in London
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#64748B', textAlign: 'center',
                            marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7',
                        }}>
                            ClubForge works for any martial arts discipline. Customise belt systems, class types, and grading criteria to match your art.
                        </p>

                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center',
                        }}>
                            {[
                                'Brazilian Jiu-Jitsu (BJJ)', 'Mixed Martial Arts (MMA)', 'Karate',
                                'Judo', 'Taekwondo', 'Muay Thai', 'Kickboxing',
                                'Krav Maga', 'Wrestling', 'Boxing', 'Kung Fu',
                                'Aikido', 'Capoeira', 'Wing Chun',
                            ].map((art) => (
                                <span key={art} style={{
                                    padding: '10px 20px', borderRadius: '100px',
                                    background: '#FAFBFC', border: '1px solid #E2E8F0',
                                    fontSize: '0.9rem', color: '#334155', fontWeight: '500',
                                }}>
                                    {art}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== FAQ ==================== */}
                <section style={{
                    background: '#FAFBFC',
                    padding: '80px 24px',
                    borderTop: '1px solid #F1F5F9',
                }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px',
                            marginBottom: '16px', textAlign: 'center',
                        }}>
                            FAQ
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                            fontWeight: '800', color: '#0F172A',
                            textAlign: 'center', marginBottom: '36px', lineHeight: '1.2',
                        }}>
                            Common questions from London martial arts clubs
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {faqs.map((faq, i) => (
                                <details
                                    key={i}
                                    style={{
                                        border: '1px solid #F1F5F9',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        background: '#FFFFFF',
                                    }}
                                >
                                    <summary style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '18px 20px', cursor: 'pointer',
                                        fontSize: '0.95rem', fontWeight: '600', color: '#0F172A',
                                        listStyle: 'none',
                                    }}>
                                        {faq.question}
                                    </summary>
                                    <div style={{
                                        padding: '0 20px 18px',
                                        borderTop: '1px solid #F1F5F9',
                                        paddingTop: '14px',
                                    }}>
                                        <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.9rem' }}>
                                            {faq.answer}
                                        </p>
                                    </div>
                                </details>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Link href="/faq" style={{
                                color: '#C5A456', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none',
                            }}>
                                View all FAQs →
                            </Link>
                        </div>
                    </div>
                </section>

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
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>London</span>
                        </div>
                        <h2 style={{
                            color: '#0F172A',
                            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                            fontWeight: '800', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Ready to professionalise your London martial arts club?
                        </h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.7' }}>
                            Join clubs across London using ClubForge to streamline operations. 14-day free trial — no card required.
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

                {/* ==================== INTERNAL LINKS ==================== */}
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
                                { href: '/bjj-gym-software-manchester', label: 'Manchester' },
                                { href: '/gym-management-birmingham', label: 'Birmingham' },
                                { href: '/martial-arts-software-leeds', label: 'Leeds' },
                                { href: '/bjj-gym-software-liverpool', label: 'Liverpool' },
                                { href: '/martial-arts-software-glasgow', label: 'Glasgow' },
                                { href: '/gym-management-edinburgh', label: 'Edinburgh' },
                                { href: '/martial-arts-software-bristol', label: 'Bristol' },
                                { href: '/bjj-gym-software-sheffield', label: 'Sheffield' },
                                { href: '/martial-arts-software-nottingham', label: 'Nottingham' },
                                { href: '/gym-management-leicester', label: 'Leicester' },
                                { href: '/martial-arts-software-newcastle', label: 'Newcastle' },
                            ].map((city, i) => (
                                <span key={city.href}>{i > 0 && <span style={{ color: '#E2E8F0', marginRight: '16px' }}>·</span>}<Link href={city.href} style={{ fontSize: '14px', color: '#C5A456', fontWeight: '600', textDecoration: 'none' }}>{city.label}</Link></span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                            <Link href="/" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Home</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/features" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Features</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/features/member-management" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Member Management</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/features/belt-progression" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Belt Progression</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/features/payments-billing" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Payments</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/pricing" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Pricing</Link>
                            <span style={{ color: '#E2E8F0' }}>·</span>
                            <Link href="/blog" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Blog</Link>
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
