// ===============================================
// DojoHub - Generic Admin CRUD API
// POST /api/admin/crud
// Server-side CRUD that bypasses RLS via service role
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { safeErrorResponse } from '@/lib/auth-guard';

// Whitelist of tables admins can access
const ALLOWED_TABLES = [
    'locations',
    'membership_types',
    'memberships',
    'waitlist',
    'instructors',
    'classes',
    'attendance',
    'belt_progression',
    'videos',
    'events',
    'event_rsvps',
    'announcements',
    'naseeha',
    'profiles',
    'email_templates',
    'professor_class_access',
    'class_membership_types',
    'promotions',
    'professor_feedback',
    'location_membership_configs',
    'tenant_members',
    'tenants',
    'rank_schemas',
    'rank_levels',
] as const;

type AllowedTable = typeof ALLOWED_TABLES[number];

// Tables where staff (admin + instructor) can write, not just admin
const STAFF_WRITE_TABLES: AllowedTable[] = [
    'attendance',
    'classes',
    'promotions',
    'professor_feedback',
    'professor_class_access',
];

interface CrudRequest {
    action: 'select' | 'insert' | 'update' | 'upsert' | 'delete';
    table: string;
    data?: Record<string, unknown>;
    filters?: { column: string; operator: string; value: unknown }[];
    select?: string;
    order?: { column: string; ascending?: boolean }[];
    limit?: number;
    single?: boolean;
    count?: 'exact' | 'planned' | 'estimated';
    head?: boolean;
}

// Columns that should NEVER be returned to the client from the tenants table
const TENANTS_SENSITIVE_COLUMNS = [
    'stripe_customer_id',
    'stripe_subscription_id',
];

// Validate and sanitise the select parameter to prevent join traversal
function sanitiseSelect(select: string | undefined): string {
    if (!select) return '*';
    // Block Supabase relationship traversal syntax (parentheses)
    // e.g. "*, tenants(*)" or "id, other_table!inner(secret)"
    if (/[()]/.test(select)) {
        // Allow known safe join patterns used by the app
        const safePatterns = [
            'membership_type:membership_types(name)',
            'membership_type:membership_types(name,price)',
            'profile:profiles!inner(first_name,email,role,is_child)',
            'profiles!inner(first_name, email, role, is_child)',
        ];
        const isSafe = safePatterns.some(p => select.includes(p));
        if (!isSafe) {
            return '*'; // Fall back to wildcard if unsanctioned join detected
        }
    }
    return select;
}

// Strip sensitive columns from tenants table results
function stripSensitiveFields(table: string, data: any): any {
    if (table !== 'tenants') return data;
    if (Array.isArray(data)) {
        return data.map(row => stripSensitiveFields(table, row));
    }
    if (data && typeof data === 'object') {
        const cleaned = { ...data };
        for (const col of TENANTS_SENSITIVE_COLUMNS) {
            delete cleaned[col];
        }
        return cleaned;
    }
    return data;
}

// Authenticate user and get tenant context
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
        return { error: 'Unauthorized', status: 401, tenantId: null, role: null, userId: null };
    }

    const adminSupabase = createAdminClient();
    const { data: tenantMember } = await adminSupabase
        .from('tenant_members')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

    if (!tenantMember || !['admin', 'instructor'].includes(tenantMember.role)) {
        return { error: 'Forbidden', status: 403, tenantId: null, role: null, userId: null };
    }

    return {
        error: null,
        status: 200,
        tenantId: tenantMember.tenant_id as string,
        role: tenantMember.role as string,
        userId: user.id,
    };
}


