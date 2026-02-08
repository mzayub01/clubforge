import Link from 'next/link';
import { Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'Privacy Policy | ClubForge',
    description: 'How ClubForge collects, uses, and protects your personal data.',
};

export default async function PrivacyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />

            <main>
                <section style={{
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    padding: 'var(--space-16) var(--space-6)',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <Shield size={40} color="var(--color-gold)" style={{ marginBottom: 'var(--space-4)' }} />
                        <h1 style={{ marginBottom: 'var(--space-4)' }}>Privacy Policy</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                    </div>
                </section>

                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-6) var(--space-6) var(--space-16)' }}>
                    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                        <div className="glass-card" style={{ padding: 'var(--space-8)', lineHeight: '1.8', color: 'var(--text-secondary)' }}>

                            <h2 style={{ color: 'var(--text-primary)', marginTop: 0 }}>1. Who We Are</h2>
                            <p>
                                ClubForge (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the ClubForge platform at clubforgehq.com.
                                ClubForge is a Software-as-a-Service (SaaS) platform that provides club management tools to gym owners, martial arts academies, and sports organisations (&ldquo;Club Operators&rdquo;).
                                Club Operators use ClubForge to manage their own members (&ldquo;End Users&rdquo;).
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>2. Data We Collect</h2>
                            <p><strong>From Club Operators (customers):</strong></p>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>Name, email, and contact details</li>
                                <li>Club name, address, and type</li>
                                <li>Billing information (processed by Stripe — we do not store card numbers)</li>
                                <li>Usage data and platform analytics</li>
                            </ul>
                            <p><strong>From End Users (club members):</strong></p>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>Name, email, phone, and emergency contacts</li>
                                <li>Attendance records and class participation</li>
                                <li>Belt/rank progression and grading history</li>
                                <li>Membership and payment information (processed by Stripe)</li>
                            </ul>

                            <h2 style={{ color: 'var(--text-primary)' }}>3. How We Use Data</h2>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>To provide and operate the ClubForge platform</li>
                                <li>To process payments and subscriptions via Stripe</li>
                                <li>To send transactional emails (welcome, billing, notifications)</li>
                                <li>To improve the platform and fix bugs</li>
                                <li>To comply with legal obligations</li>
                            </ul>
                            <p>We <strong>never</strong> sell personal data to third parties.</p>

                            <h2 style={{ color: 'var(--text-primary)' }}>4. Data Processor vs Controller</h2>
                            <p>
                                ClubForge acts as a <strong>Data Processor</strong> for End User data on behalf of Club Operators, who are the <strong>Data Controllers</strong>.
                                ClubForge is a <strong>Data Controller</strong> for Club Operator account data.
                            </p>
                            <p>
                                Club Operators are responsible for ensuring they have lawful bases for collecting and processing their members&apos; data through ClubForge.
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>5. Data Security</h2>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>All data is encrypted in transit (TLS) and at rest</li>
                                <li>Row-level security (RLS) ensures complete tenant isolation — clubs cannot access each other&apos;s data</li>
                                <li>Hosted on Supabase and Vercel with enterprise-grade infrastructure</li>
                                <li>Regular security reviews and updates</li>
                                <li>Payment data handled by Stripe (PCI DSS compliant)</li>
                            </ul>

                            <h2 style={{ color: 'var(--text-primary)' }}>6. Data Retention & Deletion</h2>
                            <p>
                                Club data is retained for the duration of the active subscription. Upon cancellation, data is retained for 90 days to allow reactivation, then permanently deleted.
                            </p>
                            <p>
                                Club Operators can export their data at any time (CSV, JSON, or API depending on plan). End Users can request data deletion through their Club Operator.
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>7. Third-Party Services</h2>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li><strong>Supabase</strong> — database hosting and authentication</li>
                                <li><strong>Stripe</strong> — payment processing</li>
                                <li><strong>Vercel</strong> — application hosting</li>
                            </ul>
                            <p>Each service has its own privacy policy and is GDPR-compliant.</p>

                            <h2 style={{ color: 'var(--text-primary)' }}>8. Your Rights (GDPR)</h2>
                            <p>You have the right to:</p>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>Access the personal data we hold about you</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Object to processing of your data</li>
                                <li>Data portability — receive your data in a structured format</li>
                                <li>Withdraw consent at any time</li>
                            </ul>

                            <h2 style={{ color: 'var(--text-primary)' }}>9. Cookies</h2>
                            <p>
                                ClubForge uses essential cookies only — for authentication and session management. We do not use tracking, advertising, or analytics cookies.
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>10. Contact</h2>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-lg)',
                                marginTop: 'var(--space-4)',
                            }}>
                                <p style={{ margin: 0 }}>
                                    <strong>ClubForge</strong><br />
                                    Email: <a href="mailto:privacy@clubforgehq.com" style={{ color: 'var(--color-gold)' }}>privacy@clubforgehq.com</a><br />
                                    Manchester, United Kingdom
                                </p>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
