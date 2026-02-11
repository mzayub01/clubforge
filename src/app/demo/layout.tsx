import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Book a Demo — See ClubForge in Action',
    description: 'Get a personalised 30-minute walkthrough of ClubForge. See member management, class scheduling, belt progression, and billing features tailored to your club.',
    alternates: {
        canonical: 'https://clubforgehq.com/demo',
    },
    openGraph: {
        title: 'Book a Demo — See ClubForge in Action',
        description: 'Get a personalised walkthrough tailored to your club.',
        url: 'https://clubforgehq.com/demo',
    },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
    return children;
}
