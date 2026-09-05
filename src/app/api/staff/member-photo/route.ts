// ===============================================
// ClubForge - Staff: set a member's profile photo
// POST /api/staff/member-photo  (multipart: image, userId)
//
// Admins and instructors can replace a member's photo — e.g. when a random
// picture was used at sign-up — including one just taken with the device
// camera. Uploads with the service role into the public `avatars` bucket
// (browser writes to storage are disabled) and updates profiles.profile_image_url.
// The member must belong to the caller's tenant.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff, checkRateLimit } from '@/lib/auth-guard';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const EXT_BY_TYPE: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
};

export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'staff-member-photo', 30);
        if (rateLimited) return rateLimited;

        const auth = await requireStaff();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json({ error: auth.error || 'No tenant context' }, { status: auth.error ? auth.status : 400 });
        }

        const formData = await request.formData();
        const image = formData.get('image');
        const userId = formData.get('userId');

        if (!(image instanceof File)) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }
        if (typeof userId !== 'string' || !userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }
        if (!image.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }
        if (image.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Image must be less than 5MB' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Target must be a member of the caller's club
        const { data: target } = await admin
            .from('profiles')
            .select('id, tenant_id, first_name, last_name')
            .eq('user_id', userId)
            .maybeSingle();
        if (!target || target.tenant_id !== auth.tenantId) {
            return NextResponse.json({ error: 'Member not found in your club' }, { status: 404 });
        }

        const ext = EXT_BY_TYPE[image.type] || (image.name.split('.').pop() || 'jpg').toLowerCase();
        const rand = Math.random().toString(36).substring(2, 8);
        const path = `profile-images/${userId}/${Date.now()}_${rand}.${ext}`;
        const buffer = Buffer.from(await image.arrayBuffer());

        const { error: uploadError } = await admin.storage
            .from('avatars')
            .upload(path, buffer, { contentType: image.type, upsert: true, cacheControl: '3600' });
        if (uploadError) {
            console.error('[staff/member-photo] upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
        }

        const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path);

        const { error: updateError } = await admin
            .from('profiles')
            .update({ profile_image_url: publicUrl })
            .eq('id', target.id)
            .eq('tenant_id', auth.tenantId);
        if (updateError) {
            console.error('[staff/member-photo] profile update error:', updateError);
            return NextResponse.json({ error: 'Photo uploaded but profile could not be updated' }, { status: 500 });
        }

        console.log(`[staff/member-photo] ${auth.role} ${auth.userId} updated photo for ${userId}`);
        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('[staff/member-photo] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
