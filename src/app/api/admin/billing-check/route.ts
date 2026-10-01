// ===============================================
// ClubForge - Admin: billing check
// GET  /api/admin/billing-check                      → subscriptions still charging that should not be
// POST /api/admin/billing-check { subscriptionId }   → cancel one flagged subscription now
//
// Reads the club's connected Stripe account, so it only works in production
// (the local key is a test key). See src/lib/billing-check.ts.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';
import { runBillingCheck, cancelFlaggedSubscription } from '@/lib/billing-check';

export async function GET(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'billing-check', 10);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ success: false, error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }

        const result = await runBillingCheck(createAdminClient(), auth.tenantId);
        if (!result.ok) {
            return NextResponse.json({ success: false, error: `Could not read Stripe: ${result.error}` }, { status: 502 });
        }

        console.log(`[billing-check] admin ${auth.userId} tenant ${auth.tenantId}: ${result.totals.live} live, ${result.totals.issues} flagged`);
        return NextResponse.json({ success: true, connected: result.connected, totals: result.totals, issues: result.issues });
    } catch (error) {
        console.error('[billing-check] Error:', error);
        return NextResponse.json({ success: false, error: safeErrorResponse(error, 'Billing check failed') }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'billing-check-cancel', 30);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ success: false, error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }

        const { subscriptionId } = await request.json() as { subscriptionId?: string };
        if (!subscriptionId || !/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) {
            return NextResponse.json({ success: false, error: 'A valid subscriptionId is required' }, { status: 400 });
        }

        const result = await cancelFlaggedSubscription(createAdminClient(), auth.tenantId, subscriptionId);
        if (!result.ok) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        console.log(`[billing-check] admin ${auth.userId} cancelled ${subscriptionId} (${result.issue?.kind}) for tenant ${auth.tenantId}`);
        return NextResponse.json({
            success: true,
            message: `Stripe subscription for ${result.issue?.memberName || 'this member'} cancelled — no further charges.`,
        });
    } catch (error) {
        console.error('[billing-check] Cancel error:', error);
        return NextResponse.json({ success: false, error: safeErrorResponse(error, 'Failed to cancel subscription') }, { status: 500 });
    }
}
