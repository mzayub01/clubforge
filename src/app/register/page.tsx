'use client';

// ===============================================
// ClubForge - Member Registration Page
// Tenant-aware 5-step wizard for member self-registration
// ===============================================

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Eye, EyeOff, User, Mail, Phone, MapPin, Calendar,
    AlertCircle, Shield, ChevronRight, ChevronLeft,
    Check, Users, CreditCard, Camera, Loader2
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

// -----------------------------------------------
// Default waiver (used when tenant has no custom waiver)
// -----------------------------------------------
const DEFAULT_WAIVER = `Disclaimer and Waiver of Liability

As the participant or legal guardian of the participant(s), I hereby acknowledge and agree to the following terms:

1. Risk Acknowledgement: I understand that physical training involves inherent risk of injury including but not limited to bruises, strains, sprains, fractures, and other physical or mental harm.

2. Fitness and Health: I confirm that the participant(s) is/are physically fit, in good health, and do not have any condition that could be adversely affected by participation.

3. Rules and Supervision: I agree that the participant(s) will adhere to all class rules and instructions provided by instructors and staff.

4. Waiver of Liability: I hereby release the club, its officers, agents, employees, coaches, volunteers, and representatives from any injury, loss, or damage arising from participation.

5. Medical Attention: In the event of an injury, I authorise staff to secure emergency medical care. I agree to be responsible for any medical charges.

6. Photography/Video Consent: I consent to the use of photographs and videos taken during classes for promotional or educational purposes.

7. Understanding of Terms: I have read this waiver and fully understand its terms.`;

// -----------------------------------------------
// Types
// -----------------------------------------------
interface Location {
    id: string;
    name: string;
    settings: { allow_waitlist?: boolean } | null;
}

interface MembershipType {
    id: string;
    name: string;
    price: number;
    description: string | null;
    location_id: string;
}

interface CapacityConfig {
    location_id: string;
    membership_type_id: string;
    capacity: number | null;
    current_count?: number;
}

interface TenantInfo {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    tagline: string | null;
    stripe_account_id: string | null;
    stripe_connect_enabled: boolean;
    settings: Record<string, unknown>;
}

interface FormData {
    membershipType: 'adult' | 'child';
    gender: 'male' | 'female' | '';
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    emergencyName: string;
    emergencyPhone: string;
    medicalInfo: string;
    isChild: boolean;
    parentFirstName: string;
    parentLastName: string;
    parentEmail: string;
    parentPhone: string;
    parentAddress: string;
    parentCity: string;
    parentPostcode: string;
    childAddressDifferent: boolean;
    etiquetteAccepted: boolean;
    waiverAccepted: boolean;
    selectedMembershipTypeId: string;
    selectedLocationId: string;
    beltRank: string;
    stripes: number;
}

