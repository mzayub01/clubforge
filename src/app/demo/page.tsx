'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, CheckCircle2, Zap, Loader2, Send, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const DIAL_CODES = [
    { code: '+44', country: '🇬🇧', label: 'UK (+44)' },
    { code: '+1', country: '🇺🇸', label: 'US (+1)' },
    { code: '+353', country: '🇮🇪', label: 'Ireland (+353)' },
    { code: '+61', country: '🇦🇺', label: 'Australia (+61)' },
    { code: '+64', country: '🇳🇿', label: 'New Zealand (+64)' },
    { code: '+1', country: '🇨🇦', label: 'Canada (+1)' },
    { code: '+91', country: '🇮🇳', label: 'India (+91)' },
    { code: '+971', country: '🇦🇪', label: 'UAE (+971)' },
    { code: '+966', country: '🇸🇦', label: 'Saudi Arabia (+966)' },
    { code: '+974', country: '🇶🇦', label: 'Qatar (+974)' },
    { code: '+973', country: '🇧🇭', label: 'Bahrain (+973)' },
    { code: '+965', country: '🇰🇼', label: 'Kuwait (+965)' },
    { code: '+968', country: '🇴🇲', label: 'Oman (+968)' },
    { code: '+92', country: '🇵🇰', label: 'Pakistan (+92)' },
    { code: '+90', country: '🇹🇷', label: 'Turkey (+90)' },
    { code: '+49', country: '🇩🇪', label: 'Germany (+49)' },
    { code: '+33', country: '🇫🇷', label: 'France (+33)' },
    { code: '+34', country: '🇪🇸', label: 'Spain (+34)' },
    { code: '+39', country: '🇮🇹', label: 'Italy (+39)' },
    { code: '+31', country: '🇳🇱', label: 'Netherlands (+31)' },
    { code: '+46', country: '🇸🇪', label: 'Sweden (+46)' },
    { code: '+47', country: '🇳🇴', label: 'Norway (+47)' },
    { code: '+45', country: '🇩🇰', label: 'Denmark (+45)' },
    { code: '+48', country: '🇵🇱', label: 'Poland (+48)' },
    { code: '+351', country: '🇵🇹', label: 'Portugal (+351)' },
    { code: '+55', country: '🇧🇷', label: 'Brazil (+55)' },
    { code: '+52', country: '🇲🇽', label: 'Mexico (+52)' },
    { code: '+27', country: '🇿🇦', label: 'South Africa (+27)' },
    { code: '+81', country: '🇯🇵', label: 'Japan (+81)' },
    { code: '+82', country: '🇰🇷', label: 'South Korea (+82)' },
    { code: '+65', country: '🇸🇬', label: 'Singapore (+65)' },
    { code: '+60', country: '🇲🇾', label: 'Malaysia (+60)' },
    { code: '+63', country: '🇵🇭', label: 'Philippines (+63)' },
    { code: '+234', country: '🇳🇬', label: 'Nigeria (+234)' },
    { code: '+254', country: '🇰🇪', label: 'Kenya (+254)' },
    { code: '+20', country: '🇪🇬', label: 'Egypt (+20)' },
];

const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'var(--color-white)',
};

export default function DemoPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        dialCode: '+44',
        phone: '',
        clubName: '',
        clubType: '',
        memberCount: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.email) {
            setError('Please fill in your name and email.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/demo-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    phone: form.phone ? `${form.dialCode} ${form.phone}` : '',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong');
            }

            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Navbar user={null} />

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
                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
                                        background: 'rgba(34, 197, 94, 0.15)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto var(--space-4)',
                                    }}>
                                        <CheckCircle2 size={32} color="#22C55E" />
                                    </div>
                                    <h3 style={{ color: 'var(--color-white)', marginBottom: 'var(--space-2)' }}>
                                        Demo Requested! ✅
                                    </h3>
                                    <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>
                                        Thanks {form.name.split(' ')[0]}! We&apos;ve sent a confirmation to <strong style={{ color: 'var(--color-gold)' }}>{form.email}</strong>. A member of our team will be in touch within 24 hours to arrange your personalised walkthrough.
                                    </p>
                                    <Link href="/get-started" className="btn btn-primary" style={{ marginTop: 'var(--space-6)', display: 'inline-flex' }}>
                                        Or start your free trial now
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ color: 'var(--color-white)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-xl)' }}>
                                        Book your demo
                                    </h3>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                                Your name *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="John Smith"
                                                className="form-input"
                                                value={form.name}
                                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="john@mygym.com"
                                                className="form-input"
                                                value={form.email}
                                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                                Phone number
                                            </label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select
                                                    className="form-input"
                                                    value={form.dialCode}
                                                    onChange={e => setForm(f => ({ ...f, dialCode: e.target.value }))}
                                                    style={{
                                                        ...inputStyle,
                                                        width: '140px',
                                                        flexShrink: 0,
                                                        fontSize: 'var(--text-sm)',
                                                    }}
                                                >
                                                    {DIAL_CODES.map((dc, i) => (
                                                        <option key={`${dc.code}-${i}`} value={dc.code} style={{ background: '#1E293B', color: '#FFFFFF' }}>
                                                            {dc.country} {dc.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="tel"
                                                    placeholder="7700 900000"
                                                    className="form-input"
                                                    value={form.phone}
                                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^\d\s-]/g, '') }))}
                                                    style={{ ...inputStyle, flex: 1 }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                                Club name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Ironmonger BJJ"
                                                className="form-input"
                                                value={form.clubName}
                                                onChange={e => setForm(f => ({ ...f, clubName: e.target.value }))}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                                Club type
                                            </label>
                                            <select
                                                className="form-input"
                                                value={form.clubType}
                                                onChange={e => setForm(f => ({ ...f, clubType: e.target.value }))}
                                                style={inputStyle}
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
                                                value={form.memberCount}
                                                onChange={e => setForm(f => ({ ...f, memberCount: e.target.value }))}
                                                style={inputStyle}
                                            >
                                                <option value="" style={{ background: '#1E293B', color: '#FFFFFF' }}>Select...</option>
                                                <option value="1-50" style={{ background: '#1E293B', color: '#FFFFFF' }}>1-50</option>
                                                <option value="51-150" style={{ background: '#1E293B', color: '#FFFFFF' }}>51-150</option>
                                                <option value="151-500" style={{ background: '#1E293B', color: '#FFFFFF' }}>151-500</option>
                                                <option value="500+" style={{ background: '#1E293B', color: '#FFFFFF' }}>500+</option>
                                            </select>
                                        </div>
                                        {error && (
                                            <p style={{ color: '#EF4444', fontSize: 'var(--text-sm)', margin: 0 }}>
                                                {error}
                                            </p>
                                        )}
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg"
                                            disabled={submitting}
                                            style={{ width: '100%', marginTop: 'var(--space-2)', opacity: submitting ? 0.7 : 1 }}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 size={18} className="spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Request Demo
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                        <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-xs)', margin: 0, textAlign: 'center' }}>
                                            We&apos;ll get back to you within 24 hours.
                                        </p>
                                    </form>
                                </>
                            )}
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
                            Skip the call. Start a 14-day free trial with full Pro features and see everything for yourself.
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
