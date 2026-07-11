'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders modal content into document.body via a portal.
 *
 * Modals rendered inline can end up in-flow at the bottom of long pages when an
 * ancestor's CSS (transform/filter/animation) breaks position: fixed — admins
 * had to scroll to the bottom of the members list to find the edit dialog.
 * Portaling to <body> guarantees the .modal-overlay is viewport-fixed on every
 * device, and body scroll is locked while the modal is open.
 */
export default function ModalPortal({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, []);

    if (typeof document === 'undefined') return null;
    return createPortal(children, document.body);
}