// -----------------------------------------------
// Registration Page Content
// -----------------------------------------------
function RegisterPageContent() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showEtiquette, setShowEtiquette] = useState(false);
    const [showWaiver, setShowWaiver] = useState(false);
    const [tenant, setTenant] = useState<TenantInfo | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
    const [capacityConfigs, setCapacityConfigs] = useState<CapacityConfig[]>([]);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = getSupabaseClient();
    const preselectedLocation = searchParams.get('location');

    // Determine number of steps based on tenant settings
    const hasEtiquette = Boolean(tenant?.settings?.etiquette_text);
    const totalSteps = hasEtiquette ? 5 : 4;
    const locationMode = (tenant?.settings?.membership_location_mode as string) || 'per_location';

    useEffect(() => {
        fetchTenantAndData();
    }, []);

    // Store all data fetched from the server
    const [allMembershipTypes, setAllMembershipTypes] = useState<MembershipType[]>([]);
    const [allCapacityConfigs, setAllCapacityConfigs] = useState<CapacityConfig[]>([]);
    const [allMembershipCounts, setAllMembershipCounts] = useState<{ location_id: string; membership_type_id: string; count: number }[]>([]);

    const fetchTenantAndData = async () => {
        try {
            // Fetch all registration data from server-side API (bypasses RLS)
            const res = await fetch('/api/tenant/register');
            if (!res.ok) {
                console.error('Failed to load registration data:', res.status);
                return;
            }
            const data = await res.json();

            if (data.tenant) {
                setTenant(data.tenant as TenantInfo);
                document.title = `Register | ${data.tenant.name}`;
            }

            const locs = data.locations || [];
            setLocations(locs);
            setAllMembershipTypes(data.membershipTypes || []);
            setAllCapacityConfigs(data.capacityConfigs || []);
            setAllMembershipCounts(data.membershipCounts || []);

            // Determine the effective location mode
            const tenantSettings = (data.tenant?.settings || {}) as Record<string, unknown>;
            const effectiveMode = (tenantSettings.membership_location_mode as string) || 'per_location';

            // Auto-select location and load membership types
            if (preselectedLocation) {
                setFormData(prev => ({ ...prev, selectedLocationId: preselectedLocation }));
                filterMembershipTypes(preselectedLocation, effectiveMode, data.membershipTypes || [], data.capacityConfigs || [], data.membershipCounts || []);
            } else if (effectiveMode === 'all_locations' && locs.length > 0) {
                setFormData(prev => ({ ...prev, selectedLocationId: locs[0].id }));
                filterMembershipTypes(locs[0].id, effectiveMode, data.membershipTypes || [], data.capacityConfigs || [], data.membershipCounts || []);
            } else if (locs.length === 1) {
                setFormData(prev => ({ ...prev, selectedLocationId: locs[0].id }));
                filterMembershipTypes(locs[0].id, effectiveMode, data.membershipTypes || [], data.capacityConfigs || [], data.membershipCounts || []);
            }
        } catch (err) {
            console.error('Error loading registration data:', err);
        } finally {
            setPageLoading(false);
        }
    };

    // Filter membership types from the already-fetched data (no extra API calls)
    const filterMembershipTypes = (
        locationId: string,
        mode: string,
        types: MembershipType[],
        configs: CapacityConfig[],
        counts: { location_id: string; membership_type_id: string; count: number }[],
    ) => {
        // In all_locations mode, show all types; in per_location, filter by location
        const filtered = mode === 'all_locations'
            ? types
            : types.filter(t => t.location_id === locationId);
        setMembershipTypes(filtered);

        // Filter capacity configs for this location
        const locConfigs = configs
            .filter((c: CapacityConfig) => c.location_id === locationId)
            .map((config: CapacityConfig) => {
                const match = counts.find(
                    m => m.location_id === locationId && m.membership_type_id === config.membership_type_id
                );
                return { ...config, current_count: match?.count || 0 };
            });
        setCapacityConfigs(locConfigs);
    };

    // Legacy wrapper for handleLocationChange compatibility
    const loadMembershipTypes = async (locationId: string, mode?: string) => {
        const effectiveMode = mode || locationMode;
        filterMembershipTypes(locationId, effectiveMode, allMembershipTypes, allCapacityConfigs, allMembershipCounts);
    };

    const hasCapacity = (membershipTypeId: string): boolean => {
        const config = capacityConfigs.find(c => c.membership_type_id === membershipTypeId);
        if (!config) return true;
        if (config.capacity === null) return true;
        return (config.current_count || 0) < config.capacity;
    };

    const getRemainingSpots = (membershipTypeId: string): number | null => {
        const config = capacityConfigs.find(c => c.membership_type_id === membershipTypeId);
        if (!config || config.capacity === null) return null;
        return Math.max(0, config.capacity - (config.current_count || 0));
    };

    const [formData, setFormData] = useState<FormData>({
        membershipType: 'adult',
        gender: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        phone: '',
        address: '',
        city: '',
        postcode: '',
        emergencyName: '',
        emergencyPhone: '',
        medicalInfo: '',
        isChild: false,
        parentFirstName: '',
        parentLastName: '',
        parentEmail: '',
        parentPhone: '',
        parentAddress: '',
        parentCity: '',
        parentPostcode: '',
        childAddressDifferent: false,
        etiquetteAccepted: false,
        waiverAccepted: false,
        selectedMembershipTypeId: '',
        selectedLocationId: preselectedLocation || '',
        beltRank: 'white',
        stripes: 0,
    });

    const updateField = (field: keyof FormData, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    // When location changes, reload membership types
    const handleLocationChange = async (locationId: string) => {
        updateField('selectedLocationId', locationId);
        updateField('selectedMembershipTypeId', '');
        if (locationId) {
            await loadMembershipTypes(locationId);
        }
    };

    const validateStep = (currentStep: number): boolean => {
        switch (currentStep) {
            case 1: // Personal Info
                if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (!formData.gender) {
                    setError('Please select your gender');
                    return false;
                }
                if (formData.membershipType === 'adult') {
                    if (!formData.email || !formData.password) {
                        setError('Email and password are required');
                        return false;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(formData.email)) {
                        setError('Please enter a valid email address');
                        return false;
                    }
                    if (formData.password.length < 6) {
                        setError('Password must be at least 6 characters');
                        return false;
                    }
                    if (formData.password !== formData.confirmPassword) {
                        setError('Passwords do not match');
                        return false;
                    }
                }
                if (formData.membershipType === 'child') {
                    if (!formData.parentFirstName || !formData.parentLastName || !formData.parentEmail || !formData.parentPhone) {
                        setError('Please fill in all parent/guardian details');
                        return false;
                    }
                    if (!formData.password) {
                        setError('Password is required for the parent/guardian account');
                        return false;
                    }
                    if (formData.password.length < 6) {
                        setError('Password must be at least 6 characters');
                        return false;
                    }
                    if (formData.password !== formData.confirmPassword) {
                        setError('Passwords do not match');
                        return false;
                    }
                }
                if (tenant?.settings?.require_profile_photo && !profileImageFile) {
                    setError('Please upload a profile picture');
                    return false;
                }
                return true;

            case 2: // Contact & Emergency
                if (!formData.phone || !formData.address || !formData.city || !formData.postcode) {
                    setError('Please fill in all address fields');
                    return false;
                }
                if (!formData.emergencyName || !formData.emergencyPhone) {
                    setError('Emergency contact is required');
                    return false;
                }
                return true;

            case 3: // Agreements (etiquette + waiver OR just waiver)
                if (hasEtiquette && !formData.etiquetteAccepted) {
                    setError('You must accept the club etiquette');
                    return false;
                }
                if (!formData.waiverAccepted) {
                    setError('You must accept the waiver to continue');
                    return false;
                }
                return true;

            case 4: // Membership Selection (or final step)
            case 5:
                if (locationMode === 'per_location' && !formData.selectedLocationId) {
                    setError('Please select a location');
                    return false;
                }
                if (!formData.selectedMembershipTypeId) {
                    setError('Please select a membership type');
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(totalSteps)) return;
        if (locationMode === 'per_location' && !formData.selectedLocationId) {
            setError('Location is required');
            return;
        }

        setLoading(true);
        setError('');

        const isChildMembership = formData.membershipType === 'child';

        try {
            // 1. Create user account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: isChildMembership ? formData.parentEmail : formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: isChildMembership ? formData.parentFirstName : formData.firstName,
                        last_name: isChildMembership ? formData.parentLastName : formData.lastName,
                        date_of_birth: formData.dateOfBirth,
                    },
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Account creation failed');

            // 2. Upload profile image if provided
            let profileImageUrl = null;
            if (profileImageFile) {
                try {
                    const fileExt = profileImageFile.name.split('.').pop();
                    const fileName = `${authData.user.id}/${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('profile-images')
                        .upload(fileName, profileImageFile, { upsert: true });

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('profile-images')
                            .getPublicUrl(fileName);
                        profileImageUrl = publicUrl;
                    }
                } catch (imgErr) {
                    console.error('Profile image upload failed:', imgErr);
                }
            }

            // 3. Update profile
            await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    date_of_birth: formData.dateOfBirth,
                    gender: formData.gender,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postcode: formData.postcode,
                    emergency_contact_name: formData.emergencyName,
                    emergency_contact_phone: formData.emergencyPhone,
                    medical_info: formData.medicalInfo || null,
                    is_child: isChildMembership,
                    belt_rank: formData.beltRank,
                    stripes: formData.stripes,
                    best_practice_accepted: true,
                    best_practice_accepted_at: new Date().toISOString(),
                    waiver_accepted: true,
                    waiver_accepted_at: new Date().toISOString(),
                    profile_image_url: profileImageUrl,
                })
                .eq('user_id', authData.user.id);

            // 4. Handle membership + payment
            const selectedType = membershipTypes.find(mt => mt.id === formData.selectedMembershipTypeId);
            const isFree = selectedType?.price === 0;
            const membershipHasCapacity = hasCapacity(formData.selectedMembershipTypeId);

            // Debug: log payment decision variables
            console.log('[Register] Payment decision:', {
                selectedTypeId: formData.selectedMembershipTypeId,
                selectedTypeName: selectedType?.name,
                price: selectedType?.price,
                isFree,
                stripeConnectEnabled: tenant?.stripe_connect_enabled,
                stripeAccountId: tenant?.stripe_account_id,
                membershipHasCapacity,
                path: (isFree || !tenant?.stripe_connect_enabled) ? 'FREE/PENDING' : 'CONNECTED_CHECKOUT',
            });

            if (membershipHasCapacity) {
                if (isFree || !tenant?.stripe_connect_enabled) {
                    // Free membership OR club hasn't connected Stripe → create via server-side API
                    const status = isFree ? 'active' : 'pending';
                    await fetch('/api/tenant/complete-registration', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: authData.user.id,
                            tenantId: tenant?.id,
                            locationId: formData.selectedLocationId,
                            membershipTypeId: formData.selectedMembershipTypeId,
                            status,
                        }),
                    });

                    // Send welcome email
                    fetch('/api/email/welcome', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: isChildMembership ? formData.parentEmail : formData.email,
                            firstName: formData.firstName,
                            locationName: locations.find(l => l.id === formData.selectedLocationId)?.name || 'Club',
                            membershipType: selectedType?.name || 'Member',
                        }),
                    }).catch(err => console.error('Welcome email error:', err));

                    if (isFree) {
                        router.push('/dashboard?registered=true');
                    } else {
                        router.push('/dashboard?registered=true&pending=true');
                    }
                    router.refresh();
                } else {
                    // Club has Stripe Connect → redirect to connected checkout
                    console.log('[Register] Calling checkout-connected API...');
                    const response = await fetch('/api/stripe/checkout-connected', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            membershipTypeName: selectedType?.name || 'Membership',
                            membershipTypeId: formData.selectedMembershipTypeId,
                            price: selectedType?.price || 0,
                            userId: authData.user.id,
                            locationId: formData.selectedLocationId,
                            locationName: locations.find(l => l.id === formData.selectedLocationId)?.name,
                            userEmail: isChildMembership ? formData.parentEmail : formData.email,
                            tenantId: tenant?.id,
                        }),
                    });

                    const data = await response.json();
                    console.log('[Register] Checkout-connected response:', { status: response.status, hasUrl: !!data.url, error: data.error });

                    if (data.url) {
                        window.location.href = data.url;
                    } else {
                        // Show the error instead of silently falling back
                        console.error('[Register] Connected checkout failed:', data.error);
                        setError(data.error || 'Payment setup failed. Please contact the club administrator.');
                        setLoading(false);
                        return;
                    }
                }
            } else {
                // Add to waitlist
                const { data: waitlistPosition } = await supabase
                    .from('waitlist')
                    .select('position')
                    .eq('location_id', formData.selectedLocationId)
                    .eq('membership_type_id', formData.selectedMembershipTypeId)
                    .order('position', { ascending: false })
                    .limit(1)
                    .single();

                await supabase.from('waitlist').insert({
                    user_id: authData.user.id,
                    location_id: formData.selectedLocationId,
                    membership_type_id: formData.selectedMembershipTypeId,
                    position: (waitlistPosition?.position || 0) + 1,
                });

                router.push('/waitlist-confirmation');
                router.refresh();
            }
        } catch (err: unknown) {
            console.error('Registration error:', err);
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Build step definitions
    const steps = hasEtiquette
        ? [
            { number: 1, title: 'Personal', icon: User },
            { number: 2, title: 'Contact', icon: Phone },
            { number: 3, title: 'Agreements', icon: Shield },
            { number: 4, title: 'Plan', icon: CreditCard },
            // Extra step for etiquette, but it's merged into step 3
        ]
        : [
            { number: 1, title: 'Personal', icon: User },
            { number: 2, title: 'Contact', icon: Phone },
            { number: 3, title: 'Agreements', icon: Shield },
            { number: 4, title: 'Plan', icon: CreditCard },
        ];

    const clubName = tenant?.name || 'Club';
    const accentColor = tenant?.primary_color || '#c5a456';
    const waiverContent = (tenant?.settings?.waiver_text as string) || DEFAULT_WAIVER;
    const etiquetteContent = (tenant?.settings?.etiquette_text as string) || '';
    const welcomeMessage = (tenant?.settings?.registration_message as string) || '';

    if (pageLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: 'var(--space-6)',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    {tenant?.logo_url ? (
                        <img
                            src={tenant.logo_url}
                            alt={clubName}
                            style={{ height: '60px', width: 'auto', margin: '0 auto', objectFit: 'contain' }}
                        />
                    ) : (
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: 'var(--radius-lg)',
                            background: accentColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: 'var(--text-xl)',
                        }}>
                            {clubName.charAt(0)}
                        </div>
                    )}
                    <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-4)' }}>
                        Join {clubName}
                    </h1>
                    {tenant?.tagline && (
                        <p style={{ color: 'var(--text-secondary)' }}>{tenant.tagline}</p>
                    )}
                    {welcomeMessage && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                            {welcomeMessage}
                        </p>
                    )}
                </div>

                {/* Progress Steps */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-8)',
                }}>
                    {steps.map((s, index) => (
                        <div key={s.number} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: step >= s.number ? accentColor : 'var(--bg-tertiary)',
                                color: step >= s.number ? '#fff' : 'var(--text-tertiary)',
                                fontWeight: '600',
                                fontSize: 'var(--text-sm)',
                                transition: 'all 0.3s ease',
                            }}>
                                {step > s.number ? <Check size={18} /> : s.number}
                            </div>
                            {index < steps.length - 1 && (
                                <div style={{
                                    width: '40px',
                                    height: '2px',
                                    background: step > s.number ? accentColor : 'var(--border-light)',
                                    transition: 'background 0.3s ease',
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>
                                    Personal Information
                                </h2>

                                {/* Adult/Child Toggle */}
                                <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                                    {(['adult', 'child'] as const).map(type => (
                                        <label key={type} style={{
                                            flex: 1,
                                            padding: 'var(--space-4)',
                                            background: formData.membershipType === type ? `${accentColor}15` : 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: `2px solid ${formData.membershipType === type ? accentColor : 'var(--border-light)'}`,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-3)',
                                            transition: 'all 0.2s ease',
                                        }}>
                                            <input
                                                type="radio"
                                                name="membershipType"
                                                checked={formData.membershipType === type}
                                                onChange={() => {
                                                    updateField('membershipType', type);
                                                    updateField('isChild', type === 'child');
                                                }}
                                                style={{ width: '20px', height: '20px', accentColor }}
                                            />
                                            <div>
                                                <strong>{type === 'adult' ? 'Adult' : 'Child'}</strong>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', margin: 0 }}>
                                                    {type === 'adult' ? '18 years and older' : 'Under 18 (parent required)'}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Child: Parent/Guardian fields */}
                                {formData.membershipType === 'child' && (
                                    <div style={{
                                        background: 'var(--bg-secondary)',
                                        padding: 'var(--space-5)',
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: 'var(--space-6)',
                                    }}>
                                        <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>
                                            Parent/Guardian Details
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                            <div className="form-group">
                                                <label className="form-label"><User size={14} /> First Name *</label>
                                                <input className="form-input" value={formData.parentFirstName}
                                                    onChange={e => updateField('parentFirstName', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Last Name *</label>
                                                <input className="form-input" value={formData.parentLastName}
                                                    onChange={e => updateField('parentLastName', e.target.value)} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                            <div className="form-group">
                                                <label className="form-label"><Mail size={14} /> Email *</label>
                                                <input className="form-input" type="email" value={formData.parentEmail}
                                                    onChange={e => updateField('parentEmail', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label"><Phone size={14} /> Phone *</label>
                                                <input className="form-input" type="tel" value={formData.parentPhone}
                                                    onChange={e => updateField('parentPhone', e.target.value)} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                            <div className="form-group">
                                                <label className="form-label">Password *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input className="form-input" type={showPassword ? 'text' : 'password'}
                                                        value={formData.password}
                                                        onChange={e => updateField('password', e.target.value)}
                                                        placeholder="Min. 6 characters"
                                                        style={{ paddingRight: 'var(--space-10)' }} />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                        style={{
                                                            position: 'absolute', right: 'var(--space-3)', top: '50%',
                                                            transform: 'translateY(-50%)', background: 'none', border: 'none',
                                                            cursor: 'pointer', color: 'var(--text-tertiary)',
                                                        }}>
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Confirm Password *</label>
                                                <input className="form-input" type="password" value={formData.confirmPassword}
                                                    onChange={e => updateField('confirmPassword', e.target.value)} />
                                            </div>
                                        </div>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                                            This creates your parent/guardian account to manage your child&apos;s membership.
                                        </p>
                                    </div>
                                )}

                                {/* Member details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <div className="form-group">
                                        <label className="form-label"><User size={14} /> First Name *</label>
                                        <input className="form-input" value={formData.firstName}
                                            onChange={e => updateField('firstName', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name *</label>
                                        <input className="form-input" value={formData.lastName}
                                            onChange={e => updateField('lastName', e.target.value)} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label"><Calendar size={14} /> Date of Birth *</label>
                                    <input className="form-input" type="date" value={formData.dateOfBirth}
                                        onChange={e => updateField('dateOfBirth', e.target.value)} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Gender *</label>
                                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                        {(['male', 'female'] as const).map(g => (
                                            <label key={g} style={{
                                                flex: 1,
                                                padding: 'var(--space-3)',
                                                background: formData.gender === g ? `${accentColor}15` : 'var(--bg-secondary)',
                                                border: `2px solid ${formData.gender === g ? accentColor : 'var(--border-light)'}`,
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                fontWeight: formData.gender === g ? '600' : '400',
                                                textTransform: 'capitalize',
                                                transition: 'all 0.2s ease',
                                            }}>
                                                <input type="radio" name="gender" value={g} checked={formData.gender === g}
                                                    onChange={() => updateField('gender', g)}
                                                    style={{ display: 'none' }} />
                                                {g}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {formData.membershipType === 'adult' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label"><Mail size={14} /> Email *</label>
                                            <input className="form-input" type="email" value={formData.email}
                                                onChange={e => updateField('email', e.target.value)} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                            <div className="form-group">
                                                <label className="form-label">Password *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input className="form-input" type={showPassword ? 'text' : 'password'}
                                                        value={formData.password}
                                                        onChange={e => updateField('password', e.target.value)}
                                                        style={{ paddingRight: 'var(--space-10)' }} />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                        style={{
                                                            position: 'absolute', right: 'var(--space-3)', top: '50%',
                                                            transform: 'translateY(-50%)', background: 'none', border: 'none',
                                                            cursor: 'pointer', color: 'var(--text-tertiary)',
                                                        }}>
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Confirm *</label>
                                                <input className="form-input" type="password" value={formData.confirmPassword}
                                                    onChange={e => updateField('confirmPassword', e.target.value)} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Profile photo (optional or required) */}
                                <div className="form-group">
                                    <label className="form-label">
                                        <Camera size={14} /> Profile Photo {tenant?.settings?.require_profile_photo ? '*' : '(Optional)'}
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
                                            background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', overflow: 'hidden',
                                            border: '2px dashed var(--border-light)',
                                        }}>
                                            {profileImagePreview ? (
                                                <img src={profileImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Camera size={20} color="var(--text-tertiary)" />
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setProfileImageFile(file);
                                                setProfileImagePreview(URL.createObjectURL(file));
                                            }
                                        }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Contact & Emergency */}
                        {step === 2 && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>
                                    Contact Details
                                </h2>

                                <div className="form-group">
                                    <label className="form-label"><Phone size={14} /> Phone *</label>
                                    <input className="form-input" type="tel" value={formData.phone}
                                        onChange={e => updateField('phone', e.target.value)} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label"><MapPin size={14} /> Address *</label>
                                    <input className="form-input" value={formData.address}
                                        onChange={e => updateField('address', e.target.value)} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
                                    <div className="form-group">
                                        <label className="form-label">City *</label>
                                        <input className="form-input" value={formData.city}
                                            onChange={e => updateField('city', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Postcode *</label>
                                        <input className="form-input" value={formData.postcode}
                                            onChange={e => updateField('postcode', e.target.value)} />
                                    </div>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: 'var(--space-6) 0' }} />

                                <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>
                                    Emergency Contact
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Contact Name *</label>
                                        <input className="form-input" value={formData.emergencyName}
                                            onChange={e => updateField('emergencyName', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Contact Phone *</label>
                                        <input className="form-input" type="tel" value={formData.emergencyPhone}
                                            onChange={e => updateField('emergencyPhone', e.target.value)} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Medical Information (Optional)</label>
                                    <textarea className="form-input" rows={3} value={formData.medicalInfo}
                                        onChange={e => updateField('medicalInfo', e.target.value)}
                                        placeholder="Any allergies, conditions, or medications we should know about" />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Agreements */}
                        {step === 3 && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>
                                    Agreements
                                </h2>

                                {/* Etiquette (if tenant has custom text) */}
                                {hasEtiquette && (
                                    <div style={{ marginBottom: 'var(--space-6)' }}>
                                        <div
                                            onClick={() => setShowEtiquette(!showEtiquette)}
                                            style={{
                                                padding: 'var(--space-4)',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-lg)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <strong>Club Etiquette & Rules</strong>
                                            <ChevronRight size={18} style={{
                                                transform: showEtiquette ? 'rotate(90deg)' : 'none',
                                                transition: 'transform 0.2s',
                                            }} />
                                        </div>

                                        {showEtiquette && (
                                            <div style={{
                                                padding: 'var(--space-4)',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                                                marginTop: '-4px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                whiteSpace: 'pre-wrap',
                                                fontSize: 'var(--text-sm)',
                                                color: 'var(--text-secondary)',
                                            }}>
                                                {etiquetteContent}
                                            </div>
                                        )}

                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-3)',
                                            cursor: 'pointer',
                                            marginTop: 'var(--space-3)',
                                            padding: 'var(--space-3)',
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.etiquetteAccepted}
                                                onChange={e => updateField('etiquetteAccepted', e.target.checked)}
                                                style={{ width: '20px', height: '20px', accentColor }}
                                            />
                                            <span style={{ fontSize: 'var(--text-sm)' }}>
                                                I have read and agree to the club etiquette and rules
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {/* Waiver */}
                                <div>
                                    <div
                                        onClick={() => setShowWaiver(!showWaiver)}
                                        style={{
                                            padding: 'var(--space-4)',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-lg)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <strong>Waiver & Liability Disclaimer</strong>
                                        <ChevronRight size={18} style={{
                                            transform: showWaiver ? 'rotate(90deg)' : 'none',
                                            transition: 'transform 0.2s',
                                        }} />
                                    </div>

                                    {showWaiver && (
                                        <div style={{
                                            padding: 'var(--space-4)',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                                            marginTop: '-4px',
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            whiteSpace: 'pre-wrap',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--text-secondary)',
                                        }}>
                                            {waiverContent}
                                        </div>
                                    )}

                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        cursor: 'pointer',
                                        marginTop: 'var(--space-3)',
                                        padding: 'var(--space-3)',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.waiverAccepted}
                                            onChange={e => updateField('waiverAccepted', e.target.checked)}
                                            style={{ width: '20px', height: '20px', accentColor }}
                                        />
                                        <span style={{ fontSize: 'var(--text-sm)' }}>
                                            I have read and agree to the waiver and liability disclaimer
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 4 (or 5): Membership Selection */}
                        {step === totalSteps && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>
                                    Choose Your Membership
                                </h2>

                                {/* Location selector — only in per_location mode with multiple locations */}
                                {locationMode === 'per_location' && locations.length > 1 && (
                                    <div className="form-group">
                                        <label className="form-label"><MapPin size={14} /> Location *</label>
                                        <select
                                            className="form-input"
                                            value={formData.selectedLocationId}
                                            onChange={e => handleLocationChange(e.target.value)}
                                        >
                                            <option value="">Select a location...</option>
                                            {locations.map(loc => (
                                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Show location badge for single-location (per_location mode) */}
                                {locationMode === 'per_location' && locations.length === 1 && (
                                    <div style={{
                                        padding: 'var(--space-3)',
                                        background: `${accentColor}15`,
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)',
                                    }}>
                                        <MapPin size={16} color={accentColor} />
                                        <span style={{ fontWeight: '500' }}>{locations[0].name}</span>
                                    </div>
                                )}

                                {/* All-locations mode: show info badge */}
                                {locationMode === 'all_locations' && (
                                    <div style={{
                                        padding: 'var(--space-3)',
                                        background: `${accentColor}15`,
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)',
                                    }}>
                                        <MapPin size={16} color={accentColor} />
                                        <span style={{ fontWeight: '500' }}>Membership covers all locations</span>
                                    </div>
                                )}

                                {/* Membership types */}
                                {formData.selectedLocationId && membershipTypes.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                        {membershipTypes.map(type => {
                                            const capacity = hasCapacity(type.id);
                                            const remaining = getRemainingSpots(type.id);
                                            const selected = formData.selectedMembershipTypeId === type.id;

                                            return (
                                                <label
                                                    key={type.id}
                                                    style={{
                                                        padding: 'var(--space-4)',
                                                        borderRadius: 'var(--radius-lg)',
                                                        border: `2px solid ${selected ? accentColor : 'var(--border-light)'}`,
                                                        background: selected ? `${accentColor}15` : 'var(--bg-secondary)',
                                                        cursor: capacity ? 'pointer' : 'not-allowed',
                                                        opacity: capacity ? 1 : 0.5,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                        <input
                                                            type="radio"
                                                            name="membershipType"
                                                            disabled={!capacity}
                                                            checked={selected}
                                                            onChange={() => updateField('selectedMembershipTypeId', type.id)}
                                                            style={{ width: '20px', height: '20px', accentColor }}
                                                        />
                                                        <div>
                                                            <strong>{type.name}</strong>
                                                            {type.description && (
                                                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', margin: 0 }}>
                                                                    {type.description}
                                                                </p>
                                                            )}
                                                            {!capacity && (
                                                                <p style={{ color: 'var(--color-red)', fontSize: 'var(--text-xs)', margin: 0 }}>
                                                                    Full — waitlist available
                                                                </p>
                                                            )}
                                                            {remaining !== null && remaining > 0 && remaining <= 5 && (
                                                                <p style={{ color: accentColor, fontSize: 'var(--text-xs)', margin: 0 }}>
                                                                    Only {remaining} spot{remaining !== 1 ? 's' : ''} remaining
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontWeight: '700', fontSize: 'var(--text-lg)', color: accentColor }}>
                                                        {type.price === 0 ? 'Free' : `£${type.price}/mo`}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {formData.selectedLocationId && membershipTypes.length === 0 && (
                                    <div className="alert alert-warning">
                                        <AlertCircle size={18} />
                                        No membership types are available at this location.
                                    </div>
                                )}

                                {!tenant?.stripe_connect_enabled && membershipTypes.some(t => t.price > 0) && (
                                    <p style={{
                                        color: 'var(--text-tertiary)',
                                        fontSize: 'var(--text-xs)',
                                        marginTop: 'var(--space-3)',
                                        fontStyle: 'italic',
                                    }}>
                                        Payment will be arranged separately by the club.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 'var(--space-8)',
                            gap: 'var(--space-4)',
                        }}>
                            {step > 1 ? (
                                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                                    <ChevronLeft size={18} /> Back
                                </button>
                            ) : (
                                <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                    <ChevronLeft size={18} /> Home
                                </Link>
                            )}

                            {step < totalSteps ? (
                                <button type="button" className="btn btn-primary" onClick={nextStep}
                                    style={{ background: accentColor }}>
                                    Next <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button type="submit" className="btn btn-primary" disabled={loading}
                                    style={{ background: accentColor }}>
                                    {loading ? <Loader2 size={18} className="spin" /> : <Check size={18} />}
                                    {loading ? 'Registering...' : 'Complete Registration'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------
// Root Registration Page with Suspense
// -----------------------------------------------
export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            }}>
                <div className="spinner spinner-lg" />
            </div>
        }>
            <RegisterPageContent />
        </Suspense>
    );
}
