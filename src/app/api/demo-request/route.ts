// ===============================================
// ClubForge - Demo Request API
// Sends demo request details to clubforgehq@gmail.com
// and a confirmation email to the requestor
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/auth-guard';

const DEMO_RECIPIENT = 'clubforgehq@gmail.com';

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 3 per minute per IP
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { success: allowed } = rateLimit(`demo:${ip}`, { maxRequests: 3, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
        }

        const body = await request.json();
        const { name, email, phone, clubName, clubType, memberCount } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
        }

        // H5: Sanitise user inputs before HTML interpolation
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safePhone = phone ? escapeHtml(phone) : '';
        const safeClubName = clubName ? escapeHtml(clubName) : '';

        const clubTypeLabels: Record<string, string> = {
            'bjj': 'BJJ / Jiu-Jitsu',
            'mma': 'MMA / Boxing',
            'karate': 'Karate / Taekwondo',
            'crossfit': 'CrossFit',
            'dance': 'Dance / Gymnastics',
            'youth': 'Youth Sports',
            'other': 'Other',
        };

        // ---- 1. Internal notification email to ClubForge team ----
        const internalHtml = `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="background: linear-gradient(135deg, #0F172A, #1E293B); color: #fff; padding: 24px 32px; border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; font-size: 22px; color: #C5A456;">📅 New Demo Request</h1>
                    <p style="margin: 8px 0 0; color: #94A3B8; font-size: 14px;">Someone wants to see ClubForge in action</p>
                </div>
                <div style="background: #fff; padding: 32px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 16px 16px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px; width: 140px;">Name</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${safeName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Email</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">
                                <a href="mailto:${safeEmail}" style="color: #C5A456; text-decoration: none;">${safeEmail}</a>
                            </td>
                        </tr>
                        ${safePhone ? `
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Phone</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${safePhone}</td>
                        </tr>
                        ` : ''}
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Club Name</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${safeClubName || 'Not provided'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Club Type</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${clubTypeLabels[clubType] || escapeHtml(clubType || '') || 'Not selected'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Members</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${escapeHtml(memberCount || '') || 'Not selected'}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 24px; padding: 16px; background: #F8FAFC; border-radius: 8px; text-align: center;">
                        <a href="mailto:${safeEmail}" style="display: inline-block; padding: 10px 24px; background: #C5A456; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                            Reply to ${safeName.split(' ')[0]}
                        </a>
                    </div>
                </div>
            </div>
        `;

        const internalResult = await sendEmail({
            to: DEMO_RECIPIENT,
            subject: `🎯 Demo Request: ${safeClubName || safeName} (${clubTypeLabels[clubType] || 'Club'})`,
            html: internalHtml,
            replyTo: email,
        });

        if (!internalResult.success) {
            console.error('Failed to send demo request email:', internalResult.error);
            return NextResponse.json({ error: 'Failed to send request. Please email us directly.' }, { status: 500 });
        }

        // ---- 2. Confirmation email to the requestor ----
        const safeFirstName = safeName.split(' ')[0];
        const confirmationHtml = `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
                <!-- Header -->
                <div style="background: #FFFFFF; padding: 40px 32px; text-align: center; border-radius: 16px 16px 0 0; border: 1px solid #E2E8F0; border-bottom: 3px solid #C5A456;">
                    <img src="https://clubforgehq.com/logo-clubforge-final.png" alt="ClubForge" style="height: 36px; margin-bottom: 16px;" />
                    <h1 style="margin: 0; font-size: 24px; color: #0F172A; font-weight: 700;">We&rsquo;ve received your request</h1>
                    <p style="margin: 12px 0 0; color: #64748B; font-size: 15px; line-height: 1.6;">
                        Thank you for your interest in ClubForge, ${safeFirstName}.
                    </p>
                </div>

                <!-- Body -->
                <div style="background: #FFFFFF; padding: 40px 32px; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
                    <!-- Confirmation message -->
                    <div style="background: linear-gradient(135deg, rgba(197,164,86,0.08), rgba(197,164,86,0.03)); border: 1px solid rgba(197,164,86,0.2); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                        <p style="margin: 0; color: #0F172A; font-size: 15px; line-height: 1.7;">
                            A member of the <strong style="color: #C5A456;">ClubForge</strong> team will be in touch within <strong>24 hours</strong> to arrange your personalised demo at a time that suits you.
                        </p>
                    </div>

                    <!-- What to expect -->
                    <h2 style="margin: 0 0 20px; font-size: 18px; color: #0F172A; font-weight: 700;">What to expect from your demo</h2>

                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 14px 16px; vertical-align: top; width: 44px;">
                                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(197,164,86,0.12); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 36px; font-size: 16px;">🎯</div>
                            </td>
                            <td style="padding: 14px 0;">
                                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #0F172A;">Tailored to your club</p>
                                <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.5;">We&rsquo;ll focus on the features most relevant to ${safeClubName ? `<strong>${safeClubName}</strong>` : 'your club'} and how you operate.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 14px 16px; vertical-align: top;">
                                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(197,164,86,0.12); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 36px; font-size: 16px;">⏱️</div>
                            </td>
                            <td style="padding: 14px 0;">
                                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #0F172A;">30 minutes, no pressure</p>
                                <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.5;">A relaxed walkthrough of the platform &mdash; ask anything you like, no sales pitch.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 14px 16px; vertical-align: top;">
                                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(197,164,86,0.12); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 36px; font-size: 16px;">🚀</div>
                            </td>
                            <td style="padding: 14px 0;">
                                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #0F172A;">See it all live</p>
                                <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.5;">Member management, class scheduling, billing, grading &mdash; everything your club needs, running in real time.</p>
                            </td>
                        </tr>
                    </table>

                    <!-- CTA -->
                    <div style="text-align: center; margin-top: 32px;">
                        <p style="margin: 0 0 16px; font-size: 14px; color: #64748B;">Can&rsquo;t wait? Start exploring right now:</p>
                        <a href="https://clubforgehq.com/get-started" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #C5A456, #D4B668); color: #FFFFFF; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(197,164,86,0.3);">
                            Start Your Free 14-Day Trial
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #F8FAFC; padding: 24px 32px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #94A3B8;">
                        Have a question in the meantime? Simply reply to this email.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #CBD5E1;">
                        &copy; ${new Date().getFullYear()} ClubForge &middot; <a href="https://clubforgehq.com" style="color: #C5A456; text-decoration: none;">clubforgehq.com</a>
                    </p>
                </div>
            </div>
        `;

        // Send confirmation (non-blocking — don't fail the request if this fails)
        sendEmail({
            to: email,
            subject: `Thanks ${safeFirstName} \u2014 your ClubForge demo request is confirmed`,
            html: confirmationHtml,
            replyTo: 'clubforgehq@gmail.com',
        }).catch(err => {
            console.error('Failed to send confirmation email:', err);
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Demo request error:', error);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
