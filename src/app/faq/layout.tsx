import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ — ClubForge Gym Management Software Questions & Answers',
    description: 'Find answers to common questions about ClubForge gym management software. Pricing, setup, features, belt progression tracking, billing, data security, multi-location support, and more.',
    alternates: {
        canonical: 'https://clubforgehq.com/faq',
    },
    openGraph: {
        title: 'FAQ — ClubForge Gym Management Software',
        description: 'Everything you need to know about ClubForge. Setup, pricing, features, belt progression, billing, and data security.',
        url: 'https://clubforgehq.com/faq',
    },
    keywords: [
        'ClubForge FAQ',
        'gym management software FAQ',
        'martial arts software questions',
        'gym billing software help',
        'belt progression tracking FAQ',
        'club management software support',
    ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return children;
}
