#!/usr/bin/env node
// ===============================================
// ClubForge - Password recovery link check
//
// Proves the mechanism behind /auth/confirm against the real Supabase project
// without touching club data or sending email:
//   1. create a throwaway auth user (random @clubforge-test.invalid address)
//   2. auth.admin.generateLink({ type: 'recovery' }) → hashed_token
//   3. anon client verifyOtp({ type: 'recovery', token_hash }) → session
//   4. updateUser({ password }) with that session
//   5. the same token_hash is rejected a second time
//   6. generateLink for an unknown email reports "not found"
//   7. delete the throwaway user
//
// Usage: node scripts/test-password-reset-link.mjs
// Reads NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
// SUPABASE_SERVICE_ROLE_KEY from .env.local.
// ===============================================

import { readFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

if (existsSync('.env.local')) {
    for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const anon = () => createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });

let failures = 0;
const check = (ok, label, detail = '') => {
    console.log(`${ok ? '  ✓' : '  ✗'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
};

const email = `reset-check-${randomBytes(4).toString('hex')}@clubforge-test.invalid`;
let userId = null;

try {
    console.log(`\nThrowaway user: ${email}`);
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: `Tmp-${randomBytes(8).toString('hex')}!`,
        email_confirm: true,
        user_metadata: { clubforge_test: 'password-reset-link' },
    });
    if (createErr) throw new Error(`createUser: ${createErr.message}`);
    userId = created.user.id;

    // 2. generateLink → hashed_token
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: 'recovery', email });
    check(!linkErr && !!link?.properties?.hashed_token, 'generateLink(recovery) returns hashed_token', linkErr?.message);
    const tokenHash = link?.properties?.hashed_token;
    check(/#access_token=|[?&]token=/.test(link?.properties?.action_link || ''), 'action_link is a Supabase /verify URL (not used by us)', link?.properties?.action_link?.slice(0, 60) + '…');

    // 3. verifyOtp with the token hash → session (this is what /auth/confirm does)
    const client = anon();
    const { data: verified, error: verifyErr } = await client.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
    check(!verifyErr && !!verified?.session?.access_token, 'verifyOtp(token_hash) establishes a session', verifyErr?.message);
    check(verified?.user?.id === userId, 'session belongs to the right user');

    // 4. the session can set a new password (what /reset-password does)
    const newPassword = `New-${randomBytes(8).toString('hex')}!`;
    const { error: updErr } = await client.auth.updateUser({ password: newPassword });
    check(!updErr, 'updateUser({ password }) succeeds with the recovery session', updErr?.message);

    const { data: signin, error: signinErr } = await anon().auth.signInWithPassword({ email, password: newPassword });
    check(!signinErr && !!signin?.session, 'sign-in works with the new password', signinErr?.message);

    // 5. replay is rejected
    const { error: replayErr } = await anon().auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
    check(!!replayErr, 'the same token_hash is rejected when used again', replayErr?.message);

    // 6. unknown email → not found (route stays silent for this)
    const { error: unknownErr } = await admin.auth.admin.generateLink({ type: 'recovery', email: `nobody-${randomBytes(4).toString('hex')}@clubforge-test.invalid` });
    check(!!unknownErr && (unknownErr.status === 404 || /not.?found/i.test(unknownErr.message)), 'generateLink for an unknown email reports not found', `${unknownErr?.status} ${unknownErr?.message}`);
} catch (err) {
    console.error('\nUnexpected error:', err instanceof Error ? err.message : err);
    failures++;
} finally {
    if (userId) {
        const { error: delErr } = await admin.auth.admin.deleteUser(userId);
        check(!delErr, 'throwaway user deleted', delErr?.message);
    }
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
