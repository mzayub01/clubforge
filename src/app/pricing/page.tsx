import Link from 'next/link';
import {
    CheckCircle2,
    ArrowRight,
    X,
    HelpCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'Pricing | ClubForge',
    description: 'Simple, honest pricing for clubs of every size. No hidden fees. No per-member charges. Start your 14-day free trial.',
};

const tiers = [
    {
        name: 'Starter',
        price: 39,
        annual: 31,
        description: 'For new and small clubs getting started.',
        highlighted: false,
        cta: 'Start Free Trial',
        ctaHref: '/register',
        features: [
            { name: 'Members', value: 'Up to 150' },
            { name: 'Locations', value: '1' },
            { name: 'Staff accounts', value: '3' },
            { name: 'Member management', value: true },
            { name: 'Class scheduling', value: true },
            { name: 'Attendance tracking', value: true },
            { name: 'Belt & rank progression', value: true },
            { name: 'Stripe payments', value: true },
            { name: 'Basic events', value: true },
            { name: 'Email support (48h)', value: true },
            { name: 'Custom email templates', value: false },
            { name: 'Advanced reports', value: false },
            { name: 'Custom domain', value: false },
            { name: 'White-label branding', value: false },
            { name: 'API access', value: false },
        ],
    },
    {
        name: 'Pro',
        price: 129,
        annual: 103,
        description: 'For established clubs ready to scale.',
        highlighted: true,
        cta: 'Start Free Trial',
        ctaHref: '/register',
        features: [
            { name: 'Members', value: 'Up to 750' },
            { name: 'Locations', value: 'Up to 3' },
            { name: 'Staff accounts', value: '10' },
            { name: 'Member management', value: true },
            { name: 'Class scheduling', value: true },
            { name: 'Attendance tracking', value: true },
            { name: 'Belt & rank progression', value: true },
            { name: 'Stripe payments', value: true },
            { name: 'Full event management', value: true },
            { name: 'Priority support (24h)', value: true },
            { name: 'Custom email templates', value: true },
            { name: 'Advanced reports', value: true },
            { name: 'Custom domain', value: false },
            { name: 'White-label branding', value: false },
            { name: 'API access', value: false },
        ],
    },
    {
        name: 'Elite',
        price: 349,
        annual: 279,
        description: 'For large academies and franchises.',
        highlighted: false,
        cta: 'Book a Demo',
        ctaHref: '/demo',
        features: [
            { name: 'Members', value: 'Unlimited' },
            { name: 'Locations', value: 'Unlimited' },
            { name: 'Staff accounts', value: 'Unlimited' },
            { name: 'Member management', value: true },
            { name: 'Class scheduling', value: true },
            { name: 'Attendance tracking', value: true },
            { name: 'Belt & rank progression', value: true },
            { name: 'Stripe payments', value: true },
            { name: 'Full event management', value: true },
            { name: 'Dedicated support + SLA', value: true },
            { name: 'Custom email templates', value: true },
            { name: 'Advanced reports', value: true },
            { name: 'Custom domain', value: true },
            { name: 'White-label branding', value: true },
            { name: 'API access & webhooks', value: true },
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
                            Simple, honest pricing
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xl)' }}>
                            No hidden fees. No per-member charges. One flat price for your entire club. Start with a 14-day free trial.
                        </p>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-6) var(--space-6) var(--space-20)' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 'var(--space-6)',
                        }}>
                            {tiers.map((tier) => (
                                <div
                                    key={tier.name}
                                    className={tier.highlighted ? '' : 'glass-card'}
                                    style={{
                                        padding: 'var(--space-8)',
                                        borderRadius: 'var(--radius-2xl)',
                                        position: 'relative',
                                        ...(tier.highlighted ? {
                                            background: 'var(--bg-primary)',
                                            border: '2px solid var(--color-gold)',
                                            boxShadow: '0 8px 40px rgba(197, 164, 86, 0.2)',
                                        } : {}),
                                    }}
                                >
                                    {tier.highlighted && (
                                        <div style={{
                                            position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                            background: 'var(--color-gold-gradient)', color: 'var(--color-black)',
                                            padding: 'var(--space-1) var(--space-4)', borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--text-xs)', fontWeight: '700', textTransform: 'uppercase',
                                        }}>
                                            Most Popular
                                        </div>
                                    )}

                                    <h3 style={{
                                        fontSize: 'var(--text-xl)',
                                        color: tier.highlighted ? 'var(--color-gold)' : 'var(--text-primary)',
                                        marginBottom: 'var(--space-2)',
                                    }}>
                                        {tier.name}
                                    </h3>

                                    <div style={{ marginBottom: 'var(--space-2)' }}>
                                        <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '800' }}>£{tier.price}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>/month</span>
                                    </div>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                                        or £{tier.annual}/mo billed annually
                                    </p>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                                        {tier.description}
                                    </p>

                                    <Link
                                        href={tier.ctaHref}
                                        className={tier.highlighted ? 'btn btn-primary' : 'btn btn-outline'}
                                        style={{ width: '100%', marginBottom: 'var(--space-6)' }}
                                    >
                                        {tier.cta}
                                        {tier.highlighted && <ArrowRight size={16} />}
                                    </Link>

                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                        {tier.features.map((f) => (
                                            <li key={f.name} style={{
                                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                fontSize: 'var(--text-sm)',
                                                color: f.value === false ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                            }}>
                                                {f.value === false ? (
                                                    <X size={16} color="var(--text-tertiary)" />
                                                ) : (
                                                    <CheckCircle2 size={16} color="var(--color-gold)" />
                                                )}
                                                {typeof f.value === 'string' ? `${f.name}: ${f.value}` : f.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-8)', marginBottom: 0 }}>
                            All plans include a 2.5% platform fee on member payments processed through Stripe.
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-16) var(--space-6)' }}>
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
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Ready to get started?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                            Start your 14-day free trial. Full Pro features, no credit card required.
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
