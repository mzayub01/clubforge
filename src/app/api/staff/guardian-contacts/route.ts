// ===============================================
// ClubForge - Staff: child → guardian contact map
// GET /api/staff/guardian-contacts
//
// Returns, for every child account in the caller's club, the guardian's real
// contact details keyed by the child's dummy email (and by child user id).
// Admin/instructor pages use it (via useGuardianContacts) to show the
// guardian's address instead of the generated @child.clubforge.local one.
// ===============================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/auth-guard';
import { CHILD_EMAIL_DOMAIN, isChildDummyEmail } from '@/lib/member-contact';

export interface GuardianContact {
    childUserId: string;
    childName: string;
    guardianUserId: string | null;
    guardianName: string | null;
    guardianEmail: string | null;
    guardianPhone: string | null;
}

export async function GET() {
    try {
        const auth = await requireStaff();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }

        const admin = createAdminClient();

        const { data: children, error } = await admin
            .from('profiles')
            .select('id, user_id, email, first_name, last_name, parent_guardian_id, is_child')
            .eq('tenant_id', auth.tenantId)
            .or(`is_child.eq.true,email.ilike.%${CHILD_EMAIL_DOMAIN}`);
        if (error) throw error;

        const guardianIds = Array.from(new Set(
            (children || []).map(c => c.parent_guardian_id).filter((id): id is string => !!id)
        ));

        const guardians = new Map<string, { user_id: string; email: string | null; first_name: string; last_name: string; phone: string | null }>();
        if (guardianIds.length > 0) {
            const { data: rows } = await admin
                .from('profiles')
                .select('id, user_id, email, first_name, last_name, phone')
                .in('id', guardianIds);
            for (const g of rows || []) guardians.set(g.id, g);
        }

        const byEmail: Record<string, GuardianContact> = {};
        const byChildUserId: Record<string, GuardianContact> = {};
        for (const c of children || []) {
            const g = c.parent_guardian_id ? guardians.get(c.parent_guardian_id) : undefined;
            const entry: GuardianContact = {
                childUserId: c.user_id,
                childName: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
                guardianUserId: g?.user_id ?? null,
                guardianName: g ? `${g.first_name || ''} ${g.last_name || ''}`.trim() : null,
                guardianEmail: g?.email && !isChildDummyEmail(g.email) ? g.email : null,
                guardianPhone: g?.phone ?? null,
            };
            byChildUserId[c.user_id] = entry;
            if (c.email) byEmail[c.email.toLowerCase()] = entry;
        }

        return NextResponse.json({ byEmail, byChildUserId });
    } catch (error) {
        console.error('[staff/guardian-contacts] Error:', error);
        return NextResponse.json({ error: 'Failed to load guardian contacts' }, { status: 500 });
    }
}
