// ===============================================
// DojoHub - Admin Locations API
// GET  /api/admin/locations  — Fetch all locations for tenant
// POST /api/admin/locations  — Create a new location
// PUT  /api/admin/locations  — Update an existing location
// Uses admin client (service role) to bypass RLS
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

// Helper: authenticate user and verify they are a tenant admin
async function authenticateAdmin() {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const { createClient } = await import('@/lib/supabase/server');
    let user;
    try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch {
        // Fallback: try getting user directly from cookie
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; '),
                },
            },
            auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data } = await supabase.auth.getUser();
        user = data.user;
    }

    if (!user) {
        return { error: 'Unauthorized', status: 401, tenantId: null };
    }

    const adminSupabase = createAdminClient();
    const { data: tenantMember } = await adminSupabase
        .from('tenant_members')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

    if (!tenantMember || tenantMember.role !== 'admin') {
        return { error: 'Forbidden', status: 403, tenantId: null };
    }

    return { error: null, status: 200, tenantId: tenantMember.tenant_id };
}


// GET: Fetch all locations for the admin's tenant
export async function GET() {
    try {
        const auth = await authenticateAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const adminSupabase = createAdminClient();
        const { data, error } = await adminSupabase
            .from('locations')
            .select('*')
            .eq('tenant_id', auth.tenantId)
            .order('name');

        if (error) {
            console.error('Locations fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ locations: data || [] });
    } catch (err) {
        console.error('Locations GET error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}


// POST: Create a new location
export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await request.json();
        const { name, address, city, postcode, description, contact_email, contact_phone, allow_multisite } = body;

        if (!name || !address || !city || !postcode) {
            return NextResponse.json({ error: 'Missing required fields: name, address, city, postcode' }, { status: 400 });
        }

        const adminSupabase = createAdminClient();
        const { data, error } = await adminSupabase
            .from('locations')
            .insert({
                tenant_id: auth.tenantId,
                name,
                address,
                city,
                postcode,
                description: description || null,
                contact_email: contact_email || null,
                contact_phone: contact_phone || null,
                allow_multisite: allow_multisite !== false,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Location create error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ location: data }, { status: 201 });
    } catch (err) {
        console.error('Locations POST error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}


// PUT: Update an existing location
export async function PUT(request: NextRequest) {
    try {
        const auth = await authenticateAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing location id' }, { status: 400 });
        }

        const adminSupabase = createAdminClient();

        // Verify the location belongs to this tenant
        const { data: existing } = await adminSupabase
            .from('locations')
            .select('id')
            .eq('id', id)
            .eq('tenant_id', auth.tenantId)
            .single();

        if (!existing) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        const { data, error } = await adminSupabase
            .from('locations')
            .update({
                name: updateData.name,
                address: updateData.address,
                city: updateData.city,
                postcode: updateData.postcode,
                description: updateData.description || null,
                contact_email: updateData.contact_email || null,
                contact_phone: updateData.contact_phone || null,
                allow_multisite: updateData.allow_multisite,
                is_active: updateData.is_active,
            })
            .eq('id', id)
            .eq('tenant_id', auth.tenantId)
            .select()
            .single();

        if (error) {
            console.error('Location update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ location: data });
    } catch (err) {
        console.error('Locations PUT error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
