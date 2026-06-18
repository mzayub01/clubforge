// ===============================================
// ClubForge - Custom Domain Management
// Elite tier: save and verify custom domains
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// Force Node.js runtime for dns module access
export const runtime = 'nodejs';

// -----------------------------------------------
// PUT: Save/update custom domain for a tenant
// -----------------------------------------------
export async function PUT(request: NextRequest) {
    try {
        // 1. Authenticate
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        let domain: string = body.domain?.trim() || '';

        // 2. Clean and validate domain
        // Strip protocol if accidentally included
        domain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();

        if (domain && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
            return NextResponse.json(
                { error: 'Invalid domain format. Enter just the domain (e.g., myclub.com)' },
                { status: 400 }
            );
        }

        // Don't allow setting clubforgehq.com or subdomains of it
        const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'clubforgehq.com';
        if (domain && (domain === baseDomain || domain.endsWith(`.${baseDomain}`))) {
            return NextResponse.json(
                { error: 'Cannot use a ClubForge subdomain as a custom domain' },
                { status: 400 }
            );
        }

        // 3. Find the tenant for this user (must be owner or admin)
        const adminSupabase = await createAdminClient();
        const { data: membership } = await adminSupabase
            .from('tenant_members')
            .select('tenant_id, role')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .in('role', ['admin', 'owner'])
            .single();

        if (!membership) {
            // Check if user is tenant owner directly
            const { data: ownedTenant } = await adminSupabase
                .from('tenants')
                .select('id, subscription_tier')
                .eq('owner_user_id', user.id)
                .eq('is_active', true)
                .single();

            if (!ownedTenant) {
                return NextResponse.json({ error: 'You must be a tenant owner or admin' }, { status: 403 });
            }

            // Check Elite tier
            if (ownedTenant.subscription_tier !== 'elite') {
                return NextResponse.json(
                    { error: 'Custom domains are available on the Elite plan only' },
                    { status: 403 }
                );
            }

            // Check uniqueness if setting a domain
            if (domain) {
                const { data: existing } = await adminSupabase
                    .from('tenants')
                    .select('id')
                    .eq('custom_domain', domain)
                    .neq('id', ownedTenant.id)
                    .single();

                if (existing) {
                    return NextResponse.json(
                        { error: 'This domain is already claimed by another club' },
                        { status: 409 }
                    );
                }
            }

            // Save
            const { error: updateError } = await adminSupabase
                .from('tenants')
                .update({ custom_domain: domain || null })
                .eq('id', ownedTenant.id);

            if (updateError) {
                console.error('[Custom-Domain] Update error:', updateError);
                return NextResponse.json({ error: 'Failed to save domain' }, { status: 500 });
            }

            return NextResponse.json({ success: true, domain: domain || null });
        }

        // User is admin via tenant_members
        const tenantId = membership.tenant_id;

        // Check Elite tier
        const { data: tenant } = await adminSupabase
            .from('tenants')
            .select('id, subscription_tier')
            .eq('id', tenantId)
            .single();

        if (!tenant || tenant.subscription_tier !== 'elite') {
            return NextResponse.json(
                { error: 'Custom domains are available on the Elite plan only' },
                { status: 403 }
            );
        }

        // Check uniqueness
        if (domain) {
            const { data: existing } = await adminSupabase
                .from('tenants')
                .select('id')
                .eq('custom_domain', domain)
                .neq('id', tenantId)
                .single();

            if (existing) {
                return NextResponse.json(
                    { error: 'This domain is already claimed by another club' },
                    { status: 409 }
                );
            }
        }

        // Save
        const { error: updateError } = await adminSupabase
            .from('tenants')
            .update({ custom_domain: domain || null })
            .eq('id', tenantId);

        if (updateError) {
            console.error('[Custom-Domain] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to save domain' }, { status: 500 });
        }

        return NextResponse.json({ success: true, domain: domain || null });
    } catch (error) {
        console.error('[Custom-Domain] PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// -----------------------------------------------
// POST: Verify DNS for a custom domain
// -----------------------------------------------
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const domain: string = body.domain?.trim()?.toLowerCase() || '';

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // 2. Check DNS CNAME record
        try {
            const dns = await import('dns');
            const cnames = await dns.promises.resolveCname(domain);
            const expectedTarget = 'cname.vercel-dns.com';

            // Check if any CNAME points to Vercel
            const pointsToVercel = cnames.some(
                (cname) => cname.toLowerCase() === expectedTarget || cname.toLowerCase().endsWith('.vercel-dns.com')
            );

            if (pointsToVercel) {
                return NextResponse.json({
                    status: 'active',
                    message: 'DNS is correctly configured! Your domain points to Vercel.',
                    cnames,
                });
            } else {
                return NextResponse.json({
                    status: 'error',
                    message: `DNS CNAME found but points to ${cnames.join(', ')} instead of ${expectedTarget}. Please update your CNAME record.`,
                    cnames,
                });
            }
        } catch (dnsError: unknown) {
            const code = (dnsError as NodeJS.ErrnoException)?.code;
            if (code === 'ENODATA' || code === 'ENOTFOUND') {
                return NextResponse.json({
                    status: 'pending',
                    message: 'No CNAME record found. Please add a CNAME record pointing to cname.vercel-dns.com. DNS changes can take up to 48 hours to propagate.',
                });
            }
            return NextResponse.json({
                status: 'error',
                message: 'Could not verify DNS. Please check your domain settings and try again.',
            });
        }
    } catch (error) {
        console.error('[Custom-Domain] POST verify error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
