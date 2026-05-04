import Link from 'next/link';
import { CreditCard, ArrowRight, RefreshCw, Receipt, Tag, BarChart3, Shield, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';
import RelatedDisciplines from '@/components/RelatedDisciplines';
import RelatedFeatures from '@/components/RelatedFeatures';

export const metadata = {
    title: 'Gym Billing & Payment Software — Stripe-Powered | ClubForge',
    description: 'Stripe-powered gym billing software: automated subscriptions, invoicing, promo codes, and real-time revenue dashboards. PCI-compliant payment processing built for gyms, dojos, and martial arts clubs. Start free trial.',
    alternates: { canonical: 'https://clubforgehq.com/features/payments-billing' },
    openGraph: {
        title: 'Gym Payment & Billing Software — ClubForge',
        description: 'Stripe subscriptions, automated invoicing, promo codes & revenue dashboards.',
        url: 'https://clubforgehq.com/features/payments-billing',
    },
    keywords: [
        'gym billing software', 'gym payment software Stripe', 'martial arts billing software',
        'gym subscription management', 'gym invoicing software', 'fitness membership billing',
        'gym payment processing', 'automated gym billing', 'gym revenue dashboard',
        'club payment management', 'gym promo codes software',
    ],
};

const faqs = [
    { question: 'Which payment processor does ClubForge use?', answer: 'ClubForge uses Stripe — the industry-standard payment processor trusted by millions of businesses worldwide. Stripe handles all payment security (PCI DSS Level 1 compliance), supports credit/debit cards and direct debit, and operates in 40+ countries.' },
    { question: 'Can I set up recurring memberships?', answer: 'Yes. Create membership tiers (e.g., Starter, Unlimited, Family) with monthly or annual billing. Members subscribe during sign-up or upgrade later. Stripe handles all recurring charges, retries failed payments, and notifies you of cancellations.' },
    { question: 'Can members pay for events and one-off purchases?', answer: 'Absolutely. Besides memberships, ClubForge supports one-time payments for events, seminars, competitions, and merchandise. Members pay directly through the platform with Stripe, and you see everything in one revenue dashboard.' },
    { question: 'Do you support promo codes and discounts?', answer: 'Yes. Create percentage or fixed-amount promo codes for specific membership tiers. Great for early-bird offers, referral discounts, family rates, or promotional campaigns. You control the terms and expiry.' },
    { question: 'What is the 2.5% platform fee?', answer: 'ClubForge charges a 2.5% platform fee on payments processed through Stripe, on top of Stripe\'s standard processing fee (~1.4% + 20p for UK cards). This keeps our subscription plans affordable while allowing us to provide the infrastructure and support you need.' },
];

export default async function PaymentsBillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Features', url: 'https://clubforgehq.com/features' },
                { name: 'Payments & Billing', url: 'https://clubforgehq.com/features/payments-billing' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: '#FAFBFC', padding: '140px 24px 80px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C5A456', fontSize: '14px', fontWeight: '600', textDecoration: 'none', marginBottom: '24px' }}>← All Features</Link>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <CreditCard size={32} color="#EC4899" />
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: '800', lineHeight: '1.1', color: '#0F172A', marginBottom: '20px' }}>
                            Gym Billing{' '}
                            <span style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Powered by Stripe</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: '1.7', marginBottom: '32px', maxWidth: '650px' }}>
                            Stop chasing payments. ClubForge connects directly to Stripe for automated subscriptions, invoicing, promo codes, and real-time revenue dashboards. Get paid on time, every time.
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
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>Every payment, managed from one dashboard</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: RefreshCw, title: 'Automated Subscriptions', desc: 'Create membership tiers with monthly or annual billing. Members subscribe during signup, and Stripe handles recurring charges, failed payment retries, and card updates automatically.' },
                                { icon: Receipt, title: 'Invoicing & Payment History', desc: 'Every payment is logged with date, amount, member, and plan. Members see their own payment history. You see a complete financial record with no manual bookkeeping.' },
                                { icon: Tag, title: 'Promo Codes & Discounts', desc: 'Create percentage or fixed-amount promo codes for any membership tier. Use them for early-bird offers, referral programs, family discounts, or seasonal campaigns. You set the terms and expiry.' },
                                { icon: BarChart3, title: 'Revenue Dashboard', desc: 'Real-time dashboards showing MRR, total revenue, payment success rates, active subscriptions, and churn. At a glance, see the financial health of your club.' },
                                { icon: Shield, title: 'PCI-Compliant & Secure', desc: 'Stripe is PCI DSS Level 1 certified — the highest level of payment security. Card details never touch your server. Members pay confidently knowing their data is secure.' },
                                { icon: Zap, title: 'Event & One-Off Payments', desc: 'Beyond memberships, accept payments for seminars, competitions, workshops, and merchandise. Stripe handles it all, and everything shows up in your unified revenue dashboard.' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(236,72,153,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <item.icon size={24} color="#EC4899" />
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
                        <RelatedFeatures currentHref="/features/payments-billing" />
                        <RelatedDisciplines currentHref="" maxItems={4} />
                    </div>
                </section>

                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Stop chasing payments. Start automating them.</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. Connect Stripe in minutes.</p>
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
