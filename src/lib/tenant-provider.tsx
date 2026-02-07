'use client';

// ===============================================
// ClubForge - Tenant Provider (Client-side)
// Provides tenant context to client components
// ===============================================

import React, { createContext, useContext, useMemo } from 'react';

export interface TenantInfo {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    primary_color: string;
    subscription_tier: 'free' | 'pro' | 'enterprise';
}

interface TenantContextValue {
    tenant: TenantInfo | null;
    tenantId: string | null;
}

const TenantContext = createContext<TenantContextValue>({
    tenant: null,
    tenantId: null,
});

export function TenantProvider({
    tenant,
    children,
}: {
    tenant: TenantInfo | null;
    children: React.ReactNode;
}) {
    const value = useMemo(
        () => ({
            tenant,
            tenantId: tenant?.id || null,
        }),
        [tenant]
    );

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant(): TenantContextValue {
    return useContext(TenantContext);
}

export function useRequireTenant(): TenantInfo {
    const { tenant } = useContext(TenantContext);
    if (!tenant) {
        throw new Error('useTenant must be used within a TenantProvider with a valid tenant');
    }
    return tenant;
}
