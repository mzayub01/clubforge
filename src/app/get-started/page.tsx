'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    User, Building2, MapPin, CreditCard, Rocket,
    ArrowRight, ArrowLeft, Check, Eye, EyeOff,
    AlertCircle, Loader2, Sparkles
} from 'lucide-react';

// -----------------------------------------------
// Types
// -----------------------------------------------

interface FormData {
    // Step 1
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    // Step 2
    clubName: string;
    slug: string;
    clubType: string;
    // Step 3
    address: string;
    city: string;
    postcode: string;
    clubPhone: string;
    clubEmail: string;
    // Step 4
    plan: 'starter' | 'pro' | 'elite';
    billingInterval: 'monthly' | 'annual';
    // Step 5
    termsAccepted: boolean;
}

const CLUB_TYPES = [
    { value: 'bjj', label: 'Brazilian Jiu-Jitsu' },
    { value: 'mma', label: 'MMA / Mixed Martial Arts' },
    { value: 'karate', label: 'Karate' },
    { value: 'taekwondo', label: 'Taekwondo' },
    { value: 'judo', label: 'Judo' },
    { value: 'boxing', label: 'Boxing' },
    { value: 'wrestling', label: 'Wrestling' },
    { value: 'muay_thai', label: 'Muay Thai' },
    { value: 'crossfit', label: 'CrossFit' },
    { value: 'dance', label: 'Dance Studio' },
    { value: 'swimming', label: 'Swimming Club' },
    { value: 'yoga', label: 'Yoga Studio' },
    { value: 'other', label: 'Other' },
];

const PLANS = [
    {
        id: 'starter' as const,
        name: 'Starter',
        monthlyPrice: 39,
        annualPrice: 31,
        description: 'For new and small clubs',
        features: ['Up to 150 members', '1 location', '3 staff', 'Stripe billing', 'Belt progression', 'Basic reports'],
    },
    {
        id: 'pro' as const,
        name: 'Pro',
        monthlyPrice: 129,
        annualPrice: 103,
        description: 'For established clubs scaling up',
        features: ['Up to 750 members', '3 locations', '10 staff', 'Events & waitlist', 'Email templates', 'Advanced reports'],
        popular: true,
    },
    {
        id: 'elite' as const,
        name: 'Elite',
        monthlyPrice: 349,
        annualPrice: 279,
        description: 'For large academies & franchises',
        features: ['Unlimited members', 'Unlimited locations', 'Unlimited staff', 'Custom domain', 'White-label', 'API access & SLA'],
    },
];

const STEPS = [
    { icon: User, label: 'Your Details' },
    { icon: Building2, label: 'Your Club' },
    { icon: MapPin, label: 'Location' },
    { icon: CreditCard, label: 'Choose Plan' },
    { icon: Rocket, label: 'Launch' },
];

// -----------------------------------------------
// Component
// -----------------------------------------------

