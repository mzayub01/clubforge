import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';



export async function GET(request: NextRequest) {
    try {
        // Rate limit: 20 per minute
        const rateLimited = checkRateLimit(request, 'admin-locations-get', 20);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
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
            return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
        }

        return NextResponse.json({ locations: data || [] });
    } catch (err) {
        console.error('Locations GET error:', err);
        return NextResponse.json(
            { error: safeErrorResponse(err, 'Internal server error') },
            { status: 500 }
        );
    }
}


export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 per minute
        const rateLimited = checkRateLimit(request, 'admin-locations-post', 10);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
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
            return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
        }

        return NextResponse.json({ location: data }, { status: 201 });
    } catch (err) {
        console.error('Locations POST error:', err);
        return NextResponse.json(
            { error: safeErrorResponse(err, 'Internal server error') },
            { status: 500 }
        );
    }
}


export async function PUT(request: NextRequest) {
    try {
        // Rate limit: 10 per minute
        const rateLimited = checkRateLimit(request, 'admin-locations-put', 10);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
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
            return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
        }

        return NextResponse.json({ location: data });
    } catch (err) {
        console.error('Locations PUT error:', err);
        return NextResponse.json(
            { error: safeErrorResponse(err, 'Internal server error') },
            { status: 500 }
        );
    }
}
