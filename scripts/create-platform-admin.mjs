#!/usr/bin/env node
// ===============================================
// ClubForge - Platform Admin management script
//
// Grants (or revokes) platform-level super-admin access. Platform admins are
// rows in `public.platform_admins` (no RLS policies -> service role only), so
// this MUST run with SUPABASE_SERVICE_ROLE_KEY from .env.local.
//
// Usage (from the repo root):
//   node scripts/create-platform-admin.mjs --list
//   node scripts/create-platform-admin.mjs --email ops@clubforgehq.com \
//        [--password "S3cret"] [--first-name Ops] [--last-name Team]
//   node scripts/create-platform-admin.mjs --user-id <auth uuid>      (existing user)
//   node scripts/create-platform-admin.mjs --remove --email ops@clubforgehq.com
//
// Behaviour:
//   * If an auth user with that email already exists it is reused (password
//     unchanged unless --password AND --reset-password are given); otherwise a
//     confirmed auth user is created. When no --password is supplied a strong
//     one is generated and printed ONCE.
//   * Existing users are found via `profiles.email` (kept in sync by the
//     `on_auth_user_created` trigger) and verified with auth.admin.getUserById.
//     auth.admin.listUsers is only a fallback: on this project it fails with
//     "Database error finding users" (hand-inserted auth rows), so it is not
//     relied upon. If both fail, pass --user-id from the Supabase dashboard.
//   * --remove only deletes the platform_admins row; the auth user is kept.
// ===============================================

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

class ScriptError extends Error {}
function fail(msg) {
    throw new ScriptError(msg);
}

// -----------------------------------------------
// Env loading (.env.local fallback if not already in process.env)
// -----------------------------------------------
function loadEnvLocal() {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const here = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(here, '../.env.local');
    if (!fs.existsSync(envPath)) return;
    for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#') || !line.includes('=')) continue;
        const idx = line.indexOf('=');
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        const quoted = /^(["']).*\1$/.test(value);
        if (quoted) value = value.slice(1, -1);
        else if (value.includes(' #')) value = value.split(' #')[0].trim();
        if (key && !(key in process.env)) process.env[key] = value;
    }
}

// -----------------------------------------------
// Arg parsing
// -----------------------------------------------
function parseArgs(argv) {
    const args = { list: false, remove: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = () => {
            const v = argv[i + 1];
            if (v === undefined || v.startsWith('--')) fail(`Missing value for ${a}`);
            i++;
            return v;
        };
        switch (a) {
            case '--list': args.list = true; break;
            case '--remove': args.remove = true; break;
            case '--email': args.email = next().trim().toLowerCase(); break;
            case '--user-id': args.userId = next().trim(); break;
            case '--password': args.password = next(); break;
            case '--reset-password': args.resetPassword = true; break;
            case '--first-name': args.firstName = next(); break;
            case '--last-name': args.lastName = next(); break;
            case '-h':
            case '--help': usage(0); break;
            default: fail(`Unknown argument: ${a}`);
        }
    }
    return args;
}

function usage(code) {
    console.log(`Usage:
  node scripts/create-platform-admin.mjs --list
  node scripts/create-platform-admin.mjs --email <email> [--password <pw>] [--first-name <n>] [--last-name <n>]
  node scripts/create-platform-admin.mjs --user-id <auth uuid>
  node scripts/create-platform-admin.mjs --remove (--email <email> | --user-id <auth uuid>)

Options:
  --reset-password   With --password: also set that password on an EXISTING auth user
                     (by default an existing user's password is left unchanged).`);
    process.exit(code);
}

function generatePassword() {
    // 24 URL-safe chars plus a guaranteed symbol/digit for stricter policies
    return randomBytes(18).toString('base64url') + '!7';
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// -----------------------------------------------
// Supabase helpers
// -----------------------------------------------
function adminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) fail('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.local).');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getUserById(supabase, userId) {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !data?.user) return null;
    return data.user;
}

async function findAuthUserByEmail(supabase, email) {
    // 1. Fast path: profiles.email (populated from auth.users by the signup trigger),
    //    verified against auth to guard against stale/edited profile emails.
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('email', email)
        .limit(10);
    if (pErr) console.warn(`WARN: profiles lookup failed (${pErr.message}); trying auth listUsers.`);
    for (const p of profiles || []) {
        const user = await getUserById(supabase, p.user_id);
        if (user && (user.email || '').toLowerCase() === email) return user;
    }

    // 2. Fallback: page through auth users. On this project perPage >= ~1000 fails
    //    with "Database error finding users", so keep pages small; any error is
    //    treated as not found (createUser will still reject a duplicate email).
    const perPage = 100;
    for (let page = 1; page <= 250; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) {
            console.warn(`WARN: auth listUsers failed (${error.message}); assuming no existing user.`);
            return null;
        }
        const match = data.users.find(u => (u.email || '').toLowerCase() === email);
        if (match) return match;
        if (data.users.length < perPage) return null;
    }
    return null;
}

