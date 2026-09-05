import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { extractSlugFromHost, TENANT_ID_HEADER, TENANT_SLUG_HEADER } from '@/lib/tenant';

// -----------------------------------------------
// Custom domain cache (in-memory, 60s TTL)
// Maps hostname → { slug, tenantId } or null (negative cache)
// This avoids a DB query on every request for custom domains.
// -----------------------------------------------
interface CachedDomain {
    slug: string;
    tenantId: string;
    customDomain: string;
    timestamp: number;
}
interface NegativeCache {
    timestamp: number;
}
const domainCache = new Map<string, CachedDomain | NegativeCache>();
const CACHE_TTL_MS = 60_000; // 60 seconds

function isNegativeCache(entry: CachedDomain | NegativeCache): entry is NegativeCache {
    return !('slug' in entry);
}

function getCachedDomain(host: string): CachedDomain | null | undefined {
    const entry = domainCache.get(host);
    if (entry === undefined) return undefined; // not cached
    // Check TTL for all entries (positive and negative)
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        domainCache.delete(host);
        return undefined; // expired
    }
    if (isNegativeCache(entry)) {
        return null; // negative cache — not a custom domain
    }
    return entry;
}

function setCachedDomain(host: string, value: CachedDomain | null) {
    // Keep cache size bounded
    if (domainCache.size > 500) {
        // Evict oldest entries
        const iterator = domainCache.keys();
        for (let i = 0; i < 100; i++) {
            const key = iterator.next().value;
            if (key) domainCache.delete(key);
        }
    }
    // Store negative cache as { timestamp } so TTL works
    domainCache.set(host, value ?? { timestamp: Date.now() });
}

// -----------------------------------------------
// Public tenant lookup with the anon key.
// Reads the `tenants_public` view (migration 014), which exposes only
// marketing-safe columns — the base `tenants` table is no longer readable by
// anon. Falls back to the base table only while the view doesn't exist yet
// (deploy-before-migrate window).
// -----------------------------------------------
type PublicTenantRow = { id: string; slug: string; custom_domain: string | null };

