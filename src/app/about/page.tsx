import Link from 'next/link';
import {
    ArrowRight, Shield, Heart, Zap, Target,
    Users, Globe, Award, Lightbulb,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'About | ClubForge',
    description: 'ClubForge was born from running a real club. We know the chaos of spreadsheets, WhatsApp, and duct-taped admin — so we built something better.',
};

export default async function AboutPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />

            <main>
                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    padding: 'var(--space-16) var(--space-6)',
                    textAlign: 'center',
                }}>
                    <div className="container" style={{ maxWidth: '750px', margin: '0 auto' }}>
                        <h1 style={{ marginBottom: 'var(--space-4)' }}>
                            Built by club operators,{' '}
                            <span style={{
                                background: 'var(--color-gold-gradient)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>for club operators</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xl)', lineHeight: '1.7' }}>
                            ClubForge wasn&apos;t designed in a boardroom. It was born from the chaos of actually running a club — managing members in spreadsheets, chasing payments on WhatsApp, and losing hours every week to admin that should have been automated.
                        </p>
                    </div>
                </section>

                {/* Origin Story */}
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-16) var(--space-6)' }}>
                    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: 'var(--space-6)' }}>The problem we lived</h2>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: '1.8' }}>
                            <p>
                                We ran a martial arts club. It started small — 20 members, one location, weekly classes. Simple enough.
                            </p>
                            <p>
                                Then it grew. 50 members. Then 100. Then a second location. Suddenly we were drowning: a Google Sheet for members, Stripe for payments (manually matched), WhatsApp for announcements, a notebook for belt gradings, and Excel for attendance.
                            </p>
                            <p>
                                We tried existing gym software. They were either built for yoga studios and didn&apos;t understand belt progression, or built for enterprise chains and cost a fortune. None of them understood what it means to actually <strong>run a club</strong> — with coaches, gradings, progression, and the operational structure that a serious club needs.
                            </p>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                So we built ClubForge. The system we wished existed.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-16) var(--space-6)' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
                            background: 'var(--color-gold-gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto var(--space-6)',
                        }}>
                            <Target size={28} color="var(--color-black)" />
                        </div>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Our mission</h2>
                        <p style={{
                            color: 'var(--text-secondary)', fontSize: 'var(--text-xl)',
                            lineHeight: '1.8', maxWidth: '700px', margin: '0 auto',
                        }}>
                            To give every club owner the tools, structure, and clarity to run their club like a real operation — without the enterprise price tag, the generic fitness software, or the duct tape.
                        </p>
                    </div>
                </section>

                {/* Values */}
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-16) var(--space-6)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>What we believe</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
                            {[
                                {
                                    icon: Shield,
                                    title: 'Reliability over features',
                                    desc: 'We\'d rather have 10 rock-solid features than 100 half-baked ones. Your club runs on this — it has to work.',
                                },
                                {
                                    icon: Lightbulb,
                                    title: 'Structure creates freedom',
                                    desc: 'Clear roles, audit trails, and processes aren\'t bureaucracy — they\'re what let you scale without chaos.',
                                },
                                {
                                    icon: Heart,
                                    title: 'Your data, your members',
                                    desc: 'Export everything, anytime. No lock-in, no hostage data. If you leave, your data comes with you.',
                                },
                                {
                                    icon: Zap,
                                    title: 'Simple beats clever',
                                    desc: 'We ship things that work, not things that impress at demos. If it saves you time, it ships.',
                                },
                            ].map((value) => (
                                <div key={value.title} className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: 'var(--radius-full)',
                                        background: 'rgba(197, 164, 86, 0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto var(--space-4)',
                                    }}>
                                        <value.icon size={24} color="var(--color-gold)" />
                                    </div>
                                    <h4 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-lg)' }}>{value.title}</h4>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Numbers */}
                <section style={{
                    background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)',
                    padding: 'var(--space-16) var(--space-6)',
                    color: 'var(--color-white)',
                }}>
                    <div style={{
                        maxWidth: '900px', margin: '0 auto',
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 'var(--space-8)', textAlign: 'center',
                    }}>
                        {[
                            { label: 'Built from', value: 'Real experience', icon: Award },
                            { label: 'Designed for', value: 'Club operators', icon: Users },
                            { label: 'Ambition', value: 'Global scale', icon: Globe },
                        ].map(stat => (
                            <div key={stat.label}>
                                <stat.icon size={32} color="#C5A456" style={{ marginBottom: 'var(--space-3)' }} />
                                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', marginBottom: 'var(--space-1)' }}>
                                    {stat.value}
                                </div>
                                <div style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Join the movement</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>
                            We&apos;re building the operating system for clubs worldwide. Start your free trial and be part of it.
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
