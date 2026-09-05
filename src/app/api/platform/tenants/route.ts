// ===============================================
// ClubForge - Platform Tenants API
// CRUD operations for managing all tenants
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Helper: verify the calling user is a platform admin
async function verifyPlatformAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

    return data ? user : null;
}

type AuthUserLite = { email: string | null; last_sign_in_at: string | null };
type AdminClient = ReturnType<typeof createAdminClient>;

// Short in-memory cache: the auth-user scan is the slow part of this endpoint.
const AUTH_CACHE_TTL_MS = 2 * 60_000;
let authUsersCache: { at: number; users: Map<string, AuthUserLite> } | null = null;

// All auth users keyed by id (email + last sign-in).
// Preferred path: platform_user_activity() RPC (migration 015, service-role
// only, one query). Fallback: auth.admin.listUsers — on this project at least
// one corrupt auth row makes ANY page containing it fail with "Database error
// finding users", so pages are subdivided 100 → 10 → 1 and only the bad row is
// skipped.
async function loadAuthUsers(adminSupabase: AdminClient) {
    if (authUsersCache && Date.now() - authUsersCache.at < AUTH_CACHE_TTL_MS) {
        return authUsersCache.users;
    }

    const users = new Map<string, AuthUserLite>();

    const { data: rpcRows, error: rpcError } = await adminSupabase.rpc('platform_user_activity');
    if (!rpcError && Array.isArray(rpcRows)) {
        for (const r of rpcRows as { user_id: string; email: string | null; last_sign_in_at: string | null }[]) {
            users.set(r.user_id, { email: r.email ?? null, last_sign_in_at: r.last_sign_in_at ?? null });
        }
    } else {
        await loadAuthUsersViaListUsers(adminSupabase, users);
    }

    authUsersCache = { at: Date.now(), users };
    return users;
}

async function loadAuthUsersViaListUsers(adminSupabase: AdminClient, users: Map<string, AuthUserLite>) {
    // Loads users [offset, offset + size) with perPage = size. Returns how many
    // rows that range holds (size → keep going, less → end of list).
    const load = async (offset: number, size: number): Promise<number> => {
        const { data, error } = await adminSupabase.auth.admin.listUsers({ page: offset / size + 1, perPage: size });
        if (!error) {
            for (const u of data.users) {
                users.set(u.id, { email: u.email ?? null, last_sign_in_at: u.last_sign_in_at ?? null });
            }
            return data.users.length;
        }
        if (size === 1) {
            console.warn(`[Platform Tenants API] skipping unreadable auth row at offset ${offset}: ${error.message}`);
            return 1;
        }
        const sub = size / 10;
        let got = 0;
        for (let o = offset; o < offset + size; o += sub) {
            const n = await load(o, sub);
            got += n;
            if (n < sub) break;
        }
        return got;
    };

    for (let offset = 0; offset < 100_000; offset += 100) {
        const n = await load(offset, 100);
        if (n < 100) break;
    }
}

function laterOf(a: string | null, b: string | null): string | null {
    if (!a) return b;
    if (!b) return a;
    return new Date(a) > new Date(b) ? a : b;
}

// GET: List all tenants with aggregated stats + activity signals
export async function GET() {
    try {
        const user = await verifyPlatformAdmin();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const adminSupabase = createAdminClient();

        // Fetch all tenants
        const { data: tenants, error } = await adminSupabase
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const [
            { data: memberRows },
            { data: profileRows },
            { data: activeMemberships },
            { data: attendanceRows },
            authUsers,
        ] = await Promise.all([
            // Every membership row (active flag kept so counts stay "active only")
            adminSupabase.from('tenant_members').select('tenant_id, user_id, is_active'),
            // Guardians often have a profile in the tenant but no tenant_members row
            adminSupabase.from('profiles').select('tenant_id, user_id').not('tenant_id', 'is', null),
            adminSupabase.from('memberships').select('tenant_id').eq('status', 'active'),
            // Most recent check-ins first; enough rows to cover every tenant's latest
            adminSupabase.from('attendance').select('tenant_id, check_in_time')
                .order('check_in_time', { ascending: false }).limit(5000),
            loadAuthUsers(adminSupabase),
        ]);

        // Aggregate per tenant
        const memberCount: Record<string, number> = {};
        const membershipCount: Record<string, number> = {};
        const tenantUserIds: Record<string, Set<string>> = {};
        const lastCheckIn: Record<string, string> = {};

        const addUser = (tenantId: string | null, userId: string) => {
            if (!tenantId) return;
            (tenantUserIds[tenantId] ||= new Set()).add(userId);
        };

        memberRows?.forEach(m => {
            if (m.is_active) memberCount[m.tenant_id] = (memberCount[m.tenant_id] || 0) + 1;
            addUser(m.tenant_id, m.user_id);
        });
        profileRows?.forEach(p => addUser(p.tenant_id, p.user_id));
        activeMemberships?.forEach(m => {
            if (m.tenant_id) membershipCount[m.tenant_id] = (membershipCount[m.tenant_id] || 0) + 1;
        });
        attendanceRows?.forEach(a => {
            // Rows arrive newest-first, so the first one per tenant is its latest
            if (a.tenant_id && a.check_in_time && !lastCheckIn[a.tenant_id]) {
                lastCheckIn[a.tenant_id] = a.check_in_time;
            }
        });

        const enrichedTenants = (tenants || []).map(t => {
            // Latest sign-in across everyone attached to the tenant
            let lastSignIn: string | null = null;
            for (const uid of tenantUserIds[t.id] || []) {
                lastSignIn = laterOf(lastSignIn, authUsers.get(uid)?.last_sign_in_at ?? null);
            }
            const owner = t.owner_user_id ? authUsers.get(t.owner_user_id) : undefined;
            lastSignIn = laterOf(lastSignIn, owner?.last_sign_in_at ?? null);

            const stripeStatus: 'connected' | 'pending' | 'none' = t.stripe_connect_enabled
                ? 'connected'
                : t.stripe_account_id ? 'pending' : 'none';

            return {
                ...t,
                member_count: memberCount[t.id] || 0,
                active_memberships: membershipCount[t.id] || 0,
                owner_email: owner?.email ?? null,
                owner_last_sign_in_at: owner?.last_sign_in_at ?? null,
                last_sign_in_at: lastSignIn,
                last_check_in_at: lastCheckIn[t.id] || null,
                last_activity_at: laterOf(lastSignIn, lastCheckIn[t.id] || null),
                stripe_status: stripeStatus,
            };
        });

        return NextResponse.json({ tenants: enrichedTenants });
    } catch (error) {
        console.error('[Platform Tenants API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
    }
}

// PATCH: Update a tenant's status or subscription tier
export async function PATCH(request: NextRequest) {
    try {
        const user = await verifyPlatformAdmin();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { tenantId, ...updates } = body;

        if (!tenantId) {
            return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
        }

        // Only allow specific fields to be updated
        const allowedFields = ['is_active', 'subscription_tier', 'subscription_status', 'name'];
        const filteredUpdates: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (key in updates) {
                filteredUpdates[key] = updates[key];
            }
        }

        if (Object.keys(filteredUpdates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const adminSupabase = createAdminClient();
        const { data: tenant, error } = await adminSupabase
            .from('tenants')
            .update(filteredUpdates)
            .eq('id', tenantId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ tenant });
    } catch (error) {
        console.error('[Platform Tenants API] PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
    }
}
