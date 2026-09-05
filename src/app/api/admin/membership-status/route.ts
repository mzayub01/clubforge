// ===============================================
// ClubForge - Admin: change a membership's status (Stripe-aware)
// POST /api/admin/membership-status
// Body: { membershipId, status: 'active'|'pending'|'inactive'|'cancelled'|'cancel_at_period_end' }
//
// Cancelling also cancels the member's Stripe subscription on the club's
// connected account (immediately, or at period end); re-activating clears a
// scheduled cancellation. See src/lib/membership-billing.ts.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';
import { applyMembershipStatusChange, MEMBERSHIP_STATUS_TARGETS, type MembershipStatusTarget } from '@/lib/membership-billing';

export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'membership-status', 30);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ success: false, error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }

        const { membershipId, status } = await request.json() as { membershipId?: string; status?: string };
        if (!membershipId || !status || !MEMBERSHIP_STATUS_TARGETS.includes(status as MembershipStatusTarget)) {
            return NextResponse.json({ success: false, error: 'membershipId and a valid status are required' }, { status: 400 });
        }

        const result = await applyMembershipStatusChange(createAdminClient(), {
            membershipId,
            tenantId: auth.tenantId,
            target: status as MembershipStatusTarget,
        });

        if (!result.ok) {
            return NextResponse.json({ success: false, error: result.error, stripe: result.stripe ?? null }, { status: 400 });
        }

        console.log(`[membership-status] admin ${auth.userId} set membership ${membershipId} → ${status} (stripe: ${result.stripe?.action || 'n/a'})`);
        return NextResponse.json({
            success: true,
            status: result.status,
            end_date: result.end_date,
            stripe: result.stripe ?? null,
            message: result.note || `Membership marked ${result.status}.`,
        });
    } catch (error) {
        console.error('[membership-status] Error:', error);
        return NextResponse.json({ success: false, error: safeErrorResponse(error, 'Failed to update membership') }, { status: 500 });
    }
}
