// ===============================================
// DojoHub - Admin API Client Helper
// Replaces direct Supabase client calls in admin pages
// All calls go through /api/admin/crud (server-side, bypasses RLS)
// ===============================================

interface Filter {
    column: string;
    operator?: string;
    value: unknown;
}

interface OrderBy {
    column: string;
    ascending?: boolean;
}

interface CrudOptions {
    filters?: Filter[];
    select?: string;
    order?: OrderBy[];
    limit?: number;
    single?: boolean;
    count?: 'exact' | 'planned' | 'estimated';
    head?: boolean;
}

// Generic fetch helper
async function crudRequest(
    action: 'select' | 'insert' | 'update' | 'upsert' | 'delete',
    table: string,
    data?: Record<string, unknown> | null,
    options?: CrudOptions
): Promise<{ data: unknown; error: string | null; count?: number | null }> {
    try {
        const res = await fetch('/api/admin/crud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                table,
                data: data || undefined,
                filters: options?.filters?.map(f => ({
                    column: f.column,
                    operator: f.operator || 'eq',
                    value: f.value,
                })),
                select: options?.select,
                order: options?.order,
                limit: options?.limit,
                single: options?.single,
                count: options?.count,
                head: options?.head,
            }),
        });

        const result = await res.json();

        if (!res.ok) {
            return { data: null, error: result.error || 'Request failed' };
        }

        return { data: result.data, error: null, count: result.count };
    } catch (err) {
        console.error(`Admin API error (${action} ${table}):`, err);
        return { data: null, error: 'Failed to connect to server' };
    }
}

/**
 * Fetch rows from a table (auto-scoped to tenant)
 */
export async function adminFetch<T = Record<string, unknown>>(
    table: string,
    options?: CrudOptions
): Promise<{ data: T[]; error: string | null; count?: number | null }> {
    const result = await crudRequest('select', table, null, options);
    return {
        data: (result.data as T[]) || [],
        error: result.error,
        count: result.count,
    };
}

/**
 * Fetch a single row from a table
 */
export async function adminFetchOne<T = Record<string, unknown>>(
    table: string,
    options?: Omit<CrudOptions, 'single'>
): Promise<{ data: T | null; error: string | null }> {
    const result = await crudRequest('select', table, null, { ...options, single: true });
    return {
        data: result.data as T | null,
        error: result.error,
    };
}

/**
 * Insert a row (tenant_id auto-injected server-side)
 */
export async function adminInsert<T = Record<string, unknown>>(
    table: string,
    data: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
    const result = await crudRequest('insert', table, data);
    return {
        data: result.data as T | null,
        error: result.error,
    };
}

/**
 * Update rows matching filters
 */
export async function adminUpdate<T = Record<string, unknown>>(
    table: string,
    data: Record<string, unknown>,
    filters: Filter[]
): Promise<{ data: T[] | null; error: string | null }> {
    const result = await crudRequest('update', table, data, { filters });
    return {
        data: result.data as T[] | null,
        error: result.error,
    };
}

/**
 * Update a single row by ID
 */
export async function adminUpdateById<T = Record<string, unknown>>(
    table: string,
    id: string,
    data: Record<string, unknown>
): Promise<{ data: T[] | null; error: string | null }> {
    return adminUpdate<T>(table, data, [{ column: 'id', value: id }]);
}

/**
 * Upsert a row (tenant_id auto-injected server-side)
 */
export async function adminUpsert<T = Record<string, unknown>>(
    table: string,
    data: Record<string, unknown>
): Promise<{ data: T[] | null; error: string | null }> {
    const result = await crudRequest('upsert', table, data);
    return {
        data: result.data as T[] | null,
        error: result.error,
    };
}

/**
 * Delete rows matching filters
 */
export async function adminDelete(
    table: string,
    filters: Filter[]
): Promise<{ error: string | null }> {
    const result = await crudRequest('delete', table, null, { filters });
    return { error: result.error };
}

/**
 * Delete a single row by ID
 */
export async function adminDeleteById(
    table: string,
    id: string
): Promise<{ error: string | null }> {
    return adminDelete(table, [{ column: 'id', value: id }]);
}

/**
 * Count rows in a table
 */
export async function adminCount(
    table: string,
    filters?: Filter[]
): Promise<{ count: number; error: string | null }> {
    const result = await crudRequest('select', table, null, {
        filters,
        count: 'exact',
        head: true,
    });
    return {
        count: (result.count as number) || 0,
        error: result.error,
    };
}
