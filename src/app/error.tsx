'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[GlobalError]', error);
    }, [error]);

    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            textAlign: 'center',
        }}>
            <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, fontSize: 28,
            }}>
                ⚠️
            </div>
            <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: '#a1a1aa', marginBottom: 24, maxWidth: 400 }}>
                An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>
            <button
                onClick={reset}
                style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #c5a456, #a68935)',
                    color: '#000',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                Try Again
            </button>
        </div>
    );
}
