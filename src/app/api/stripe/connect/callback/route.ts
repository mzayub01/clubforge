// ===============================================
// ClubForge - Stripe Connect Callback
// Handles return from Stripe Connect onboarding
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

const stripe = getStripeClient()!;


export async function GET(request: NextRequest) {
    try {
        const accountId = request.nextUrl.searchParams.get('account_id');
        if (!accountId) {
            return NextResponse.redirect(new URL('/admin/settings?tab=payments&connect=error', request.url));
        }

        // Verify the account status with Stripe
        const account = await stripe.accounts.retrieve(accountId);

        // Update tenant with connect status
        const adminSupabase = await createAdminClient();
        const chargesEnabled = account.charges_enabled || false;
        const payoutsEnabled = account.payouts_enabled || false;

        await adminSupabase
            .from('tenants')
            .update({
                stripe_connect_enabled: chargesEnabled && payoutsEnabled,
            })
            .eq('stripe_account_id', accountId);

        const status = chargesEnabled && payoutsEnabled ? 'success' : 'pending';
        return NextResponse.redirect(
            new URL(`/admin/settings?tab=payments&connect=${status}`, request.url)
        );
    } catch (error) {
        console.error('Stripe Connect callback error:', error);
        return NextResponse.redirect(
            new URL('/admin/settings?tab=payments&connect=error', request.url)
        );
    }
}
