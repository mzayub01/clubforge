import { NextRequest, NextResponse } from 'next/server';
import { TENANT_SLUG_HEADER } from '@/lib/tenant';
import { createAdminClient } from '@/lib/supabase/admin';

// Serve a dynamic manifest.json that uses the tenant name when on a tenant domain
export async function GET(request: NextRequest) {
    const slug = request.headers.get(TENANT_SLUG_HEADER);

    let appName = 'ClubForge';
    let appDescription = 'Club Management Platform';
    let themeColor = '#C5A456';

    if (slug) {
        try {
            // Service role: `tenants` is not readable with the anon/user key any
            // more (migration 014). Only marketing-safe columns are selected.
            const supabase = createAdminClient();
            const { data: tenant } = await supabase
                .from('tenants')
                .select('name, primary_color')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (tenant) {
                appName = tenant.name;
                appDescription = `${tenant.name} — Member Portal`;
                if (tenant.primary_color) {
                    themeColor = `#${tenant.primary_color.replace('#', '')}`;
                }
            }
        } catch {
            // Fall back to defaults
        }
    }

    const manifest = {
        name: appName,
        short_name: appName,
        description: appDescription,
        start_url: '/',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: themeColor,
        orientation: 'portrait-primary',
        icons: [
            { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['sports', 'fitness', 'health'],
    };

    return NextResponse.json(manifest, {
        headers: {
            'Content-Type': 'application/manifest+json',
            'Cache-Control': 'public, max-age=3600', // cache for 1 hour
        },
    });
}
