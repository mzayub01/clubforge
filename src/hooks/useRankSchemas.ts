'use client';

// ===============================================
// ClubForge - useRankSchemas Hook
// Fetches rank schemas for the current tenant and provides
// both dynamic and legacy-fallback belt data
// ===============================================

import { useState, useEffect, useCallback } from 'react';

export interface RankLevel {
    id: string;
    name: string;
    color_hex: string;
    bar_color_hex: string;
    sort_order: number;
}

export interface RankSchema {
    id: string;
    name: string;
    has_stripes: boolean;
    max_stripes: number;
    is_default: boolean;
    sort_order: number;
    rank_levels: RankLevel[];
}

// -----------------------------------------------
// Legacy fallback data (used when no schemas configured)
// -----------------------------------------------

const LEGACY_ADULT_LEVELS: RankLevel[] = [
    { id: 'legacy-white', name: 'White', color_hex: '#F5F5F5', bar_color_hex: '#1A1A1A', sort_order: 1 },
    { id: 'legacy-blue', name: 'Blue', color_hex: '#1E40AF', bar_color_hex: '#1A1A1A', sort_order: 2 },
    { id: 'legacy-purple', name: 'Purple', color_hex: '#6B21A8', bar_color_hex: '#1A1A1A', sort_order: 3 },
    { id: 'legacy-brown', name: 'Brown', color_hex: '#78350F', bar_color_hex: '#1A1A1A', sort_order: 4 },
    { id: 'legacy-black', name: 'Black', color_hex: '#1A1A1A', bar_color_hex: '#DC2626', sort_order: 5 },
];

const LEGACY_KIDS_LEVELS: RankLevel[] = [
    { id: 'legacy-white', name: 'White', color_hex: '#F5F5F5', bar_color_hex: '#1A1A1A', sort_order: 1 },
    { id: 'legacy-grey-white', name: 'Grey/White', color_hex: '#9CA3AF', bar_color_hex: '#1A1A1A', sort_order: 2 },
    { id: 'legacy-grey', name: 'Grey', color_hex: '#6B7280', bar_color_hex: '#1A1A1A', sort_order: 3 },
    { id: 'legacy-grey-black', name: 'Grey/Black', color_hex: '#4B5563', bar_color_hex: '#1A1A1A', sort_order: 4 },
    { id: 'legacy-yellow-white', name: 'Yellow/White', color_hex: '#FDE047', bar_color_hex: '#1A1A1A', sort_order: 5 },
    { id: 'legacy-yellow', name: 'Yellow', color_hex: '#EAB308', bar_color_hex: '#1A1A1A', sort_order: 6 },
    { id: 'legacy-yellow-black', name: 'Yellow/Black', color_hex: '#A16207', bar_color_hex: '#1A1A1A', sort_order: 7 },
    { id: 'legacy-orange-white', name: 'Orange/White', color_hex: '#FB923C', bar_color_hex: '#1A1A1A', sort_order: 8 },
    { id: 'legacy-orange', name: 'Orange', color_hex: '#EA580C', bar_color_hex: '#1A1A1A', sort_order: 9 },
    { id: 'legacy-orange-black', name: 'Orange/Black', color_hex: '#C2410C', bar_color_hex: '#1A1A1A', sort_order: 10 },
    { id: 'legacy-green-white', name: 'Green/White', color_hex: '#4ADE80', bar_color_hex: '#1A1A1A', sort_order: 11 },
    { id: 'legacy-green', name: 'Green', color_hex: '#16A34A', bar_color_hex: '#1A1A1A', sort_order: 12 },
    { id: 'legacy-green-black', name: 'Green/Black', color_hex: '#15803D', bar_color_hex: '#1A1A1A', sort_order: 13 },
];

const LEGACY_ADULT_SCHEMA: RankSchema = {
    id: 'legacy-adult',
    name: 'BJJ Adult',
    has_stripes: true,
    max_stripes: 4,
    is_default: true,
    sort_order: 0,
    rank_levels: LEGACY_ADULT_LEVELS,
};

const LEGACY_KIDS_SCHEMA: RankSchema = {
    id: 'legacy-kids',
    name: 'BJJ Kids',
    has_stripes: true,
    max_stripes: 12,
    is_default: false,
    sort_order: 1,
    rank_levels: LEGACY_KIDS_LEVELS,
};

