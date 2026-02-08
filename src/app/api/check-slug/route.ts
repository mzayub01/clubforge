// ===============================================
// ClubForge - Slug Availability Check
// GET /api/check-slug?slug=xxx
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        // In development without Supabase, return available
        return NextResponse.json({ available: true });
    }

    const supabase = createClient(url, key);

    const { data } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .single();

    return NextResponse.json({ available: !data });
}
