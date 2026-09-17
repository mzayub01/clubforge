// ===============================================
// ClubForge - Admin: send a "complete your payment" reminder
// POST /api/admin/send-payment-reminder  { userId, email, firstName?, locationName?, membershipType? }
//
// Uses the club's `payment_incomplete` email template when it has one (Pro/
// Elite can edit it), otherwise a built-in club-branded template — the
// reminder must never fail just because a template row was never seeded
// (that was the "Email template not found. Please run the migration…" error).
// The payment link points at the club's own domain, and replies go to the club.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, escapeHtml, safeErrorResponse } from '@/lib/auth-guard';
import { sendEmail } from '@/lib/email';
import { renderEmailFromDatabase, getTenantBranding } from '@/lib/email-templates-db';
import { renderPaymentReminderEmail } from '@/lib/email-templates';
import { isChildDummyEmail, undeliverableReason } from '@/lib/member-contact';

export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'payment-reminder', 30);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }
        const tenantId = auth.tenantId;

        const body = await request.json();
        const { userId, email, firstName, locationName, membershipType } = body as {
            userId?: string; email?: string; firstName?: string; locationName?: string; membershipType?: string;
        };
        if (!userId || !email) {
            return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
        }

        // The member must belong to this club
        const admin = createAdminClient();
        const { data: target } = await admin
            .from('profiles')
            .select('id, tenant_id, first_name, email')
            .eq('user_id', userId)
            .maybeSingle();
        if (!target || target.tenant_id !== tenantId) {
            return NextResponse.json({ error: 'Member not found in your club' }, { status: 404 });
        }

        // A child's dummy address can't receive mail — sendEmail() swaps it for the
        // guardian, but prefer the address the page resolved for us.
        const recipient = isChildDummyEmail(email) ? (isChildDummyEmail(target.email) ? email : target.email) : email;

        // Fail early with a plain explanation rather than the provider's error
        const reason = isChildDummyEmail(recipient) ? null : undeliverableReason(recipient);
        if (reason) {
            return NextResponse.json({ error: `Can't send: ${reason}` }, { status: 400 });
        }

        // Payment link on the club's own domain (subdomain or custom domain)
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'clubforgehq.com';
        const paymentLink = `https://${host}/dashboard/membership`;

        const branding = await getTenantBranding(tenantId);
        const clubName = branding?.name || 'ClubForge';
        const safeFirstName = escapeHtml(firstName || target.first_name || 'Member');
        const safeLocation = escapeHtml(locationName || 'your club');
        const safeMembership = membershipType ? escapeHtml(membershipType) : undefined;

        // 1. Club's own template (editable under Email Templates), if seeded
        const rendered = await renderEmailFromDatabase('payment_incomplete', {
            firstName: safeFirstName,
            email: escapeHtml(recipient),
            locationName: safeLocation,
            membershipType: safeMembership || 'Membership',
            paymentLink,
            clubName: escapeHtml(clubName),
        }, tenantId, branding || undefined);

        // 2. Built-in fallback
        const html = rendered?.html || renderPaymentReminderEmail({
            firstName: safeFirstName,
            clubName,
            locationName: safeLocation,
            membershipType: safeMembership,
            paymentLink,
        });
        const subject = rendered?.subject || `Complete your ${clubName} membership payment`;

        const result = await sendEmail({
            to: recipient,
            subject,
            html,
            from: `${clubName} <noreply@clubforgehq.com>`,
            replyTo: branding?.contactEmail || undefined,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
        }

        const sentTo = result.to?.[0] || recipient;
        console.log(`[payment-reminder] admin ${auth.userId} → ${sentTo} (member ${userId}, template: ${rendered ? 'club' : 'built-in'})`);

        return NextResponse.json({
            success: true,
            message: `Payment reminder sent to ${sentTo}`,
        });
    } catch (error) {
        console.error('Error sending payment reminder:', error);
        return NextResponse.json({ error: safeErrorResponse(error, 'Failed to send payment reminder') }, { status: 500 });
    }
}
