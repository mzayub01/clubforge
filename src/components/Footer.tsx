import Link from 'next/link';
import Image from 'next/image';
import { Mail, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer" style={{ background: 'var(--color-gray-900)', color: 'var(--color-gray-300)' }}>
            <div
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: 'var(--space-16) var(--space-6) var(--space-8)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-10)',
                }}
            >
                {/* Brand */}
                <div style={{ gridColumn: 'span 1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <Image
                            src="/logo-clubforge-final-dark.svg"
                            alt="ClubForge"
                            width={200}
                            height={52}
                            style={{ height: '36px', width: 'auto' }}
                        />
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7', color: 'var(--color-gray-400)', marginBottom: 'var(--space-4)' }}>
                        The operating system for clubs. Build, run, and grow your gym, dojo, or academy with one powerful platform.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <a href="https://twitter.com/clubforgehq" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gray-500)' }}>
                            <Twitter size={18} />
                        </a>
                        <a href="https://linkedin.com/company/clubforge" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gray-500)' }}>
                            <Linkedin size={18} />
                        </a>
                    </div>
                </div>

                {/* Product */}
                <div>
                    <h4 style={{ color: 'var(--color-white)', fontSize: 'var(--text-sm)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)' }}>
                        Product
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <li><Link href="/features" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>All Features</Link></li>
                        <li><Link href="/pricing" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Pricing</Link></li>
                        <li><Link href="/demo" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Book a Demo</Link></li>
                        <li><Link href="/get-started" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Start Free Trial</Link></li>
                    </ul>
                </div>

                {/* Features */}
                <div>
                    <h4 style={{ color: 'var(--color-white)', fontSize: 'var(--text-sm)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)' }}>
                        Features
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <li><Link href="/features/member-management" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Member Management</Link></li>
                        <li><Link href="/features/class-scheduling" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Class Scheduling</Link></li>
                        <li><Link href="/features/belt-progression" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Belt Progression</Link></li>
                        <li><Link href="/features/attendance-tracking" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Attendance Tracking</Link></li>
                        <li><Link href="/features/payments-billing" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Payments & Billing</Link></li>
                        <li><Link href="/features/multi-location" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Multi-Location</Link></li>
                    </ul>
                </div>

                {/* Built For */}
                <div>
                    <h4 style={{ color: 'var(--color-white)', fontSize: 'var(--text-sm)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)' }}>
                        Built For
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <li><Link href="/for/martial-arts" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Martial Arts Clubs</Link></li>
                        <li><Link href="/for/bjj" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>BJJ Academies</Link></li>
                        <li><Link href="/for/boxing-mma" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Boxing & MMA Gyms</Link></li>
                        <li><Link href="/for/fitness-studios" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Fitness Studios</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 style={{ color: 'var(--color-white)', fontSize: 'var(--text-sm)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)' }}>
                        Company
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <li><Link href="/about" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>About</Link></li>
                        <li><Link href="/faq" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>FAQ</Link></li>
                        <li><a href="mailto:support@clubforgehq.com" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Contact</a></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 style={{ color: 'var(--color-white)', fontSize: 'var(--text-sm)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)' }}>
                        Legal
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <li><Link href="/privacy" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Privacy Policy</Link></li>
                        <li><Link href="/terms" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: 'var(--space-6) var(--space-6)',
                    borderTop: '1px solid var(--color-gray-800)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space-4)',
                }}
            >
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    © {currentYear} ClubForge. All rights reserved.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    <Mail size={14} />
                    <a href="mailto:support@clubforgehq.com" style={{ color: 'var(--color-gray-500)' }}>support@clubforgehq.com</a>
                </div>
            </div>
        </footer>
    );
}
