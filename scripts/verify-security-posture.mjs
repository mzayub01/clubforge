#!/usr/bin/env node
// ===============================================
// ClubForge - Security posture verification (read-only)
//
// Re-runs the probes from the 2026-09 responsible disclosure with the PUBLIC
// anon key, exactly as an anonymous internet caller would. Prints PASS/FAIL per
// check. Run before and after applying migration 014.
//
//   node scripts/verify-security-posture.mjs
//
// Optional authenticated checks (a NON-platform-admin member account works best):
//   VERIFY_EMAIL=... VERIFY_PASSWORD=... node scripts/verify-security-posture.mjs
// These attempt (and expect to be refused): writing a canary into a foreign
// tenant's storage folder, and self-elevating profiles.role. Nothing is left
// behind if a write unexpectedly succeeds — it is deleted/reverted immediately.
// ===============================================

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function loadEnvLocal() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.local');
    if (!fs.existsSync(envPath)) return;
    for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#') || !line.includes('=')) continue;
        const i = line.indexOf('=');
        const key = line.slice(0, i).trim();
        let value = line.slice(i + 1).trim();
        if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
        if (key && !(key in process.env)) process.env[key] = value;
    }
}

const SENSITIVE_TENANT_COLUMNS = [
    'owner_user_id', 'contact_email', 'contact_phone', 'stripe_account_id',
    'stripe_customer_id', 'subscription_tier', 'subscription_status', 'trial_ends_at',
];

let failures = 0;
function report(ok, name, detail) {
    failures += ok ? 0 : 1;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

async function anonChecks(url, anonKey) {
    const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // F1: anonymous read of the base tenants table
    {
        const { data, error } = await anon.from('tenants').select('*').limit(50);
        const rows = data?.length ?? 0;
        report(!error && rows === 0 || !!error, 'anon SELECT public.tenants returns nothing',
            error ? `error ${error.code}` : `${rows} rows`);
    }

    // The safe projection must work for anon and must not carry sensitive columns
    {
        const { data, error } = await anon.from('tenants_public').select('*').limit(50);
        if (error) {
            report(false, 'anon SELECT tenants_public works', `error ${error.code} ${error.message}`);
        } else {
            const cols = Object.keys(data[0] || {});
            const leaked = cols.filter(c => SENSITIVE_TENANT_COLUMNS.includes(c));
            report(data.length > 0, 'anon SELECT tenants_public returns rows', `${data.length} rows`);
            report(leaked.length === 0, 'tenants_public has no sensitive columns',
                leaked.length ? 'leaked: ' + leaked.join(', ') : cols.join(', '));
        }
    }

    // L3: no infinite recursion, and still nothing visible to anon
    for (const table of ['tenant_members', 'rank_schemas', 'profiles', 'memberships', 'platform_admins']) {
        const { data, error } = await anon.from(table).select('*').limit(5);
        const recursion = error?.code === '42P17';
        report(!recursion && (data?.length ?? 0) === 0, `anon SELECT ${table} is empty and not recursive`,
            error ? `error ${error.code}` : `${data?.length ?? 0} rows`);
    }

    // F2: anonymous listing of storage buckets
    for (const [bucket, prefix] of [['tenant-assets', 'tenants'], ['tenant-assets', ''], ['avatars', ''], ['avatars', 'profile-images']]) {
        const { data, error } = await anon.storage.from(bucket).list(prefix, { limit: 20 });
        report((data?.length ?? 0) === 0, `anon LIST ${bucket}/${prefix || '(root)'} is empty`,
            error ? `error ${error.message}` : `${data?.length ?? 0} entries`);
    }

    // Public-bucket downloads must keep working (logos render without RLS)
    {
        const { data } = await anon.from('tenants_public').select('slug, logo_url').not('logo_url', 'is', null).limit(1);
        const logo = data?.[0]?.logo_url;
        if (logo) {
            const res = await fetch(logo.split('?')[0]);
            report(res.status === 200, `public logo download still works (${data[0].slug})`, `HTTP ${res.status}`);
        } else {
            report(true, 'public logo download check skipped', 'no tenant with a logo_url');
        }
    }
}

async function authenticatedChecks(url, anonKey, email, password) {
    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: signIn, error: signInErr } = await client.auth.signInWithPassword({ email, password });
    if (signInErr || !signIn.user) {
        report(false, 'authenticated checks: sign-in', signInErr?.message || 'no user');
        return;
    }
    const uid = signIn.user.id;
    console.log(`\nAuthenticated as ${email} (${uid})`);

    // F2: write a canary into a tenant folder this user is not an admin of
    {
        const foreign = `tenants/00000000-0000-4000-8000-000000000000/canary-${Date.now()}.txt`;
        const { error } = await client.storage.from('tenant-assets').upload(foreign, new Blob(['canary']), { contentType: 'text/plain' });
        if (!error) await client.storage.from('tenant-assets').remove([foreign]);
        report(!!error, 'upload into a foreign tenant-assets folder is refused', error ? error.message : 'UPLOAD SUCCEEDED (cleaned up)');
    }
    {
        const foreign = `profile-images/canary/${Date.now()}.txt`;
        const { error } = await client.storage.from('avatars').upload(foreign, new Blob(['canary']), { contentType: 'text/plain' });
        if (!error) await client.storage.from('avatars').remove([foreign]);
        report(!!error, 'client upload into avatars is refused', error ? error.message : 'UPLOAD SUCCEEDED (cleaned up)');
    }

    // L1: self-elevation of profiles.role
    {
        const { data: before } = await client.from('profiles').select('role').eq('user_id', uid).maybeSingle();
        const { data, error } = await client.from('profiles').update({ role: 'admin' }).eq('user_id', uid).select('role');
        const elevated = !error && data?.[0]?.role === 'admin' && before?.role !== 'admin';
        if (elevated) await client.from('profiles').update({ role: before?.role || 'member' }).eq('user_id', uid);
        report(!elevated, 'PATCH own profiles.role=admin is refused',
            error ? `error ${error.code}` : (before?.role === 'admin' ? 'already admin — inconclusive' : 'ROLE CHANGED (reverted)'));
    }

    // Tenants visible to a signed-in user must be limited to owned/admin tenants
    {
        const { data: tm } = await client.from('tenant_members').select('tenant_id, role').eq('user_id', uid);
        const adminTenants = (tm || []).filter(m => m.role === 'admin').length;
        const { data: tenants, error } = await client.from('tenants').select('id').limit(100);
        report(!error && (tenants?.length ?? 0) <= adminTenants + 1,
            'authenticated SELECT tenants limited to own admin/owned tenants',
            error ? `error ${error.code}` : `${tenants?.length ?? 0} rows visible, ${adminTenants} admin memberships`);
    }

    await client.auth.signOut();
}

async function main() {
    loadEnvLocal();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');

    console.log(`Anonymous probes against ${url}\n`);
    await anonChecks(url, anonKey);

    if (process.env.VERIFY_EMAIL && process.env.VERIFY_PASSWORD) {
        await authenticatedChecks(url, anonKey, process.env.VERIFY_EMAIL, process.env.VERIFY_PASSWORD);
    } else {
        console.log('\n(authenticated checks skipped — set VERIFY_EMAIL and VERIFY_PASSWORD to run them)');
    }

    console.log(`\n${failures === 0 ? 'All checks passed.' : failures + ' check(s) FAILED.'}`);
    process.exitCode = failures === 0 ? 0 : 1;
}

main().catch(err => {
    console.error(`\nERROR: ${err?.message || err}`);
    process.exitCode = 1;
});
