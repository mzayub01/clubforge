// ===============================================
// ClubForge - Shared Auth Guard Helpers
// Reusable authentication and authorization checks
// for API route handlers
// ===============================================

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTenantId } from '@/lib/tenant';
import { rateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// -----------------------------------------------
// Types
// -----------------------------------------------

export interface AuthResult {
    error: string | null;
    status: number;
    userId: string | null;
    tenantId: string | null;
    role: string | null;
}

// -----------------------------------------------
// Authenticate any logged-in user
// -----------------------------------------------

export async function requireAuth(): Promise<AuthResult> {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { error: 'Unauthorized', status: 401, userId: null, tenantId: null, role: null };
        }

        const adminSupabase = createAdminClient();
        const headerTenantId = await getTenantId();

        // 1. Membership scoped to the tenant the request is for (subdomain/custom
        //    domain). Scoping to one tenant also avoids the old bug where a user
        //    belonging to multiple tenants broke .single() (multiple rows) and fell
        //    back to role 'member', causing spurious 403s on admin endpoints.
        if (headerTenantId) {
            const { data: tenantMember } = await adminSupabase
                .from('tenant_members')
                .select('role')
                .eq('user_id', user.id)
                .eq('tenant_id', headerTenantId)
                .eq('is_active', true)
                .single();

            if (tenantMember) {
                return {
                    error: null,
                    status: 200,
                    userId: user.id,
                    tenantId: headerTenantId,
                    role: tenantMember.role,
                };
            }

            // 2. Platform admins act as admin of the tenant they're browsing
            //    (mirrors the admin CRUD route). Without this, platform admins who
            //    aren't tenant_members resolved to 'member' and got 403s.
            const { data: platformAdmin } = await adminSupabase
                .from('platform_admins')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (platformAdmin) {
                return {
                    error: null,
                    status: 200,
                    userId: user.id,
                    tenantId: headerTenantId,
                    role: 'admin',
                };
            }
        }

        // 3. No tenant context (e.g. non-subdomain route): the user's earliest
        //    active membership. limit(1) tolerates users in multiple tenants.
        const { data: anyMember } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id, role')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        return {
            error: null,
            status: 200,
            userId: user.id,
            tenantId: anyMember?.tenant_id || null,
            role: anyMember?.role || 'member',
        };
    } catch {
        return { error: 'Authentication failed', status: 401, userId: null, tenantId: null, role: null };
    }
}

// -----------------------------------------------
// Authenticate and require admin role
// -----------------------------------------------

export async function requireAdmin(): Promise<AuthResult> {
    const auth = await requireAuth();
    if (auth.error) return auth;

    if (auth.role !== 'admin') {
        return { ...auth, error: 'Forbidden: Admin access required', status: 403 };
    }

    return auth;
}

// -----------------------------------------------
// Authenticate and require admin or instructor role
// -----------------------------------------------

export async function requireStaff(): Promise<AuthResult> {
    const auth = await requireAuth();
    if (auth.error) return auth;

    if (!['admin', 'instructor'].includes(auth.role || '')) {
        return { ...auth, error: 'Forbidden: Staff access required', status: 403 };
    }

    return auth;
}

// -----------------------------------------------
// Rate limit helper that returns a NextResponse if blocked
// -----------------------------------------------

export function checkRateLimit(
    request: NextRequest,
    key: string,
    maxRequests: number = 30,
    windowMs: number = 60_000
): NextResponse | null {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { success } = rateLimit(`${key}:${ip}`, { maxRequests, windowMs });

    if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    return null;
}

// -----------------------------------------------
// HTML sanitiser — strips dangerous tags/attributes
// for use in email templates and any user-generated HTML
// -----------------------------------------------

const DANGEROUS_TAGS = /(<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|link|style|meta|base|applet)[^>]*>)/gi;
const EVENT_HANDLERS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi;
const JAVASCRIPT_URLS = /(href|src|action)\s*=\s*["']?\s*javascript\s*:/gi;
const DATA_URLS = /(href|src|action)\s*=\s*["']?\s*data\s*:/gi;

export function sanitiseHtml(input: string): string {
    if (!input) return input;
    return input
        .replace(DANGEROUS_TAGS, '')
        .replace(EVENT_HANDLERS, '')
        .replace(JAVASCRIPT_URLS, '$1=""')
        .replace(DATA_URLS, '$1=""');
}

// -----------------------------------------------
// Sanitise text for safe interpolation into HTML
// (escapes all HTML special characters)
// -----------------------------------------------

export function escapeHtml(str: string): string {
    if (!str) return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// -----------------------------------------------
// Password complexity validation
// -----------------------------------------------

export function validatePasswordStrength(password: string): string | null {
    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
    }
    return null; // Valid
}

// -----------------------------------------------
// Safe error response — hides internal details
// -----------------------------------------------

export function safeErrorResponse(error: unknown, fallbackMessage: string = 'Internal server error'): string {
    // In development, return the full error for debugging
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        return error.message;
    }
    return fallbackMessage;
}
