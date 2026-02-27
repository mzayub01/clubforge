import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/dashboard/',
                    '/instructor/',
                    '/professor/',
                    '/platform/',
                    '/api/',
                    '/docs/',
                    '/tenant-home',
                    '/login',
                    '/register',
                    '/reset-password',
                    '/forgot-password',
                    '/waitlist-confirmation',
                    '/checkout/',
                ],
            },
        ],
        sitemap: 'https://clubforgehq.com/sitemap.xml',
    };
}