async function lookupPublicTenant(
    client: SupabaseClient,
    column: 'slug' | 'custom_domain',
    value: string,
): Promise<PublicTenantRow | null> {
    const columns = 'id, slug, custom_domain';
    const { data, error } = await client
        .from('tenants_public')
        .select(columns)
        .eq(column, value)
        .eq('is_active', true)
        .maybeSingle();
    if (!error) return (data as PublicTenantRow | null) ?? null;

    const viewMissing =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        /schema cache|does not exist/i.test(error.message || '');
    if (!viewMissing) return null;

    const { data: legacy } = await client
        .from('tenants')
        .select(columns)
        .eq(column, value)
        .eq('is_active', true)
        .maybeSingle();
    return (legacy as PublicTenantRow | null) ?? null;
}

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // -----------------------------------------------
    // 1. Resolve tenant from subdomain
    // -----------------------------------------------
    const host = request.headers.get('host') || '';
    let slug = extractSlugFromHost(host);

    // -----------------------------------------------
    // 1a. Custom domain fallback (Elite tier)
    // If no subdomain slug was found and the host isn't the
    // base domain, check if it's a custom domain.
    // This is purely ADDITIVE — existing subdomain resolution
    // is completely untouched above.
    // -----------------------------------------------
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'clubforgehq.com';
    const rawHostname = host.split(':')[0]; // strip port
    // Strip www. prefix for custom domain matching (DB stores apex domain)
    const hostname = rawHostname.startsWith('www.') ? rawHostname.slice(4) : rawHostname;
    const isWww = rawHostname.startsWith('www.');
    let customDomainTenantId: string | null = null;
    let isCustomDomain = false;

    if (!slug && hostname !== baseDomain && hostname !== 'localhost') {
        // Check cache first
        const cached = getCachedDomain(hostname);
        if (cached !== undefined) {
            // Cache hit (could be null = negative cache)
            if (cached) {
                slug = cached.slug;
                customDomainTenantId = cached.tenantId;
                isCustomDomain = true;
            }
            // If cached === null, it's a negative cache — not a custom domain, treat as platform
        } else if (supabaseUrl && supabaseKey) {
            // Cache miss — query the database
            const domainLookupClient = createServerClient(supabaseUrl, supabaseKey, {
                cookies: {
                    get() { return undefined; },
                    set() { /* no-op */ },
                    remove() { /* no-op */ },
                },
            });

            // Query custom_domain column — wrapped in try-catch because the column
            // may not exist yet if the migration hasn't been run
            try {
                const tenant = await lookupPublicTenant(domainLookupClient, 'custom_domain', hostname);

                if (tenant) {
                    slug = tenant.slug;
                    customDomainTenantId = tenant.id;
                    isCustomDomain = true;
                    setCachedDomain(hostname, {
                        slug: tenant.slug,
                        tenantId: tenant.id,
                        customDomain: hostname,
                        timestamp: Date.now(),
                    });
                } else {
                    // Negative cache — this hostname is not a custom domain
                    setCachedDomain(hostname, null);
                }
            } catch {
                // custom_domain column likely doesn't exist yet — negative cache
                setCachedDomain(hostname, null);
            }
        }
    }

    // Redirect www → apex for custom domains (e.g., www.hameem.uk → hameem.uk)
    if (isCustomDomain && isWww) {
        const url = request.nextUrl.clone();
        url.host = hostname; // apex domain without www
        url.port = '';
        url.protocol = 'https';
        return NextResponse.redirect(url, 301);
    }

    // -----------------------------------------------
    // 1b. SEO redirect: subdomain → custom domain
    // If user is on slug.clubforgehq.com but tenant has a custom domain,
    // redirect to the custom domain for SEO consistency.
    // -----------------------------------------------
    if (slug && !isCustomDomain && supabaseUrl && supabaseKey) {
        // Check if this subdomain tenant has a custom domain set
        const cached = getCachedDomain(`_slug_${slug}`);
        if (cached !== undefined) {
            if (cached) {
                // Tenant has a custom domain — redirect
                const url = request.nextUrl.clone();
                url.host = cached.customDomain;
                url.port = '';
                url.protocol = 'https';
                return NextResponse.redirect(url, 301);
            }
            // cached === null means tenant has no custom domain — continue normally
        } else {
            // We'll check during tenant ID resolution below and cache the result
            // For the homepage rewrite branch, we do the check inline
        }
    }

    // Clone request headers so we can inject tenant context
    const requestHeaders = new Headers(request.headers);
    if (slug) {
        requestHeaders.set(TENANT_SLUG_HEADER, slug);
    }

    // If we already resolved the tenant ID from custom domain cache, set it
    if (customDomainTenantId) {
        requestHeaders.set(TENANT_ID_HEADER, customDomainTenantId);
    }

    // -----------------------------------------------
    // 1c. Route bifurcation for tenant subdomains
    // Block SaaS-only pages and rewrite homepage
    // -----------------------------------------------
    if (slug) {
        const pathname = request.nextUrl.pathname;

        // SaaS-only pages that should not be visible on tenant subdomains
        const saasOnlyPaths = ['/get-started', '/pricing', '/faq', '/about', '/demo', '/platform'];
        if (saasOnlyPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }

        // Rewrite homepage to the tenant welcome page
        if (pathname === '/') {
            const url = request.nextUrl.clone();
            url.pathname = '/tenant-home';
            // Use rewrite (not redirect) to keep the URL clean
            const rewriteResponse = NextResponse.rewrite(url, {
                request: { headers: requestHeaders },
            });
            // Continue to resolve tenant ID and refresh session below
            // We need to do this inline since rewrite returns immediately
            if (supabaseUrl && supabaseKey) {
                const supabase = createServerClient(supabaseUrl, supabaseKey, {
                    cookies: {
                        get(name: string) {
                            return request.cookies.get(name)?.value;
                        },
                        set(name: string, value: string, options: CookieOptions) {
                            rewriteResponse.cookies.set({ name, value, ...options });
                        },
                        remove(name: string, options: CookieOptions) {
                            rewriteResponse.cookies.set({ name, value: '', ...options });
                        },
                    },
                });
                await supabase.auth.getUser();

                // If we already have the tenant ID from custom domain lookup, use it
                if (customDomainTenantId) {
                    rewriteResponse.headers.set(TENANT_ID_HEADER, customDomainTenantId);
                    requestHeaders.set(TENANT_ID_HEADER, customDomainTenantId);
                } else {
                    const tenant = await lookupPublicTenant(supabase, 'slug', slug);

                    if (tenant) {
                        rewriteResponse.headers.set(TENANT_ID_HEADER, tenant.id);
                        requestHeaders.set(TENANT_ID_HEADER, tenant.id);

                        // SEO redirect: if tenant has custom_domain and user is on subdomain, redirect
                        if (tenant.custom_domain && !isCustomDomain) {
                            const redirectUrl = request.nextUrl.clone();
                            redirectUrl.host = tenant.custom_domain;
                            redirectUrl.port = '';
                            redirectUrl.pathname = '/';
                            redirectUrl.protocol = 'https';
                            setCachedDomain(`_slug_${slug}`, {
                                slug,
                                tenantId: tenant.id,
                                customDomain: tenant.custom_domain,
                                timestamp: Date.now(),
                            });
                            return NextResponse.redirect(redirectUrl, 301);
                        } else {
                            setCachedDomain(`_slug_${slug}`, null);
                        }
                    }
                }
            }
            return rewriteResponse;
        }
    }

    let response = NextResponse.next({
        request: { headers: requestHeaders },
    });

    // -----------------------------------------------
    // 2. Skip Supabase if not configured
    // -----------------------------------------------
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials not configured. Skipping auth middleware.');
        return response;
    }

    // -----------------------------------------------
    // 3. Supabase session refresh
    // -----------------------------------------------
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            get(name: string) {
                return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                request.cookies.set({ name, value, ...options });
                response = NextResponse.next({
                    request: { headers: requestHeaders },
                });
                response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
                request.cookies.set({ name, value: '', ...options });
                response = NextResponse.next({
                    request: { headers: requestHeaders },
                });
                response.cookies.set({ name, value: '', ...options });
            },
        },
    });

    // Refresh session if expired
    await supabase.auth.getUser();

    // -----------------------------------------------
    // 4. Resolve tenant ID from slug (if present)
    // -----------------------------------------------
    if (slug) {
        // If we already have the tenant ID from custom domain lookup, use it directly
        if (customDomainTenantId) {
            response.headers.set(TENANT_ID_HEADER, customDomainTenantId);
            requestHeaders.set(TENANT_ID_HEADER, customDomainTenantId);
            response = NextResponse.next({
                request: { headers: requestHeaders },
            });
            response.headers.set(TENANT_ID_HEADER, customDomainTenantId);
        } else {
            const tenant = await lookupPublicTenant(supabase, 'slug', slug);

            if (tenant) {
                // SEO redirect: if tenant has custom_domain and user is on subdomain, redirect
                if (tenant.custom_domain && !isCustomDomain) {
                    const redirectUrl = request.nextUrl.clone();
                    redirectUrl.host = tenant.custom_domain;
                    redirectUrl.port = '';
                    redirectUrl.protocol = 'https';
                    setCachedDomain(`_slug_${slug}`, {
                        slug,
                        tenantId: tenant.id,
                        customDomain: tenant.custom_domain,
                        timestamp: Date.now(),
                    });
                    return NextResponse.redirect(redirectUrl, 301);
                }

                // No custom domain — cache negative result and proceed normally
                setCachedDomain(`_slug_${slug}`, null);

                // Set tenant ID in response headers for downstream server components
                response.headers.set(TENANT_ID_HEADER, tenant.id);
                // Also set on the forwarded request headers
                requestHeaders.set(TENANT_ID_HEADER, tenant.id);
                // Rebuild response with updated headers
                response = NextResponse.next({
                    request: { headers: requestHeaders },
                });
                // Re-copy cookies from the original response
                response.headers.set(TENANT_ID_HEADER, tenant.id);
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
