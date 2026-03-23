import Link from 'next/link';

export default function PromoBanner() {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            padding: '14px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '2px solid #C5A456',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(197,164,86,0.08) 50%, transparent 100%)',
                animation: 'promoShimmer 3s ease-in-out infinite',
                pointerEvents: 'none',
            }} />
            <style>{`
                @keyframes promoShimmer {
                    0%, 100% { opacity: 0; transform: translateX(-100%); }
                    50% { opacity: 1; transform: translateX(100%); }
                }
            `}</style>
            <p style={{ margin: 0, fontSize: 'clamp(13px, 2.5vw, 16px)', lineHeight: '1.5' }}>
                <span style={{ color: '#FFFFFF', fontWeight: '700' }}>🔥 LIMITED TIME: </span>
                <span style={{
                    background: 'linear-gradient(135deg, #D4B86A, #F5D98C)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    fontWeight: '800', fontSize: 'clamp(14px, 2.8vw, 18px)',
                }}>
                    40% OFF
                </span>
                <span style={{ color: '#CBD5E1', fontWeight: '500' }}> all plans — sign up before April 30th. Use code </span>
                <span style={{
                    background: 'rgba(197,164,86,0.15)', color: '#D4B86A', fontWeight: '800',
                    padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(197,164,86,0.3)',
                    fontFamily: 'monospace', fontSize: 'clamp(13px, 2.5vw, 15px)', letterSpacing: '1px',
                }}>
                    APRIL40
                </span>
                <span style={{ color: '#CBD5E1', fontWeight: '500' }}> at checkout</span>
                <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                    <Link href="/get-started" style={{
                        color: '#0F172A', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                        padding: '5px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
                        textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>
                        Claim Offer →
                    </Link>
                </span>
            </p>
        </div>
    );
}
