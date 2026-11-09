// ===============================================
// ClubForge - Password recovery links & emails (server only)
//
// Every password link ClubForge sends — "Forgot password?" and the admin
// "Set your password" email for a new member — is built here and delivered
// through Resend with the club's branding. Supabase Auth's own mailer is
// never used: without custom SMTP it only delivers to the project's team
// members (and is capped at a couple of emails an hour), so a club member
// would see "we've sent a link" and receive nothing.
//
// The link points at our own `/auth/confirm` route with the `hashed_token`
// from `auth.admin.generateLink`. That route calls `verifyOtp` server side
// and sets the session cookie, so the link works in ANY browser or device —
// unlike Supabase's `action_link`, which completes as an implicit-flow
// redirect that the PKCE browser client (`@supabase/ssr`) rejects with
// "Not a valid PKCE flow url.".
// ===============================================

import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, type EmailResult } from '@/lib/email';
import { getTenantBranding } from '@/lib/email-templates-db';
import { escapeHtml } from '@/lib/auth-guard';

export const RESET_PASSWORD_PATH = '/reset-password';

/**
 * The public origin the user is on (club custom domain, subdomain, or the
 * platform host). Vercel sets `x-forwarded-host`; `host` is the fallback.
 */
export function requestOrigin(request: NextRequest): { origin: string; host: string } {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'clubforgehq.com';
    const isLocal = /^(localhost|127\.0\.0\.1|[^/]+\.localhost)(:\d+)?$/i.test(host);
    const proto = isLocal ? 'http' : 'https';
    return { origin: `${proto}://${host}`, host };
}

/**
 * Builds the link a user clicks. `/auth/confirm` verifies the token hash,
 * establishes the session in cookies and redirects to `next`.
 */
export function buildRecoveryUrl(origin: string, hashedToken: string, next: string = RESET_PASSWORD_PATH): string {
    const params = new URLSearchParams({ token_hash: hashedToken, type: 'recovery', next });
    return `${origin}/auth/confirm?${params.toString()}`;
}

export type RecoveryLinkResult =
    | { ok: true; url: string; userId: string | null }
    | { ok: false; reason: 'not_found' | 'error'; message: string };

/**
 * Generates a one-time recovery link for an existing auth user.
 * `not_found` is returned for unknown emails so callers can stay silent
 * (no account enumeration) while still distinguishing real failures.
 */
export async function createRecoveryLink(email: string, origin: string): Promise<RecoveryLinkResult> {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
    });

    if (error || !data?.properties?.hashed_token) {
        const message = error?.message || 'no hashed_token returned';
        const notFound = error?.status === 404 || /not.?found/i.test(message);
        return { ok: false, reason: notFound ? 'not_found' : 'error', message };
    }

    return {
        ok: true,
        url: buildRecoveryUrl(origin, data.properties.hashed_token),
        userId: data.user?.id ?? null,
    };
}

export interface PasswordEmailOptions {
    to: string;
    /** `set`: admin created the account; `reset`: the member asked for a reset. */
    variant: 'set' | 'reset';
    url: string;
    firstName?: string | null;
    /** Club the request is for — branding, from-name and reply-to. */
    tenantId?: string | null;
    origin: string;
    host: string;
}

/**
 * Sends the "Set your password" / "Reset your password" email via Resend,
 * branded for the club when a tenant is known.
 */
export async function sendPasswordEmail(opts: PasswordEmailOptions): Promise<EmailResult> {
    const branding = opts.tenantId ? await getTenantBranding(opts.tenantId) : null;
    const clubName = branding?.name || 'ClubForge';
    const from = `${clubName} <noreply@clubforgehq.com>`;
    const replyTo = branding?.contactEmail || undefined;
    const greeting = opts.firstName ? `Hi ${escapeHtml(opts.firstName)},` : 'Hi,';
    const safeClub = escapeHtml(clubName);
    const safeHost = escapeHtml(opts.host);

    const intro = opts.variant === 'set'
        ? `<p>${safeClub} has created a member account for you using <strong>${escapeHtml(opts.to)}</strong>. Choose your password to sign in:</p>`
        : `<p>We received a request to reset the password for your ${safeClub} account (<strong>${escapeHtml(opts.to)}</strong>). Click the button below to choose a new one:</p>`;
    const button = opts.variant === 'set' ? 'Set my password' : 'Reset my password';
    const heading = opts.variant === 'set' ? `Your ${safeClub} member account` : `Reset your ${safeClub} password`;
    const subject = opts.variant === 'set' ? `Set your password for ${clubName}` : `Reset your ${clubName} password`;
    const ignore = opts.variant === 'reset'
        ? `<p style="color:#666;font-size:13px">If you didn't ask for this, you can ignore this email — your password won't change.</p>`
        : '';

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
            <h2 style="margin:0 0 12px">${heading}</h2>
            <p>${greeting}</p>
            ${intro}
            <p style="margin:24px 0"><a href="${opts.url}" style="background:#c5a456;color:#000;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">${button}</a></p>
            <p style="color:#666;font-size:13px">This link can only be used once and expires after a short time. If it has expired, use “Forgot password?” on the sign-in page at <a href="${opts.origin}/login">${safeHost}</a>.</p>
            <p style="color:#666;font-size:13px">If the button doesn't work, copy this address into your browser:<br/><span style="word-break:break-all">${opts.url}</span></p>
            ${ignore}
            <p>See you soon,<br/>The ${safeClub} Team</p>
        </div>`;

    return sendEmail({ to: opts.to, subject, html, from, replyTo });
}
