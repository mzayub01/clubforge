import Link from 'next/link';
import Image from 'next/image';
import { Linkedin } from 'lucide-react';
import s from './Footer.module.css';

// The Features, Built for and Locations lists are the sitewide internal links
// to the feature, discipline and city pages: keep them when restyling.
// Add "Compare" and "Case studies" columns only once those pages exist
// (.agent/SEO_PLAN.md C1 and D3).

const PRODUCT = [
    { href: '/features', label: 'All features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/#tour', label: 'See it in action' },
    { href: '/#switching', label: 'Switching to ClubForge' },
    { href: '/demo', label: 'Book a demo' },
    { href: '/get-started', label: 'Start free trial' },
];

const FEATURES = [
    { href: '/features/member-management', label: 'Member management' },
    { href: '/features/class-scheduling', label: 'Class scheduling' },
    { href: '/features/belt-progression', label: 'Belt progression' },
    { href: '/features/attendance-tracking', label: 'Attendance tracking' },
    { href: '/features/payments-billing', label: 'Payments and billing' },
    { href: '/features/multi-location', label: 'Multi-location' },
];

const BUILT_FOR = [
    { href: '/for/martial-arts', label: 'Martial arts clubs' },
    { href: '/for/bjj', label: 'BJJ academies' },
    { href: '/for/boxing-mma', label: 'Boxing and MMA gyms' },
    { href: '/for/boxing', label: 'Boxing clubs' },
    { href: '/for/kickboxing', label: 'Kickboxing clubs' },
    { href: '/for/karate', label: 'Karate dojos' },
    { href: '/for/taekwondo', label: 'Taekwondo clubs' },
    { href: '/for/judo', label: 'Judo clubs' },
    { href: '/for/fitness-studios', label: 'Fitness studios' },
];

const COMPANY = [
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/faq', label: 'FAQ' },
];

const CITIES = [
    { href: '/martial-arts-software-london', label: 'London' },
    { href: '/bjj-gym-software-manchester', label: 'Manchester' },
    { href: '/gym-management-birmingham', label: 'Birmingham' },
    { href: '/martial-arts-software-leeds', label: 'Leeds' },
    { href: '/bjj-gym-software-liverpool', label: 'Liverpool' },
    { href: '/martial-arts-software-glasgow', label: 'Glasgow' },
    { href: '/gym-management-edinburgh', label: 'Edinburgh' },
    { href: '/martial-arts-software-bristol', label: 'Bristol' },
    { href: '/bjj-gym-software-sheffield', label: 'Sheffield' },
    { href: '/martial-arts-software-nottingham', label: 'Nottingham' },
    { href: '/gym-management-leicester', label: 'Leicester' },
    { href: '/martial-arts-software-newcastle', label: 'Newcastle' },
];

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
    return (
        <nav className={s.col} aria-label={title}>
            <h2>{title}</h2>
            <ul>
                {links.map(link => (
                    <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                ))}
            </ul>
        </nav>
    );
}

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={s.footer}>
            <div className={s.wrap}>
                <div className={s.top}>
                    <div className={s.brand}>
                        <Image src="/logo-clubforge-final-dark.svg" alt="ClubForge" width={200} height={52} />
                        <p>Club management software for martial arts clubs.</p>
                        <a href="https://linkedin.com/company/clubforge" target="_blank" rel="noopener noreferrer" className={s.social}>
                            <Linkedin size={18} aria-hidden="true" />
                            ClubForge on LinkedIn
                        </a>
                    </div>

                    <Column title="Product" links={PRODUCT} />
                    <Column title="Features" links={FEATURES} />
                    <Column title="Built for" links={BUILT_FOR} />
                    <nav className={s.col} aria-label="Company">
                        <h2>Company</h2>
                        <ul>
                            {COMPANY.map(link => (
                                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                            ))}
                            <li><a href="mailto:support@clubforgehq.com">Contact</a></li>
                        </ul>
                    </nav>
                </div>

                <nav className={s.places} aria-label="Locations">
                    <h2>Locations</h2>
                    <ul>
                        {CITIES.map(city => (
                            <li key={city.href}><Link href={city.href}>{city.label}</Link></li>
                        ))}
                    </ul>
                </nav>

                <div className={s.bottom}>
                    <p>© {currentYear} ClubForge</p>
                    <ul>
                        <li><Link href="/privacy">Privacy</Link></li>
                        <li><Link href="/terms">Terms</Link></li>
                        <li><a href="mailto:support@clubforgehq.com">support@clubforgehq.com</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
