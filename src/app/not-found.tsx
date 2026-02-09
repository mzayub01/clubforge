import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-primary, #0a0a0f)',
            color: 'var(--text-primary, #e4e4e7)',
        }}>
            <div style={{ fontSize: 72, marginBottom: 16, opacity: 0.6 }}>404</div>
            <h1 style={{ marginBottom: 8, fontSize: 28 }}>Page Not Found</h1>
            <p style={{
                color: 'var(--text-secondary, #a1a1aa)',
                marginBottom: 32,
                maxWidth: 420,
                lineHeight: 1.6,
            }}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
                href="/"
                style={{
                    padding: '12px 28px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #c5a456, #a68935)',
                    color: '#000',
                    fontWeight: 600,
                    textDecoration: 'none',
                }}
            >
                Go Home
            </Link>
        </div>
    );
}
