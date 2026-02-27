import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://clubforgehq.com';

    return [
        {
            url: baseUrl,
            lastModified: new Date('2026-02-27'),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date('2026-02-27'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/get-started`,
            lastModified: new Date('2026-02-27'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/demo`,
            lastModified: new Date('2026-02-27'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date('2026-02-27'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date('2026-02-27'),
            changeFrequency: 'monthly',
            priority: 0.7,
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
