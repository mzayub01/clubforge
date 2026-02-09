'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type BrowserClient = ReturnType<typeof createBrowserClient>;

export function createClient(): BrowserClient {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.',
        );
    }
    return createBrowserClient(supabaseUrl, supabaseKey);
}

// Singleton client for client components
let browserClient: BrowserClient | null = null;

export function getSupabaseClient(): BrowserClient {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
}
