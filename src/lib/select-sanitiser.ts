// ===============================================
// ClubForge - PostgREST select-string validator for the admin CRUD route
//
// The CRUD route lets admin pages ask for joined data ("embeds") such as
// `*, location:locations(name), class_membership_types(membership_type_id)`.
// Embeds are validated STRUCTURALLY: every embedded table must be in the
// route's allowlist and never a blocked table, columns must be plain
// identifiers or `*`, and nesting is limited. Anything else falls back to `*`.
//
// History: the previous implementation compared against four exact strings
// and silently fell back to `*` for everything else — the Classes page lost its
// tier links (admins saw empty checkboxes and re-saving wiped the links), the
// Members page lost location/plan names, etc.
// ===============================================

/** Tables that must never be reachable through an embed (cross-tenant / platform data). */
export const EMBED_BLOCKED_TABLES: readonly string[] = ['tenants', 'platform_admins'];

const COLUMN_RE = /^[A-Za-z_*][\w*]*$/;
const EMBED_HEAD_RE = /^(?:[A-Za-z_]\w*:)?([A-Za-z_]\w*)(?:!inner|!left)?$/;

/** Split on commas that are not inside parentheses. Returns null if parens are unbalanced. */
function splitTopLevel(list: string): string[] | null {
    const parts: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of list) {
        if (ch === '(') depth++;
        else if (ch === ')') { depth--; if (depth < 0) return null; }
        if (ch === ',' && depth === 0) { parts.push(current); current = ''; continue; }
        current += ch;
    }
    if (depth !== 0) return null;
    parts.push(current);
    return parts;
}

function validateList(list: string, allowedTables: readonly string[], depth: number, maxDepth: number): boolean {
    const parts = splitTopLevel(list);
    if (!parts) return false;
    for (const raw of parts) {
        const part = raw.trim();
        if (!part) continue;
        const open = part.indexOf('(');
        if (open === -1) {
            if (!COLUMN_RE.test(part)) return false;
            continue;
        }
        if (!part.endsWith(')')) return false;
        const head = part.slice(0, open).trim();
        const inner = part.slice(open + 1, -1);
        const m = head.match(EMBED_HEAD_RE);
        if (!m) return false;
        const table = m[1];
        if (EMBED_BLOCKED_TABLES.includes(table) || !allowedTables.includes(table)) return false;
        if (depth >= maxDepth) return false;
        if (!validateList(inner, allowedTables, depth + 1, maxDepth)) return false;
    }
    return true;
}

/**
 * Returns the select string unchanged when every column and embed is valid,
 * otherwise `*` (never throws — the route keeps working with a plain select).
 */
export function sanitiseSelect(
    select: string | undefined,
    allowedTables: readonly string[],
    maxDepth = 3,
): string {
    if (!select) return '*';
    const trimmed = select.trim();
    if (!trimmed) return '*';
    return validateList(trimmed, allowedTables, 1, maxDepth) ? trimmed : '*';
}