export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body: CrudRequest = await request.json();
        const { action, table, data, filters, select: selectCols, order, limit, single, count, head } = body;

        // Validate table
        if (!ALLOWED_TABLES.includes(table as AllowedTable)) {
            return NextResponse.json({ error: `Table '${table}' is not allowed` }, { status: 400 });
        }

        // Check write permissions
        if (action !== 'select' && auth.role !== 'admin') {
            if (!STAFF_WRITE_TABLES.includes(table as AllowedTable)) {
                return NextResponse.json({ error: 'Only admins can modify this table' }, { status: 403 });
            }
        }

        const adminSupabase = createAdminClient();

        // Scope queries to the current tenant
        // Special case: tenants table uses 'id' instead of 'tenant_id'
        const tenantFilterColumn = table === 'tenants' ? 'id' : 'tenant_id';
        const tenantFilter = { column: tenantFilterColumn, value: auth.tenantId };

        // Auto-inject current user ID where '__CURRENT_USER__' sentinel is used
        if (data && typeof data === 'object') {
            for (const key of Object.keys(data)) {
                if (data[key] === '__CURRENT_USER__') {
                    data[key] = auth.userId;
                }
            }
        }

        switch (action) {
            case 'select': {
                const safeSelect = sanitiseSelect(selectCols);
                let query = adminSupabase
                    .from(table)
                    .select(safeSelect, count ? { count, head: head || false } : undefined);

                // Auto-scope to tenant
                if (tenantFilter) {
                    query = query.eq(tenantFilter.column, tenantFilter.value);
                }

                // Apply filters
                if (filters) {
                    for (const f of filters) {
                        switch (f.operator) {
                            case 'eq': query = query.eq(f.column, f.value); break;
                            case 'neq': query = query.neq(f.column, f.value); break;
                            case 'gt': query = query.gt(f.column, f.value as string); break;
                            case 'gte': query = query.gte(f.column, f.value as string); break;
                            case 'lt': query = query.lt(f.column, f.value as string); break;
                            case 'lte': query = query.lte(f.column, f.value as string); break;
                            case 'like': query = query.like(f.column, f.value as string); break;
                            case 'ilike': query = query.ilike(f.column, f.value as string); break;
                            case 'is': query = query.is(f.column, f.value as null); break;
                            case 'in': query = query.in(f.column, f.value as unknown[]); break;
                            case 'contains': query = query.contains(f.column, f.value as unknown[]); break;
                            default: query = query.eq(f.column, f.value);
                        }
                    }
                }

                // Apply ordering
                if (order) {
                    for (const o of order) {
                        query = query.order(o.column, { ascending: o.ascending !== false });
                    }
                }

                // Apply limit
                if (limit) {
                    query = query.limit(limit);
                }

                // Single row
                if (single) {
                    const { data: result, error, count: resultCount } = await query.single();
                    if (error) {
                        return NextResponse.json({ error: error.message }, { status: 500 });
                    }
                    return NextResponse.json({ data: result, count: resultCount });
                }

                const { data: result, error, count: resultCount } = await query;
                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 });
                }
                return NextResponse.json({ data: result || [], count: resultCount });
            }

            case 'insert': {
                if (!data) {
                    return NextResponse.json({ error: 'Missing data for insert' }, { status: 400 });
                }

                // Auto-inject tenant_id (skip for tenants table which doesn't have this column)
                const insertData = table !== 'tenants' ? { ...data, tenant_id: auth.tenantId } : data;

                const { data: result, error } = await adminSupabase
                    .from(table)
                    .insert(insertData)
                    .select()
                    .single();

                if (error) {
                    console.error(`Insert error on ${table}:`, error);
                    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
                }
                return NextResponse.json({ data: stripSensitiveFields(table, result) }, { status: 201 });
            }

            case 'update': {
                if (!data || !filters || filters.length === 0) {
                    return NextResponse.json({ error: 'Missing data or filters for update' }, { status: 400 });
                }

                let query = adminSupabase.from(table).update(data);

                // Scope to tenant
                if (tenantFilter) {
                    query = query.eq(tenantFilter.column, tenantFilter.value);
                }

                // Apply filters
                for (const f of filters) {
                    query = query.eq(f.column, f.value);
                }

                const { data: result, error } = await query.select();

                if (error) {
                    console.error(`Update error on ${table}:`, error);
                    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
                }
                return NextResponse.json({ data: stripSensitiveFields(table, result) });
            }

            case 'upsert': {
                if (!data) {
                    return NextResponse.json({ error: 'Missing data for upsert' }, { status: 400 });
                }

                const upsertData = table !== 'tenants' ? { ...data, tenant_id: auth.tenantId } : data;

                const { data: result, error } = await adminSupabase
                    .from(table)
                    .upsert(upsertData)
                    .select();

                if (error) {
                    console.error(`Upsert error on ${table}:`, error);
                    return NextResponse.json({ error: 'Upsert failed' }, { status: 500 });
                }
                return NextResponse.json({ data: stripSensitiveFields(table, result) });
            }

            case 'delete': {
                if (!filters || filters.length === 0) {
                    return NextResponse.json({ error: 'Missing filters for delete' }, { status: 400 });
                }

                let query = adminSupabase.from(table).delete();

                // Scope to tenant
                if (tenantFilter) {
                    query = query.eq(tenantFilter.column, tenantFilter.value);
                }

                // Apply filters
                for (const f of filters) {
                    query = query.eq(f.column, f.value);
                }

                const { error } = await query;

                if (error) {
                    console.error(`Delete error on ${table}:`, error);
                    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
                }
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (err) {
        console.error('Admin CRUD error:', err);
        return NextResponse.json(
            { error: safeErrorResponse(err, 'Internal server error') },
            { status: 500 }
        );
    }
}
