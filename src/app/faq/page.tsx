'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqItems: FAQItem[] = [
    // Getting Started
    {
        category: 'Getting Started',
        question: 'How do I get started with ClubForge?',
        answer: 'Sign up for a 14-day free trial — no credit card required. You\'ll get full access to Pro features so you can explore everything. Set up your club profile, add your locations, create classes, and invite your team. The whole setup takes under 10 minutes.',
    },
    {
        category: 'Getting Started',
        question: 'How long does it take to set up?',
        answer: 'Most clubs are fully set up within 30 minutes. Our onboarding wizard walks you through configuring your club name, branding, locations, class schedule, and membership types. You can be accepting member registrations the same day.',
    },
    {
        category: 'Getting Started',
        question: 'Can I import my existing member data?',
        answer: 'Yes. ClubForge supports CSV import for member data including names, emails, membership types, belt ranks, and more. On Pro and Elite plans, our team can assist with data migration from other platforms.',
    },

    // Features
    {
        category: 'Features',
        question: 'What types of clubs is ClubForge built for?',
        answer: 'ClubForge is designed for any club with members, classes, and coaches. It\'s especially powerful for martial arts gyms (BJJ, MMA, Karate, Taekwondo), boxing clubs, CrossFit boxes, dance studios, youth sports organisations, and fitness academies. The platform adapts terminology to match your club type.',
    },
    {
        category: 'Features',
        question: 'Does ClubForge support belt and rank progression?',
        answer: 'Yes — this is one of our unique strengths. ClubForge includes a full structured ranking system with adult and youth belt schemes, grading history, coach feedback, and promotion audit trails. No other platform does this natively.',
    },
    {
        category: 'Features',
        question: 'Can I manage multiple locations?',
        answer: 'Absolutely. Pro plans support up to 3 locations, and Elite plans offer unlimited locations. You get unified reporting, cross-site member management, and location-specific settings all from one dashboard.',
    },
    {
        category: 'Features',
        question: 'How does attendance tracking work?',
        answer: 'Members check in to classes via the member portal with one tap. Coaches and staff can also check in members manually. You get real-time attendance reports, retention insights, and the ability for parents to check in their children.',
    },

    // Billing & Pricing
    {
        category: 'Billing & Pricing',
        question: 'How does billing work?',
        answer: 'ClubForge uses Stripe for all payment processing. You connect your own Stripe account, set up your membership prices, and your members pay you directly. ClubForge takes a 2.5% platform fee on each transaction, plus Stripe\'s standard processing fees.',
    },
    {
        category: 'Billing & Pricing',
        question: 'What\'s the difference between the plans?',
        answer: 'Starter (£39/mo) is for small clubs with up to 150 members and 1 location. Pro (£129/mo) supports up to 750 members, 3 locations, and adds advanced features like email templates and priority support. Elite (£349/mo) is for large organisations with unlimited everything, custom domains, and white-label branding.',
    },
    {
        category: 'Billing & Pricing',
        question: 'Can I cancel anytime?',
        answer: 'Yes, you can cancel your ClubForge subscription at any time from your admin settings. There are no long-term contracts. After cancellation, your data is retained for 90 days in case you wish to come back.',
    },
    {
        category: 'Billing & Pricing',
        question: 'Do you offer annual billing?',
        answer: 'Yes — save 20% with annual billing. Starter is £31/mo, Pro is £103/mo, and Elite is £279/mo when billed annually.',
    },

    // Security & Data
    {
        category: 'Security & Data',
        question: 'Is my data secure?',
        answer: 'Yes. ClubForge uses enterprise-grade databases with row-level security ensuring complete data isolation between clubs. All data is encrypted in transit and at rest. We never share your data with third parties.',
    },
    {
        category: 'Security & Data',
        question: 'Can I export my data?',
        answer: 'Always. We believe your data belongs to you, not us. Starter plans can export member data as CSV. Pro plans include full CSV and JSON export. Elite plans get API access for automated data sync.',
    },
    {
        category: 'Security & Data',
        question: 'Where is the data stored?',
        answer: 'ClubForge runs on a global edge network with enterprise-grade cloud infrastructure. Your data is stored securely with automated backups and high availability.',
    },

    // Support
    {
        category: 'Support',
        question: 'What support do you offer?',
        answer: 'Starter plans include email support with 48-hour response times. Pro plans get priority email support with 24-hour responses. Elite plans receive dedicated support with an SLA guarantee. All plans have access to our documentation and help centre.',
    },
    {
        category: 'Support',
        question: 'Can I get a demo before signing up?',
        answer: 'Of course! Book a personalised 30-minute demo at clubforgehq.com/demo. We\'ll walk you through the platform tailored to your specific club type and needs.',
    },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const categories = [...new Set(faqItems.map(item => item.category))];

    return (
        <>
            <Navbar />

            <main>
                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    padding: 'var(--space-16) var(--space-6)',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <h1 style={{ marginBottom: 'var(--space-4)' }}>Frequently Asked Questions</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xl)' }}>
                            Everything you need to know about ClubForge. Can&apos;t find what you&apos;re looking for?{' '}
                            <a href="mailto:support@clubforgehq.com" style={{ color: 'var(--color-gold)' }}>Get in touch</a>.
                        </p>
                    </div>
                </section>

                {/* FAQ Content */}
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-6) var(--space-6) var(--space-16)' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {categories.map((category) => (
                            <div key={category} style={{ marginBottom: 'var(--space-10)' }}>
                                <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', color: 'var(--color-gold)' }}>
                                    {category}
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {faqItems
                                        .filter(item => item.category === category)
                                        .map((item) => {
                                            const globalIndex = faqItems.indexOf(item);
                                            const isOpen = openIndex === globalIndex;
                                            return (
                                                <div
                                                    key={globalIndex}
                                                    className="glass-card"
                                                    style={{ padding: 0, cursor: 'pointer' }}
                                                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                                >
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: 'var(--space-4) var(--space-5)',
                                                        gap: 'var(--space-3)',
                                                    }}>
                                                        <h4 style={{ fontSize: 'var(--text-base)', margin: 0, fontWeight: '500', flex: 1 }}>
                                                            {item.question}
                                                        </h4>
                                                        <ChevronDown
                                                            size={20}
                                                            color="var(--text-tertiary)"
                                                            style={{
                                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s ease',
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    </div>
                                                    {isOpen && (
                                                        <div style={{
                                                            padding: '0 var(--space-5) var(--space-4)',
                                                            borderTop: '1px solid var(--border-light)',
                                                            paddingTop: 'var(--space-4)',
                                                        }}>
                                                            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.7', fontSize: 'var(--text-sm)' }}>
                                                                {item.answer}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={{
                    background: 'var(--bg-secondary)', padding: 'var(--space-16) var(--space-6)', textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Still have questions?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                            Book a demo with our team or start a free trial and explore for yourself.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/get-started" className="btn btn-primary btn-lg">
                                Start Free Trial
                                <ArrowRight size={20} />
                            </Link>
                            <Link href="/demo" className="btn btn-outline btn-lg">
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
