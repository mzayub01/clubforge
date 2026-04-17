import Link from 'next/link';
import { FAQPageSchema } from '@/components/structured-data';

interface CityFAQProps {
    city: string;
}

export default function CityFAQ({ city }: CityFAQProps) {
    const faqs = [
        {
            question: `What is the best martial arts management software in ${city}?`,
            answer: `ClubForge is used by martial arts academies across ${city} to manage memberships, payments, attendance, and belt progression in one platform.`,
        },
        {
            question: `Can I use ClubForge for a BJJ gym in ${city}?`,
            answer: `Yes, ClubForge is designed specifically for BJJ academies, with features like belt tracking, attendance monitoring, and automated payments. Clubs across ${city} use ClubForge to run their operations.`,
        },
        {
            question: `How much does gym management software cost in ${city}?`,
            answer: `ClubForge starts at £39/month for small clubs with up to 150 members. There are no setup fees and you can start with a 14-day free trial.`,
        },
        {
            question: `Does ClubForge work for martial arts clubs with multiple locations in ${city}?`,
            answer: `Yes, ClubForge supports multi-location management from one dashboard. You can manage members, classes, and payments across all your ${city} locations.`,
        },
    ];

    return (
        <>
            <FAQPageSchema faqs={faqs} />

            <section style={{
                background: '#FFFFFF',
                padding: '80px 24px',
                borderTop: '1px solid #F1F5F9',
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <p style={{
                        fontSize: '14px', fontWeight: '600', color: '#C5A456',
                        textTransform: 'uppercase', letterSpacing: '1.5px',
                        marginBottom: '16px', textAlign: 'center',
                    }}>
                        FAQ
                    </p>
                    <h2 style={{
                        fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                        fontWeight: '800', color: '#0F172A',
                        textAlign: 'center', marginBottom: '36px', lineHeight: '1.2',
                    }}>
                        Common questions from {city} clubs
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {faqs.map((faq, i) => (
                            <details
                                key={i}
                                style={{
                                    border: '1px solid #F1F5F9',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    background: '#FFFFFF',
                                }}
                            >
                                <summary style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '18px 20px', cursor: 'pointer',
                                    fontSize: '0.95rem', fontWeight: '600', color: '#0F172A',
                                    listStyle: 'none',
                                }}>
                                    {faq.question}
                                </summary>
                                <div style={{
                                    padding: '0 20px 18px',
                                    borderTop: '1px solid #F1F5F9',
                                    paddingTop: '14px',
                                }}>
                                    <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.9rem' }}>
                                        {faq.answer}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Link href="/faq" style={{
                            color: '#C5A456', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none',
                        }}>
                            View all FAQs →
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
