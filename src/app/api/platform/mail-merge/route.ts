// ===============================================
// ClubForge - Platform Mail Merge API
// Send personalized emails to a list of recipients
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

async function verifyPlatformAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

    return data ? user : null;
}

interface Recipient {
    name: string;
    email: string;
}

/**
 * Convert simple markdown formatting to HTML for emails
 * Supports: **bold**, *italic*, [text](url), ## headings, - bullets, ---, newlines
 */
function markdownToEmailHtml(text: string): string {
    return text
        .split('\n')
        .map(line => {
            const trimmed = line.trim();

            // Horizontal rule
            if (/^---+$/.test(trimmed)) {
                return '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">';
            }

            // Heading 2
            if (trimmed.startsWith('## ')) {
                const content = formatInline(trimmed.slice(3));
                return `<h2 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 24px 0 8px 0;">${content}</h2>`;
            }

            // Heading 3
            if (trimmed.startsWith('### ')) {
                const content = formatInline(trimmed.slice(4));
                return `<h3 style="font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 20px 0 6px 0;">${content}</h3>`;
            }

            // Bullet point
            if (/^[-•]\s/.test(trimmed)) {
                const content = formatInline(trimmed.slice(2));
                return `<div style="padding-left: 16px; margin: 4px 0;"><span style="color: #7c3aed; margin-right: 8px;">•</span>${content}</div>`;
            }

            // Empty line = paragraph break
            if (!trimmed) {
                return '<div style="height: 12px;"></div>';
            }

            // Normal paragraph with inline formatting
            return `<p style="margin: 0 0 6px 0; line-height: 1.7;">${formatInline(trimmed)}</p>`;
        })
        .join('\n');
}

/** Format inline markdown: {color:#hex}text{/color}, **bold**, *italic*, [text](url) */
function formatInline(text: string): string {
    return text
        // Colored text: {color:#hex}text{/color}
        .replace(
            /\{color:(#[0-9a-fA-F]{3,6})\}(.+?)\{\/color\}/g,
            '<span style="color: $1">$2</span>'
        )
        // Bold: **text**
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic: *text*
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Links: [text](url)
        .replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" style="color: #7c3aed; text-decoration: underline;">$1</a>'
        );
}

/** Wrap HTML content in a plain email layout (looks like a normal typed email) */
function wrapInEmailTemplate(bodyHtml: string): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #1a1a2e;">
${bodyHtml}
</body>
</html>`;
}

export async function POST(request: NextRequest) {
    try {
        const user = await verifyPlatformAdmin();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { recipients, subject, bodyTemplate, fromName, fromEmail, replyTo } = body as {
            recipients: Recipient[];
            subject: string;
            bodyTemplate: string;
            fromName?: string;
            fromEmail?: string;
            replyTo?: string;
        };

        // Validate
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
        }
        if (!subject?.trim()) {
            return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
        }
        if (!bodyTemplate?.trim()) {
            return NextResponse.json({ error: 'Email body is required' }, { status: 400 });
        }

        // Safety limit
        if (recipients.length > 500) {
            return NextResponse.json(
                { error: 'Maximum 500 recipients per batch. Please split into smaller batches.' },
                { status: 400 }
            );
        }

        // Build from address: "Display Name <email>" or fall back to default
        const fromAddress = fromName && fromEmail
            ? `${fromName} <${fromEmail}>`
            : undefined;

        // Reply-to: use explicit replyTo, or fall back to fromEmail so replies go to their inbox
        const effectiveReplyTo = replyTo?.trim() || fromEmail?.trim() || undefined;

        let sent = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const recipient of recipients) {
            try {
                // Replace placeholders in subject and body
                const personalizedSubject = subject
                    .replace(/\{\{club_name\}\}/gi, recipient.name);

                const personalizedBody = bodyTemplate
                    .replace(/\{\{club_name\}\}/gi, recipient.name);

                // Convert markdown formatting to HTML and wrap in professional template
                const bodyHtml = markdownToEmailHtml(personalizedBody);
                const htmlBody = wrapInEmailTemplate(bodyHtml);

                const result = await sendEmail({
                    to: recipient.email,
                    subject: personalizedSubject,
                    html: htmlBody,
                    ...(fromAddress ? { from: fromAddress } : {}),
                    ...(effectiveReplyTo ? { replyTo: effectiveReplyTo } : {}),
                });

                if (result.success) {
                    sent++;
                } else {
                    failed++;
                    errors.push(`${recipient.email}: ${result.error}`);
                }

                // Resend free tier allows 2 requests/second — 600ms gap keeps us safely under
                await new Promise(resolve => setTimeout(resolve, 600));

            } catch (err) {
                failed++;
                errors.push(`${recipient.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }

        return NextResponse.json({
            success: true,
            sent,
            failed,
            total: recipients.length,
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        });

    } catch (error) {
        console.error('[Mail Merge API] Error:', error);
        return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
    }
}