export default function GetStartedPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [slugChecking, setSlugChecking] = useState(false);

    const [form, setForm] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        clubName: '',
        slug: '',
        clubType: 'bjj',
        address: '',
        city: '',
        postcode: '',
        clubPhone: '',
        clubEmail: '',
        plan: 'pro',
        billingInterval: 'monthly',
        termsAccepted: false,
    });

    // Auto-generate slug from club name
    useEffect(() => {
        if (form.clubName && !form.slug) {
            const generated = form.clubName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .slice(0, 50);
            updateField('slug', generated);
        }
    }, [form.clubName]);

    // Check slug availability with debounce
    useEffect(() => {
        if (!form.slug || form.slug.length < 3) {
            setSlugAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setSlugChecking(true);
            try {
                const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(form.slug)}`);
                const data = await res.json();
                setSlugAvailable(data.available);
            } catch {
                setSlugAvailable(null);
            } finally {
                setSlugChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [form.slug]);

    const updateField = (field: keyof FormData, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    const validateStep = (s: number): string | null => {
        switch (s) {
            case 1:
                if (!form.firstName.trim()) return 'First name is required';
                if (!form.lastName.trim()) return 'Last name is required';
                if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required';
                if (form.password.length < 8) return 'Password must be at least 8 characters';
                return null;
            case 2:
                if (!form.clubName.trim()) return 'Club name is required';
                if (!form.slug.trim() || form.slug.length < 3) return 'Club URL must be at least 3 characters';
                if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(form.slug)) return 'Club URL can only contain lowercase letters, numbers, and hyphens';
                if (slugAvailable === false) return 'This URL is already taken';
                return null;
            case 3:
                // Address is optional during onboarding
                return null;
            case 4:
                if (!form.plan) return 'Please select a plan';
                return null;
            case 5:
                if (!form.termsAccepted) return 'You must accept the Terms of Service';
                return null;
        }
        return null;
    };

    const nextStep = () => {
        const err = validateStep(step);
        if (err) {
            setError(err);
            return;
        }
        setError('');
        setStep(prev => Math.min(prev + 1, 5));
    };

    const prevStep = () => {
        setError('');
        setStep(prev => Math.max(prev - 1, 1));
    };

    // -----------------------------------------------
    // Submit
    // -----------------------------------------------

    const handleSubmit = async () => {
        const err = validateStep(5);
        if (err) {
            setError(err);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Success! Redirect to admin dashboard
            router.push('/login?onboarded=true&slug=' + data.slug);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create your club. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // -----------------------------------------------
    // Shared styles
    // -----------------------------------------------

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-primary)',
        fontSize: 'var(--text-base)',
        outline: 'none',
        transition: 'border-color 0.2s ease',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: 'var(--text-sm)',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-1)',
    };

    const fieldGroupStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
    };

    // -----------------------------------------------
    // Render Steps
    // -----------------------------------------------

    const renderStep1 = () => (
        <div style={fieldGroupStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                    <label style={labelStyle}>First Name *</label>
                    <input style={inputStyle} value={form.firstName}
                        onChange={e => updateField('firstName', e.target.value)} placeholder="John" autoFocus />
                </div>
                <div>
                    <label style={labelStyle}>Last Name *</label>
                    <input style={inputStyle} value={form.lastName}
                        onChange={e => updateField('lastName', e.target.value)} placeholder="Smith" />
                </div>
            </div>

            <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" value={form.email}
                    onChange={e => updateField('email', e.target.value)} placeholder="john@ironmongerbjj.com" />
            </div>

            <div>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                    <input style={inputStyle} type={showPassword ? 'text' : 'password'} value={form.password}
                        onChange={e => updateField('password', e.target.value)} placeholder="Minimum 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)'
                        }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" value={form.phone}
                    onChange={e => updateField('phone', e.target.value)} placeholder="+44 7xxx xxx xxx" />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div style={fieldGroupStyle}>
            <div>
                <label style={labelStyle}>Club Name *</label>
                <input style={inputStyle} value={form.clubName}
                    onChange={e => { updateField('clubName', e.target.value); updateField('slug', ''); }}
                    placeholder="e.g. Ironmonger BJJ" autoFocus />
            </div>

            <div>
                <label style={labelStyle}>Club URL *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <input
                        style={{ ...inputStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none' }}
                        value={form.slug}
                        onChange={e => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="ironmonger-bjj"
                    />
                    <span style={{
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        borderTopRightRadius: 'var(--radius-lg)',
                        borderBottomRightRadius: 'var(--radius-lg)',
                        color: 'var(--text-tertiary)',
                        fontSize: 'var(--text-sm)',
                        whiteSpace: 'nowrap',
                    }}>
                        .clubforgehq.com
                    </span>
                </div>
                {form.slug.length >= 3 && (
                    <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {slugChecking ? (
                            <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> <span style={{ color: 'var(--text-tertiary)' }}>Checking...</span></>
                        ) : slugAvailable === true ? (
                            <><Check size={14} color="var(--color-green)" /> <span style={{ color: 'var(--color-green)' }}>Available!</span></>
                        ) : slugAvailable === false ? (
                            <><AlertCircle size={14} color="var(--color-red)" /> <span style={{ color: 'var(--color-red)' }}>Already taken</span></>
                        ) : null}
                    </div>
                )}
            </div>

            <div>
                <label style={labelStyle}>Club Type *</label>
                <select style={inputStyle} value={form.clubType} onChange={e => updateField('clubType', e.target.value)}>
                    {CLUB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div style={fieldGroupStyle}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                You can add or update your address later from settings.
            </p>
            <div>
                <label style={labelStyle}>Street Address</label>
                <input style={inputStyle} value={form.address}
                    onChange={e => updateField('address', e.target.value)} placeholder="123 Main Street" autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                    <label style={labelStyle}>City</label>
                    <input style={inputStyle} value={form.city}
                        onChange={e => updateField('city', e.target.value)} placeholder="Manchester" />
                </div>
                <div>
                    <label style={labelStyle}>Postcode</label>
                    <input style={inputStyle} value={form.postcode}
                        onChange={e => updateField('postcode', e.target.value)} placeholder="M1 1AA" />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                    <label style={labelStyle}>Club Phone</label>
                    <input style={inputStyle} type="tel" value={form.clubPhone}
                        onChange={e => updateField('clubPhone', e.target.value)} placeholder="+44 xxx" />
                </div>
                <div>
                    <label style={labelStyle}>Club Email</label>
                    <input style={inputStyle} type="email" value={form.clubEmail}
                        onChange={e => updateField('clubEmail', e.target.value)} placeholder="info@yourclub.com" />
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => {
        const selectedPlan = PLANS.find(p => p.id === form.plan);
        return (
            <div style={fieldGroupStyle}>
                {/* Billing toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <button
                        onClick={() => updateField('billingInterval', 'monthly')}
                        style={{
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: form.billingInterval === 'monthly' ? 'var(--color-gold)' : 'var(--bg-secondary)',
                            color: form.billingInterval === 'monthly' ? 'var(--color-black)' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => updateField('billingInterval', 'annual')}
                        style={{
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: form.billingInterval === 'annual' ? 'var(--color-gold)' : 'var(--bg-secondary)',
                            color: form.billingInterval === 'annual' ? 'var(--color-black)' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                        }}
                    >
                        Annual <span style={{ color: form.billingInterval === 'annual' ? 'var(--color-black)' : 'var(--color-green)', fontWeight: '700' }}>Save 20%</span>
                    </button>
                </div>

                {/* Plan cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                    {PLANS.map(plan => {
                        const isSelected = form.plan === plan.id;
                        const price = form.billingInterval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                        return (
                            <div
                                key={plan.id}
                                onClick={() => updateField('plan', plan.id)}
                                style={{
                                    padding: 'var(--space-5)',
                                    borderRadius: 'var(--radius-xl)',
                                    background: isSelected ? 'rgba(197, 164, 86, 0.1)' : 'var(--bg-secondary)',
                                    border: isSelected ? '2px solid var(--color-gold)' : '2px solid var(--border-light)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                }}
                            >
                                {plan.popular && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        padding: '2px 12px',
                                        background: 'var(--color-gold)',
                                        color: 'var(--color-black)',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        borderRadius: 'var(--radius-full)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        Most Popular
                                    </div>
                                )}

                                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', margin: 0, marginBottom: 'var(--space-1)' }}>
                                    {plan.name}
                                </h3>

                                <div style={{ marginBottom: 'var(--space-3)' }}>
                                    <span style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', color: isSelected ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                                        £{price}
                                    </span>
                                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>/mo</span>
                                </div>

                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                                    {plan.description}
                                </p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--text-sm)' }}>
                                    {plan.features.map((f, i) => (
                                        <li key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            color: 'var(--text-secondary)', marginBottom: '4px',
                                        }}>
                                            <Check size={14} color="var(--color-green)" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {isSelected && (
                                    <div style={{
                                        marginTop: 'var(--space-3)',
                                        textAlign: 'center',
                                        color: 'var(--color-gold)',
                                        fontWeight: '600',
                                        fontSize: 'var(--text-sm)',
                                    }}>
                                        ✓ Selected
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                    All plans include a 14-day free trial. Cancel anytime.
                </p>
            </div>
        );
    };

    const renderStep5 = () => {
        const selectedPlan = PLANS.find(p => p.id === form.plan)!;
        const price = form.billingInterval === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;

        return (
            <div style={fieldGroupStyle}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--color-gold)', margin: 0 }}>
                    Review your details
                </h3>

                {/* Owner */}
                <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Owner</div>
                    <p style={{ margin: 0, fontWeight: '500' }}>{form.firstName} {form.lastName}</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{form.email}</p>
                </div>

                {/* Club */}
                <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Club</div>
                    <p style={{ margin: 0, fontWeight: '500' }}>{form.clubName}</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {form.slug}.clubforgehq.com · {CLUB_TYPES.find(t => t.value === form.clubType)?.label}
                    </p>
                    {form.city && <p style={{ margin: '4px 0 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>{form.city}{form.postcode ? `, ${form.postcode}` : ''}</p>}
                </div>

                {/* Plan */}
                <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Plan</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: '500' }}>{selectedPlan.name} — {form.billingInterval === 'annual' ? 'Annual' : 'Monthly'}</p>
                            <p style={{ margin: 0, color: 'var(--color-green)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>14-day free trial included</p>
                        </div>
                        <span style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--color-gold)' }}>
                            £{price}/mo
                        </span>
                    </div>
                </div>

                {/* Terms */}
                <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    cursor: 'pointer',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    background: form.termsAccepted ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                    border: form.termsAccepted ? '1px solid var(--color-green)' : '1px solid var(--border-light)',
                    transition: 'all 0.2s ease',
                }}>
                    <input
                        type="checkbox"
                        checked={form.termsAccepted}
                        onChange={e => updateField('termsAccepted', e.target.checked)}
                        style={{ marginTop: '3px', accentColor: 'var(--color-gold)' }}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        I agree to the <Link href="/terms" target="_blank" style={{ color: 'var(--color-gold)' }}>Terms of Service</Link> and{' '}
                        <Link href="/privacy" target="_blank" style={{ color: 'var(--color-gold)' }}>Privacy Policy</Link>.
                        I understand that my 14-day trial starts today, and I&apos;ll be billed £{price}/mo after the trial unless I cancel.
                    </span>
                </label>
            </div>
        );
    };

    // -----------------------------------------------
    // Main render
    // -----------------------------------------------

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            {/* Logo */}
            <Link href="/" style={{ marginBottom: 'var(--space-6)' }}>
                <Image src="/logo-clubforge-final-dark.svg" alt="ClubForge" width={200} height={52}
                    style={{ height: '50px', width: 'auto' }} priority />
            </Link>

            {/* Progress bar */}
            <div style={{ maxWidth: '600px', width: '100%', marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Track line */}
                    <div style={{
                        position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px',
                        background: 'var(--border-light)', zIndex: 0,
                    }} />
                    <div style={{
                        position: 'absolute', top: '16px', left: '10%', height: '2px',
                        background: 'var(--color-gold)', zIndex: 1,
                        width: `${((step - 1) / (STEPS.length - 1)) * 80}%`,
                        transition: 'width 0.3s ease',
                    }} />

                    {STEPS.map((s, i) => {
                        const StepIcon = s.icon;
                        const isActive = i + 1 === step;
                        const isComplete = i + 1 < step;
                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                    width: '34px', height: '34px', borderRadius: 'var(--radius-full)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: isComplete ? 'var(--color-gold)' : isActive ? 'rgba(197, 164, 86, 0.2)' : 'var(--bg-secondary)',
                                    border: isActive ? '2px solid var(--color-gold)' : '2px solid transparent',
                                    transition: 'all 0.3s ease',
                                }}>
                                    {isComplete ? (
                                        <Check size={16} color="var(--color-black)" />
                                    ) : (
                                        <StepIcon size={16} color={isActive ? 'var(--color-gold)' : 'var(--text-tertiary)'} />
                                    )}
                                </div>
                                <span style={{
                                    fontSize: '11px', marginTop: '6px',
                                    color: isActive ? 'var(--color-gold)' : isComplete ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                                    fontWeight: isActive ? '600' : '400',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form card */}
            <div className="glass-card" style={{
                maxWidth: step === 4 ? '800px' : '550px',
                width: '100%',
                padding: 'var(--space-8)',
                transition: 'max-width 0.3s ease',
            }}>
                {/* Step title */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', margin: 0, marginBottom: 'var(--space-1)' }}>
                        {STEPS[step - 1].label}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {step === 1 && 'Tell us about you — the club owner.'}
                        {step === 2 && 'Set up your club\'s identity on ClubForge.'}
                        {step === 3 && 'Where is your club located? (Optional — you can add this later)'}
                        {step === 4 && 'Start with a 14-day free trial. You won\'t be charged until it ends.'}
                        {step === 5 && 'Almost there! Review everything and launch your club.'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--space-4)',
                        color: 'var(--color-red)',
                        fontSize: 'var(--text-sm)',
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Step content */}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}

                {/* Navigation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 'var(--space-6)',
                    gap: 'var(--space-4)',
                }}>
                    {step > 1 ? (
                        <button
                            onClick={prevStep}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                padding: 'var(--space-3) var(--space-5)',
                                background: 'transparent', border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: '500',
                            }}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 5 ? (
                        <button
                            onClick={nextStep}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                padding: 'var(--space-3) var(--space-6)',
                                background: 'var(--color-gold)', border: 'none',
                                borderRadius: 'var(--radius-lg)', color: 'var(--color-black)',
                                cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: '700',
                            }}
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                padding: 'var(--space-3) var(--space-8)',
                                background: isSubmitting ? 'var(--text-tertiary)' : 'linear-gradient(135deg, #ffd700 0%, #c5a456 100%)',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)', color: 'var(--color-black)',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: 'var(--text-base)', fontWeight: '700',
                            }}
                        >
                            {isSubmitting ? (
                                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating your club...</>
                            ) : (
                                <><Sparkles size={18} /> Launch My Club</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Already have an account */}
            <p style={{ marginTop: 'var(--space-6)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--color-gold)', fontWeight: '500' }}>Sign in</Link>
            </p>

            {/* Spin animation for loader */}
            <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
