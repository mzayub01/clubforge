import Link from 'next/link';
import {
    Users, Calendar, Award, CheckCircle2, CreditCard, BarChart3,
    Building2, ArrowRight, ChevronRight, Video, Ticket,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Features — Everything Your Club Needs in One Platform | ClubForge',
    description: 'Explore ClubForge\'s complete feature set: member management, class scheduling, belt progression tracking, Stripe payments, attendance tracking, multi-location support, event management, and more. Built specifically for martial arts clubs and gyms.',
    alternates: {
        canonical: 'https://clubforgehq.com/features',
    },
    openGraph: {
        title: 'ClubForge Features — Gym & Martial Arts Club Management Software',
        description: 'Member management, class scheduling, belt progression, payments, attendance, and multi-location support — all from one dashboard.',
        url: 'https://clubforgehq.com/features',
    },
    keywords: [
        'gym management software features',
        'club management platform features',
        'martial arts software features',
        'gym member management',
        'class scheduling software',
        'belt progression tracking',
        'gym attendance tracking',
        'gym billing software',
        'multi-location gym management',
    ],
};

const features = [
    {
        icon: Users,
        title: 'Member Management',
        slug: 'member-management',
        description: 'Complete member profiles, family accounts, self-registration, and automated onboarding. Know every member, manage every relationship.',
        color: '#3B82F6',
        keywords: ['profiles', 'family accounts', 'self-registration', 'CRM'],
    },
    {
        icon: Calendar,
        title: 'Class Scheduling',
        slug: 'class-scheduling',
        description: 'Recurring and one-off classes, instructor assignment, capacity limits, and waitlists. Your timetable, fully automated.',
        color: '#8B5CF6',
        keywords: ['timetable', 'booking', 'instructor assignment', 'capacity'],
    },
    {
        icon: Award,
        title: 'Belt & Rank Progression',
        slug: 'belt-progression',
        description: 'Structured ranking systems, grading history, coach feedback, and promotion audit trails. The feature no other platform does natively.',
        color: '#F59E0B',
        keywords: ['belt tracking', 'grading', 'rank progression', 'audit trail'],
    },
    {
        icon: CheckCircle2,
        title: 'Attendance Tracking',
        slug: 'attendance-tracking',
        description: 'One-tap check-in from any device, parent-child support, attendance reports, and retention insights. See who shows up.',
        color: '#10B981',
        keywords: ['check-in', 'reports', 'retention', 'analytics'],
    },
    {
        icon: CreditCard,
        title: 'Payments & Billing',
        slug: 'payments-billing',
        description: 'Stripe-powered subscriptions, automated invoicing, promo codes, and real-time revenue dashboards. Get paid, on time, every time.',
        color: '#EC4899',
        keywords: ['Stripe', 'subscriptions', 'invoicing', 'promo codes'],
    },
    {
        icon: Building2,
        title: 'Multi-Location Management',
        slug: 'multi-location',
        description: 'One dashboard, many venues. Cross-site memberships, unified reporting, and location-specific settings. Scale without chaos.',
        color: '#F97316',
        keywords: ['multi-site', 'franchises', 'unified reporting', 'cross-site'],
    },
    {
        icon: Video,
        title: 'Video Library',
        slug: null,
        description: 'Upload drill and technique videos for your members. Build a premium content library that adds value and keeps students training between sessions.',
        color: '#6366F1',
        keywords: ['technique videos', 'drills', 'training content', 'library'],
    },
    {
        icon: Ticket,
        title: 'Events & Ticketing',
        slug: null,
        description: 'Run seminars, competitions, and retreats with built-in registration and Stripe-powered payments. Manage attendees and track revenue.',
        color: '#06B6D4',
        keywords: ['seminars', 'competitions', 'registration', 'ticketing'],
    },
    {
        icon: BarChart3,
        title: 'Reports & Insights',
        slug: null,
        description: 'Retention trends, attendance analytics, revenue forecasting, and operational health metrics. Make data-driven decisions with confidence.',
        color: '#14B8A6',
        keywords: ['analytics', 'retention', 'revenue', 'forecasting'],
    },
];

export default async function FeaturesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Features', url: 'https://clubforgehq.com/features' },
            ]} />

            <main>
                {/* Hero */}
                <section style={{
                    background: '#FAFBFC',
                    padding: '140px 24px 80px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(197,164,86,0.06) 0%, transparent 70%)',
                        top: '-200px', right: '-100px', pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{
                            fontSize: '14px', fontWeight: '600', color: '#C5A456',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                        }}>
                            Platform Features
                        </p>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800',
                            lineHeight: '1.1', color: '#0F172A', marginBottom: '20px',
                        }}>
                            Gym Management Software{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>
                                Features
                            </span>
                        </h1>
                        <p style={{
                            fontSize: '1.15rem', color: '#64748B', lineHeight: '1.7',
                            maxWidth: '600px', margin: '0 auto',
                        }}>
                            ClubForge replaces your spreadsheet, booking tool, payment processor, and WhatsApp group with one professional system built specifically for gyms, dojos, and martial arts academies.
                        </p>
                    </div>
                </section>

                {/* Feature Grid */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '24px',
                        }}>
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    style={{
                                        padding: '36px 32px', borderRadius: '20px',
                                        border: '1px solid #F1F5F9', background: '#FAFBFC',
                                        transition: 'all 0.25s ease',
                                        display: 'flex', flexDirection: 'column',
                                    }}
                                >
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '16px',
                                        background: `${feature.color}12`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '20px',
                                    }}>
                                        <feature.icon size={28} color={feature.color} />
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.25rem', fontWeight: '700', color: '#0F172A',
                                        marginBottom: '12px',
                                    }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{
                                        color: '#64748B', lineHeight: '1.7', fontSize: '0.95rem',
                                        flex: 1, marginBottom: '16px',
                                    }}>
                                        {feature.description}
                                    </p>
                                    <div style={{
                                        display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px',
                                    }}>
                                        {feature.keywords.map((kw) => (
                                            <span key={kw} style={{
                                                fontSize: '11px', fontWeight: '600', color: '#94A3B8',
                                                background: '#F1F5F9', padding: '4px 10px',
                                                borderRadius: '100px',
                                            }}>
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                    {feature.slug && (
                                        <Link
                                            href={`/features/${feature.slug}`}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                color: '#C5A456', fontWeight: '600', fontSize: '14px',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            Learn more <ChevronRight size={16} />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{
                    background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)',
                    padding: '80px 24px', textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{
                            color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                            fontWeight: '800', marginBottom: '16px',
                        }}>
                            Ready to see it in action?
                        </h2>
                        <p style={{
                            color: 'rgba(15,23,42,0.6)', fontSize: '1.05rem',
                            marginBottom: '32px', lineHeight: '1.7',
                        }}>
                            Start a 14-day free trial with full Pro features. No card required.
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
                                border: '2px solid rgba(15,23,42,0.25)',
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