async function resolveUser(supabase, args) {
    if (args.userId) {
        const user = await getUserById(supabase, args.userId);
        if (!user) fail(`No auth user found with id ${args.userId}.`);
        return user;
    }
    return findAuthUserByEmail(supabase, args.email);
}

async function listPlatformAdmins(supabase) {
    const { data: rows, error } = await supabase
        .from('platform_admins')
        .select('id, user_id, created_at')
        .order('created_at', { ascending: true });
    if (error) fail(`Could not read platform_admins: ${error.message}`);

    const out = [];
    for (const row of rows) {
        const user = await getUserById(supabase, row.user_id);
        out.push({
            email: user?.email || '(auth user missing)',
            user_id: row.user_id,
            granted: (row.created_at || '').slice(0, 10),
            last_sign_in: (user?.last_sign_in_at || '').slice(0, 10) || '-',
        });
    }
    return out;
}

// -----------------------------------------------
// Main
// -----------------------------------------------
async function main() {
    loadEnvLocal();
    const args = parseArgs(process.argv.slice(2));
    const supabase = adminClient();

    if (args.list) {
        const admins = await listPlatformAdmins(supabase);
        if (admins.length === 0) {
            console.log('No platform admins found.');
        } else {
            console.log(`\nPlatform admins (${admins.length}):\n`);
            console.table(admins);
        }
        return;
    }

    if (args.userId && !UUID_RE.test(args.userId)) fail('--user-id must be a UUID.');
    if (!args.userId && (!args.email || !EMAIL_RE.test(args.email))) {
        fail('A valid --email (or --user-id) is required, or use --list.');
    }

    if (args.remove) {
        const user = await resolveUser(supabase, args);
        const label = args.email || args.userId;
        if (!user) fail(`No auth user found for ${label}.`);
        const { data, error } = await supabase
            .from('platform_admins')
            .delete()
            .eq('user_id', user.id)
            .select('id');
        if (error) fail(`Failed to revoke: ${error.message}`);
        if (!data?.length) {
            console.log(`INFO: ${user.email || label} was not a platform admin; nothing to do.`);
        } else {
            console.log(`OK: Revoked platform admin access for ${user.email || label} (auth user kept).`);
        }
        return;
    }

    // ---- Grant ----
    let user = await resolveUser(supabase, args);
    let createdAuthUser = false;
    let generatedPassword = null;

    if (user) {
        console.log(`INFO: Auth user already exists for ${user.email} (${user.id}); reusing it.`);
        if (args.password && args.resetPassword) {
            const { error } = await supabase.auth.admin.updateUserById(user.id, { password: args.password });
            if (error) fail(`Failed to set password: ${error.message}`);
            console.log('OK: Password updated to the supplied --password.');
        } else if (args.password) {
            console.log('INFO: --password ignored for an existing user (pass --reset-password to set it).');
        } else {
            console.log('INFO: Password unchanged.');
        }
    } else {
        const password = args.password || (generatedPassword = generatePassword());
        const { data, error } = await supabase.auth.admin.createUser({
            email: args.email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name: args.firstName || 'Platform',
                last_name: args.lastName || 'Admin',
                is_platform_admin: true,
            },
        });
        if (error || !data?.user) {
            const msg = error?.message || 'unknown error';
            if (/already been registered|already exists/i.test(msg)) {
                fail(`An auth user with ${args.email} already exists but could not be located via profiles/listUsers. ` +
                    `Find its UUID under Authentication → Users in the Supabase dashboard and re-run with --user-id <uuid>.`);
            }
            fail(`Failed to create auth user: ${msg}`);
        }
        user = data.user;
        createdAuthUser = true;
        console.log(`OK: Created confirmed auth user ${args.email} (${user.id}).`);
    }

    const { data: existing } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing) {
        console.log(`INFO: ${user.email} is already a platform admin.`);
    } else {
        const { error } = await supabase.from('platform_admins').insert({ user_id: user.id });
        if (error) fail(`Failed to insert platform_admins row: ${error.message}`);
        console.log(`OK: Granted platform admin access to ${user.email}.`);
    }

    console.log('\nNext steps:');
    console.log('  1. Sign in at https://clubforgehq.com/login (apex domain, not a club subdomain).');
    console.log('  2. Platform admins are redirected to /platform automatically.');
    if (createdAuthUser) {
        if (generatedPassword) {
            console.log(`\n  Temporary password (shown once, change it after first login):\n\n    ${generatedPassword}\n`);
        } else {
            console.log('  Password: the one you supplied via --password.');
        }
    }
}

main().catch(err => {
    console.error(`\nERROR: ${err?.message || String(err)}`);
    process.exitCode = 1;
});
