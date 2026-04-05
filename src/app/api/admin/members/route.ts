import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit, safeErrorResponse } from '@/lib/auth-guard';

export async function DELETE(request: NextRequest) {
    try {
        // Rate limit: 10 per minute
        const rateLimited = checkRateLimit(request, 'admin-members-delete', 10);
        if (rateLimited) return rateLimited;

        // Require admin authentication
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        // Prevent self-deletion
        if (userId === auth.userId) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();

        // H1 FIX: Verify the target user belongs to the admin's tenant
        const { data: targetMember } = await supabaseAdmin
            .from('tenant_members')
            .select('id')
            .eq('user_id', userId)
            .eq('tenant_id', auth.tenantId)
            .single();

        if (!targetMember) {
            return NextResponse.json({ error: 'Member not found in your tenant' }, { status: 404 });
        }

        // Delete related records first — scoped to tenant
        await supabaseAdmin.from('attendance').delete().eq('user_id', userId).eq('tenant_id', auth.tenantId);
        await supabaseAdmin.from('memberships').delete().eq('user_id', userId).eq('tenant_id', auth.tenantId);
        await supabaseAdmin.from('tenant_members').delete().eq('user_id', userId).eq('tenant_id', auth.tenantId);

        // Delete the profile (tenant-scoped)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('user_id', userId)
            .eq('tenant_id', auth.tenantId);

        if (profileError) {
            console.error('Profile deletion error:', profileError);
            return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
        }

        // Delete the auth user
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Auth deletion error:', authError);
            return NextResponse.json({ error: 'Failed to delete member account' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Member deleted successfully' });

    } catch (error) {
        console.error('Delete member error:', error);
        return NextResponse.json(
            { error: safeErrorResponse(error, 'Internal server error') },
            { status: 500 }
        );
    }
}
