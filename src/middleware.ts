import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { extractSlugFromHost, TENANT_ID_HEADER, TENANT_SLUG_HEADER } from '@/lib/tenant';

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // -----------------------------------------------
    // 1. Resolve tenant from subdomain
    // -----------------------------------------------
    const host = request.headers.get('host') || '';
    const slug = extractSlugFromHost(host);

    // Clone request headers so we can inject tenant context
    const requestHeaders = new Headers(request.headers);
    if (slug) {
        requestHeaders.set(TENANT_SLUG_HEADER, slug);
    }

    // -----------------------------------------------
    // 1b. Route bifurcation for tenant subdomains
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

                const { data: tenant } = await supabase
                    .from('tenants')
                    .select('id')
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .single();

                if (tenant) {
                    rewriteResponse.headers.set(TENANT_ID_HEADER, tenant.id);
                    requestHeaders.set(TENANT_ID_HEADER, tenant.id);
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
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (tenant) {
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
