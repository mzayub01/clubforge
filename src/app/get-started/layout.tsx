import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Get Started Free — Set Up Your Club in Minutes',
    description: 'Create your ClubForge account and start managing your martial arts club in minutes. Free setup, no credit card required. Belt tracking, class scheduling, membership management and more.',
    alternates: {
        canonical: 'https://clubforgehq.com/get-started',
    },
    openGraph: {
        title: 'Get Started Free — ClubForge',
        description: 'Set up your martial arts club management in minutes. Free tier available, no credit card required.',
        url: 'https://clubforgehq.com/get-started',
    },
    keywords: [
        'ClubForge sign up',
        'martial arts software free trial',
        'gym management software free',
        'start martial arts club software',
        'free club management software',
    ],
};

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
    return children;
}
