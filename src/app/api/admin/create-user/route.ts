import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getTenantId } from '@/lib/tenant';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 requests per minute
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { success: allowed } = rateLimit(`create-user:${ip}`, { maxRequests: 10, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        // Verify the requester is an admin
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (adminProfile?.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { email, password, firstName, lastName, role } = body;

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Use admin client to create user
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

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

        // Get tenant context
        const tenantId = await getTenantId();

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
                ...(tenantId && { tenant_id: tenantId }),
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
