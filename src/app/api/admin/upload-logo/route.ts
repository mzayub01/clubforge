// ===============================================
// ClubForge - Club Logo Upload (server-side)
// POST /api/admin/upload-logo  (multipart/form-data: `logo`)
//
// Uploads the club logo with the service-role client into the public
// `tenant-assets` bucket at tenants/<tenantId>/logo.<ext>. The browser no
// longer writes to storage directly: the bucket's client policies were
// bucket-wide (any signed-in user could overwrite/delete any club's logo —
// 2026-09 disclosure), and are now scoped to the tenant's admins as defence in
// depth. The tenant is taken from the authenticated admin's request context,
// never from the client.
// ===============================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, checkRateLimit } from '@/lib/auth-guard';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB (matches the bucket limit)
const ALLOWED_TYPES: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/gif': 'gif',
};
// Extensions older client-side uploads may have left behind for the same tenant.
const STALE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'];

export async function POST(request: NextRequest) {
    try {
        const rateLimited = checkRateLimit(request, 'upload-logo', 10);
        if (rateLimited) return rateLimited;

        const auth = await requireAdmin();
        if (auth.error || !auth.tenantId) {
            return NextResponse.json(
                { error: auth.error || 'No tenant context' },
                { status: auth.error ? auth.status : 400 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('logo');
        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'No logo file provided' }, { status: 400 });
        }
        const ext = ALLOWED_TYPES[file.type];
        if (!ext) {
            return NextResponse.json(
                { error: 'Logo must be a PNG, JPEG, WebP, SVG or GIF image' },
                { status: 400 }
            );
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Logo must be less than 5MB' }, { status: 400 });
        }

        const admin = createAdminClient();
        const folder = `tenants/${auth.tenantId}`;
        const path = `${folder}/logo.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await admin.storage
            .from('tenant-assets')
            .upload(path, buffer, { contentType: file.type, upsert: true, cacheControl: '3600' });

        if (uploadError) {
            console.error('[upload-logo] Upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
        }

        // Best effort: remove variants with other extensions so a club has one logo object.
        const stale = STALE_EXTS.filter(e => e !== ext).map(e => `${folder}/logo.${e}`);
        await admin.storage.from('tenant-assets').remove(stale);

        const { data: { publicUrl } } = admin.storage.from('tenant-assets').getPublicUrl(path);

        // Cache-buster: the object path is stable across re-uploads.
        return NextResponse.json({ url: `${publicUrl}?v=${Date.now()}` });
    } catch (error) {
        console.error('[upload-logo] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
