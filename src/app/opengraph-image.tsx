import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ClubForge — The Operating System for Martial Arts Clubs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                    padding: '60px 80px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    position: 'relative',
                }}
            >
                {/* Grid pattern overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Gold accent bar */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #A88B3D, #D4B86A, #C5A456)',
                    }}
                />

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1 }}>
                    {/* Badge */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#0F172A',
                                letterSpacing: '1px',
                            }}
                        >
                            CLUBFORGE
                        </div>
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: '64px',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            lineHeight: 1.1,
                            maxWidth: '700px',
                        }}
                    >
                        The Operating System for
                        <span style={{ color: '#C5A456' }}> Martial Arts Clubs</span>
                    </div>

                    {/* Subtitle */}
                    <div
                        style={{
                            fontSize: '24px',
                            color: '#94A3B8',
                            maxWidth: '600px',
                            lineHeight: 1.5,
                        }}
                    >
                        Members · Classes · Belt Progression · Payments · Attendance — all in one dashboard
                    </div>

                    {/* URL */}
                    <div
                        style={{
                            fontSize: '18px',
                            color: '#C5A456',
                            fontWeight: 600,
                            marginTop: '10px',
                        }}
                    >
                        clubforgehq.com
                    </div>
                </div>

                {/* Stats preview on right */}
                <div
                    style={{
                        position: 'absolute',
                        right: '60px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    {[
                        { label: 'Members', value: '247', color: '#3B82F6' },
                        { label: 'Revenue', value: '£8.4k', color: '#10B981' },
                        { label: 'Attendance', value: '87%', color: '#F59E0B' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '20px 28px',
                                minWidth: '180px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                            }}
                        >
                            <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>{stat.label}</div>
                            <div style={{ fontSize: '32px', color: '#FFFFFF', fontWeight: 800 }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        { ...size }
    );
}
