// ===============================================
// ClubForge - Tenant Context
// Resolves and provides tenant context across the application
// ===============================================

import { cache } from 'react';
import { headers } from 'next/headers';

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
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'past_due' | 'cancelled' | 'trialing';
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
