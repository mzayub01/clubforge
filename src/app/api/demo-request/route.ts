// ===============================================
// ClubForge - Demo Request API
// Sends demo request details to clubforgehq@gmail.com
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

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
        const { name, email, clubName, clubType, memberCount } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
        }

        const clubTypeLabels: Record<string, string> = {
            'bjj': 'BJJ / Jiu-Jitsu',
            'mma': 'MMA / Boxing',
            'karate': 'Karate / Taekwondo',
            'crossfit': 'CrossFit',
            'dance': 'Dance / Gymnastics',
            'youth': 'Youth Sports',
            'other': 'Other',
        };

        const html = `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="background: linear-gradient(135deg, #0F172A, #1E293B); color: #fff; padding: 24px 32px; border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; font-size: 22px; color: #C5A456;">📅 New Demo Request</h1>
                    <p style="margin: 8px 0 0; color: #94A3B8; font-size: 14px;">Someone wants to see ClubForge in action</p>
                </div>
                <div style="background: #fff; padding: 32px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 16px 16px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px; width: 140px;">Name</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${name}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Email</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">
                                <a href="mailto:${email}" style="color: #C5A456; text-decoration: none;">${email}</a>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Club Name</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${clubName || 'Not provided'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #F1F5F9;">
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Club Type</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${clubTypeLabels[clubType] || clubType || 'Not selected'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Members</td>
                            <td style="padding: 12px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${memberCount || 'Not selected'}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 24px; padding: 16px; background: #F8FAFC; border-radius: 8px; text-align: center;">
                        <a href="mailto:${email}" style="display: inline-block; padding: 10px 24px; background: #C5A456; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                            Reply to ${name.split(' ')[0]}
                        </a>
                    </div>
                </div>
            </div>
        `;

        const result = await sendEmail({
            to: DEMO_RECIPIENT,
            subject: `🎯 Demo Request: ${clubName || name} (${clubTypeLabels[clubType] || 'Club'})`,
            html,
            replyTo: email,
        });

        if (!result.success) {
            console.error('Failed to send demo request email:', result.error);
            return NextResponse.json({ error: 'Failed to send request. Please email us directly.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Demo request error:', error);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
