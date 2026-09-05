import { Resend } from 'resend';
import { isChildDummyEmail } from './member-contact';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Default from address
const DEFAULT_FROM = process.env.EMAIL_FROM || 'ClubForge <noreply@clubforgehq.com>';

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
}

export interface EmailResult {
    success: boolean;
    id?: string;
    error?: string;
    /** Recipients actually used after child → guardian resolution */
    to?: string[];
}

/**
 * Child accounts carry a generated `@child.clubforge.local` address that can't
 * receive mail. Any such recipient is swapped for the linked guardian's real
 * address (deduplicated); unlinked children are dropped with a warning. Doing
 * this here means EVERY trigger (welcome, payment, events, webhooks…) is
 * covered without each call site having to remember.
 */
export async function resolveRecipients(to: string | string[]): Promise<string[]> {
    const list = (Array.isArray(to) ? to : [to]).filter((e): e is string => !!e);
    const dummies = list.filter(isChildDummyEmail);
    if (dummies.length === 0) return dedupe(list);

    const childToGuardian = new Map<string, string>();
    try {
        const { createAdminClient } = await import('./supabase/admin');
        const admin = createAdminClient();

        const { data: children } = await admin
            .from('profiles')
            .select('email, parent_guardian_id')
            .in('email', dummies);

        const guardianIds = Array.from(new Set(
            (children || []).map(c => c.parent_guardian_id).filter((id): id is string => !!id)
        ));

        const guardianEmailById = new Map<string, string>();
        if (guardianIds.length > 0) {
            const { data: guardians } = await admin
                .from('profiles')
                .select('id, email')
                .in('id', guardianIds);
            for (const g of guardians || []) {
                if (g.email && !isChildDummyEmail(g.email)) guardianEmailById.set(g.id, g.email);
            }
        }

        for (const c of children || []) {
            const guardianEmail = c.parent_guardian_id ? guardianEmailById.get(c.parent_guardian_id) : undefined;
            if (c.email && guardianEmail) childToGuardian.set(c.email.toLowerCase(), guardianEmail);
        }
    } catch (err) {
        console.error('[email] guardian resolution failed:', err instanceof Error ? err.message : err);
    }

    const resolved: string[] = [];
    for (const email of list) {
        if (!isChildDummyEmail(email)) {
            resolved.push(email);
            continue;
        }
        const guardian = childToGuardian.get(email.toLowerCase());
        if (guardian) {
            resolved.push(guardian);
        } else {
            console.warn(`[email] dropping unreachable child address ${email} (no linked guardian)`);
        }
    }
    return dedupe(resolved);
}

function dedupe(emails: string[]): string[] {
    const seen = new Set<string>();
    return emails.filter(e => {
        const key = e.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    if (!resend) {
        console.warn('Email service not configured. Set RESEND_API_KEY in environment.');
        return { success: false, error: 'Email service not configured' };
    }

    const to = await resolveRecipients(options.to);
    if (to.length === 0) {
        return { success: false, error: 'No reachable recipient (child account without a linked guardian)', to };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: options.from || DEFAULT_FROM,
            to,
            subject: options.subject,
            html: options.html,
            replyTo: options.replyTo,
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message, to };
        }

        console.log('Email sent successfully:', data?.id);
        return { success: true, id: data?.id, to };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Email send exception:', errorMessage);
        return { success: false, error: errorMessage, to };
    }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
    return !!resend;
}
