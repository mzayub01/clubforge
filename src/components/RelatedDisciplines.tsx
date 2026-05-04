import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Discipline {
    name: string;
    href: string;
    emoji: string;
}

const allDisciplines: Discipline[] = [
    { name: 'Martial Arts Clubs', href: '/for/martial-arts', emoji: '🥋' },
    { name: 'BJJ Academies', href: '/for/bjj', emoji: '🤼' },
    { name: 'Boxing Clubs', href: '/for/boxing', emoji: '🥊' },
    { name: 'Boxing & MMA Gyms', href: '/for/boxing-mma', emoji: '🥊' },
    { name: 'Kickboxing Clubs', href: '/for/kickboxing', emoji: '🦶' },
    { name: 'Karate Dojos', href: '/for/karate', emoji: '🥋' },
    { name: 'Taekwondo Clubs', href: '/for/taekwondo', emoji: '🥋' },
    { name: 'Judo Clubs', href: '/for/judo', emoji: '🥋' },
    { name: 'Fitness Studios', href: '/for/fitness-studios', emoji: '💪' },
];

interface RelatedDisciplinesProps {
    /** The current page's href to exclude from the list */
    currentHref: string;
    /** Max items to show (default 6) */
    maxItems?: number;
}

export default function RelatedDisciplines({ currentHref, maxItems = 6 }: RelatedDisciplinesProps) {
    const related = allDisciplines
        .filter(d => d.href !== currentHref)
        .slice(0, maxItems);

    return (
        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #F1F5F9' }}>
            <h3 style={{
                fontSize: '0.9rem', fontWeight: '700', color: '#94A3B8',
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px',
            }}>
                ClubForge for Other Disciplines
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px',
            }}>
                {related.map((d) => (
                    <Link
                        key={d.href}
                        href={d.href}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 14px', borderRadius: '10px',
                            border: '1px solid #F1F5F9', background: '#FAFBFC',
                            color: '#334155', fontSize: '0.85rem', fontWeight: '500',
                            textDecoration: 'none', transition: 'all 0.2s ease',
                        }}
                    >
                        <span>{d.emoji}</span>
                        <span style={{ flex: 1 }}>{d.name}</span>
                        <ChevronRight size={14} color="#C5A456" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
