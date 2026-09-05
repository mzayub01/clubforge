'use client';

import { useEffect, useState, useCallback } from 'react';
import { isChildDummyEmail } from '@/lib/member-contact';

interface GuardianContact {
    childUserId: string;
    childName: string;
    guardianUserId: string | null;
    guardianName: string | null;
    guardianEmail: string | null;
    guardianPhone: string | null;
}

interface GuardianMap {
    byEmail: Record<string, GuardianContact>;
    byChildUserId: Record<string, GuardianContact>;
}

export interface ResolvedContact {
    /** Address to show / mail: guardian's for a child, own otherwise */
    email: string;
    /** Same as email, with " (guardian)" appended when it belongs to the guardian */
    label: string;
    viaGuardian: boolean;
    guardianName: string | null;
    guardianPhone: string | null;
}

// One fetch per page load, shared by every component on the page.
let cache: GuardianMap | null = null;
let inflight: Promise<GuardianMap> | null = null;

async function load(): Promise<GuardianMap> {
    if (cache) return cache;
    if (!inflight) {
        inflight = fetch('/api/staff/guardian-contacts')
            .then(r => (r.ok ? r.json() : { byEmail: {}, byChildUserId: {} }))
            .then((j: GuardianMap) => { cache = j; return j; })
            .catch(() => ({ byEmail: {}, byChildUserId: {} }) as GuardianMap)
            .finally(() => { inflight = null; });
    }
    return inflight;
}

/** Drop the shared cache (e.g. after linking a child to a guardian). */
export function invalidateGuardianContacts() {
    cache = null;
}

/**
 * Resolve a member's displayable contact address. Children have generated
 * dummy emails; this returns the guardian's real address instead.
 *
 *   const { contactFor } = useGuardianContacts();
 *   <span>{contactFor(member.email).label}</span>
 */
export function useGuardianContacts() {
    const [map, setMap] = useState<GuardianMap | null>(cache);

    useEffect(() => {
        let cancelled = false;
        load().then(m => { if (!cancelled) setMap(m); });
        return () => { cancelled = true; };
    }, []);

    const contactFor = useCallback((email?: string | null, childUserId?: string | null): ResolvedContact => {
        const own = email || '';
        const isDummy = isChildDummyEmail(own);
        const entry = (childUserId && map?.byChildUserId[childUserId])
            || (own && map?.byEmail[own.toLowerCase()])
            || null;

        if (entry?.guardianEmail) {
            return {
                email: entry.guardianEmail,
                label: `${entry.guardianEmail} (guardian)`,
                viaGuardian: true,
                guardianName: entry.guardianName,
                guardianPhone: entry.guardianPhone,
            };
        }
        if (isDummy) {
            // Child with no linked guardian: never show the meaningless dummy
            return { email: '', label: map ? 'No guardian email on file' : '…', viaGuardian: false, guardianName: null, guardianPhone: null };
        }
        return { email: own, label: own, viaGuardian: false, guardianName: null, guardianPhone: null };
    }, [map]);

    return { contactFor, loading: map === null };
}