// -----------------------------------------------
// Hook
// -----------------------------------------------

export function useRankSchemas() {
    const [schemas, setSchemas] = useState<RankSchema[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchemas = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/rank-schemas?include_levels=true');
            if (!res.ok) throw new Error('Failed to fetch rank schemas');
            const data = await res.json();
            setSchemas(data.schemas || []);
        } catch (err) {
            console.error('useRankSchemas error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load');
            // Fall back to legacy schemas on error
            setSchemas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchemas();
    }, [fetchSchemas]);

    // Select the right schema based on whether the member is a child
    const getSchemaForMember = useCallback((isChild: boolean): RankSchema => {
        if (schemas.length === 0) {
            // No dynamic schemas configured — use legacy BJJ
            return isChild ? LEGACY_KIDS_SCHEMA : LEGACY_ADULT_SCHEMA;
        }
        if (isChild) {
            // Find a kids schema, or fall back to the first non-default
            const kidsSchema = schemas.find(s => s.name.toLowerCase().includes('kids'));
            return kidsSchema || schemas[0];
        }
        // Find the default schema, or fall back to the first one
        const defaultSchema = schemas.find(s => s.is_default);
        return defaultSchema || schemas[0];
    }, [schemas]);

    // Convert a legacy belt name (e.g. "white", "blue") to a RankLevel
    const findLevelByLegacyName = useCallback((beltName: string, isChild: boolean): RankLevel | null => {
        const schema = getSchemaForMember(isChild);
        // Try to match by name (case-insensitive, handling hyphen/slash differences)
        const normalised = beltName.toLowerCase().replace(/-/g, '/');
        return schema.rank_levels.find(l =>
            l.name.toLowerCase() === normalised ||
            l.name.toLowerCase().replace(/\//g, '-') === beltName.toLowerCase()
        ) || null;
    }, [getSchemaForMember]);

    return {
        schemas,
        loading,
        error,
        getSchemaForMember,
        findLevelByLegacyName,
        refetch: fetchSchemas,
        hasCustomSchemas: schemas.length > 0,
    };
}

// -----------------------------------------------
// Utility: get color for a belt name (used by multiple components)
// Falls back to legacy color map if no match found
// -----------------------------------------------

const LEGACY_COLOR_MAP: Record<string, { main: string; bar: string }> = {
    white: { main: '#F5F5F5', bar: '#1A1A1A' },
    blue: { main: '#1E40AF', bar: '#1A1A1A' },
    purple: { main: '#6B21A8', bar: '#1A1A1A' },
    brown: { main: '#78350F', bar: '#1A1A1A' },
    black: { main: '#1A1A1A', bar: '#DC2626' },
    grey: { main: '#6B7280', bar: '#1A1A1A' },
    'grey-white': { main: '#9CA3AF', bar: '#1A1A1A' },
    'grey-black': { main: '#4B5563', bar: '#1A1A1A' },
    yellow: { main: '#EAB308', bar: '#1A1A1A' },
    'yellow-white': { main: '#FDE047', bar: '#1A1A1A' },
    'yellow-black': { main: '#A16207', bar: '#1A1A1A' },
    orange: { main: '#EA580C', bar: '#1A1A1A' },
    'orange-white': { main: '#FB923C', bar: '#1A1A1A' },
    'orange-black': { main: '#C2410C', bar: '#1A1A1A' },
    green: { main: '#16A34A', bar: '#1A1A1A' },
    'green-white': { main: '#4ADE80', bar: '#1A1A1A' },
    'green-black': { main: '#15803D', bar: '#1A1A1A' },
};

export function getBeltColors(beltName: string, levels?: RankLevel[]): { main: string; bar: string } {
    // Try to find in dynamic levels first
    if (levels) {
        const normalised = beltName.toLowerCase().replace(/-/g, '/');
        const level = levels.find(l =>
            l.name.toLowerCase() === normalised ||
            l.name.toLowerCase().replace(/\//g, '-') === beltName.toLowerCase()
        );
        if (level) {
            return { main: level.color_hex, bar: level.bar_color_hex };
        }
    }
    // Fall back to legacy
    return LEGACY_COLOR_MAP[beltName] || LEGACY_COLOR_MAP.white;
}
