'use client';

// ===============================================
// ClubForge - Dynamic Theme Provider
// Injects tenant brand colors as CSS custom properties
// ===============================================

import { createContext, useContext, useEffect, useMemo } from 'react';

interface ThemeConfig {
    primaryColor: string;
    logoUrl?: string;
    clubName: string;
    tagline?: string;
}

const ThemeContext = createContext<ThemeConfig>({
    primaryColor: '#c5a456',
    clubName: 'ClubForge',
});

export function useTheme() {
    return useContext(ThemeContext);
}

/**
 * Convert hex color to HSL components
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 43, s: 56, l: 55 }; // fallback gold

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

interface ThemeProviderProps {
    children: React.ReactNode;
    primaryColor?: string;
    logoUrl?: string;
    clubName?: string;
    tagline?: string;
}

export function ThemeProvider({
    children,
    primaryColor = '#c5a456',
    logoUrl,
    clubName = 'ClubForge',
    tagline,
}: ThemeProviderProps) {
    const hsl = useMemo(() => hexToHSL(primaryColor), [primaryColor]);

    // Inject CSS custom properties
    useEffect(() => {
        const root = document.documentElement;

        // ── Tenant-specific variables ──
        root.style.setProperty('--tenant-color', primaryColor);
        root.style.setProperty('--tenant-color-h', String(hsl.h));
        root.style.setProperty('--tenant-color-s', `${hsl.s}%`);
        root.style.setProperty('--tenant-color-l', `${hsl.l}%`);
        // Light variant (higher lightness)
        const lightColor = `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 15, 90)}%)`;
        root.style.setProperty('--tenant-color-light', lightColor);
        // Dark variant (lower lightness)
        const darkColor = `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 15, 10)}%)`;
        root.style.setProperty('--tenant-color-dark', darkColor);
        // Transparent variant for backgrounds
        root.style.setProperty('--tenant-color-alpha', `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.1)`);
        // Gradient
        const gradient = `linear-gradient(135deg, hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 10, 85)}%) 0%, hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%) 50%, hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 10, 20)}%) 100%)`;
        root.style.setProperty('--tenant-color-gradient', gradient);

        // ── Override the design-system gold tokens ──
        // This makes ALL existing CSS that uses var(--color-gold) etc.
        // automatically pick up the tenant's brand colour.
        root.style.setProperty('--color-gold', primaryColor);
        root.style.setProperty('--color-gold-light', lightColor);
        root.style.setProperty('--color-gold-dark', darkColor);
        root.style.setProperty('--color-gold-gradient', gradient);
        root.style.setProperty('--shadow-gold', `0 4px 20px hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.3)`);

        return () => {
            // Cleanup tenant vars
            root.style.removeProperty('--tenant-color');
            root.style.removeProperty('--tenant-color-h');
            root.style.removeProperty('--tenant-color-s');
            root.style.removeProperty('--tenant-color-l');
            root.style.removeProperty('--tenant-color-light');
            root.style.removeProperty('--tenant-color-dark');
            root.style.removeProperty('--tenant-color-alpha');
            root.style.removeProperty('--tenant-color-gradient');
            // Cleanup gold overrides (reverts to :root defaults)
            root.style.removeProperty('--color-gold');
            root.style.removeProperty('--color-gold-light');
            root.style.removeProperty('--color-gold-dark');
            root.style.removeProperty('--color-gold-gradient');
            root.style.removeProperty('--shadow-gold');
        };
    }, [primaryColor, hsl]);

    const value = useMemo(
        () => ({ primaryColor, logoUrl, clubName, tagline }),
        [primaryColor, logoUrl, clubName, tagline]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
