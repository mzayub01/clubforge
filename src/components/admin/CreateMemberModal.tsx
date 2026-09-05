'use client';

// ===============================================
// ClubForge - Create Member (admin)
// Full member creation in one modal: adult or child, personal details,
// login, role & rank, membership, photo (upload or take one), agreements,
// optional welcome / set-password emails.
// ===============================================

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Plus, X, Loader2, Eye, EyeOff, RefreshCw, Camera, Upload, Copy, CheckCircle,
    User, Shield, MapPin, Award, Mail, Baby, Users,
} from 'lucide-react';
import ModalPortal from './ModalPortal';
import Avatar from '../Avatar';
import { CameraCapture } from '../MemberPhotoEditor';
import type { Location, MembershipType } from '@/lib/types';
import type { RankSchema } from '@/hooks/useRankSchemas';

export interface GuardianOption {
    id: string;
    name: string;
    email: string;
}

interface CreateMemberModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (message: string) => void;
    locations: Location[];
    membershipTypes: MembershipType[];
    guardianOptions: GuardianOption[];
    getSchemaForMember: (isChild: boolean) => RankSchema;
}

interface FormState {
    accountType: 'adult' | 'child';
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: '' | 'male' | 'female';
    phone: string;
    address: string;
    city: string;
    postcode: string;
    emergencyName: string;
    emergencyPhone: string;
    medicalInfo: string;
    email: string;
    password: string;
    sendWelcomeEmail: boolean;
    sendSetPasswordEmail: boolean;
    role: 'member' | 'instructor' | 'professor' | 'admin';
    beltRank: string;
    stripes: number;
    guardianProfileId: string;
    locationId: string;
    membershipTypeId: string;
    membershipStatus: 'active' | 'pending' | 'none';
    profileImageUrl: string;
    waiverAccepted: boolean;
    bestPracticeAccepted: boolean;
}

const INITIAL: FormState = {
    accountType: 'adult',
    firstName: '', lastName: '', dateOfBirth: '', gender: '', phone: '',
    address: '', city: '', postcode: '',
    emergencyName: '', emergencyPhone: '', medicalInfo: '',
    email: '', password: '', sendWelcomeEmail: true, sendSetPasswordEmail: true,
    role: 'member', beltRank: 'white', stripes: 0,
    guardianProfileId: '',
    locationId: '', membershipTypeId: '', membershipStatus: 'active',
    profileImageUrl: '', waiverAccepted: false, bestPracticeAccepted: false,
};

interface CreatedResult {
    name: string;
    email: string | null;
    isChild: boolean;
    guardianEmail: string | null;
    temporaryPassword: string | null;
    membershipCreated: boolean;
    emails: { welcome: boolean; setPassword: boolean };
}

const rankValue = (levelName: string) => levelName.toLowerCase().replace(/\//g, '-');

function randomPassword(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => alphabet[b % alphabet.length]).join('') + '!7';
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: '0 0 var(--space-3)' }}>
                {icon} {title}
            </h3>
            {children}
        </div>
    );
}

