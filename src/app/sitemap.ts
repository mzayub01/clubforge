import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://clubforgehq.com';

    // Use actual content dates rather than current time
    const siteLastUpdated = new Date('2026-06-22');
    const blogLastUpdated = new Date('2026-06-22');
    const pagesCreated = new Date('2026-03-01');

    return [
        {
            url: baseUrl,
            lastModified: siteLastUpdated,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/features`,
            lastModified: siteLastUpdated,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/features/member-management`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/class-scheduling`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/belt-progression`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/attendance-tracking`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/payments-billing`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/multi-location`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        // Discipline pages
        {
            url: `${baseUrl}/for/martial-arts`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/bjj`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/boxing-mma`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/fitness-studios`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/boxing`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/kickboxing`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/karate`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/taekwondo`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/judo`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        // Core pages
        {
            url: `${baseUrl}/pricing`,
            lastModified: siteLastUpdated,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/get-started`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/demo`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: pagesCreated,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        // Blog
        {
            url: `${baseUrl}/blog`,
            lastModified: blogLastUpdated,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/best-app-to-track-belt-promotions`,
            lastModified: new Date('2026-04-15'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog/martial-arts-software-uk-guide`,
            lastModified: blogLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog/how-much-does-gym-management-software-cost`,
            lastModified: new Date('2026-04-20'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog/karate-club-software-guide`,
            lastModified: blogLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog/martial-arts-gym-management-guide`,
            lastModified: blogLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog/boxing-gym-software-guide`,
            lastModified: blogLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        // City landing pages
        {
            url: `${baseUrl}/martial-arts-software-london`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/bjj-gym-software-manchester`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gym-management-birmingham`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-leeds`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/bjj-gym-software-liverpool`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-glasgow`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gym-management-edinburgh`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-bristol`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/bjj-gym-software-sheffield`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-nottingham`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gym-management-leicester`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-newcastle`,
            lastModified: siteLastUpdated,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        // Legal
        {
            url: `${baseUrl}/privacy`,
            lastModified: pagesCreated,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: pagesCreated,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
}
