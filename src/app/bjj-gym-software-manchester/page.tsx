import Link from 'next/link';
import {
    Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight,
    BarChart3, Shield, Swords, MapPin, Zap, Ticket, Video,
    TrendingUp, Globe, Building2, Heart, Clock, Star,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'BJJ & Martial Arts Gym Software Manchester | #1 Club Management | ClubForge',
    description: 'ClubForge is the leading martial arts club management software for Manchester academies. Purpose-built for BJJ, MMA, Karate & combat sports gyms. Manage memberships, Stripe payments, attendance & belt progression. Free 14-day trial. Trusted by clubs across Greater Manchester.',
    alternates: { canonical: 'https://clubforgehq.com/bjj-gym-software-manchester' },
    openGraph: {
        title: 'BJJ & Martial Arts Gym Software Manchester | ClubForge',
        description: 'The all-in-one management platform for martial arts academies across Manchester. Memberships, Stripe payments, attendance, belt progression — one system.',
        url: 'https://clubforgehq.com/bjj-gym-software-manchester',
        type: 'website',
    },
    keywords: [
        'BJJ gym software Manchester',
        'martial arts gym software Manchester',
        'martial arts club management Manchester',
        'gym management software Manchester',
        'MMA gym software Manchester',
        'combat sports software Manchester',
        'BJJ academy management Manchester',
        'martial arts membership software Manchester',
        'gym billing software Manchester',
        'club management system Manchester',
        'karate dojo software Manchester',
        'Muay Thai gym software Manchester',
        'belt progression tracking Manchester',
        'martial arts booking system Manchester',
    ],
};

const faqs = [
    {
        question: 'What is the best BJJ gym management software in Manchester?',
        answer: 'ClubForge is purpose-built for BJJ and martial arts academies in Manchester, offering belt progression tracking across all IBJJF ranks, automated Stripe payments, attendance monitoring, and class scheduling — all in one platform. Unlike generic gym software like Mindbody or Glofox, ClubForge includes martial arts–specific features out of the box.',
    },
    {
        question: 'Can I use ClubForge for an MMA gym in Manchester?',
        answer: 'Absolutely. ClubForge works for all combat sports and martial arts disciplines, including MMA, BJJ, Muay Thai, boxing, wrestling, and more. MMA gyms across Manchester use ClubForge to manage their memberships, track attendance across multiple class types, and handle payments automatically.',
    },
    {
        question: 'How much does martial arts gym software cost in Manchester?',
        answer: 'ClubForge offers a free tier for new clubs, with paid plans starting at £39/month for up to 150 members. The Pro plan at £129/month supports up to 750 members and 3 locations — ideal for growing Manchester academies with multiple sites across Greater Manchester. No setup fees, no contracts.',
    },
    {
        question: 'Does ClubForge support multi-location gyms across Greater Manchester?',
        answer: 'Yes. ClubForge\'s multi-location support lets you manage members, classes, schedules, and payments across all your Manchester venues from a single dashboard. Whether you have sites in the city centre, Salford, Stockport, or Oldham, everything stays connected.',
    },
    {
        question: 'How does ClubForge compare to Zen Planner or TeamUp for martial arts?',
        answer: 'Zen Planner and TeamUp are popular gym management tools but lack martial arts–specific features like belt progression tracking and grading history. ClubForge is built from the ground up for martial arts, with UK-based pricing in GBP and purpose-built rank management.',
    },
    {
        question: 'Can ClubForge handle kids martial arts classes in Manchester?',
        answer: 'Yes. ClubForge includes family accounts that let parents manage multiple children from a single login. Each child has their own attendance record, belt progression, and class enrolments — perfect for Manchester clubs running children\'s BJJ, karate, or judo programmes.',
    },
    {
        question: 'Does ClubForge offer attendance tracking for Manchester gyms?',
        answer: 'ClubForge provides one-click mobile check-ins for every class. Coaches can see real-time attendance, track member consistency over time, and use attendance data to inform grading decisions. Full reporting dashboards show retention trends across your Manchester academy.',
    },
    {
        question: 'Is ClubForge suitable for small martial arts clubs in Manchester?',
        answer: 'ClubForge scales with your club — from the free tier for brand-new clubs to the Elite plan for large multi-location academies. There are no long-term contracts, so you can upgrade or downgrade as your Manchester club grows.',
    },
];

