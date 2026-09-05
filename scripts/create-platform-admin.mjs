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
//   node scripts/create-platform-admin.mjs --remove --email ops@clubforgehq.com
//
// Behaviour:
//   * If an auth user with that email already exists it is reused (no password
//     change); otherwise a confirmed auth user is created. When no --password is
//     supplied a strong one is generated and printed ONCE.
//   * The `on_auth_user_created` trigger creates the matching `profiles` row
//     from user_metadata (first_name / last_name), so we pass those through.
//   * --remove only deletes the platform_admins row; the auth user is kept.
// ===============================================

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
            case '--password': args.password = next(); break;
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
  node scripts/create-platform-admin.mjs --remove --email <email>`);
    process.exit(code);
}

function fail(msg) {
    console.error(`\nERROR: ${msg}`);
    process.exit(1);
}

function generatePassword() {
    // 24 URL-safe chars plus a guaranteed symbol/digit for stricter policies
    return randomBytes(18).toString('base64url') + '!7';
}

// -----------------------------------------------
// Supabase helpers
// -----------------------------------------------
function adminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) fail('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.local).');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function findAuthUserByEmail(supabase, email) {
    const perPage = 1000;
    for (let page = 1; page <= 50; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) fail(`listUsers failed: ${error.message}`);
        const match = data.users.find(u => (u.email || '').toLowerCase() === email);
        if (match) return match;
        if (data.users.length < perPage) return null;
    }
    return null;
}

async function listPlatformAdmins(supabase) {
    const { data: rows, error } = await supabase
        .from('platform_admins')
        .select('id, user_id, created_at')
        .order('created_at', { ascending: true });
    if (error) fail(`Could not read platform_admins: ${error.message}`);

    const out = [];
    for (const row of rows) {
        const { data, error: uErr } = await supabase.auth.admin.getUserById(row.user_id);
        out.push({
            email: uErr ? `(auth user missing: ${uErr.message})` : data.user?.email || '(no email)',
            user_id: row.user_id,
            granted: (row.created_at || '').slice(0, 10),
            last_sign_in: (data?.user?.last_sign_in_at || '').slice(0, 10) || '-',
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

    if (!args.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(args.email)) {
        fail('A valid --email is required (or use --list).');
    }

    if (args.remove) {
        const user = await findAuthUserByEmail(supabase, args.email);
        if (!user) fail(`No auth user found for ${args.email}.`);
        const { data, error } = await supabase
            .from('platform_admins')
            .delete()
            .eq('user_id', user.id)
            .select('id');
        if (error) fail(`Failed to revoke: ${error.message}`);
        if (!data?.length) {
            console.log(`INFO: ${args.email} was not a platform admin; nothing to do.`);
        } else {
            console.log(`OK: Revoked platform admin access for ${args.email} (auth user kept).`);
        }
        return;
    }

    // ---- Grant ----
    let user = await findAuthUserByEmail(supabase, args.email);
    let createdAuthUser = false;
    let generatedPassword = null;

    if (user) {
        console.log(`INFO: Auth user already exists for ${args.email} (${user.id}); reusing it. Password unchanged.`);
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
        if (error || !data?.user) fail(`Failed to create auth user: ${error?.message || 'unknown error'}`);
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
        console.log(`INFO: ${args.email} is already a platform admin.`);
    } else {
        const { error } = await supabase.from('platform_admins').insert({ user_id: user.id });
        if (error) fail(`Failed to insert platform_admins row: ${error.message}`);
        console.log(`OK: Granted platform admin access to ${args.email}.`);
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

main().catch(err => fail(err?.message || String(err)));
