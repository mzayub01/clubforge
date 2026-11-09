// ===============================================
// ClubForge - Auth link confirmation
// GET /auth/confirm?token_hash=…&type=recovery&next=/reset-password
//
// Target of every password link ClubForge emails (see src/lib/password-reset.ts).
// Verifies the one-time token hash server side, writes the session cookies on
// the redirect response and sends the user on to `next` — so the link works in
// whatever browser or device the email is opened in (no PKCE verifier needed).
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { requestOrigin, RESET_PASSWORD_PATH } from '@/lib/password-reset';

const OTP_TYPES: ReadonlySet<string> = new Set<EmailOtpType>(['recovery', 'signup', 'invite', 'magiclink', 'email_change', 'email']);

/** Only same-site relative paths — never an absolute URL from the query string. */
function safeNextPath(next: string | null, fallback: string): string {
    if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
    return next;
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const { origin } = requestOrigin(request);

    const isRecovery = type === 'recovery';
    const fallback = isRecovery ? RESET_PASSWORD_PATH : '/login';
    const next = safeNextPath(searchParams.get('next'), fallback);
    const failure = () => NextResponse.redirect(new URL(`${fallback}?error=link_invalid`, origin));

    if (!tokenHash || !type || !OTP_TYPES.has(type)) {
        return failure();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('[auth/confirm] Supabase credentials not configured');
        return failure();
    }

    // Cookies are written straight onto the redirect we return, so the session
    // is guaranteed to travel with the user to `next`.
    const success = NextResponse.redirect(new URL(next, origin));
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                for (const { name, value, options } of cookiesToSet) {
                    success.cookies.set(name, value, options);
                }
            },
        },
    });

    const { error } = await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash });
    if (error) {
        console.warn(`[auth/confirm] ${type} link rejected: ${error.message}`);
        return failure();
    }

    return success;
}