export default async function ManchesterPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ClubForge — BJJ & Martial Arts Software Manchester',
        description: 'Club management software for BJJ and martial arts gyms in Manchester. Manage memberships, payments, attendance, belt progression, and class scheduling.',
        url: 'https://clubforgehq.com/bjj-gym-software-manchester',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Gym Management Software',
        operatingSystem: 'Web',
        areaServed: {
            '@type': 'City',
            name: 'Manchester',
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
                { name: 'BJJ Gym Software Manchester', url: 'https://clubforgehq.com/bjj-gym-software-manchester' },
            ]} />
            <FAQPageSchema faqs={faqs} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />

            <main>
                <style>{`
                    @media (max-width: 768px) {
                        .cf-city-features-grid { grid-template-columns: 1fr !important; }
                        .cf-city-pain-grid { grid-template-columns: 1fr !important; }
                        .cf-city-why-grid { grid-template-columns: 1fr !important; }
                        .cf-city-stats-grid { grid-template-columns: 1fr 1fr !important; }
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
                    <div style={{
                        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)',
                        top: '-200px', right: '-100px', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
                        bottom: '-150px', left: '-80px', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }} />

                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            marginBottom: '24px', background: 'rgba(197,164,86,0.12)',
                            padding: '8px 16px', borderRadius: '100px',
                            border: '1px solid rgba(197,164,86,0.2)',
                        }}>
                            <MapPin size={14} color="#C5A456" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#C5A456', letterSpacing: '0.03em' }}>
                                Trusted by gyms across Greater Manchester
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                            fontWeight: '800', lineHeight: '1.1', marginBottom: '20px',
                            color: '#FFFFFF',
                        }}>
                            BJJ & Martial Arts Club Management Software in{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>Manchester</span>
                        </h1>

                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            Manchester is one of the UK&apos;s biggest martial arts hubs, with over 150 clubs across Greater Manchester. ClubForge is the platform built specifically for them.
                        </p>
                        <p style={{ fontSize: '1rem', color: '#64748B', marginBottom: '16px', maxWidth: '650px', lineHeight: '1.7' }}>
                            Manage memberships, automate Stripe payments, track attendance, and handle belt progression — all from one system designed for BJJ, MMA, Karate, and combat sports academies.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.7' }}>
                            Stop juggling spreadsheets and WhatsApp groups. Start your free 14-day trial today.
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

                {/* ==================== STATS ==================== */}
                <section style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div className="cf-city-stats-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px',
                        }}>
                            {[
                                { value: '2.8M+', label: 'Greater Manchester population', icon: Users },
                                { value: '150+', label: 'Martial arts clubs', icon: Swords },
                                { value: '10', label: 'Metropolitan boroughs', icon: Building2 },
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

                {/* ==================== MANCHESTER SCENE ==================== */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            The Manchester Martial Arts Scene
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2',
                        }}>
                            Why Manchester gyms need specialist software
                        </h2>

                        <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem' }}>
                            <p style={{ marginBottom: '16px' }}>
                                Manchester has established itself as one of the UK&apos;s premier martial arts cities. Greater Manchester — encompassing the city centre, Salford, Stockport, Trafford, Bolton, Oldham, Bury, Rochdale, Tameside, and Wigan — is home to over 150 martial arts clubs serving a population of approximately 2.8 million people.
                            </p>
                            <p style={{ marginBottom: '16px' }}>
                                The city&apos;s combat sports heritage runs deep. Manchester has produced world-class fighters across boxing, MMA, and kickboxing, and this culture has fuelled a thriving grassroots martial arts scene. BJJ has seen particularly rapid growth, with academies spanning from the Northern Quarter to Didsbury and beyond. Muay Thai, MMA, and traditional martial arts also enjoy strong communities across the region.
                            </p>
                            <p style={{ marginBottom: '16px' }}>
                                For club owners, Manchester&apos;s competitive landscape presents both opportunity and challenge. With multiple academies often serving overlapping areas, the clubs that thrive are those that deliver a professional member experience — from seamless online booking and automated payments to clear belt progression tracking and responsive communication.
                            </p>
                            <p style={{ marginBottom: '0' }}>
                                ClubForge was built to give Manchester&apos;s martial arts clubs exactly that edge. Not a retrofitted fitness app, but a purpose-built platform that understands gradings, belt systems, competition prep, and the unique community dynamics of martial arts training.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ==================== FEATURES ==================== */}
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
                            Everything Manchester martial arts clubs need
                        </h2>

                        <div className="cf-city-features-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px',
                        }}>
                            {[
                                { icon: CreditCard, title: 'Automated Billing', desc: 'Stripe-powered membership billing with automatic retries, receipts, and payment tracking. No more chasing members for overdue fees.', link: '/features/payments-billing' },
                                { icon: CheckCircle2, title: 'Mobile Check-ins', desc: 'One-click mobile check-ins from any device. Track attendance per class, per member, per week — all automatically.', link: '/features/attendance-tracking' },
                                { icon: Award, title: 'Belt Progression', desc: 'Purpose-built belt and rank tracking with full grading history. Support for BJJ, Karate, Judo, Taekwondo belts and custom rank systems.', link: '/features/belt-progression' },
                                { icon: Users, title: 'Member Management', desc: 'Complete member profiles with contact details, membership status, attendance history, and progression records. Family accounts for kids classes.', link: '/features/member-management' },
                                { icon: Calendar, title: 'Class Scheduling', desc: 'Live class scheduling with real-time updates, capacity management, waitlists, and recurring timetable support.', link: '/features/class-scheduling' },
                                { icon: Ticket, title: 'Events & Gradings', desc: 'Organise gradings, seminars, competitions, and open days. Ticket management and attendance tracking built in.' },
                                { icon: Video, title: 'Training Content', desc: 'Member portal with training videos, technique libraries, and exclusive content. Keep members engaged between classes.' },
                                { icon: BarChart3, title: 'Analytics & Reports', desc: 'Attendance analytics, retention reports, revenue dashboards, and member engagement metrics for data-driven decisions.' },
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

                {/* ==================== WHY MANCHESTER CLUBS CHOOSE CLUBFORGE ==================== */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            Why Manchester Clubs Choose ClubForge
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2',
                        }}>
                            Built for Greater Manchester&apos;s martial arts community
                        </h2>

                        <div className="cf-city-local-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '32px',
                        }}>
                            {[
                                { icon: Building2, title: 'Multi-Site Support', desc: 'Many Manchester clubs operate across multiple boroughs — city centre, Salford, Stockport and beyond. Manage all locations from one dashboard.' },
                                { icon: TrendingUp, title: 'Grow in a Competitive Market', desc: 'With 150+ clubs across Greater Manchester, retention matters. ClubForge\'s engagement tools help you spot at-risk members early.' },
                                { icon: Clock, title: 'Save Hours Every Week', desc: 'Automate payments, attendance logging, and member communications. Spend your time coaching, not doing admin.' },
                                { icon: Star, title: 'Professional Member Experience', desc: 'Branded member portal, online class booking, and self-service account management. Stand out from clubs still using spreadsheets.' },
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

                {/* ==================== VS GENERIC SOFTWARE ==================== */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)',
                    padding: '80px 24px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(197,164,86,0.04) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>
                            ClubForge vs Generic Software
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#FFFFFF', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2',
                        }}>
                            Why not Zen Planner, TeamUp, or GymDesk?
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#94A3B8', textAlign: 'center',
                            marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px', lineHeight: '1.7',
                        }}>
                            Generic gym platforms are designed for personal trainers and fitness studios. They lack martial arts–specific features and often charge premium prices for functionality you don&apos;t need.
                        </p>

                        <div className="cf-city-why-grid" style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
                        }}>
                            {[
                                { icon: Award, title: 'Belt progression built in', desc: 'Purpose-built rank tracking with grading history — not a custom field hack in a generic CRM.' },
                                { icon: Zap, title: 'One integrated platform', desc: 'Payments, scheduling, attendance, progression — all connected. No Zapier glue required.' },
                                { icon: Shield, title: 'UK pricing in GBP', desc: 'No USD conversion surprises. UK-based support and features designed for the UK market.' },
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
                    </div>
                </section>

                {/* ==================== DISCIPLINES ==================== */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2',
                        }}>
                            Software for every martial art in Manchester
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: '#64748B', textAlign: 'center',
                            marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7',
                        }}>
                            Customise belt systems, class types, and grading criteria to match your discipline.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                            {[
                                'Brazilian Jiu-Jitsu (BJJ)', 'Mixed Martial Arts (MMA)', 'Muay Thai',
                                'Karate', 'Judo', 'Taekwondo', 'Kickboxing', 'Boxing',
                                'Wrestling', 'Krav Maga', 'Kung Fu', 'Capoeira',
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
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center',
                        }}>FAQ</p>
                        <h2 style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: '800', color: '#0F172A',
                            textAlign: 'center', marginBottom: '36px', lineHeight: '1.2',
                        }}>
                            Common questions from Manchester martial arts clubs
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {faqs.map((faq, i) => (
                                <details key={i} style={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF' }}>
                                    <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', color: '#0F172A', listStyle: 'none' }}>
                                        {faq.question}
                                    </summary>
                                    <div style={{ padding: '0 20px 18px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                                        <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.9rem' }}>{faq.answer}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Link href="/faq" style={{ color: '#C5A456', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>View all FAQs →</Link>
                        </div>
                    </div>
                </section>

                {/* ==================== CTA ==================== */}
                <section style={{
                    background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)',
                    padding: '80px 24px', textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'rgba(15,23,42,0.1)', padding: '8px 16px', borderRadius: '100px' }}>
                            <MapPin size={14} color="#0F172A" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Manchester</span>
                        </div>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
                            Ready to professionalise your Manchester gym?
                        </h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.7' }}>
                            Join martial arts clubs across Greater Manchester using ClubForge. 14-day free trial — no card required.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                                Book a Demo <ArrowRight size={18} />
                            </Link>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#0F172A', border: '2px solid rgba(15,23,42,0.3)', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ==================== INTERNAL LINKS ==================== */}
                <section style={{ background: '#FAFBFC', padding: '48px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                        <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500', margin: 0 }}>Also available in other cities</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {[
                                { href: '/martial-arts-software-london', label: 'London' },
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
