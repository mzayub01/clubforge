'use client';

import { useEffect } from 'react';

export default function PlatformError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[PlatformError]', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '64px 24px', textAlign: 'center',
        }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛠️</div>
            <h2 style={{ marginBottom: 8 }}>Platform Error</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 420 }}>
                Something went wrong in the platform dashboard. Please try again.
            </p>
            <button onClick={reset} className="btn btn-primary">Try Again</button>
        </div>
    );
}
