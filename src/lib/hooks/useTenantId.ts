'use client';

// ===============================================
// ClubForge - useTenantId Hook
// Resolves the current user's tenant_id for client components
// ===============================================

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

let cachedTenantId: string | null = null;
let fetchPromise: Promise<string | null> | null = null;

/**
 * Hook that resolves the current user's tenant_id.
 * Uses the tenant_members table to find which tenant the user belongs to.
 * The result is cached globally for the session.
 */
export function useTenantId(): string | null {
    const [tenantId, setTenantId] = useState<string | null>(cachedTenantId);

    useEffect(() => {
        if (cachedTenantId) {
            setTenantId(cachedTenantId);
            return;
        }

        if (!fetchPromise) {
            fetchPromise = (async () => {
                try {
                    const supabase = getSupabaseClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return null;

                    const { data } = await supabase
                        .from('tenant_members')
                        .select('tenant_id')
                        .eq('user_id', user.id)
                        .eq('is_active', true)
                        .limit(1)
                        .single();

                    const id = data?.tenant_id || null;
                    cachedTenantId = id;
                    return id;
                } catch {
                    return null;
                }
            })();
        }

        fetchPromise.then((id) => setTenantId(id));
    }, []);

    return tenantId;
}

/**
 * Reset the cached tenant ID (e.g., on logout or tenant switch).
 */
export function resetTenantCache() {
    cachedTenantId = null;
    fetchPromise = null;
}
