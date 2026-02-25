import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sales Demo Pack | ClubForge',
    description: 'Internal sales demo pack for the ClubForge team.',
    robots: { index: false, follow: false },
};

export default function SalesPackLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="salespack-root">
            <style>{`
        .salespack-root {
          --sp-bg: #0F172A;
          --sp-surface: #1E293B;
          --sp-border: rgba(255,255,255,0.08);
          --sp-gold: #C5A456;
          --sp-gold-dark: #A88B3D;
          --sp-gold-light: #D4B86A;
          --sp-text: #E2E8F0;
          --sp-muted: #94A3B8;
          --sp-white: #fff;
          --sp-card-bg: rgba(255,255,255,0.04);
          --sp-green: #22C55E;
          --sp-blue: #3B82F6;
          --sp-red: #DC2626;
          font-family: var(--font-inter, 'Inter', sans-serif);
          min-height: 100vh;
        }
        .sp-nav {
          background: var(--sp-bg);
          border-bottom: 1px solid var(--sp-border);
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .sp-nav-brand {
          color: var(--sp-white);
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
        }
        .sp-nav-brand span { color: var(--sp-gold); }
        .sp-nav a.sp-nav-back {
          color: var(--sp-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .sp-nav a.sp-nav-back:hover { color: var(--sp-gold); }
      `}</style>
            {children}
        </div>
    );
}
