'use client';

// ===============================================
// ClubForge - StudentDetailsButton (instructors)
// "Details" button that opens what an instructor needs in class: contact
// (guardian's for a child), emergency contact, medical notes, memberships
// and recent attendance. Data via GET /api/staff/member-details.
// ===============================================

import { useEffect, useState } from 'react';
import { Info, X, Loader2, Phone, Mail, Shield, Heart, MapPin, Calendar, AlertCircle } from 'lucide-react';
import ModalPortal from '@/components/admin/ModalPortal';
import Avatar from '@/components/Avatar';

interface Details {
    member: {
        userId: string; firstName: string; lastName: string; isChild: boolean;
        contactEmail: string | null; contactViaGuardian: boolean; phone: string | null;
        dateOfBirth: string | null; gender: string | null; address: string | null;
        emergencyContactName: string | null; emergencyContactPhone: string | null;
        medicalInfo: string | null; beltRank: string; stripes: number;
        profileImageUrl: string | null; waiverAccepted: boolean; memberSince: string;
    };
    guardian: { name: string; email: string | null; phone: string | null } | null;
    memberships: { id: string; status: string; startDate: string | null; endDate: string | null; location: string | null; type: string | null }[];
    recentAttendance: { id: string; date: string; className: string | null }[];
}

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>{icon}</span>
            <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{label}</p>
                <p style={{ margin: 0, wordBreak: 'break-word' }}>{value || '—'}</p>
            </div>
        </div>
    );
}

export default function StudentDetailsButton({ userId, name }: { userId: string; name: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [details, setDetails] = useState<Details | null>(null);

    useEffect(() => {
        if (!open || details) return;
        let cancelled = false;
        setLoading(true);
        setError('');
        fetch(`/api/staff/member-details?userId=${encodeURIComponent(userId)}`)
            .then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Failed to load'); return j as Details; })
            .then(j => { if (!cancelled) setDetails(j); })
            .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [open, details, userId]);

    const m = details?.member;
    const age = m?.dateOfBirth ? Math.floor((Date.now() - new Date(m.dateOfBirth).getTime()) / (365.25 * 86_400_000)) : null;

    return (
        <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)} title={`Details for ${name}`}>
                <Info size={14} /> Details
            </button>

            {open && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setOpen(false)}>
                        <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    {m && <Avatar src={m.profileImageUrl} firstName={m.firstName} lastName={m.lastName} size="md" />}
                                    <span>{name}{m?.isChild ? <span className="badge badge-gold" style={{ marginLeft: 'var(--space-2)' }}>Child</span> : null}</span>
                                </h2>
                                <button type="button" className="btn btn-ghost btn-icon" onClick={() => setOpen(false)} aria-label="Close" title="Close">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                {loading && (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
                                        <Loader2 size={28} className="animate-spin" />
                                    </div>
                                )}
                                {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}
                                {m && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                                        {m.medicalInfo && (
                                            <div className="alert alert-warning" style={{ margin: 0 }}>
                                                <Heart size={16} />
                                                <div>
                                                    <strong>Medical:</strong> {m.medicalInfo}
                                                </div>
                                            </div>
                                        )}

                                        <section>
                                            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 var(--space-2)' }}>Emergency contact</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                                <Row icon={<Shield size={14} />} label="Name" value={m.emergencyContactName} />
                                                <Row icon={<Phone size={14} />} label="Phone" value={m.emergencyContactPhone ? <a href={`tel:${m.emergencyContactPhone}`}>{m.emergencyContactPhone}</a> : null} />
                                            </div>
                                        </section>

                                        <section>
                                            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 var(--space-2)' }}>
                                                {m.isChild ? 'Guardian' : 'Contact'}
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                                {m.isChild && <Row icon={<Shield size={14} />} label="Guardian" value={details?.guardian?.name || 'Not linked'} />}
                                                <Row icon={<Mail size={14} />} label="Email" value={m.contactEmail ? <a href={`mailto:${m.contactEmail}`}>{m.contactEmail}</a> : (m.isChild ? 'No guardian email' : null)} />
                                                <Row icon={<Phone size={14} />} label="Phone" value={(m.isChild ? details?.guardian?.phone : m.phone) ? <a href={`tel:${m.isChild ? details?.guardian?.phone : m.phone}`}>{m.isChild ? details?.guardian?.phone : m.phone}</a> : null} />
                                                <Row icon={<MapPin size={14} />} label="Address" value={m.address} />
                                            </div>
                                        </section>

                                        <section>
                                            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 var(--space-2)' }}>Member</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                                <Row icon={<Calendar size={14} />} label="Date of birth" value={m.dateOfBirth ? `${fmtDate(m.dateOfBirth)}${age !== null ? ` (${age})` : ''}` : null} />
                                                <Row icon={<Calendar size={14} />} label="Member since" value={fmtDate(m.memberSince)} />
                                                <Row icon={<Shield size={14} />} label="Rank" value={`${m.beltRank}${m.stripes ? ` · ${m.stripes} stripe${m.stripes > 1 ? 's' : ''}` : ''}`} />
                                                <Row icon={<Shield size={14} />} label="Waiver" value={m.waiverAccepted ? 'Accepted' : 'Not accepted'} />
                                            </div>
                                        </section>

                                        <section>
                                            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 var(--space-2)' }}>Memberships</h3>
                                            {details?.memberships.length ? details.memberships.map(ms => (
                                                <p key={ms.id} style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)' }}>
                                                    <span className={`badge ${ms.status === 'active' ? 'badge-green' : ms.status === 'pending' ? 'badge-gold' : 'badge-gray'}`} style={{ marginRight: 6 }}>{ms.status}</span>
                                                    {ms.type || 'No plan'}{ms.location ? ` · ${ms.location}` : ''}{ms.endDate ? ` · ends ${fmtDate(ms.endDate)}` : ''}
                                                </p>
                                            )) : <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No membership on record</p>}
                                        </section>

                                        <section>
                                            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 var(--space-2)' }}>Recent attendance</h3>
                                            {details?.recentAttendance.length ? (
                                                <ul style={{ margin: 0, paddingLeft: '1.1em', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                    {details.recentAttendance.map(a => <li key={a.id}>{fmtDate(a.date)}{a.className ? ` · ${a.className}` : ''}</li>)}
                                                </ul>
                                            ) : <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No check-ins yet</p>}
                                        </section>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => setOpen(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </>
    );
}
