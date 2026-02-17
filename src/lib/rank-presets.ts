// ===============================================
// ClubForge - Rank Schema Presets
// Template data for different martial arts belt systems
// ===============================================

export interface RankPresetLevel {
    name: string;
    color_hex: string;
    bar_color_hex: string;
    sort_order: number;
}

export interface RankPreset {
    id: string;
    name: string;
    label: string;
    description: string;
    has_stripes: boolean;
    max_stripes: number;
    levels: RankPresetLevel[];
}

export const RANK_PRESETS: RankPreset[] = [
    {
        id: 'bjj_adult',
        name: 'BJJ Adult',
        label: 'Brazilian Jiu-Jitsu (Adult)',
        description: '5 belts with up to 4 stripes each',
        has_stripes: true,
        max_stripes: 4,
        levels: [
            { name: 'White', color_hex: '#F5F5F5', bar_color_hex: '#1A1A1A', sort_order: 1 },
            { name: 'Blue', color_hex: '#1E40AF', bar_color_hex: '#1A1A1A', sort_order: 2 },
            { name: 'Purple', color_hex: '#6B21A8', bar_color_hex: '#1A1A1A', sort_order: 3 },
            { name: 'Brown', color_hex: '#78350F', bar_color_hex: '#1A1A1A', sort_order: 4 },
            { name: 'Black', color_hex: '#1A1A1A', bar_color_hex: '#DC2626', sort_order: 5 },
        ],
    },
    {
        id: 'bjj_kids',
        name: 'BJJ Kids',
        label: 'Brazilian Jiu-Jitsu (Kids)',
        description: '13 belts with up to 12 stripes',
        has_stripes: true,
        max_stripes: 12,
        levels: [
            { name: 'White', color_hex: '#F5F5F5', bar_color_hex: '#1A1A1A', sort_order: 1 },
            { name: 'Grey/White', color_hex: '#9CA3AF', bar_color_hex: '#1A1A1A', sort_order: 2 },
            { name: 'Grey', color_hex: '#6B7280', bar_color_hex: '#1A1A1A', sort_order: 3 },
            { name: 'Grey/Black', color_hex: '#4B5563', bar_color_hex: '#1A1A1A', sort_order: 4 },
            { name: 'Yellow/White', color_hex: '#FDE047', bar_color_hex: '#1A1A1A', sort_order: 5 },
            { name: 'Yellow', color_hex: '#EAB308', bar_color_hex: '#1A1A1A', sort_order: 6 },
            { name: 'Yellow/Black', color_hex: '#A16207', bar_color_hex: '#1A1A1A', sort_order: 7 },
            { name: 'Orange/White', color_hex: '#FB923C', bar_color_hex: '#1A1A1A', sort_order: 8 },
            { name: 'Orange', color_hex: '#EA580C', bar_color_hex: '#1A1A1A', sort_order: 9 },
            { name: 'Orange/Black', color_hex: '#C2410C', bar_color_hex: '#1A1A1A', sort_order: 10 },
            { name: 'Green/White', color_hex: '#4ADE80', bar_color_hex: '#1A1A1A', sort_order: 11 },
            { name: 'Green', color_hex: '#16A34A', bar_color_hex: '#1A1A1A', sort_order: 12 },
            { name: 'Green/Black', color_hex: '#15803D', bar_color_hex: '#1A1A1A', sort_order: 13 },
        ],
    },
    {
        id: 'karate',
        name: 'Karate',
        label: 'Karate',
        description: '10 belts, no stripes',
        has_stripes: false,
        max_stripes: 0,
        levels: [
            { name: 'White', color_hex: '#F5F5F5', bar_color_hex: '#1A1A1A', sort_order: 1 },
            { name: 'Yellow', color_hex: '#EAB308', bar_color_hex: '#1A1A1A', sort_order: 2 },
            { name: 'Orange', color_hex: '#EA580C', bar_color_hex: '#1A1A1A', sort_order: 3 },
            { name: 'Green', color_hex: '#16A34A', bar_color_hex: '#1A1A1A', sort_order: 4 },
            { name: 'Blue', color_hex: '#1E40AF', bar_color_hex: '#1A1A1A', sort_order: 5 },
            { name: 'Purple', color_hex: '#6B21A8', bar_color_hex: '#1A1A1A', sort_order: 6 },
            { name: 'Brown', color_hex: '#78350F', bar_color_hex: '#1A1A1A', sort_order: 7 },
            { name: 'Black 1st Dan', color_hex: '#1A1A1A', bar_color_hex: '#DC2626', sort_order: 8 },
            { name: 'Black 2nd Dan', color_hex: '#1A1A1A', bar_color_hex: '#DC2626', sort_order: 9 },
            { name: 'Black 3rd Dan', color_hex: '#1A1A1A', bar_color_hex: '#DC2626', sort_order: 10 },
        ],
    },
    {
        id: 'taekwondo',
        name: 'Taekwondo',
        label: 'Taekwondo',
        description: '10 belt levels, no stripes',
        has_stripes: false,
        max_stripes: 0,
        levels: [
            { name: 'White', color_hex: '#F5F5F5', bar_color_hex: '#1A1A1A', sort_order: 1 },
            { name: 'Yellow', color_hex: '#EAB308', bar_color_hex: '#1A1A1A', sort_order: 2 },
            { name: 'Yellow/Green', color_hex: '#84CC16', bar_color_hex: '#1A1A1A', sort_order: 3 },
            { name: 'Green', color_hex: '#16A34A', bar_color_hex: '#1A1A1A', sort_order: 4 },
            { name: 'Green/Blue', color_hex: '#0EA5E9', bar_color_hex: '#1A1A1A', sort_order: 5 },
            { name: 'Blue', color_hex: '#1E40AF', bar_color_hex: '#1A1A1A', sort_order: 6 },
            { name: 'Blue/Red', color_hex: '#7C3AED', bar_color_hex: '#1A1A1A', sort_order: 7 },
            { name: 'Red', color_hex: '#DC2626', bar_color_hex: '#1A1A1A', sort_order: 8 },
            { name: 'Red/Black', color_hex: '#991B1B', bar_color_hex: '#1A1A1A', sort_order: 9 },
            { name: 'Black', color_hex: '#1A1A1A', bar_color_hex: '#DC2626', sort_order: 10 },
        ],
    },
    {
        id: 'judo',
        name: 'Judo',
        label: 'Judo',
        description: '7 belts, no stripes',
        has_stripes: false,
        max_stripes: 0,
        levels: [
            { name: 'White', color_hex: '#F5F5F5', bar_color_hex: '#1A1A1A', sort_order: 1 },
            { name: 'Yellow', color_hex: '#EAB308', bar_color_hex: '#1A1A1A', sort_order: 2 },
            { name: 'Orange', color_hex: '#EA580C', bar_color_hex: '#1A1A1A', sort_order: 3 },
            { name: 'Green', color_hex: '#16A34A', bar_color_hex: '#1A1A1A', sort_order: 4 },
            { name: 'Blue', color_hex: '#1E40AF', bar_color_hex: '#1A1A1A', sort_order: 5 },
            { name: 'Brown', color_hex: '#78350F', bar_color_hex: '#1A1A1A', sort_order: 6 },
            { name: 'Black', color_hex: '#1A1A1A', bar_color_hex: '#DC2626', sort_order: 7 },
        ],
    },
];

/**
 * Get a preset by ID
 */
export function getRankPreset(presetId: string): RankPreset | undefined {
    return RANK_PRESETS.find(p => p.id === presetId);
}
