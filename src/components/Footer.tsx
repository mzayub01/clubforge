import Link from 'next/link';
import Image from 'next/image';
import {
    MapPin,
    Phone,
    Mail,
    Facebook,
    Instagram,
    Youtube
} from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-grid">
                {/* Brand */}
                <div className="footer-brand">
                    <Image
                        src="/logo-simple.png"
                        alt="ClubForge"
                        width={120}
                        height={120}
                        style={{
                            height: '80px',
                            width: 'auto',
                            filter: 'brightness(0) invert(1)'
                        }}
                    />
                    <p style={{ marginTop: 'var(--space-4)' }}>
                        The all-in-one management platform for martial arts gyms and fitness centers.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-gray-400)' }}
                        >
                            <Facebook size={20} />
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-gray-400)' }}
                        >
                            <Instagram size={20} />
                        </a>
                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-gray-400)' }}
                        >
                            <Youtube size={20} />
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="footer-title">Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/classes">BJJ Classes</Link></li>
                        <li><Link href="/events">Events</Link></li>
                        <li><Link href="/faq">FAQ</Link></li>
                        <li><Link href="/register">Register</Link></li>
                    </ul>
                </div>

                {/* Locations */}
                <div>
                    <h4 className="footer-title">Platform</h4>
                    <ul className="footer-links">
                        <li><Link href="/classes">Features</Link></li>
                        <li><Link href="/faq">Pricing</Link></li>
                        <li><Link href="/about">About</Link></li>
                        <li><Link href="/faq">Support</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="footer-title">Contact Us</h4>
                    <ul className="footer-links">
                        <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <MapPin size={16} />
                            <span>Worldwide</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Mail size={16} />
                            <a href="mailto:support@clubforgehq.com">support@clubforgehq.com</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {currentYear} ClubForge. All rights reserved.</p>
                <div style={{ marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                    <Link href="/waiver">Liability Waiver</Link>
                </div>
            </div>
        </footer>
    );
}
