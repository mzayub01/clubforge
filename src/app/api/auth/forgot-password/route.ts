// ===============================================
// ClubForge - Forgot password
// POST /api/auth/forgot-password  { email }
//
// Replaces the browser-side `supabase.auth.resetPasswordForEmail()`, which
// relied on Supabase Auth's built-in mailer — that mailer only delivers to the
// Supabase project's own team members unless custom SMTP is configured, so club
// members saw "we've sent a link" and nothing arrived. The link is now
// generated here and emailed through Resend with the club's branding.
//
// Response is the same whether or not the address has an account (no
// enumeration); a genuine sending failure is reported honestly.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/auth-guard';
import { rateLimit } from '@/lib/rate-limit';
import { getTenantId } from '@/lib/tenant';
import { isChildDummyEmail } from '@/lib/member-contact';
import { createRecoveryLink, requestOrigin, sendPasswordEmail } from '@/lib/password-reset';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** `ab***@domain` — enough to follow a report in the logs without storing the address. */
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
}

export async function POST(request: NextRequest) {
    // Per-IP: 5 requests / 15 min
    const limited = checkRateLimit(request, 'forgot-password', 5, 15 * 60_000);
    if (limited) return limited;

    let email = '';
    try {
        const body = await request.json();
        email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    } catch {
        // fall through to validation below
    }
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Per-address: 3 emails / hour, whoever asks
    const perEmail = rateLimit(`forgot-password-email:${email}`, { maxRequests: 3, windowMs: 60 * 60_000 });
    if (!perEmail.success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const ok = NextResponse.json({ success: true });

    // Child accounts have no inbox and no password of their own — guardians
    // manage them. Say nothing and send nothing.
    if (isChildDummyEmail(email)) return ok;

    try {
        const { origin, host } = requestOrigin(request);
        const tenantId = await getTenantId();

        const link = await createRecoveryLink(email, origin);
        if (!link.ok) {
            if (link.reason === 'not_found') {
                console.log(`[forgot-password] no account for ${maskEmail(email)} (tenant ${tenantId ?? 'platform'})`);
                return ok;
            }
            console.error(`[forgot-password] generateLink failed for ${maskEmail(email)}: ${link.message}`);
            return NextResponse.json(
                { error: "We couldn't create a reset link right now. Please try again in a few minutes." },
                { status: 503 },
            );
        }

        // First name for the greeting — prefer the profile in this club.
        let firstName: string | null = null;
        if (link.userId) {
            const admin = createAdminClient();
            let query = admin.from('profiles').select('first_name').eq('user_id', link.userId);
            if (tenantId) query = query.eq('tenant_id', tenantId);
            const { data: profile } = await query.limit(1).maybeSingle();
            firstName = profile?.first_name ?? null;
        }

        const sent = await sendPasswordEmail({
            to: email,
            variant: 'reset',
            url: link.url,
            firstName,
            tenantId,
            origin,
            host,
        });

        if (!sent.success) {
            console.error(`[forgot-password] email to ${maskEmail(email)} failed: ${sent.error}`);
            return NextResponse.json(
                { error: "We couldn't send the email right now. Please try again shortly or contact the club." },
                { status: 503 },
            );
        }

        console.log(`[forgot-password] reset link sent to ${maskEmail(email)} (tenant ${tenantId ?? 'platform'}, resend ${sent.id ?? '?'})`);
        return ok;
    } catch (error) {
        console.error('[forgot-password] unexpected error:', error);
        return NextResponse.json(
            { error: "We couldn't send the email right now. Please try again in a few minutes." },
            { status: 500 },
        );
    }
}
