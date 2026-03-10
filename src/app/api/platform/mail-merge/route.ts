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

                // Convert newlines to <br> for HTML
                const htmlBody = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
                        ${personalizedBody.replace(/\n/g, '<br>')}
                    </div>
                `;

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

                // 100ms delay to respect Resend rate limits
                await new Promise(resolve => setTimeout(resolve, 100));

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
