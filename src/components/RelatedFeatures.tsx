import Link from 'next/link';
import { ChevronRight, Users, Calendar, Award, CheckCircle2, CreditCard, Building2 } from 'lucide-react';

const allFeatures = [
    { name: 'Member Management', href: '/features/member-management', icon: Users },
    { name: 'Class Scheduling', href: '/features/class-scheduling', icon: Calendar },
    { name: 'Belt Progression', href: '/features/belt-progression', icon: Award },
    { name: 'Attendance Tracking', href: '/features/attendance-tracking', icon: CheckCircle2 },
    { name: 'Payments & Billing', href: '/features/payments-billing', icon: CreditCard },
    { name: 'Multi-Location', href: '/features/multi-location', icon: Building2 },
];

interface RelatedFeaturesProps {
    currentHref?: string;
    maxItems?: number;
}

export default function RelatedFeatures({ currentHref, maxItems = 4 }: RelatedFeaturesProps) {
    const related = allFeatures
        .filter(f => f.href !== currentHref)
        .slice(0, maxItems);

    return (
        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #F1F5F9' }}>
            <h3 style={{
                fontSize: '0.9rem', fontWeight: '700', color: '#94A3B8',
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px',
            }}>
                Explore ClubForge Features
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
            }}>
                {related.map((f) => (
                    <Link
                        key={f.href}
                        href={f.href}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 14px', borderRadius: '10px',
                            border: '1px solid #F1F5F9', background: '#FAFBFC',
                            color: '#334155', fontSize: '0.85rem', fontWeight: '500',
                            textDecoration: 'none', transition: 'all 0.2s ease',
                        }}
                    >
                        <f.icon size={16} color="#C5A456" />
                        <span style={{ flex: 1 }}>{f.name}</span>
                        <ChevronRight size={14} color="#C5A456" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
