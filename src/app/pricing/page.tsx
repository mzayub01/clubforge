import Link from 'next/link';
import {
    CheckCircle2,
    ArrowRight,
    X,
    HelpCircle,
    Users,
    MapPin,
    UserCog,
    Calendar,
    Award,
    CreditCard,
    BarChart3,
    Bell,
    Video,
    BookOpen,
    Mail,
    Tag,
    Globe,
    Paintbrush,
    Code,
    Zap,
    Headphones,
    Download,
    PartyPopper,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import CurrencyPrice, { CurrencyAnnualNote } from '@/components/CurrencyPrice';

export const metadata = {
    title: 'Pricing — Gym Management Software Plans for Every Club Size',
    description: 'Simple, honest pricing for martial arts clubs and gym management. Starter from £39/mo, Pro from £129/mo, Elite from £349/mo. No hidden fees, no per-member charges. Compare all features. Start your 14-day free trial.',
    alternates: {
        canonical: 'https://clubforgehq.com/pricing',
    },
    openGraph: {
        title: 'ClubForge Pricing — Gym Management Software Plans',
        description: 'From £39/mo. No hidden fees, no per-member charges. Start free.',
        url: 'https://clubforgehq.com/pricing',
    },
    keywords: [
        'gym management software pricing',
        'martial arts software cost',
        'club management software plans',
        'affordable gym software',
        'gym software free trial',
        'ClubForge pricing',
    ],
};

// -----------------------------------------------
// Feature comparison data — aligned to feature-gate.ts
// -----------------------------------------------

type FeatureValue = boolean | string;

interface FeatureRow {
    name: string;
    starter: FeatureValue;
    pro: FeatureValue;
    elite: FeatureValue;
    tooltip?: string;
}

interface FeatureCategory {
    title: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    rows: FeatureRow[];
}

const featureCategories: FeatureCategory[] = [
    {
        title: 'Usage Limits',
        icon: Users,
        rows: [
            { name: 'Members', starter: 'Up to 150', pro: 'Up to 750', elite: 'Unlimited' },
            { name: 'Locations', starter: '1', pro: 'Up to 3', elite: 'Unlimited' },
            { name: 'Events', starter: 'Up to 5', pro: 'Up to 50', elite: 'Unlimited' },
            { name: 'Video library', starter: false, pro: 'Up to 30', elite: 'Unlimited' },
        ],
    },
    {
        title: 'Core Club Management',
        icon: Calendar,
        rows: [
            { name: 'Member management', starter: true, pro: true, elite: true, tooltip: 'Profiles, family accounts, self-registration' },
            { name: 'Class scheduling', starter: true, pro: true, elite: true, tooltip: 'Recurring & one-off classes, instructor assignment, capacity limits' },
            { name: 'Attendance tracking', starter: true, pro: true, elite: true, tooltip: 'One-tap check-in for members and parents' },
            { name: 'Belt & rank progression', starter: true, pro: true, elite: true, tooltip: 'Structured ranking system with grading history' },
            { name: 'Stripe payments & billing', starter: true, pro: true, elite: true, tooltip: 'Subscriptions, invoicing, promo codes via Stripe' },
            { name: 'Announcements', starter: true, pro: true, elite: true, tooltip: 'Send announcements with optional email delivery' },
            { name: 'Member self-registration', starter: true, pro: true, elite: true },
            { name: 'Basic reports', starter: true, pro: true, elite: true, tooltip: 'Member counts, attendance summary, revenue overview' },
        ],
    },
    {
        title: 'Growth & Engagement',
        icon: PartyPopper,
        rows: [
            { name: 'Event management', starter: false, pro: true, elite: true, tooltip: 'Create, manage, and take payments for events' },
            { name: 'Waitlist management', starter: false, pro: true, elite: true, tooltip: 'Manage a waitlist for oversubscribed classes or your club' },
            { name: 'Video library', starter: false, pro: true, elite: true, tooltip: 'Upload and share technique videos with members' },
            { name: 'Weekly wisdom', starter: false, pro: true, elite: true, tooltip: 'Publish weekly advice and inspiration to members' },
            { name: 'Custom email templates', starter: false, pro: true, elite: true, tooltip: 'Design branded email templates for member communications' },
            { name: 'Promo codes', starter: false, pro: true, elite: true, tooltip: 'Create discount codes for memberships and events' },
            { name: 'Grading feedback', starter: false, pro: true, elite: true, tooltip: 'Coaches provide written feedback on belt gradings' },
            { name: 'Multi-location support', starter: false, pro: true, elite: true, tooltip: 'Manage multiple venues from one dashboard' },
        ],
    },
    {
        title: 'Analytics & Data',
        icon: BarChart3,
        rows: [
            { name: 'Advanced reports & analytics', starter: false, pro: true, elite: true, tooltip: 'Retention trends, revenue forecasting, detailed attendance analytics' },
            { name: 'Data export (CSV)', starter: false, pro: true, elite: true, tooltip: 'Export member data as CSV for offline analysis' },
            { name: 'Data export (JSON)', starter: false, pro: true, elite: true },
            { name: 'Data export (API)', starter: false, pro: false, elite: true, tooltip: 'Programmatic access to export data via API' },
        ],
    },
    {
        title: 'Enterprise & Branding',
        icon: Globe,
        rows: [
            { name: 'Custom subdomain', starter: false, pro: false, elite: true, tooltip: 'yourclub.clubforge.io → your own branded URL' },
            { name: 'White-label branding', starter: false, pro: false, elite: true, tooltip: 'Remove ClubForge branding, fully custom look & feel' },
            { name: 'API access', starter: false, pro: false, elite: true, tooltip: 'Full REST API for integrations' },
            { name: 'Webhooks', starter: false, pro: false, elite: true, tooltip: 'Real-time event notifications for external systems' },
            { name: 'Automation engine', starter: false, pro: false, elite: true, tooltip: 'Automated workflows triggered by member actions' },
        ],
    },
    {
        title: 'Support',
        icon: Headphones,
        rows: [
            { name: 'Email support', starter: '48h response', pro: '24h response', elite: 'Priority' },
            { name: 'Dedicated account manager', starter: false, pro: false, elite: true },
            { name: 'SLA guarantee', starter: false, pro: false, elite: true, tooltip: 'Guaranteed uptime and response time commitments' },
            { name: 'Migration assistance', starter: false, pro: true, elite: true, tooltip: 'Help importing data from other platforms' },
        ],
    },
];

const faqs = [
    {
        q: 'What happens after the 14-day trial?',
        a: 'Your trial includes full Pro features. After 14 days, choose a plan or your account pauses. No surprise charges — we don\'t take a card upfront.',
    },
    {
        q: 'Can I change my plan later?',
        a: 'Absolutely. Upgrade or downgrade anytime from your admin settings. Changes are prorated automatically.',
    },
    {
        q: 'What\'s the 2.5% platform fee?',
        a: 'When your members pay you through ClubForge (via Stripe), we take a 2.5% fee on each transaction. This is on top of Stripe\'s standard processing fee. It applies to all tiers.',
    },
    {
        q: 'Can I import my existing members?',
        a: 'Yes. We support CSV import for member data. Our team can also help with migration from other platforms on Pro and Elite plans.',
    },
    {
        q: 'Do you offer annual billing?',
        a: 'Yes — save 20% with annual billing. Pay for the year upfront at a discounted rate.',
    },
];

// -----------------------------------------------
// Component
// -----------------------------------------------

export default async function PricingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />

            <main>
                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    padding: 'var(--space-16) var(--space-6) var(--space-10)',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <h1 style={{ marginBottom: 'var(--space-4)' }}>
                            Gym Management Software Pricing
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xl)' }}>
                            No hidden fees. No per-member charges. One flat price for your entire club. Start with a 14-day free trial.
                        </p>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-6) var(--space-6) var(--space-10)' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 'var(--space-6)',
                        }}>
                            {/* Starter */}
                            <div className="glass-card" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
                                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                                    Starter
                                </h3>
                                <div style={{ marginBottom: 'var(--space-2)' }}>
                                    <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '800' }}><CurrencyPrice tier="starter" period="monthly" /></span>
                                    <span style={{ color: 'var(--text-secondary)' }}>/month</span>
                                </div>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                                    <CurrencyAnnualNote tier="starter" />
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                                    For new and small clubs getting started.
                                </p>
                                <Link href="/get-started" className="btn btn-outline" style={{ width: '100%', marginBottom: 'var(--space-6)' }}>
                                    Start Free Trial
                                </Link>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {['Up to 150 members', '1 location', 'Up to 5 events', 'Unlimited classes & staff', 'Member management & profiles', 'Class scheduling & attendance', 'Belt & rank progression', 'Stripe payments & billing', 'Announcements', 'Basic reports', 'Email support (48h)'].map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                            <CheckCircle2 size={16} color="var(--color-gold)" style={{ flexShrink: 0 }} /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pro */}
                            <div style={{
                                padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', position: 'relative',
                                background: 'var(--bg-primary)', border: '2px solid var(--color-gold)',
                                boxShadow: '0 8px 40px rgba(197, 164, 86, 0.2)',
                            }}>
                                <div style={{
                                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--color-gold-gradient)', color: 'var(--color-black)',
                                    padding: 'var(--space-1) var(--space-4)', borderRadius: 'var(--radius-full)',
                                    fontSize: 'var(--text-xs)', fontWeight: '700', textTransform: 'uppercase',
                                }}>
                                    Most Popular
                                </div>
                                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-gold)', marginBottom: 'var(--space-2)' }}>
                                    Pro
                                </h3>
                                <div style={{ marginBottom: 'var(--space-2)' }}>
                                    <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '800' }}><CurrencyPrice tier="pro" period="monthly" /></span>
                                    <span style={{ color: 'var(--text-secondary)' }}>/month</span>
                                </div>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                                    <CurrencyAnnualNote tier="pro" />
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                                    For established clubs ready to scale.
                                </p>
                                <Link href="/get-started" className="btn btn-primary" style={{ width: '100%', marginBottom: 'var(--space-6)' }}>
                                    Start Free Trial <ArrowRight size={16} />
                                </Link>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {['Up to 750 members', '3 locations', 'Up to 50 events', '30 training videos', 'Unlimited classes & staff', 'Everything in Starter, plus:', 'Event management & waitlists', 'Video library for drills & techniques', 'Custom email templates & promo codes', 'Multi-location support', 'Advanced reports & analytics', 'Data export (CSV & JSON)', 'Grading feedback from coaches', 'Priority support (24h)', 'Migration assistance'].map(f => (
                                        <li key={f} style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            fontSize: 'var(--text-sm)',
                                            color: f.startsWith('Everything') ? 'var(--color-gold)' : 'var(--text-primary)',
                                            fontWeight: f.startsWith('Everything') ? '600' : '400',
                                        }}>
                                            <CheckCircle2 size={16} color="var(--color-gold)" style={{ flexShrink: 0 }} /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Elite */}
                            <div className="glass-card" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
                                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                                    Elite
                                </h3>
                                <div style={{ marginBottom: 'var(--space-2)' }}>
                                    <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '800' }}><CurrencyPrice tier="elite" period="monthly" /></span>
                                    <span style={{ color: 'var(--text-secondary)' }}>/month</span>
                                </div>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                                    <CurrencyAnnualNote tier="elite" />
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                                    For large academies and franchises.
                                </p>
                                <Link href="/demo" className="btn btn-outline" style={{ width: '100%', marginBottom: 'var(--space-6)' }}>
                                    Book a Demo
                                </Link>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {['Unlimited members', 'Unlimited locations', 'Unlimited events', 'Unlimited videos', 'Unlimited classes & staff', 'Everything in Pro, plus:', 'Custom subdomain', 'Full white-label branding', 'API access & webhooks', 'Automation engine', 'Data export via API', 'Dedicated account manager', 'SLA guarantee'].map(f => (
                                        <li key={f} style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            fontSize: 'var(--text-sm)',
                                            color: f.startsWith('Everything') ? 'var(--color-gold)' : 'var(--text-primary)',
                                            fontWeight: f.startsWith('Everything') ? '600' : '400',
                                        }}>
                                            <CheckCircle2 size={16} color="var(--color-gold)" style={{ flexShrink: 0 }} /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-8)', marginBottom: 0 }}>
                            All plans include a 2.5% platform fee on member payments processed through Stripe.
                        </p>
                    </div>
                </section>

                {/* ===== FULL FEATURE COMPARISON TABLE ===== */}
                <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-16) var(--space-6)' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                            Full Feature Comparison
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-base)' }}>
                            A detailed breakdown of what&apos;s included in every plan.
                        </p>

                        {/* Scroll hint on mobile */}
                        <p style={{
                            textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)',
                            marginBottom: 'var(--space-3)', display: 'none',
                        }} className="pricing-scroll-hint">
                            ← Swipe to compare plans →
                        </p>

                        {/* Scrollable table wrapper */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{
                                width: '100%',
                                minWidth: '480px',
                                borderCollapse: 'collapse',
                                tableLayout: 'fixed',
                            }}>
                                <colgroup>
                                    <col />
                                    <col style={{ width: '80px' }} />
                                    <col style={{ width: '80px' }} />
                                    <col style={{ width: '80px' }} />
                                </colgroup>

                                {/* Sticky tier header */}
                                <thead>
                                    <tr style={{
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 10,
                                        background: 'var(--bg-secondary)',
                                    }}>
                                        <th style={{ padding: 'var(--space-3) var(--space-1)', borderBottom: '2px solid var(--border-primary)' }} />
                                        <th style={{
                                            padding: 'var(--space-3) var(--space-1)',
                                            textAlign: 'center', fontWeight: '600', fontSize: 'var(--text-xs)',
                                            color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-primary)',
                                        }}>Starter</th>
                                        <th style={{
                                            padding: 'var(--space-3) var(--space-1)',
                                            textAlign: 'center', fontWeight: '700', fontSize: 'var(--text-xs)',
                                            color: 'var(--color-gold)', borderBottom: '2px solid var(--border-primary)',
                                        }}>
                                            <span style={{
                                                background: 'rgba(197, 164, 86, 0.08)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: 'var(--space-1) var(--space-2)',
                                                display: 'inline-block',
                                            }}>Pro</span>
                                        </th>
                                        <th style={{
                                            padding: 'var(--space-3) var(--space-1)',
                                            textAlign: 'center', fontWeight: '600', fontSize: 'var(--text-xs)',
                                            color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-primary)',
                                        }}>Elite</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {featureCategories.map((category) => (
                                        <>
                                            {/* Category header row */}
                                            <tr key={`cat-${category.title}`}>
                                                <td colSpan={4} style={{
                                                    padding: 'var(--space-4) var(--space-1) var(--space-2)',
                                                    borderBottom: '1px solid var(--border-primary)',
                                                }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                                                        fontSize: 'var(--text-sm)', fontWeight: '700',
                                                        color: 'var(--text-primary)', textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                    }}>
                                                        <category.icon size={18} color="var(--color-gold)" />
                                                        {category.title}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Feature rows */}
                                            {category.rows.map((row, i) => (
                                                <tr key={row.name} style={{
                                                    borderBottom: i < category.rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                                }}>
                                                    <td style={{
                                                        padding: 'var(--space-3) var(--space-1)',
                                                        fontSize: 'var(--text-sm)',
                                                        color: 'var(--text-primary)',
                                                    }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                            {row.name}
                                                            {row.tooltip && (
                                                                <span title={row.tooltip} style={{ cursor: 'help', flexShrink: 0 }}>
                                                                    <HelpCircle size={13} color="var(--text-tertiary)" />
                                                                </span>
                                                            )}
                                                        </span>
                                                    </td>
                                                    {(['starter', 'pro', 'elite'] as const).map((tier) => {
                                                        const val = row[tier];
                                                        return (
                                                            <td key={tier} style={{ textAlign: 'center', padding: 'var(--space-3) var(--space-1)' }}>
                                                                {val === true ? (
                                                                    <CheckCircle2 size={18} color="var(--color-gold)" />
                                                                ) : val === false ? (
                                                                    <X size={18} color="var(--text-tertiary)" style={{ opacity: 0.4 }} />
                                                                ) : (
                                                                    <span style={{
                                                                        fontSize: 'var(--text-xs)',
                                                                        fontWeight: '600',
                                                                        color: tier === 'elite' ? 'var(--color-gold)' : 'var(--text-primary)',
                                                                        lineHeight: 1.3,
                                                                    }}>
                                                                        {val}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>

                                {/* Bottom CTA row */}
                                <tfoot>
                                    <tr style={{ borderTop: '2px solid var(--border-primary)' }}>
                                        <td style={{ padding: 'var(--space-6) var(--space-1) var(--space-2)' }} />
                                        <td style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-1) var(--space-2)' }}>
                                            <Link href="/get-started" style={{
                                                fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                                                textDecoration: 'underline',
                                            }}>
                                                Start Trial
                                            </Link>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-1) var(--space-2)' }}>
                                            <Link href="/get-started" style={{
                                                fontSize: 'var(--text-xs)', color: 'var(--color-gold)',
                                                fontWeight: '600', textDecoration: 'underline',
                                            }}>
                                                Start Trial
                                            </Link>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-1) var(--space-2)' }}>
                                            <Link href="/demo" style={{
                                                fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                                                textDecoration: 'underline',
                                            }}>
                                                Book Demo
                                            </Link>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-16) var(--space-6)' }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                            Pricing FAQ
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {faqs.map((faq) => (
                                <div key={faq.q} className="glass-card" style={{ padding: 'var(--space-5)' }}>
                                    <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                                        <HelpCircle size={18} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        {faq.q}
                                    </h4>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)', lineHeight: '1.7', paddingLeft: 'var(--space-6)' }}>
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Ready to get started?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                            Start your 14-day free trial. Full Pro features included.
                        </p>
                        <Link href="/register" className="btn btn-primary btn-lg">
                            Start Free Trial
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
