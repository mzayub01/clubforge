// ===============================================
// ClubForge — Dynamic Class Type Utilities
// Derives class types from tenant rank schemas + generic defaults
// ===============================================

/**
 * Map from rank schema name → class type label.
 * Schemas that share the same martial art (e.g. "BJJ Adult" + "BJJ Kids")
 * collapse into a single class type.
 */
const SCHEMA_TO_CLASS_TYPE: Record<string, { value: string; label: string }> = {
    'bjj adult': { value: 'bjj', label: 'Brazilian Jiu-Jitsu' },
    'bjj kids': { value: 'bjj', label: 'Brazilian Jiu-Jitsu' },
    'karate': { value: 'karate', label: 'Karate' },
    'taekwondo': { value: 'taekwondo', label: 'Taekwondo' },
    'judo': { value: 'judo', label: 'Judo' },
};

/**
 * Generic class types available to every club regardless of schema.
 */
const GENERIC_CLASS_TYPES = [
    { value: 'open-mat', label: 'Open Mat' },
    { value: 'sparring', label: 'Sparring' },
    { value: 'strength', label: 'Strength & Conditioning' },
    { value: 'comp-prep', label: 'Competition Prep' },
    { value: 'private-lesson', label: 'Private Lesson' },
    { value: 'fundamentals', label: 'Fundamentals' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'kids', label: 'Kids Class' },
    { value: 'other', label: 'Other' },
];

export interface ClassTypeOption {
    value: string;
    label: string;
}

/**
 * Build a list of class type options by combining:
 * 1. Types derived from the tenant's active rank schemas
 * 2. Generic class types that apply to any club
 *
 * Duplicate values are deduplicated (e.g. BJJ Adult + BJJ Kids → one "Brazilian Jiu-Jitsu").
 */
export function getClassTypes(schemaNames: string[]): ClassTypeOption[] {
    const seen = new Set<string>();
    const types: ClassTypeOption[] = [];

    // 1. Add schema-derived types first (in order of matched schemas)
    for (const name of schemaNames) {
        const mapping = SCHEMA_TO_CLASS_TYPE[name.toLowerCase()];
        if (mapping && !seen.has(mapping.value)) {
            seen.add(mapping.value);
            types.push(mapping);
        }
    }

    // 2. Append generic types (skip if already present from schemas)
    for (const generic of GENERIC_CLASS_TYPES) {
        if (!seen.has(generic.value)) {
            seen.add(generic.value);
            types.push(generic);
        }
    }

    return types;
}

/**
 * Look up the display label for a stored class_type value.
 * Falls back to capitalising the raw value if not found.
 */
export function getClassTypeLabel(value: string, schemaNames: string[] = []): string {
    const types = getClassTypes(schemaNames);
    const match = types.find(t => t.value === value);
    if (match) return match.label;

    // Legacy fallback — capitalise the raw value
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
}
