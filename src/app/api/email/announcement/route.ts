import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { renderEmailFromDatabase, getTenantBranding } from '@/lib/email-templates-db';
import { requireAdmin, checkRateLimit, escapeHtml, safeErrorResponse } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 requests per minute
        const rateLimited = checkRateLimit(request, 'email-announce', 10);
        if (rateLimited) return rateLimited;

        // Require admin authentication
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await request.json();
        const { announcementTitle, announcementMessage, locationId, targetAudience } = body;

        if (!announcementTitle || !announcementMessage) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // H5: Sanitise user inputs before HTML interpolation
        const safeTitle = escapeHtml(announcementTitle);
        const safeMessage = escapeHtml(announcementMessage);

        // Use admin client to fetch all members
        const supabaseAdmin = createAdminClient();

        // Get tenant branding for email personalisation
        const branding = auth.tenantId ? await getTenantBranding(auth.tenantId) : null;
        const fromName = branding?.name || 'ClubForge';

        // Build query to get members
        // Start with active memberships
        let query = supabaseAdmin
            .from('memberships')
            .select('user_id, profile:profiles!inner(first_name, email, role, is_child)')
            .eq('status', 'active')
            .eq('tenant_id', auth.tenantId); // H2: Tenant isolation

        // Filter by location if specified
        if (locationId) {
            query = query.eq('location_id', locationId);
        }

        const { data: memberships, error: membershipsError } = await query;

        if (membershipsError) {
            console.error('Error fetching memberships:', membershipsError);
            return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
        }

        // Filter by target audience and remove duplicates (one member might have multiple memberships)
        const emailMap = new Map<string, { firstName: string; email: string }>();

        for (const membership of memberships || []) {
            // Profile can be an object or array depending on the query
            const profileData = membership.profile as unknown;
            const profile = (Array.isArray(profileData) ? profileData[0] : profileData) as {
                first_name: string;
                email: string;
                role: string;
                is_child: boolean
            } | null;

            if (!profile) continue;

            // Skip child profiles (they don't have real emails)
            if (profile.is_child) continue;

            // Skip if email looks like a child placeholder
            if (profile.email.includes('@child.clubforge.local')) continue;

            // Filter by target audience
            if (targetAudience === 'members' && profile.role !== 'member') continue;
            if (targetAudience === 'instructors' && profile.role !== 'instructor') continue;
            // 'all' includes everyone

            // Use Map to deduplicate by email
            if (!emailMap.has(profile.email)) {
                emailMap.set(profile.email, {
                    firstName: profile.first_name,
                    email: profile.email,
                });
            }
        }

        const recipients = Array.from(emailMap.values());

        if (recipients.length === 0) {
            return NextResponse.json({
                success: true,
                sent: 0,
                failed: 0,
                message: 'No matching recipients found',
            });
        }

        // Send emails
        let sent = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const recipient of recipients) {
            try {
                // Render the email template
                const templateData = {
                    firstName: escapeHtml(recipient.firstName),
                    announcementTitle: safeTitle,
                    announcementMessage: safeMessage.replace(/\n/g, '<br>'),
                };

                const emailContent = await renderEmailFromDatabase('announcement_notification', templateData, auth.tenantId || undefined, branding || undefined);

                if (!emailContent) {
                    // Fallback if template not in database
                    const fallbackSubject = `📢 ${safeTitle}`;
                    const fallbackHtml = `
    <p>Hi ${escapeHtml(recipient.firstName)},</p>
        <p>We have an important announcement:</p>
            <h2>${safeTitle}</h2>
                <p>${safeMessage.replace(/\n/g, '<br>')}</p>
                    <p>Best regards,<br>${fromName}</p>
                        `;
                    const result = await sendEmail({
                        to: recipient.email,
                        subject: fallbackSubject,
                        html: fallbackHtml,
                        from: `${fromName} <noreply@clubforgehq.com>`,
                        replyTo: branding?.contactEmail,
                    });

                    if (result.success) {
                        sent++;
                    } else {
                        failed++;
                        errors.push(`${recipient.email}: ${result.error} `);
                    }
                } else {
                    const result = await sendEmail({
                        to: recipient.email,
                        subject: emailContent.subject,
                        html: emailContent.html,
                        from: `${fromName} <noreply@clubforgehq.com>`,
                        replyTo: branding?.contactEmail,
                    });

                    if (result.success) {
                        sent++;
                    } else {
                        failed++;
                        errors.push(`${recipient.email}: ${result.error} `);
                    }
                }

                // Small delay to avoid rate limits (Resend allows 10/sec on free tier)
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (err) {
                failed++;
                errors.push(`${recipient.email}: ${err instanceof Error ? err.message : 'Unknown error'} `);
            }
        }

        return NextResponse.json({
            success: true,
            sent,
            failed,
            total: recipients.length,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined, // Only return first 5 errors
        });

    } catch (error) {
        console.error('Announcement email API error:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Failed to send announcement emails') },
            { status: 500 }
        );
    }
}
