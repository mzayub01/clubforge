import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { renderWelcomeEmail } from '@/lib/email-templates';
import { renderEmailFromDatabase, getTenantBranding } from '@/lib/email-templates-db';
import { checkRateLimit, escapeHtml, safeErrorResponse } from '@/lib/auth-guard';
import { createClient } from '@/lib/supabase/server';
import { getTenantId } from '@/lib/tenant';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 5 requests per minute
        const rateLimited = checkRateLimit(request, 'email-welcome', 5);
        if (rateLimited) return rateLimited;

        // Authenticate: caller must be logged in
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, firstName, locationName, membershipType } = body;

        if (!email || !firstName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Security: only allow sending to the authenticated user's email
        if (user.email !== email) {
            return NextResponse.json({ error: 'Forbidden: Email mismatch' }, { status: 403 });
        }

        // Sanitise user inputs before interpolation
        const safeName = escapeHtml(firstName);
        const safeLocation = escapeHtml(locationName || 'ClubForge');
        const safeMembership = escapeHtml(membershipType || 'Member');

        // Get tenant context for branding
        const tenantId = await getTenantId();
        const branding = tenantId ? await getTenantBranding(tenantId) : null;

        // Clubs can switch the automated welcome email off (Settings → General).
        if (tenantId) {
            const { data: tenantRow } = await createAdminClient()
                .from('tenants')
                .select('settings')
                .eq('id', tenantId)
                .maybeSingle();
            const settings = (tenantRow?.settings || {}) as Record<string, unknown>;
            if (settings.welcome_email_enabled === false) {
                return NextResponse.json({ success: true, skipped: true, reason: 'welcome_email_disabled' });
            }
        }

        // Try to get template from database first (with tenant context)
        const dbTemplate = await renderEmailFromDatabase('welcome', {
            firstName: safeName,
            locationName: safeLocation,
            membershipType: safeMembership,
        }, tenantId || undefined, branding || undefined);

        let html: string;
        let subject: string;

        if (dbTemplate) {
            // Use database template (tenant-branded)
            html = dbTemplate.html;
            subject = dbTemplate.subject;
        } else {
            // Fallback to static template
            html = renderWelcomeEmail({
                firstName: safeName,
                locationName: safeLocation,
                membershipType: safeMembership,
                clubName: branding?.name || 'ClubForge',
            });
            subject = `Welcome to ${branding?.name || 'ClubForge'}, ${safeName}!`;
        }

        // Use tenant name in the from address
        const fromName = branding?.name || 'ClubForge';

        // Send the email
        const result = await sendEmail({
            to: email,
            subject,
            html,
            from: `${fromName} <noreply@clubforgehq.com>`,
            replyTo: branding?.contactEmail,
        });

        if (!result.success) {
            console.error('Failed to send welcome email:', result.error);
            // Don't fail the registration if email fails
            return NextResponse.json({ success: false, error: 'Email delivery failed' });
        }

        return NextResponse.json({ success: true, id: result.id });
    } catch (error) {
        console.error('Welcome email API error:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Failed to send welcome email') },
            { status: 500 }
        );
    }
}
