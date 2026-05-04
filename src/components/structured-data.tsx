// ===============================================
// ClubForge — JSON-LD Structured Data Components
// Used for rich snippets in Google, Bing, AI engines
// ===============================================

import React from 'react';

const SITE_URL = 'https://clubforgehq.com';
const LOGO_URL = `${SITE_URL}/logo-clubforge-final.svg`;

// -----------------------------------------------
// Organization Schema — appears in Knowledge Panel
// -----------------------------------------------
export function OrganizationSchema() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ClubForge',
        url: SITE_URL,
        logo: LOGO_URL,
        description: 'The all-in-one management platform for martial arts clubs, gyms, dojos, and fitness academies. Member management, class scheduling, belt progression, payments, and more.',
        foundingDate: '2025',
        sameAs: [
            'https://twitter.com/clubforgehq',
            'https://linkedin.com/company/clubforge',
            'https://www.capterra.co.uk/software/clubforge',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'sales',
            email: 'support@clubforgehq.com',
            url: `${SITE_URL}/demo`,
            availableLanguage: ['English'],
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// -----------------------------------------------
// WebSite Schema — enables sitelinks searchbox
// -----------------------------------------------
export function WebSiteSchema() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'ClubForge',
        url: SITE_URL,
        description: 'The operating system for martial arts clubs and fitness academies.',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/faq?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// -----------------------------------------------
// SoftwareApplication Schema — for product rich results
// -----------------------------------------------
export function SoftwareApplicationSchema() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ClubForge',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Gym Management Software',
        operatingSystem: 'Web',
        url: SITE_URL,
        description: 'All-in-one club management platform for martial arts gyms, dojos, and fitness academies. Manage members, classes, belt progression, payments, attendance, and more from a single dashboard.',
        screenshot: `${SITE_URL}/opengraph-image`,
        featureList: [
            'Member management with family accounts',
            'Class scheduling and recurring timetables',
            'Attendance tracking with one-tap check-in',
            'Belt & rank progression with grading history',
            'Stripe payments, subscriptions, and billing',
            'Event management and ticketing',
            'Video training library',
            'Multi-location support',
            'Branded member portal',
            'Custom email templates',
            'Advanced analytics and reports',
            'White-label branding',
        ].join(', '),
        offers: [
            {
                '@type': 'Offer',
                name: 'Starter',
                price: '39',
                priceCurrency: 'GBP',
                priceValidUntil: '2027-12-31',
                url: `${SITE_URL}/pricing`,
                description: 'For new and small clubs. Up to 150 members, 1 location.',
            },
            {
                '@type': 'Offer',
                name: 'Pro',
                price: '129',
                priceCurrency: 'GBP',
                priceValidUntil: '2027-12-31',
                url: `${SITE_URL}/pricing`,
                description: 'For established clubs scaling up. Up to 750 members, 3 locations.',
            },
            {
                '@type': 'Offer',
                name: 'Elite',
                price: '349',
                priceCurrency: 'GBP',
                priceValidUntil: '2027-12-31',
                url: `${SITE_URL}/pricing`,
                description: 'For large academies and franchises. Unlimited everything.',
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// -----------------------------------------------
// FAQPage Schema — shows rich FAQ snippets in Google
// -----------------------------------------------
interface FAQItem {
    question: string;
    answer: string;
}

export function FAQPageSchema({ faqs }: { faqs: FAQItem[] }) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// -----------------------------------------------
// BreadcrumbList Schema — for breadcrumbs in SERPs
// -----------------------------------------------
interface BreadcrumbItem {
    name: string;
    url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
