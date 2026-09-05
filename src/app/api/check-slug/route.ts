// ===============================================
// ClubForge - Slug Availability Check
// GET /api/check-slug?slug=xxx
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug || slug.length < 3) {
        return NextResponse.json({ available: false, error: 'Slug must be at least 3 characters' });
    }

    // Validate format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
        return NextResponse.json({ available: false, error: 'Invalid slug format' });
    }

    // Reserved slugs that can't be used by tenants
    const RESERVED = [
        'www', 'app', 'api', 'admin', 'help', 'support', 'docs',
        'blog', 'status', 'mail', 'demo', 'test', 'staging',
        'platform', 'dashboard', 'billing', 'pricing', 'login',
        'register', 'get-started', 'onboard', 'clubforge',
    ];

    if (RESERVED.includes(slug)) {
        return NextResponse.json({ available: false, error: 'This name is reserved' });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // In development without Supabase, return available
        return NextResponse.json({ available: true });
    }

    // Service role: `tenants` is not readable with the anon key any more
    // (migration 014), and availability must also consider inactive tenants.
    const supabase = createAdminClient();

    const { data } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

    return NextResponse.json({ available: !data });
}
