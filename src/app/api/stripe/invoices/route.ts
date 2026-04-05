import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, getStripeClient } from '@/lib/stripe';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';

export async function GET(request: NextRequest) {
    // Rate limit: 20 per minute
    const rateLimited = checkRateLimit(request, 'stripe-invoices', 20);
    if (rateLimited) return rateLimited;

    if (!isStripeConfigured()) {
        return NextResponse.json(
            { error: 'Stripe is not configured', invoices: [] },
            { status: 400 }
        );
    }

    const stripe = getStripeClient();
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe client not available', invoices: [] },
            { status: 400 }
        );
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated', invoices: [] },
                { status: 401 }
            );
        }

        // Get customer ID from URL params or find by user
        const { searchParams } = new URL(request.url);
        let customerId = searchParams.get('customerId');

        // If no customerId provided, look up from profile
        if (!customerId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('stripe_customer_id')
                .eq('user_id', user.id)
                .single();

            customerId = profile?.stripe_customer_id;
        }

        if (!customerId) {
            return NextResponse.json({ invoices: [], message: 'No payment history found' });
        }

        // Look up the user's tenant to get the connected Stripe account ID
        // (with Connect, customers/invoices live on the connected account, not the platform)
        const adminSupabase = await createAdminClient();
        const { data: tenantMember } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .limit(1)
            .single();

        let stripeAccountId: string | undefined;
        if (tenantMember?.tenant_id) {
            const { data: tenant } = await adminSupabase
                .from('tenants')
                .select('stripe_account_id, stripe_connect_enabled')
                .eq('id', tenantMember.tenant_id)
                .single();

            if (tenant?.stripe_account_id && tenant.stripe_connect_enabled) {
                stripeAccountId = tenant.stripe_account_id;
            }
        }

        // Fetch invoices — from connected account if applicable, else platform
        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: 50,
        }, stripeAccountId ? { stripeAccount: stripeAccountId } : undefined);

        // Transform to simpler format
        const formattedInvoices = invoices.data.map((invoice) => ({
            id: invoice.id,
            number: invoice.number,
            amount: invoice.amount_paid / 100, // Convert from cents to pounds
            currency: invoice.currency,
            status: invoice.status,
            created: invoice.created,
            paid: invoice.status === 'paid',
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_pdf: invoice.invoice_pdf,
            description: invoice.lines.data[0]?.description || 'Membership',
        }));

        return NextResponse.json({ invoices: formattedInvoices });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Failed to fetch invoices'), invoices: [] },
            { status: 500 }
        );
    }
}

