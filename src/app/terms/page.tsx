import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'Terms of Service | ClubForge',
    description: 'Terms of Service governing your use of the ClubForge platform.',
};

export default async function TermsPage() {
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
                        <h1 style={{ marginBottom: 'var(--space-4)' }}>Terms of Service</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                    </div>
                </section>

                <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-6) var(--space-6) var(--space-16)' }}>
                    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                        <div className="glass-card" style={{ padding: 'var(--space-8)', lineHeight: '1.8', color: 'var(--text-secondary)' }}>

                            <h2 style={{ color: 'var(--text-primary)', marginTop: 0 }}>1. Agreement</h2>
                            <p>
                                By accessing or using ClubForge (&ldquo;the Platform&rdquo;), operated by ClubForge (&ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to be bound by these Terms of Service.
                                The Platform is a Software-as-a-Service product that provides club management tools to organisations (&ldquo;Club Operators&rdquo;) and their members (&ldquo;End Users&rdquo;).
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>2. Accounts</h2>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>You must provide accurate and complete information when creating an account.</li>
                                <li>You are responsible for maintaining the security of your account credentials.</li>
                                <li>Club Operators are responsible for the accounts and actions of users within their club.</li>
                                <li>One person or organisation may not maintain more than one free trial at a time.</li>
                            </ul>

                            <h2 style={{ color: 'var(--text-primary)' }}>3. Subscriptions & Billing</h2>
                            <p><strong>Free Trial:</strong></p>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>New accounts receive a 14-day free trial with Pro features.</li>
                                <li>No credit card is required for the trial.</li>
                                <li>At the end of the trial, you must select a paid plan to continue using the Platform.</li>
                            </ul>
                            <p><strong>Paid Plans:</strong></p>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>Plans are billed monthly or annually as selected at checkout.</li>
                                <li>Payments are processed by Stripe. By subscribing, you also agree to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)' }}>Stripe&apos;s Terms of Service</a>.</li>
                                <li>Price changes will be communicated 30 days in advance.</li>
                                <li>Refunds are not provided for partial billing periods.</li>
                            </ul>
                            <p><strong>Platform Fee:</strong></p>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>A 2.5% platform fee is charged on all member payments processed through ClubForge via Stripe.</li>
                                <li>This is in addition to Stripe&apos;s standard processing fees.</li>
                            </ul>

                            <h2 style={{ color: 'var(--text-primary)' }}>4. Acceptable Use</h2>
                            <p>You agree not to:</p>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>Use the Platform for any illegal purpose or in violation of any laws</li>
                                <li>Attempt to access another club&apos;s data or systems</li>
                                <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
                                <li>Upload malicious content, viruses, or harmful code</li>
                                <li>Resell, sublicence, or redistribute the Platform without permission</li>
                                <li>Use the Platform to send spam or unsolicited communications</li>
                            </ul>

                            <h2 style={{ color: 'var(--text-primary)' }}>5. Data Ownership</h2>
                            <p>
                                <strong>Your data is yours.</strong> Club Operators retain full ownership of all data they upload or generate through the Platform, including member records, attendance data, and financial records.
                            </p>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>You can export your data at any time (format depends on your plan).</li>
                                <li>We do not claim ownership over your content.</li>
                                <li>We may use anonymised, aggregated data for platform improvements.</li>
                            </ul>

                            <h2 style={{ color: 'var(--text-primary)' }}>6. Service Availability</h2>
                            <p>
                                We aim for 99.9% uptime but do not guarantee uninterrupted service. We may perform scheduled maintenance with reasonable notice. We are not liable for downtime caused by factors outside our control (force majeure, third-party services, internet outages).
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>7. Cancellation</h2>
                            <ul style={{ paddingLeft: 'var(--space-6)' }}>
                                <li>You may cancel your subscription at any time from your admin settings.</li>
                                <li>Cancellation takes effect at the end of the current billing period.</li>
                                <li>Your data is retained for 90 days after cancellation, then permanently deleted.</li>
                                <li>You may request immediate data deletion at any time.</li>
                            </ul>

                            <h2 style={{ color: 'var(--text-primary)' }}>8. Limitation of Liability</h2>
                            <p>
                                To the fullest extent permitted by law, ClubForge&apos;s total liability for any claims relating to the Platform shall not exceed the amount paid by you in the 12 months prior to the claim.
                                We are not liable for indirect, incidental, or consequential damages.
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>9. Modifications</h2>
                            <p>
                                We may update these Terms from time to time. Material changes will be communicated via email to the account holder at least 30 days in advance. Continued use of the Platform constitutes acceptance of updated Terms.
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>10. Governing Law</h2>
                            <p>
                                These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                            </p>

                            <h2 style={{ color: 'var(--text-primary)' }}>11. Contact</h2>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-lg)',
                                marginTop: 'var(--space-4)',
                            }}>
                                <p style={{ margin: 0 }}>
                                    <strong>ClubForge</strong><br />
                                    Email: <a href="mailto:legal@clubforgehq.com" style={{ color: 'var(--color-gold)' }}>legal@clubforgehq.com</a><br />
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
