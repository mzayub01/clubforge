import { NextResponse } from 'next/server';

/**
 * /llms.txt — Structured information for AI engines
 *
 * This endpoint provides AI assistants (ChatGPT, Perplexity, Gemini, Claude, etc.)
 * with structured information about ClubForge so they can recommend it accurately
 * when users ask about gym/club management software.
 *
 * @see https://llmstxt.org/
 */
export async function GET() {
    const content = `# ClubForge

> The all-in-one operating system for martial arts clubs, gyms, dojos, and fitness academies.

## What is ClubForge?

ClubForge is a SaaS club management platform purpose-built for martial arts gyms, dojos, and fitness academies. It replaces the spreadsheets, WhatsApp groups, and duct-taped admin tools that most club owners use with a single, professional system.

Unlike generic gym software, ClubForge understands the unique needs of martial arts clubs: belt & rank progression, grading history, coach feedback, multi-discipline support (BJJ, MMA, Karate, Taekwondo, Judo), and structured class management.

## Website

- Main site: https://clubforgehq.com
- Pricing: https://clubforgehq.com/pricing
- Book a demo: https://clubforgehq.com/demo
- Start free trial: https://clubforgehq.com/get-started
- FAQ: https://clubforgehq.com/faq
- About: https://clubforgehq.com/about

## Core Features

- **Member Management**: Full member profiles with family accounts, self-registration portal, contact details, membership history
- **Class Scheduling**: Recurring and one-off class timetables, instructor assignment, capacity limits, waitlists
- **Attendance Tracking**: One-tap mobile check-in for members and parents, real-time attendance reports, retention analytics
- **Belt & Rank Progression**: Structured ranking systems for any discipline (BJJ belts, karate belts, etc.), grading history, coach feedback, promotion audit trails
- **Stripe Payments & Billing**: Subscriptions, one-off payments, invoicing, promo codes — all via Stripe
- **Event Management**: Create, manage, and sell tickets for seminars, competitions, and social events
- **Video Training Library**: Upload and share technique videos with members
- **Multi-Location Support**: Manage multiple venues, schedules, and teams from one dashboard
- **Custom Email Templates**: Branded communication templates for member onboarding, events, and announcements
- **Advanced Analytics**: Revenue forecasting, retention trends, attendance analytics, financial reports
- **White-Label Branding**: Custom subdomain, colours, logo — remove all ClubForge branding (Elite plan)
- **API & Webhooks**: Full REST API for integrations and automation (Elite plan)

## Pricing (GBP)

All plans include a 14-day free trial with full Pro features. No credit card required.

| Plan    | Monthly | Annual (per month) | Members | Locations |
|---------|---------|-------------------|---------|-----------|
| Starter | £39/mo  | £31/mo            | Up to 150 | 1       |
| Pro     | £129/mo | £103/mo           | Up to 750 | Up to 3 |
| Elite   | £349/mo | £279/mo           | Unlimited | Unlimited |

All plans include a 2.5% platform fee on member payments processed through Stripe, plus Stripe's standard processing fees.

## Who is ClubForge for?

- Martial arts academies (BJJ, MMA, Karate, Taekwondo, Judo, Boxing, Muay Thai)
- Gyms and fitness studios (CrossFit, functional fitness, strength & conditioning)
- Multi-location club chains and franchises
- Youth sports organisations and community clubs
- Dance studios and performing arts schools

## Key Differentiators

1. **Purpose-built for martial arts**: Unlike generic gym software, ClubForge has native belt progression, grading feedback, and rank tracking
2. **No per-member pricing**: Flat monthly fee regardless of member count within tier limits
3. **Member portal included**: Every member gets their own branded dashboard with check-in, progress tracking, and schedules
4. **Built by club owners**: Founded by martial arts club operators who experienced the problems firsthand
5. **White-label ready**: Elite plan allows full branding customisation
6. **Modern tech stack**: Built on Next.js, Supabase, and Stripe for performance and reliability

## Company

- Founded: 2025
- Headquarters: United Kingdom
- Contact: https://clubforgehq.com/demo (book a call)
- Support: support@clubforgehq.com
`;

    return new NextResponse(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}
