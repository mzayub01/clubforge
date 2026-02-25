'use client';

import Link from 'next/link';

const docs = [
  {
    href: '/docs/salespack/demo-script',
    icon: '🎬',
    title: 'Demo Script',
    desc: '30-minute guided walkthrough with talk tracks, wow moments, and a closing sequence.',
  },
  {
    href: '/docs/salespack/features',
    icon: '⚡',
    title: 'Feature Overview',
    desc: 'One-page summary of every platform feature. Perfect as a leave-behind.',
  },
  {
    href: '/docs/salespack/quickstart',
    icon: '🚀',
    title: 'Demo Quickstart',
    desc: 'Login credentials, pre-loaded data, key URLs, and reset instructions.',
  },
  {
    href: '/docs/salespack/objections',
    icon: '🛡️',
    title: 'Objection Handling',
    desc: '9 common objections with empathetic, ready-made responses.',
  },
  {
    href: '/docs/salespack/pricing',
    icon: '💰',
    title: 'Pricing & ROI',
    desc: 'Tier comparison, per-member cost breakdowns, ROI calculator.',
  },
  {
    href: '/docs/salespack/screen-walk',
    icon: '🖥️',
    title: 'Screen Walk',
    desc: 'Click-by-click walkthrough of every admin and member screen.',
  },
];

export default function SalesPackIndex() {
  return (
    <>
      <nav className="sp-nav">
        <Link href="/docs/salespack" className="sp-nav-brand">
          Club<span>Forge</span> Sales Pack
        </Link>
      </nav>

      <style>{`
        .sp-hero {
          background: linear-gradient(135deg, #0F172A, #1E293B);
          color: #fff;
          padding: 80px 24px 64px;
          text-align: center;
        }
        .sp-badge {
          display: inline-block;
          background: linear-gradient(135deg, #D4B86A, #A88B3D);
          color: #0F172A;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 24px;
        }
        .sp-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 12px;
        }
        .sp-hero h1 span {
          background: linear-gradient(135deg, #D4B86A, #C5A456, #A88B3D);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sp-hero p {
          color: #94A3B8;
          font-size: 1.05rem;
          max-width: 550px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .sp-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .sp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .sp-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 28px;
          text-decoration: none;
          color: #E2E8F0;
          transition: all 0.2s;
          display: block;
        }
        .sp-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(197, 164, 86, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(197, 164, 86, 0.1);
        }
        .sp-card-icon { font-size: 28px; margin-bottom: 12px; }
        .sp-card h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .sp-card p { font-size: 13px; color: #94A3B8; line-height: 1.6; }
        .sp-creds {
          background: rgba(197, 164, 86, 0.08);
          border: 1px solid rgba(197, 164, 86, 0.2);
          border-radius: 16px;
          padding: 28px;
        }
        .sp-creds h3 {
          font-size: 14px;
          font-weight: 700;
          color: #C5A456;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .sp-cred-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
          gap: 8px;
        }
        .sp-cred-row:last-child { border-bottom: none; }
        .sp-cred-label { font-size: 13px; color: #94A3B8; font-weight: 500; }
        .sp-cred-value {
          font-size: 13px;
          color: #fff;
          font-weight: 600;
          font-family: 'Courier New', monospace;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 10px;
          border-radius: 6px;
        }
        .sp-footer {
          text-align: center;
          color: #475569;
          font-size: 12px;
          padding-top: 32px;
          margin-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .sp-hero + .sp-container { background: #0F172A; }
      `}</style>

      <div className="sp-hero">
        <div className="sp-badge">Sales Demo Pack</div>
        <h1>
          ClubForge <span>Demo Kit</span>
        </h1>
        <p>
          Everything your team needs to run polished product demos and close
          deals. Open any document below to get started.
        </p>
      </div>

      <div className="sp-container" style={{ background: '#0F172A' }}>
        <div className="sp-grid">
          {docs.map((d) => (
            <Link key={d.href} href={d.href} className="sp-card">
              <div className="sp-card-icon">{d.icon}</div>
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
            </Link>
          ))}
        </div>

        <div className="sp-creds">
          <h3>🔑 Quick Access — Demo Credentials</h3>
          <div className="sp-cred-row">
            <span className="sp-cred-label">Admin Email</span>
            <span className="sp-cred-value">demo-admin@clubforgehq.com</span>
          </div>
          <div className="sp-cred-row">
            <span className="sp-cred-label">Member Email</span>
            <span className="sp-cred-value">demo-member@clubforgehq.com</span>
          </div>
          <div className="sp-cred-row">
            <span className="sp-cred-label">Password (both)</span>
            <span className="sp-cred-value">ClubForge2026!</span>
          </div>
          <div className="sp-cred-row">
            <span className="sp-cred-label">Free Trial Link</span>
            <span className="sp-cred-value">clubforgehq.com/get-started</span>
          </div>
        </div>

        <div className="sp-footer">
          ClubForge Sales Demo Pack · v1.0 · February 2026
        </div>
      </div>
    </>
  );
}
