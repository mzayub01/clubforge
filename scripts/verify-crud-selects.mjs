#!/usr/bin/env node
// ===============================================
// ClubForge - Verify every /api/admin/crud select string against the live DB
//
// The CRUD route validates select strings structurally (src/lib/select-sanitiser.ts)
// and passes them straight to PostgREST, so a column or relationship that doesn't
// exist in production fails at runtime for the page that uses it ("Failed to load
// classes" on the class roster, 2026-09-21: `classes.membership_type_id`). This
// script extracts every `adminFetch('<table>', { select: '<cols>' })` call (and the
// data-export config's `table`/`select` pairs) from src/ and runs each with
// `.limit(1)` using the service key. Run after touching any admin page's select:
//
//   node scripts/verify-crud-selects.mjs
//
// Exit code 1 if any select fails. Read-only.
// ===============================================
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
    fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)
        .filter(l => l && !l.startsWith('#') && l.includes('='))
        .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p, out);
        else if (/\.tsx?$/.test(entry.name)) out.push(p);
    }
    return out;
}

// adminFetch<T>('table', { ..., select: '...' }) — select may sit a few lines into the options object
const CALL_RE = /adminFetch(?:One)?(?:<[^>]*>)?\(\s*['"`](\w+)['"`]\s*,\s*\{([^}]*)\}/gs;
// data-export style config objects:  table: 'x', ... select: '...'
const CONFIG_RE = /table:\s*['"`](\w+)['"`][^}]*?select:\s*['"`]([^'"`]+)['"`]/gs;
const SELECT_RE = /select:\s*['"`]([^'"`]+)['"`]/;

const found = new Map(); // "table|select" -> Set(files)
const add = (table, select, file) => {
    const key = `${table}|${select}`;
    if (!found.has(key)) found.set(key, new Set());
    found.get(key).add(file);
};

for (const file of walk(path.join(root, 'src'))) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(root, file).split(path.sep).join('/');
    for (const m of text.matchAll(CALL_RE)) {
        const sel = m[2].match(SELECT_RE);
        if (sel) add(m[1], sel[1], rel);
    }
    for (const m of text.matchAll(CONFIG_RE)) add(m[1], m[2], rel);
}

let failures = 0;
for (const [key, files] of [...found.entries()].sort()) {
    const [table, select] = key.split('|');
    const { error } = await sb.from(table).select(select).limit(1);
    if (error) failures++;
    const shown = select.length > 80 ? select.slice(0, 77) + '...' : select;
    console.log(`${error ? 'FAIL' : 'ok  '} ${table.padEnd(26)} ${shown}`);
    if (error) console.log(`       -> ${error.message}\n       used by: ${[...files].join(', ')}`);
}
console.log(`\n${found.size} distinct select strings checked, ${failures} failing.`);
process.exit(failures ? 1 : 0);
