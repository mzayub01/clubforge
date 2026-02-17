import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantId } from '@/lib/tenant';
import { getRankPreset } from '@/lib/rank-presets';

/**
 * GET /api/rank-schemas - Get all rank schemas for the current tenant
 * Optional query param: ?include_levels=true to include rank levels
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = await getTenantId();
        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
        }

        const includeLevels = request.nextUrl.searchParams.get('include_levels') === 'true';

        if (includeLevels) {
            const { data: schemas, error } = await supabase
                .from('rank_schemas')
                .select('*, rank_levels(*)')
                .eq('tenant_id', tenantId)
                .eq('is_active', true)
                .order('sort_order');

            if (error) throw error;

            // Sort levels within each schema
            const sorted = schemas?.map(s => ({
                ...s,
                rank_levels: (s.rank_levels || []).sort(
                    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
                ),
            }));

            return NextResponse.json({ success: true, schemas: sorted || [] });
        } else {
            const { data: schemas, error } = await supabase
                .from('rank_schemas')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('is_active', true)
                .order('sort_order');

            if (error) throw error;
            return NextResponse.json({ success: true, schemas: schemas || [] });
        }
    } catch (error) {
        console.error('Rank schemas GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * POST /api/rank-schemas - Create a rank schema from a preset or custom definition
 * Body: { preset_id: string } OR { name, has_stripes, max_stripes, levels: [...] }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const tenantId = await getTenantId();
        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
        }

        const body = await request.json();

        // If creating from a preset
        if (body.preset_id) {
            const preset = getRankPreset(body.preset_id);
            if (!preset) {
                return NextResponse.json({ error: 'Unknown preset' }, { status: 400 });
            }

            // Check if this preset already exists for the tenant
            const { data: existing } = await supabase
                .from('rank_schemas')
                .select('id')
                .eq('tenant_id', tenantId)
                .eq('name', preset.name)
                .single();

            if (existing) {
                return NextResponse.json({ error: 'This rank schema already exists' }, { status: 409 });
            }

            // Get current schema count for sort_order
            const { count } = await supabase
                .from('rank_schemas')
                .select('id', { count: 'exact', head: true })
                .eq('tenant_id', tenantId);

            // Create the schema
            const { data: schema, error: schemaError } = await supabase
                .from('rank_schemas')
                .insert({
                    tenant_id: tenantId,
                    name: preset.name,
                    has_stripes: preset.has_stripes,
                    max_stripes: preset.max_stripes,
                    is_default: (count || 0) === 0, // First schema is default
                    sort_order: (count || 0),
                })
                .select()
                .single();

            if (schemaError) throw schemaError;

            // Create the levels
            const levels = preset.levels.map(level => ({
                schema_id: schema.id,
                name: level.name,
                color_hex: level.color_hex,
                bar_color_hex: level.bar_color_hex,
                sort_order: level.sort_order,
            }));

            const { error: levelsError } = await supabase
                .from('rank_levels')
                .insert(levels);

            if (levelsError) throw levelsError;

            // Re-fetch with levels
            const { data: fullSchema } = await supabase
                .from('rank_schemas')
                .select('*, rank_levels(*)')
                .eq('id', schema.id)
                .single();

            return NextResponse.json({ success: true, schema: fullSchema });
        }

        // Custom schema creation
        if (!body.name || !body.levels || body.levels.length === 0) {
            return NextResponse.json({ error: 'Name and at least one level required' }, { status: 400 });
        }

        const { count } = await supabase
            .from('rank_schemas')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        const { data: schema, error: schemaError } = await supabase
            .from('rank_schemas')
            .insert({
                tenant_id: tenantId,
                name: body.name,
                has_stripes: body.has_stripes ?? false,
                max_stripes: body.max_stripes ?? 0,
                is_default: (count || 0) === 0,
                sort_order: (count || 0),
            })
            .select()
            .single();

        if (schemaError) throw schemaError;

        const levels = body.levels.map((level: { name: string; color_hex: string; bar_color_hex?: string }, i: number) => ({
            schema_id: schema.id,
            name: level.name,
            color_hex: level.color_hex,
            bar_color_hex: level.bar_color_hex || '#1A1A1A',
            sort_order: i + 1,
        }));

        const { error: levelsError } = await supabase.from('rank_levels').insert(levels);
        if (levelsError) throw levelsError;

        const { data: fullSchema } = await supabase
            .from('rank_schemas')
            .select('*, rank_levels(*)')
            .eq('id', schema.id)
            .single();

        return NextResponse.json({ success: true, schema: fullSchema });
    } catch (error) {
        console.error('Rank schemas POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/rank-schemas?id=xxx - Delete a rank schema
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const schemaId = request.nextUrl.searchParams.get('id');
        if (!schemaId) {
            return NextResponse.json({ error: 'Schema ID required' }, { status: 400 });
        }

        // Soft-delete by marking inactive
        const { error } = await supabase
            .from('rank_schemas')
            .update({ is_active: false })
            .eq('id', schemaId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Rank schemas DELETE error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
