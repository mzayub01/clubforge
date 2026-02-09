import Link from 'next/link';
import { Calendar, ArrowRight, CheckCircle2, Monitor, Users, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'Book a Demo — See ClubForge in Action',
    description: 'Get a personalised 30-minute walkthrough of ClubForge. See member management, class scheduling, belt progression, and billing features tailored to your club.',
    alternates: {
        canonical: 'https://clubforgehq.com/demo',
    },
    openGraph: {
        title: 'Book a Demo — See ClubForge in Action',
        description: 'Get a personalised walkthrough tailored to your club.',
        url: 'https://clubforgehq.com/demo',
    },
};

export default async function DemoPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />

            <main>
                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)',
                    padding: 'var(--space-20) var(--space-6)',
                    color: 'var(--color-white)',
                }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-12)', alignItems: 'center' }}>
                        {/* Left */}
                        <div>
                            <h1 style={{ color: 'var(--color-white)', marginBottom: 'var(--space-4)' }}>
                                See ClubForge{' '}
                                <span style={{
                                    background: 'var(--color-gold-gradient)', WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                }}>in action</span>
                            </h1>
                            <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-lg)', lineHeight: '1.7', marginBottom: 'var(--space-6)' }}>
                                Get a personalised walkthrough of how ClubForge can transform the way you run your club. We&apos;ll show you the features that matter most for your specific setup.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {[
                                    'Personalised to your club type and size',
                                    '30-minute live walkthrough',
                                    'See member management, classes, and billing in action',
                                    'Get your questions answered by our team',
                                ].map(item => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-300)' }}>
                                        <CheckCircle2 size={16} color="#C5A456" />
                                        <span style={{ fontSize: 'var(--text-sm)' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — Demo Form */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-2xl)',
                            border: '1px solid rgba(255,255,255,0.1)', padding: 'var(--space-8)',
                        }}>
                            <h3 style={{ color: 'var(--color-white)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-xl)' }}>
                                Book your demo
                            </h3>
                            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                        Your name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Smith"
                                        className="form-input"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-white)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john@mygym.com"
                                        className="form-input"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-white)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                        Club name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ironmonger BJJ"
                                        className="form-input"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-white)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                        Club type
                                    </label>
                                    <select
                                        className="form-input"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-white)' }}
                                    >
                                        <option value="" style={{ background: '#1E293B', color: '#FFFFFF' }}>Select...</option>
                                        <option value="bjj" style={{ background: '#1E293B', color: '#FFFFFF' }}>BJJ / Jiu-Jitsu</option>
                                        <option value="mma" style={{ background: '#1E293B', color: '#FFFFFF' }}>MMA / Boxing</option>
                                        <option value="karate" style={{ background: '#1E293B', color: '#FFFFFF' }}>Karate / Taekwondo</option>
                                        <option value="crossfit" style={{ background: '#1E293B', color: '#FFFFFF' }}>CrossFit</option>
                                        <option value="dance" style={{ background: '#1E293B', color: '#FFFFFF' }}>Dance / Gymnastics</option>
                                        <option value="youth" style={{ background: '#1E293B', color: '#FFFFFF' }}>Youth Sports</option>
                                        <option value="other" style={{ background: '#1E293B', color: '#FFFFFF' }}>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                        How many members do you have?
                                    </label>
                                    <select
                                        className="form-input"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-white)' }}
                                    >
                                        <option value="" style={{ background: '#1E293B', color: '#FFFFFF' }}>Select...</option>
                                        <option value="1-50" style={{ background: '#1E293B', color: '#FFFFFF' }}>1-50</option>
                                        <option value="51-150" style={{ background: '#1E293B', color: '#FFFFFF' }}>51-150</option>
                                        <option value="151-500" style={{ background: '#1E293B', color: '#FFFFFF' }}>151-500</option>
                                        <option value="500+" style={{ background: '#1E293B', color: '#FFFFFF' }}>500+</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                                    Request Demo
                                    <ArrowRight size={18} />
                                </button>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-xs)', margin: 0, textAlign: 'center' }}>
                                    We&apos;ll get back to you within 24 hours.
                                </p>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Or try it yourself */}
                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(197, 164, 86, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto var(--space-4)',
                        }}>
                            <Zap size={28} color="var(--color-gold)" />
                        </div>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Prefer to explore on your own?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>
                            Skip the call. Start a 14-day free trial with full Pro features and see everything for yourself. No credit card required.
                        </p>
                        <Link href="/get-started" className="btn btn-primary btn-lg">
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
