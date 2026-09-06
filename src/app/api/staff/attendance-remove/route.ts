// ===============================================
// ClubForge - Staff: remove an attendance record (undo a check-in)
// POST /api/staff/attendance-remove  { attendanceId }
//
// Instructors and admins can undo a check-in from the class roster. The
// row must belong to the caller's tenant. Runs with the service role so the
// roster works for instructors (the generic admin CRUD route only allows
// admins to delete).
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff, checkRateLimit } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'attendance-remove', 60);
        if (rateLimited) return rateLimited;

        const auth = await requireStaff();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }

        const { attendanceId } = await request.json() as { attendanceId?: string };
        if (!attendanceId) {
            return NextResponse.json({ error: 'attendanceId is required' }, { status: 400 });
        }

        const admin = createAdminClient();
        const { data, error } = await admin
            .from('attendance')
            .delete()
            .eq('id', attendanceId)
            .eq('tenant_id', auth.tenantId)
            .select('id');

        if (error) {
            console.error('[attendance-remove] delete failed:', error.message);
            return NextResponse.json({ error: 'Failed to remove attendance' }, { status: 500 });
        }
        if (!data?.length) {
            return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[attendance-remove] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
