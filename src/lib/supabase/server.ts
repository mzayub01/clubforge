import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createStandardClient } from '@supabase/supabase-js';
import { getTenantId } from '@/lib/tenant';

// -----------------------------------------------
// Server client (uses anon key, respects RLS)
// -----------------------------------------------

export async function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.',
        );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch {
                        // Handle cookies in read-only context
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch {
                        // Handle cookies in read-only context
                    }
                },
            },
        }
    );

    // Set tenant context for RLS policies
    const tenantId = await getTenantId();
    if (tenantId) {
        await supabase.rpc('set_tenant_context', { p_tenant_id: tenantId });
    }

    return supabase;
}

// -----------------------------------------------
// Admin client (service role, bypasses RLS)
// Use for cross-tenant operations and platform admin tasks
// -----------------------------------------------

export async function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        throw new Error(
            'Missing Supabase admin credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
        );
    }

    return createStandardClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// -----------------------------------------------
// Tenant-scoped admin client (service role + tenant context)
// Bypasses RLS but still filters by tenant for convenience
// -----------------------------------------------

export async function createTenantAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        throw new Error(
            'Missing Supabase admin credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
        );
    }

    const client = createStandardClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    // Set tenant context even for admin client
    const tenantId = await getTenantId();
    if (tenantId) {
        await client.rpc('set_tenant_context', { p_tenant_id: tenantId });
    }

    return client;
}
