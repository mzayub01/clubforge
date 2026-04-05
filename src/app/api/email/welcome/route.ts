import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { renderWelcomeEmail } from '@/lib/email-templates';
import { renderEmailFromDatabase } from '@/lib/email-templates-db';
import { checkRateLimit, escapeHtml, safeErrorResponse } from '@/lib/auth-guard';
import { createClient } from '@/lib/supabase/server';

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

        // Try to get template from database first
        const dbTemplate = await renderEmailFromDatabase('welcome', {
            firstName: safeName,
            locationName: safeLocation,
            membershipType: safeMembership,
        });

        let html: string;
        let subject: string;

        if (dbTemplate) {
            // Use database template
            html = dbTemplate.html;
            subject = dbTemplate.subject;
        } else {
            // Fallback to static template
            html = renderWelcomeEmail({
                firstName: safeName,
                locationName: safeLocation,
                membershipType: safeMembership,
            });
            subject = `Welcome to ClubForge, ${safeName}!`;
        }

        // Send the email
        const result = await sendEmail({
            to: email,
            subject,
            html,
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
