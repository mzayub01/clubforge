#!/usr/bin/env node
// ===============================================
// ClubForge - Seed a missing email template for existing clubs
//
//   node scripts/seed-email-template.mjs --key payment_incomplete [--tenant <slug> | --all] [--yes]
//
// Inserts the built-in default for `--key` into email_templates for every
// active tenant (or one) that doesn't already have that key. Existing rows are
// never touched. Dry run unless --yes.
//
// Why: onboarding seeds welcome / event_confirmation / membership_activated /
// payment_failed / announcement_notification, but `payment_incomplete` (admin
// payment reminders) was never seeded anywhere, so the reminder failed with
// "Email template not found". The route now has a built-in fallback; seeding
// simply lets Pro/Elite clubs customise the wording.
// ===============================================

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULTS = {
    payment_incomplete: (clubName, clubUrl) => ({
        name: 'Payment Reminder',
        description: 'Sent by an admin to remind a member to complete their membership payment',
        subject: `Complete your ${clubName} membership payment`,
        greeting: 'Hi {{firstName}},',
        body_intro: `Your ${clubName} account is set up, but the membership payment hasn't been completed yet. Once it's done you'll be able to check in to classes straight away.`,
        body_details: '📍 **Location:** {{locationName}}\n🏷️ **Membership:** {{membershipType}}\n⏳ **Status:** Payment pending',
        body_action: 'Use the button below to complete your payment securely online.',
        body_closing: 'If you have already paid, or you think this was sent in error, just reply to this email and we will sort it out.',
        signature: `The ${clubName} Team`,
        button_text: 'Complete Payment',
        button_url: `${clubUrl}/dashboard/membership`,
        is_active: true,
    }),
};

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

function parseArgs(argv) {
    const args = { yes: false, all: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--yes') args.yes = true;
        else if (a === '--all') args.all = true;
        else if (a === '--key') args.key = argv[++i];
        else if (a === '--tenant') args.tenant = argv[++i];
        else throw new Error(`Unknown argument: ${a}`);
    }
    if (!args.key || !DEFAULTS[args.key]) throw new Error(`--key must be one of: ${Object.keys(DEFAULTS).join(', ')}`);
    if (!args.all && !args.tenant) throw new Error('Pass --tenant <slug> or --all');
    return args;
}

async function main() {
    loadEnvLocal();
    const args = parseArgs(process.argv.slice(2));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (.env.local)');
    const s = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    let q = s.from('tenants').select('id, name, slug, custom_domain').eq('is_active', true).order('slug');
    if (args.tenant) q = q.eq('slug', args.tenant);
    const { data: tenants, error } = await q;
    if (error) throw new Error(error.message);
    if (!tenants?.length) throw new Error('No matching active tenants');

    const { data: existing } = await s.from('email_templates').select('tenant_id').eq('template_key', args.key);
    const has = new Set((existing || []).map(r => r.tenant_id));

    const todo = tenants.filter(t => !has.has(t.id));
    console.log(`${tenants.length} tenant(s) checked · ${tenants.length - todo.length} already have "${args.key}" · ${todo.length} missing`);
    for (const t of todo) console.log('  + ' + t.slug.padEnd(28) + t.name);
    if (todo.length === 0) return;
    if (!args.yes) { console.log('\ndry run — re-run with --yes to insert'); return; }

    const rows = todo.map(t => ({
        tenant_id: t.id,
        template_key: args.key,
        ...DEFAULTS[args.key](t.name, `https://${t.custom_domain || `${t.slug}.clubforgehq.com`}`),
    }));
    const { error: insErr } = await s.from('email_templates').insert(rows);
    if (insErr) throw new Error(`insert failed: ${insErr.message}`);
    console.log(`\nOK: inserted "${args.key}" for ${rows.length} tenant(s).`);
}

main().catch(err => {
    console.error(`\nERROR: ${err?.message || err}`);
    process.exitCode = 1;
});
