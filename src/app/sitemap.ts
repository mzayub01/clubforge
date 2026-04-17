import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://clubforgehq.com';

    return [
        {
            url: baseUrl,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/features`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/features/member-management`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/class-scheduling`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/belt-progression`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/attendance-tracking`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/payments-billing`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/multi-location`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/martial-arts`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/bjj`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/boxing-mma`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for/fitness-studios`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/get-started`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/demo`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date('2026-03-23'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        // City landing pages
        {
            url: `${baseUrl}/martial-arts-software-london`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/bjj-gym-software-manchester`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gym-management-birmingham`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-leeds`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/bjj-gym-software-liverpool`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-glasgow`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gym-management-edinburgh`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-bristol`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/bjj-gym-software-sheffield`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-nottingham`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gym-management-leicester`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/martial-arts-software-newcastle`,
            lastModified: new Date('2026-04-17'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date('2026-02-27'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date('2026-02-27'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
}
