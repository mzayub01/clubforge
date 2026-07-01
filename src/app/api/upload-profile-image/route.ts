import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/auth-guard';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload-profile-image
 *
 * Uploads a profile picture server-side using the admin client (bypasses
 * Storage RLS) into the public `avatars` bucket — the same reliable path the
 * add-child flow uses. This replaces the client-side upload during
 * registration, which depended on Storage RLS / an active session and could
 * fail silently, leaving members with no picture even when photos are
 * mandatory.
 *
 * Accepts multipart/form-data: `image` (File, required), `userId` (string,
 * optional — used only to organise the storage path). Returns { url }.
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit: 20 uploads per minute (abuse guard for this unauthenticated endpoint)
        const rateLimited = checkRateLimit(request, 'upload-profile-image', 20);
        if (rateLimited) return rateLimited;

        const formData = await request.formData();
        const image = formData.get('image') as File | null;
        const userId = (formData.get('userId') as string | null) || null;

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }
        if (!image.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }
        if (image.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Image must be less than 5MB' }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();

        // Ensure the avatars bucket exists (mirrors the add-child upload flow)
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        if (!buckets?.find(b => b.id === 'avatars')) {
            await supabaseAdmin.storage.createBucket('avatars', { public: true });
            console.log('[upload-profile-image] Created missing "avatars" storage bucket');
        }

        const fileExt = image.name.split('.').pop() || 'jpg';
        const rand = Math.random().toString(36).substring(2, 8);
        const folder = userId || 'registrations';
        const filePath = `profile-images/${folder}/${Date.now()}_${rand}.${fileExt}`;

        const buffer = Buffer.from(await image.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
            .from('avatars')
            .upload(filePath, buffer, { contentType: image.type, upsert: true });

        if (uploadError) {
            console.error('[upload-profile-image] Upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload profile picture', details: uploadError.message },
                { status: 500 }
            );
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (error) {
        console.error('[upload-profile-image] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
