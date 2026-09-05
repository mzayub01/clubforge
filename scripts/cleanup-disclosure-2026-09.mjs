#!/usr/bin/env node
// ===============================================
// ClubForge - One-off cleanup for the 2026-09 responsible disclosure
//
// Each action re-verifies its preconditions against the live project before
// touching anything, and does nothing without --yes.
//
//   node scripts/cleanup-disclosure-2026-09.mjs --delete-squat-user [--yes]
//       Deletes the auth user the researcher created for the real customer
//       address info@alloutwarriors.com (so the club can register it).
//
//   node scripts/cleanup-disclosure-2026-09.mjs --clear-aow-logo [--yes]
//       Clears tenants.logo_url on All Out Warriors — the object was deleted by
//       the researcher and is not recoverable; the club must re-upload.
//
//   node scripts/cleanup-disclosure-2026-09.mjs --delete-researcher-accounts [--yes]
//       Deletes the researcher's two trial accounts. Only run this AFTER they
//       have validated the fix — they offered to.
// ===============================================

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SQUAT_USER = { id: 'ec999072-852c-48e4-96d6-a3f51c248e1d', email: 'info@alloutwarriors.com' };
const RESEARCHER_USERS = [
    { id: '3bd5e5c4-9d4b-43d8-8877-f25a7eb8c1fb', email: 'greysurface-security+clubforgehq1@proton.me' },
    { id: '001115a4-e6c9-48c6-a19c-b5e3193cb354', email: 'greysurface-security+clubforgehq2@proton.me' },
];
const AOW_TENANT_ID = '1ef919f7-d9e6-498e-ab9d-ef8852e37229';
const AOW_DEAD_LOGO = `https://iquaxdmttxburgabuuvi.supabase.co/storage/v1/object/public/tenant-assets/tenants/${AOW_TENANT_ID}/logo.png`;

function loadEnvLocal() {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) return;
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

function fail(msg) { throw new Error(msg); }

// A user is "empty" when it owns nothing and belongs to nothing.
async function assertEmptyUser(s, { id, email }) {
    const { data, error } = await s.auth.admin.getUserById(id);
    if (error || !data?.user) fail(`${email}: auth user ${id} not found (${error?.message || 'already deleted?'})`);
    if ((data.user.email || '').toLowerCase() !== email) fail(`${email}: auth user ${id} has a different email (${data.user.email})`);
    const [{ data: tm }, { data: owned }, { data: ms }, { data: att }] = await Promise.all([
        s.from('tenant_members').select('id').eq('user_id', id),
        s.from('tenants').select('id').eq('owner_user_id', id),
        s.from('memberships').select('id').eq('user_id', id),
        s.from('attendance').select('id').eq('user_id', id).limit(1),
    ]);
    if (tm?.length) fail(`${email}: has ${tm.length} tenant_members row(s) — refusing`);
    if (owned?.length) fail(`${email}: owns ${owned.length} tenant(s) — refusing`);
    if (ms?.length) fail(`${email}: has ${ms.length} membership(s) — refusing`);
    if (att?.length) fail(`${email}: has attendance records — refusing`);
    return data.user;
}

async function deleteUser(s, user, yes) {
    const u = await assertEmptyUser(s, user);
    console.log(`Verified ${user.email} (${user.id}): created ${u.created_at}, no memberships/tenants/attendance.`);
    if (!yes) { console.log('  dry run — re-run with --yes to delete'); return; }
    const { error } = await s.auth.admin.deleteUser(user.id);
    if (error) fail(`delete failed: ${error.message}`);
    console.log(`  OK: deleted auth user ${user.email} (profile row cascades).`);
}

async function clearAowLogo(s, yes) {
    const { data: t, error } = await s.from('tenants').select('id, slug, logo_url').eq('id', AOW_TENANT_ID).maybeSingle();
    if (error || !t) fail(`tenant ${AOW_TENANT_ID} not found`);
    if (t.logo_url !== AOW_DEAD_LOGO) fail(`logo_url is not the deleted object any more (${t.logo_url}) — nothing to do`);
    const { data: objs } = await s.storage.from('tenant-assets').list(`tenants/${AOW_TENANT_ID}`, { limit: 20 });
    if ((objs || []).some(o => o.name === 'logo.png')) fail('logo.png exists in storage again — leaving logo_url alone');
    const res = await fetch(AOW_DEAD_LOGO);
    console.log(`Verified ${t.slug}: logo_url points at a missing object (HTTP ${res.status}).`);
    if (!yes) { console.log('  dry run — re-run with --yes to clear logo_url'); return; }
    const { error: upErr } = await s.from('tenants').update({ logo_url: null }).eq('id', AOW_TENANT_ID).eq('logo_url', AOW_DEAD_LOGO);
    if (upErr) fail(`update failed: ${upErr.message}`);
    console.log('  OK: logo_url cleared. Ask the club to re-upload their logo in Admin → Settings.');
}

async function main() {
    loadEnvLocal();
    const args = new Set(process.argv.slice(2));
    const yes = args.has('--yes');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) fail('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (.env.local)');
    const s = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    let ran = false;
    if (args.has('--delete-squat-user')) { ran = true; await deleteUser(s, SQUAT_USER, yes); }
    if (args.has('--clear-aow-logo')) { ran = true; await clearAowLogo(s, yes); }
    if (args.has('--delete-researcher-accounts')) {
        ran = true;
        for (const u of RESEARCHER_USERS) await deleteUser(s, u, yes);
    }
    if (!ran) {
        console.log('Nothing selected. Flags: --delete-squat-user | --clear-aow-logo | --delete-researcher-accounts, plus --yes to apply.');
    }
}

main().catch(err => {
    console.error(`\nERROR: ${err?.message || err}`);
    process.exitCode = 1;
});
