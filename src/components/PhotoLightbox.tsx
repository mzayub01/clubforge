'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import ModalPortal from './admin/ModalPortal';

interface PhotoLightboxProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

/**
 * Full-size view of a profile photo (profile thumbnails are tiny). Click the
 * backdrop, the close button or press Escape to dismiss.
 */
export default function PhotoLightbox({ src, alt = '', onClose }: PhotoLightboxProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <ModalPortal>
            <div
                onClick={onClose}
                role="dialog"
                aria-label={alt ? `Photo of ${alt}` : 'Photo'}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    background: 'rgba(0, 0, 0, 0.88)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    cursor: 'zoom-out',
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(255,255,255,0.12)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <X size={20} />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    onClick={e => e.stopPropagation()}
                    style={{
                        maxWidth: 'min(92vw, 900px)',
                        maxHeight: '85vh',
                        objectFit: 'contain',
                        borderRadius: 12,
                        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                        cursor: 'default',
                        background: '#111',
                    }}
                />
                {alt && (
                    <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 14, opacity: 0.85 }}>
                        {alt}
                    </div>
                )}
            </div>
        </ModalPortal>
    );
}
