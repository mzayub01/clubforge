import Link from 'next/link';
import {
    Users, UserPlus, Heart, Search, Shield, ArrowRight, CheckCircle2,
    ChevronRight, Smartphone, FileText,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';
import RelatedDisciplines from '@/components/RelatedDisciplines';
import RelatedFeatures from '@/components/RelatedFeatures';

export const metadata = {
    title: 'Member Management Software for Gyms & Martial Arts Clubs | ClubForge',
    description: 'Complete gym member management: profiles, family accounts, self-registration, automated onboarding, CRM, and member portals. Manage every relationship from one dashboard. Start your 14-day free trial.',
    alternates: {
        canonical: 'https://clubforgehq.com/features/member-management',
    },
    openGraph: {
        title: 'Gym Member Management Software — ClubForge',
        description: 'Profiles, family accounts, self-registration, and automated onboarding. Manage every member from one dashboard.',
        url: 'https://clubforgehq.com/features/member-management',
    },
    keywords: [
        'gym member management software',
        'membership management system',
        'gym CRM software',
        'martial arts member management',
        'gym member portal',
        'family account gym management',
        'gym member self registration',
        'club membership software',
        'fitness member management',
        'gym member database',
    ],
};

const faqs = [
    {
        question: 'Can members register themselves online?',
        answer: 'Yes. ClubForge provides a branded self-registration page where new members can sign up, select a membership tier, agree to your waiver, and pay via Stripe — all without you lifting a finger. You get notified of every new signup.',
    },
    {
        question: 'How do family accounts work?',
        answer: 'Parents create one account and add their children underneath it. They can manage all family members, check kids into classes, view progress for each child, and receive a single consolidated bill. You see and manage the family as one unit.',
    },
    {
        question: 'Can I import my existing member data?',
        answer: 'Absolutely. ClubForge supports CSV import for member data. On Pro and Elite plans, our team can also assist with migration from other platforms like spreadsheets, Zen Planner, Kicksite, or any other system.',
    },
    {
        question: 'What information is stored in member profiles?',
        answer: 'Each profile includes contact details, emergency contacts, medical notes, membership tier, payment history, attendance records, belt/rank progression, grading history, waiver status, and any custom notes you add. It\'s a complete 360° view of every member.',
    },
    {
        question: 'Do members get their own portal?',
        answer: 'Yes. Every member gets a branded mobile-friendly dashboard where they can view their schedule, check into classes, track their belt progression, see grading feedback, manage their payment details, and stay connected — all without contacting you.',
    },
];

export default async function MemberManagementPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Features', url: 'https://clubforgehq.com/features' },
                { name: 'Member Management', url: 'https://clubforgehq.com/features/member-management' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                {/* Hero */}
                <section style={{
                    background: '#FAFBFC', padding: '140px 24px 80px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
                        top: '-150px', right: '-100px', pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <Link href="/features" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            color: '#C5A456', fontSize: '14px', fontWeight: '600',
                            textDecoration: 'none', marginBottom: '24px',
                        }}>
                            ← All Features
                        </Link>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'rgba(59,130,246,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px',
                        }}>
                            <Users size={32} color="#3B82F6" />
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: '800',
                            lineHeight: '1.1', color: '#0F172A', marginBottom: '20px',
                        }}>
                            Gym Member Management{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>
                                That Runs Itself
                            </span>
                        </h1>
                        <p style={{
                            fontSize: '1.15rem', color: '#64748B', lineHeight: '1.7',
                            marginBottom: '32px', maxWidth: '650px',
                        }}>
                            Stop managing members across spreadsheets, WhatsApp, and notebooks. ClubForge gives you a complete member database with profiles, family accounts, self-registration, and a branded member portal — all from one dashboard.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                color: '#0F172A', padding: '14px 32px', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
                            }}>
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <Link href="/demo" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                border: '2px solid #E2E8F0', color: '#334155',
                                padding: '14px 32px', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: '600', textDecoration: 'none',
                            }}>
                                Book a Demo
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Problem */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A, #1E293B)',
                    padding: '80px 24px', color: '#FFFFFF',
                }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', marginBottom: '20px' }}>
                            Sound familiar?
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '32px' }}>
                            {[
                                'Member details scattered across Google Sheets, notebooks, and WhatsApp',
                                'Parents constantly messaging to ask about their child\'s progress',
                                'No idea which members are active, lapsed, or about to leave',
                                'Manually onboarding every new member with paperwork and emails',
                            ].map((pain) => (
                                <div key={pain} style={{
                                    padding: '20px 24px', borderRadius: '14px',
                                    background: 'rgba(239,68,68,0.06)',
                                    border: '1px solid rgba(239,68,68,0.12)',
                                    textAlign: 'left',
                                }}>
                                    <p style={{ color: '#FCA5A5', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                                        ✗ {pain}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Feature Deep-Dive */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '48px',
                        }}>
                            How ClubForge transforms your member management
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                {
                                    icon: FileText,
                                    title: 'Complete Member Profiles',
                                    desc: 'Every member gets a rich profile: contact details, emergency contacts, medical notes, membership tier, payment history, attendance records, belt rank, grading history, and waiver status. One place for everything.',
                                },
                                {
                                    icon: Heart,
                                    title: 'Family Accounts',
                                    desc: 'Parents manage all their children from one login. Check kids into class, view progress for each child, and receive a single consolidated bill. You manage one family, not five separate accounts.',
                                },
                                {
                                    icon: UserPlus,
                                    title: 'Self-Registration & Onboarding',
                                    desc: 'Share your branded registration link. New members sign up, select their membership, agree to your waiver, and pay via Stripe — automatically. You get notified; they get onboarded. Zero admin.',
                                },
                                {
                                    icon: Smartphone,
                                    title: 'Branded Member Portal',
                                    desc: 'Every member gets their own mobile-friendly dashboard. They check into class, track belt progression, view schedules, manage payments, and see grading feedback — without messaging you.',
                                },
                                {
                                    icon: Search,
                                    title: 'Smart Search & Filters',
                                    desc: 'Find any member instantly. Filter by membership tier, belt rank, attendance frequency, payment status, join date, or location. Identify at-risk members before they lapse.',
                                },
                                {
                                    icon: Shield,
                                    title: 'Data Security & GDPR Compliance',
                                    desc: 'All member data is encrypted, tenant-isolated with row-level security, and fully GDPR compliant. Members can export or delete their data anytime. Your members\' trust is safe with us.',
                                },
                            ].map((item) => (
                                <div key={item.title} style={{
                                    display: 'flex', gap: '24px', alignItems: 'flex-start',
                                    padding: '28px', borderRadius: '16px',
                                    border: '1px solid #F1F5F9', background: '#FAFBFC',
                                }}>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '14px',
                                        background: 'rgba(59,130,246,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <item.icon size={24} color="#3B82F6" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                                            {item.title}
                                        </h3>
                                        <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.95rem' }}>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800',
                            color: '#0F172A', textAlign: 'center', marginBottom: '40px',
                        }}>
                            Frequently Asked Questions
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {faqs.map((faq) => (
                                <div key={faq.question} style={{
                                    padding: '24px', borderRadius: '14px',
                                    background: '#FFFFFF', border: '1px solid #F1F5F9',
                                }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                                        {faq.question}
                                    </h3>
                                    <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ background: '#FFFFFF', padding: '60px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <RelatedFeatures currentHref="/features/member-management" />
                        <RelatedDisciplines currentHref="" maxItems={4} />
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
                            Ready to manage your members properly?
                        </h2>
                        <p style={{
                            color: 'rgba(15,23,42,0.6)', fontSize: '1rem',
                            marginBottom: '32px', lineHeight: '1.7',
                        }}>
                            Start a 14-day free trial. Import your existing members or start fresh.
                        </p>
                        <Link href="/get-started" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: '#0F172A', color: '#FFFFFF',
                            padding: '14px 32px', borderRadius: '12px',
                            fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
                        }}>
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
