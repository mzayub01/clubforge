#!/usr/bin/env node
// ===============================================
// ClubForge - Reset a club's welcome-email wording
//
// Existing tenants were seeded with martial-arts welcome copy ("clean Gi",
// "See you on the mats") regardless of club type. This rewrites one tenant's
// `welcome` email template to the neutral or martial-arts default (same copy
// as src/lib/welcome-email-copy.ts) and keeps everything else (button,
// signature, subject) consistent with onboarding defaults.
//
//   node scripts/set-welcome-template.mjs --tenant <slug> [--style fitness|martial-arts] [--yes]
//
// Without --style the style is derived from the tenant's settings.club_type.
// Without --yes it only prints the current and proposed wording.
// ===============================================

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MARTIAL_ARTS_CLUB_TYPES = ['bjj', 'mma', 'karate', 'taekwondo', 'judo', 'boxing', 'wrestling', 'muay_thai'];

function welcomeCopy(clubName, style) {
    if (style === 'martial-arts') {
        return {
            body_intro: `We're thrilled to welcome you to our martial arts family! Your registration at **{{locationName}}** has been successfully completed.`,
            body_action: 'Before your first class, please remember to:\n✅ Bring a clean Gi (uniform)\n✅ Trim your finger and toe nails\n✅ Arrive 10 minutes early\n✅ Bring water and a positive attitude!',
            body_closing: "If you have any questions, please don't hesitate to reach out to us. See you on the mats!",
        };
    }
    return {
        body_intro: `We're thrilled to welcome you to ${clubName}! Your registration at **{{locationName}}** has been successfully completed.`,
        body_action: 'Before your first session, please remember to:\n✅ Wear comfortable training clothes\n✅ Arrive 10 minutes early\n✅ Bring water and a positive attitude!',
        body_closing: "If you have any questions, please don't hesitate to reach out to us. See you soon!",
    };
}

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
    const args = { yes: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--yes') args.yes = true;
        else if (a === '--tenant') args.tenant = argv[++i];
        else if (a === '--style') args.style = argv[++i];
        else throw new Error(`Unknown argument: ${a}`);
    }
    if (!args.tenant) throw new Error('--tenant <slug> is required');
    if (args.style && !['fitness', 'martial-arts'].includes(args.style)) throw new Error('--style must be fitness or martial-arts');
    return args;
}

async function main() {
    loadEnvLocal();
    const args = parseArgs(process.argv.slice(2));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (.env.local)');
    const s = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: tenant, error } = await s.from('tenants').select('id, name, slug, settings').eq('slug', args.tenant).maybeSingle();
    if (error || !tenant) throw new Error(`Tenant "${args.tenant}" not found`);

    const clubType = tenant.settings?.club_type ?? null;
    const style = args.style || (MARTIAL_ARTS_CLUB_TYPES.includes(clubType) ? 'martial-arts' : 'fitness');
    const copy = welcomeCopy(tenant.name, style);
    const clubUrl = `https://${tenant.slug}.clubforgehq.com`;

    const { data: existing } = await s.from('email_templates').select('*').eq('tenant_id', tenant.id).eq('template_key', 'welcome').maybeSingle();

    console.log(`Tenant: ${tenant.name} (${tenant.slug}) — club_type: ${clubType || 'unknown'} → style: ${style}`);
    if (existing) {
        console.log('\nCurrent wording:');
        console.log('  intro:   ' + existing.body_intro);
        console.log('  action:  ' + existing.body_action?.replace(/\n/g, ' | '));
        console.log('  closing: ' + existing.body_closing);
    } else {
        console.log('\nNo tenant welcome template yet (the static fallback is used).');
    }
    console.log('\nProposed wording:');
    console.log('  intro:   ' + copy.body_intro);
    console.log('  action:  ' + copy.body_action.replace(/\n/g, ' | '));
    console.log('  closing: ' + copy.body_closing);

    if (!args.yes) {
        console.log('\ndry run — re-run with --yes to apply');
        return;
    }

    if (existing) {
        const { error: upErr } = await s.from('email_templates').update({
            body_intro: copy.body_intro,
            body_action: copy.body_action,
            body_closing: copy.body_closing,
            is_active: true,
        }).eq('id', existing.id);
        if (upErr) throw new Error(`update failed: ${upErr.message}`);
        console.log('\nOK: welcome template updated.');
    } else {
        const { error: insErr } = await s.from('email_templates').insert({
            tenant_id: tenant.id,
            template_key: 'welcome',
            name: 'Welcome Email',
            description: 'Sent to new members after registration',
            subject: `Welcome to ${tenant.name}, {{firstName}}!`,
            greeting: 'Hi {{firstName}},',
            body_intro: copy.body_intro,
            body_details: '📍 **Location:** {{locationName}}\n🏷️ **Membership:** {{membershipType}}',
            body_action: copy.body_action,
            body_closing: copy.body_closing,
            signature: `The ${tenant.name} Team`,
            button_text: 'Go to Dashboard',
            button_url: `${clubUrl}/dashboard`,
            is_active: true,
        });
        if (insErr) throw new Error(`insert failed: ${insErr.message}`);
        console.log('\nOK: welcome template created.');
    }
}

main().catch(err => {
    console.error(`\nERROR: ${err?.message || err}`);
    process.exitCode = 1;
});
