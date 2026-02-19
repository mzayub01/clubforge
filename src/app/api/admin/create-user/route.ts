import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveTenantForUser } from '@/lib/tenant';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 requests per minute
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { success: allowed } = rateLimit(`create-user:${ip}`, { maxRequests: 10, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        // Verify the requester is an admin via tenant_members
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const membership = await resolveTenantForUser(user.id);
        if (!membership || membership.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { email, password, firstName, lastName, role } = body;

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Use admin client to create user
        const supabaseAdmin = createAdminClient();

        // Create auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return NextResponse.json({ success: false, error: createError.message }, { status: 400 });
        }

        if (!newUser.user) {
            return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
        }

        // Create/update profile for the user (upsert in case trigger already created it)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                user_id: newUser.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                role: role || 'member',
                belt_rank: 'white',
                stripes: 0,
                is_child: false,
                date_of_birth: '2000-01-01', // Default placeholder
                address: '',
                city: '',
                postcode: '',
                phone: '',
                emergency_contact_name: '',
                emergency_contact_phone: '',
                best_practice_accepted: false,
                waiver_accepted: false,
                tenant_id: membership.tenantId,
            }, { onConflict: 'user_id' });

        if (profileError) {
            console.error('Error creating profile:', profileError);
            // Try to clean up the auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
            return NextResponse.json({
                success: false,
                error: `Failed to create user profile: ${profileError.message || profileError.code || JSON.stringify(profileError)}`
            }, { status: 500 });
        }

        // Create tenant_members row for the new user
        const { error: tmError } = await supabaseAdmin
            .from('tenant_members')
            .upsert({
                tenant_id: membership.tenantId,
                user_id: newUser.user.id,
                role: role || 'member',
                is_active: true,
            }, { onConflict: 'tenant_id,user_id' });

        if (tmError) {
            console.error('Warning: Failed to create tenant_members row:', tmError.message);
            // Non-fatal — profile already created
        }


        return NextResponse.json({
            success: true,
            user: {
                id: newUser.user.id,
                email: newUser.user.email
            }
        });
    } catch (error) {
        console.error('Create user API error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