export default function CreateMemberModal({
    open, onClose, onCreated, locations, membershipTypes, guardianOptions, getSchemaForMember,
}: CreateMemberModalProps) {
    const [form, setForm] = useState<FormState>(INITIAL);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [guardianQuery, setGuardianQuery] = useState('');
    const [photoUploading, setPhotoUploading] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [result, setResult] = useState<CreatedResult | null>(null);
    const [copied, setCopied] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const isChild = form.accountType === 'child';
    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));

    // Reset when (re)opened
    useEffect(() => {
        if (open) {
            setForm(INITIAL);
            setError('');
            setResult(null);
            setGuardianQuery('');
            setShowPassword(false);
        }
    }, [open]);

    const schema = getSchemaForMember(isChild);
    const maxStripes = schema.has_stripes ? (schema.max_stripes || (isChild ? 12 : 4)) : 0;

    // Keep the rank valid for the selected schema
    useEffect(() => {
        const valid = schema.rank_levels.some(l => rankValue(l.name) === form.beltRank);
        if (!valid && schema.rank_levels[0]) set('beltRank', rankValue(schema.rank_levels[0].name));
        if (form.stripes > maxStripes) set('stripes', 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChild, schema.rank_levels.length]);

    const typesForLocation = useMemo(() => {
        if (!form.locationId) return membershipTypes;
        const scoped = membershipTypes.filter(t => t.location_id === form.locationId || t.is_multisite);
        return scoped.length > 0 ? scoped : membershipTypes;
    }, [membershipTypes, form.locationId]);

    const filteredGuardians = useMemo(() => {
        const q = guardianQuery.trim().toLowerCase();
        const list = q
            ? guardianOptions.filter(g => g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q))
            : guardianOptions;
        return [...list].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 200);
    }, [guardianOptions, guardianQuery]);

    const uploadPhoto = async (file: Blob, filename: string) => {
        setPhotoUploading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('image', file, filename);
            const res = await fetch('/api/upload-profile-image', { method: 'POST', body: fd });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error || 'Failed to upload photo');
            set('profileImageUrl', json.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload photo');
            throw err;
        } finally {
            setPhotoUploading(false);
        }
    };

    const onPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Please choose an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('Photo must be less than 5MB'); return; }
        try { await uploadPhoto(file, file.name); } catch { /* shown */ }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (isChild && !form.guardianProfileId) { setError('Choose the guardian for this child'); return; }
        if (form.membershipStatus !== 'none' && !form.locationId) { setError('Choose a location for the membership, or set membership to "None for now"'); return; }

        setSaving(true);
        try {
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    stripes: Number(form.stripes) || 0,
                    gender: form.gender || undefined,
                    email: isChild ? undefined : form.email,
                    password: isChild ? undefined : form.password,
                    guardianProfileId: isChild ? form.guardianProfileId : undefined,
                    locationId: form.membershipStatus === 'none' ? undefined : form.locationId,
                    membershipTypeId: form.membershipStatus === 'none' ? undefined : (form.membershipTypeId || undefined),
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create member');

            const name = `${form.firstName} ${form.lastName}`.trim();
            setResult({
                name,
                email: data.user?.email ?? null,
                isChild: !!data.isChild,
                guardianEmail: data.guardianEmail ?? null,
                temporaryPassword: data.temporaryPassword ?? null,
                membershipCreated: !!data.membershipCreated,
                emails: data.emails || { welcome: false, setPassword: false },
            });
            onCreated(`${name} created${data.membershipCreated ? ' with a membership' : ''}.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create member');
        } finally {
            setSaving(false);
        }
    };

    const copyPassword = async () => {
        if (!result?.temporaryPassword) return;
        try {
            await navigator.clipboard.writeText(result.temporaryPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard blocked */ }
    };

    if (!open) return null;

    const selectedGuardian = guardianOptions.find(g => g.id === form.guardianProfileId);

    return (
        <ModalPortal>
            <div className="modal-overlay" onClick={() => !saving && onClose()}>
                <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '760px' }}>
                    <div className="modal-header">
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Plus size={20} /> {result ? 'Member created' : 'Add Member'}
                        </h2>
                        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" disabled={saving} aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {result ? (
                        // ---------------- Success panel ----------------
                        <>
                            <div className="modal-body">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                    <CheckCircle size={28} color="var(--color-green)" />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: 'var(--text-lg)' }}>{result.name}</p>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                            {result.isChild
                                                ? `Child account · managed by guardian${result.guardianEmail ? ` (${result.guardianEmail})` : ''}`
                                                : result.email}
                                            {result.membershipCreated ? ' · membership added' : ' · no membership yet'}
                                        </p>
                                    </div>
                                </div>

                                {result.temporaryPassword && (
                                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--color-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                        <p style={{ margin: '0 0 6px', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Temporary password — shown once</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                            <code style={{ fontSize: 'var(--text-lg)', letterSpacing: '0.04em' }}>{result.temporaryPassword}</code>
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={copyPassword}>
                                                {copied ? <CheckCircle size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                        <p style={{ margin: '8px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            Pass this on securely, or rely on the set-password email if it was sent.
                                        </p>
                                    </div>
                                )}

                                {!result.isChild && (
                                    <ul style={{ margin: 0, paddingLeft: '1.2em', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        <li>Welcome email: {result.emails.welcome ? 'sent' : 'not sent'}</li>
                                        <li>Set-password email: {result.emails.setPassword ? 'sent' : 'not sent'}</li>
                                    </ul>
                                )}
                                {result.isChild && (
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        Children don&apos;t have their own login. The guardian sees and manages this child from their dashboard, and club emails for the child go to the guardian.
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => { setResult(null); setForm(INITIAL); }}>
                                    <Plus size={16} /> Add another
                                </button>
                                <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
                            </div>
                        </>
                    ) : (
                        // ---------------- Form ----------------
                        <form onSubmit={submit}>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {error && (
                                    <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>
                                )}

                                {/* Account type */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
                                    {([['adult', 'Adult member', <User key="a" size={16} />], ['child', 'Child (managed by a guardian)', <Baby key="c" size={16} />]] as const).map(([value, label, icon]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => set('accountType', value)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                                                padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                                                border: form.accountType === value ? '2px solid var(--color-gold)' : '1px solid var(--border-light)',
                                                background: form.accountType === value ? 'rgba(197, 164, 86, 0.12)' : 'var(--bg-primary)',
                                                color: 'var(--text-primary)', fontWeight: form.accountType === value ? 600 : 400,
                                            }}
                                        >
                                            {icon} {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Photo */}
                                <Section icon={<Camera size={14} />} title="Photo">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Avatar src={form.profileImageUrl || null} firstName={form.firstName} lastName={form.lastName} size="xl" />
                                            {photoUploading && (
                                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Loader2 size={22} color="white" className="animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCameraOpen(true)} disabled={photoUploading}>
                                                <Camera size={14} /> Take photo
                                            </button>
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={photoUploading}>
                                                <Upload size={14} /> Upload
                                            </button>
                                            {form.profileImageUrl && (
                                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => set('profileImageUrl', '')}>
                                                    <X size={14} /> Remove
                                                </button>
                                            )}
                                        </div>
                                        <input ref={fileRef} type="file" accept="image/*" onChange={onPhotoFile} style={{ display: 'none' }} />
                                    </div>
                                </Section>

                                {/* Personal */}
                                <Section icon={<User size={14} />} title="Personal details">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                        <div className="form-group">
                                            <label className="form-label">First name *</label>
                                            <input type="text" className="form-input" required value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Last name *</label>
                                            <input type="text" className="form-input" required value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Date of birth *</label>
                                            <input type="date" className="form-input" required max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Gender</label>
                                            <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value as FormState['gender'])}>
                                                <option value="">Not specified</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone</label>
                                            <input type="tel" className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Address</label>
                                            <input type="text" className="form-input" value={form.address} onChange={e => set('address', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">City</label>
                                            <input type="text" className="form-input" value={form.city} onChange={e => set('city', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Postcode</label>
                                            <input type="text" className="form-input" value={form.postcode} onChange={e => set('postcode', e.target.value)} />
                                        </div>
                                    </div>
                                </Section>

                                {/* Guardian (child) or Login (adult) */}
                                {isChild ? (
                                    <Section icon={<Shield size={14} />} title="Guardian *">
                                        <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                            Children don&apos;t get a login. Pick the adult member who manages this child — club emails for the child go to them.
                                        </p>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Search guardians by name or email…"
                                            value={guardianQuery}
                                            onChange={e => setGuardianQuery(e.target.value)}
                                            style={{ marginBottom: 'var(--space-2)' }}
                                        />
                                        <select
                                            className="form-select"
                                            size={Math.min(6, Math.max(3, filteredGuardians.length + 1))}
                                            value={form.guardianProfileId}
                                            onChange={e => set('guardianProfileId', e.target.value)}
                                            style={{ height: 'auto' }}
                                        >
                                            <option value="">— Select guardian —</option>
                                            {filteredGuardians.map(g => (
                                                <option key={g.id} value={g.id}>{g.name} ({g.email})</option>
                                            ))}
                                        </select>
                                        {selectedGuardian && (
                                            <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--text-sm)' }}>
                                                <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                                Guardian: <strong>{selectedGuardian.name}</strong> · {selectedGuardian.email}
                                            </p>
                                        )}
                                        {guardianOptions.length === 0 && (
                                            <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-red)' }}>
                                                No adult members yet — create the guardian first.
                                            </p>
                                        )}
                                    </Section>
                                ) : (
                                    <Section icon={<Mail size={14} />} title="Login">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                            <div className="form-group">
                                                <label className="form-label">Email *</label>
                                                <input type="email" className="form-input" required value={form.email} onChange={e => set('email', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Password</label>
                                                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                                    <div style={{ position: 'relative', flex: 1 }}>
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            className="form-input"
                                                            minLength={8}
                                                            placeholder="Leave blank to generate"
                                                            value={form.password}
                                                            onChange={e => set('password', e.target.value)}
                                                            style={{ paddingRight: '36px' }}
                                                            autoComplete="new-password"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                    <button type="button" className="btn btn-ghost btn-sm" title="Generate a password" onClick={() => { set('password', randomPassword()); setShowPassword(true); }}>
                                                        <RefreshCw size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                            <label className="form-checkbox">
                                                <input type="checkbox" checked={form.sendSetPasswordEmail} onChange={e => set('sendSetPasswordEmail', e.target.checked)} />
                                                <span>Email them a link to set their own password</span>
                                            </label>
                                            <label className="form-checkbox">
                                                <input type="checkbox" checked={form.sendWelcomeEmail} onChange={e => set('sendWelcomeEmail', e.target.checked)} />
                                                <span>Send the club welcome email</span>
                                            </label>
                                        </div>
                                    </Section>
                                )}

                                {/* Role & rank */}
                                <Section icon={<Award size={14} />} title="Role & rank">
                                    <div style={{ display: 'grid', gridTemplateColumns: isChild ? '1fr' : '1fr 1fr', gap: 'var(--space-3)' }}>
                                        {!isChild && (
                                            <div className="form-group">
                                                <label className="form-label">Role</label>
                                                <select className="form-select" value={form.role} onChange={e => set('role', e.target.value as FormState['role'])}>
                                                    <option value="member">Member</option>
                                                    <option value="instructor">Instructor</option>
                                                    <option value="professor">Professor</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                {form.role === 'admin' && <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-gold)' }}>Admins have full access to all data and settings.</p>}
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label className="form-label">Rank</label>
                                            <select className="form-select" value={form.beltRank} onChange={e => set('beltRank', e.target.value)}>
                                                {schema.rank_levels.map(level => (
                                                    <option key={level.name} value={rankValue(level.name)}>{level.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {maxStripes > 0 && (
                                            <div className="form-group">
                                                <label className="form-label">Stripes</label>
                                                <select className="form-select" value={form.stripes} onChange={e => set('stripes', Number(e.target.value))}>
                                                    {Array.from({ length: maxStripes + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </Section>

                                {/* Membership */}
                                <Section icon={<MapPin size={14} />} title="Membership">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Status</label>
                                            <select className="form-select" value={form.membershipStatus} onChange={e => set('membershipStatus', e.target.value as FormState['membershipStatus'])}>
                                                <option value="active">Active (paid / free)</option>
                                                <option value="pending">Pending payment</option>
                                                <option value="none">None for now</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Location{form.membershipStatus !== 'none' ? ' *' : ''}</label>
                                            <select className="form-select" value={form.locationId} onChange={e => { set('locationId', e.target.value); set('membershipTypeId', ''); }} disabled={form.membershipStatus === 'none'}>
                                                <option value="">— Select —</option>
                                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Membership type</label>
                                            <select className="form-select" value={form.membershipTypeId} onChange={e => set('membershipTypeId', e.target.value)} disabled={form.membershipStatus === 'none'}>
                                                <option value="">— Not set —</option>
                                                {typesForLocation.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}{typeof t.price === 'number' ? (t.price > 0 ? ` · £${t.price}/mo` : ' · free') : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                        Records only — this does not set up Stripe billing. A &ldquo;pending payment&rdquo; member sees the complete-payment banner on their dashboard.
                                    </p>
                                </Section>

                                {/* Emergency & medical */}
                                <Section icon={<Shield size={14} />} title="Emergency contact & medical">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Emergency contact name</label>
                                            <input type="text" className="form-input" value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Emergency contact phone</label>
                                            <input type="tel" className="form-input" value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Medical information</label>
                                        <textarea className="form-input" rows={2} value={form.medicalInfo} onChange={e => set('medicalInfo', e.target.value)} placeholder="Allergies, conditions, injuries…" />
                                    </div>
                                </Section>

                                {/* Agreements */}
                                <Section icon={<CheckCircle size={14} />} title="Agreements">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                        <label className="form-checkbox">
                                            <input type="checkbox" checked={form.waiverAccepted} onChange={e => set('waiverAccepted', e.target.checked)} />
                                            <span>Waiver accepted (e.g. signed on paper)</span>
                                        </label>
                                        <label className="form-checkbox">
                                            <input type="checkbox" checked={form.bestPracticeAccepted} onChange={e => set('bestPracticeAccepted', e.target.checked)} />
                                            <span>Club etiquette / best practice accepted</span>
                                        </label>
                                    </div>
                                </Section>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={onClose} className="btn btn-ghost" disabled={saving}>Cancel</button>
                                <button type="submit" disabled={saving || photoUploading} className="btn btn-primary">
                                    {saving ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Plus size={16} /> Create member</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {cameraOpen && (
                <CameraCapture
                    onCapture={async (blob) => { await uploadPhoto(blob, `new-member-${Date.now()}.jpg`); }}
                    onClose={() => setCameraOpen(false)}
                    subjectName={`${form.firstName} ${form.lastName}`.trim() || undefined}
                />
            )}
        </ModalPortal>
    );
}
