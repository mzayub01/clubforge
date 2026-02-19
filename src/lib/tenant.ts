// ===============================================
// ClubForge - Tenant Context
// Resolves and provides tenant context across the application
// ===============================================

import { cache } from 'react';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

// -----------------------------------------------
// Types
// -----------------------------------------------

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_user_id?: string;
  logo_url?: string;
  primary_color: string;
  contact_email?: string;
  contact_phone?: string;
  stripe_account_id?: string;
  stripe_customer_id?: string;
  stripe_connect_enabled: boolean;
  subscription_tier: 'starter' | 'pro' | 'elite';
  subscription_status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  trial_ends_at?: string;
  onboarding_completed: boolean;
  tagline?: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'member' | 'instructor' | 'professor' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------
// Header constants
// -----------------------------------------------

export const TENANT_ID_HEADER = 'x-tenant-id';
export const TENANT_SLUG_HEADER = 'x-tenant-slug';

// -----------------------------------------------
// Server-side tenant resolution (cached per request)
// -----------------------------------------------

/**
 * Get the current tenant ID from request headers.
 * This is set by the middleware after resolving the tenant from the subdomain/slug.
 * Uses React `cache()` so it's only read once per request.
 */
export const getTenantId = cache(async (): Promise<string | null> => {
  try {
    const headerStore = await headers();
    return headerStore.get(TENANT_ID_HEADER) || null;
  } catch {
    return null;
  }
});

/**
 * Get the current tenant slug from request headers.
 */
export const getTenantSlug = cache(async (): Promise<string | null> => {
  try {
    const headerStore = await headers();
    return headerStore.get(TENANT_SLUG_HEADER) || null;
  } catch {
    return null;
  }
});

/**
 * Require a tenant ID — throws if not present.
 * Use this in API routes and pages that must have tenant context.
 */
export async function requireTenantId(): Promise<string> {
  const tenantId = await getTenantId();
  if (!tenantId) {
    throw new Error('Tenant context is required but not found. Ensure middleware is configured.');
  }
  return tenantId;
}

// -----------------------------------------------
// Slug extraction helpers
// -----------------------------------------------

/**
 * Extract tenant slug from hostname.
 * Examples:
 *   ironmonger.clubforgehq.com → "ironmonger"
 *   clubforgehq.com → null (platform root)
 *   ironmonger.localhost:3000 → "ironmonger"
 */
export function extractSlugFromHost(host: string): string | null {
  // Remove port
  const hostname = host.split(':')[0];

  // Local development: {slug}.localhost
  if (hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    const slug = hostname.split('.')[0];
    return slug === 'localhost' || slug === 'local' ? null : slug;
  }

  // Production: {slug}.clubforgehq.com
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'clubforgehq.com';
  if (hostname.endsWith(`.${baseDomain}`)) {
    const slug = hostname.replace(`.${baseDomain}`, '');
    return slug || null;
  }

  // Direct domain access (no subdomain) → platform root
  if (hostname === baseDomain || hostname === 'localhost') {
    return null;
  }

  return null;
}

// -----------------------------------------------
// Shared tenant + role resolution for API routes
// -----------------------------------------------



/**
 * Resolve tenant ID and role for a given user.
 * 1. Tries getTenantId() from middleware headers
 * 2. Falls back to tenant_members lookup via admin client
 * 
 * Returns { tenantId, role } or null if user has no tenant membership.
 */
export async function resolveTenantForUser(userId: string): Promise<{
  tenantId: string;
  role: 'member' | 'instructor' | 'professor' | 'admin';
} | null> {
  // Try header-based resolution first (fast path)
  const headerTenantId = await getTenantId();

  if (headerTenantId) {
    // We have the tenant from headers; look up the user's role in that tenant
    const admin = createAdminClient();
    const { data: membership } = await admin
      .from('tenant_members')
      .select('role')
      .eq('user_id', userId)
      .eq('tenant_id', headerTenantId)
      .eq('is_active', true)
      .single();

    return membership
      ? { tenantId: headerTenantId, role: membership.role }
      : null;
  }

  // Fallback: look up tenant_members directly (works for admin-domain routes)
  const admin = createAdminClient();
  const { data: membership } = await admin
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  return membership
    ? { tenantId: membership.tenant_id, role: membership.role }
    : null;
}
