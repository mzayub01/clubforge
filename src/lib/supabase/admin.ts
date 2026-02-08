// ===============================================
// ClubForge - Supabase Admin Client (Service Role)
// For server-side operations that bypass RLS
// ===============================================

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the service role key.
 * This client bypasses RLS and should ONLY be used for:
 * - Tenant provisioning
 * - Platform-level operations
 * - Billing synchronisation
 * 
 * NEVER expose this client to the browser.
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error(
            'Missing Supabase admin credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
        );
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
