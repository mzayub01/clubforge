'use client';

import Image from 'next/image';

interface AvatarProps {
    src?: string | null;
    firstName?: string;
    lastName?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    /** When set, the avatar becomes a button (e.g. open a full-size lightbox). */
    onClick?: () => void;
    title?: string;
}

const SIZES = {
    xs: { width: 24, height: 24, fontSize: '10px' },
    sm: { width: 32, height: 32, fontSize: '12px' },
    md: { width: 40, height: 40, fontSize: '14px' },
    lg: { width: 56, height: 56, fontSize: '18px' },
    xl: { width: 80, height: 80, fontSize: '24px' },
};

export default function Avatar({ src, firstName = '', lastName = '', size = 'md', className = '', onClick, title }: AvatarProps) {
    const { width, height, fontSize } = SIZES[size];
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    const interactive = onClick
        ? {
            role: 'button' as const,
            tabIndex: 0,
            onClick,
            onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } },
            title: title || 'View photo',
            'aria-label': title || 'View photo',
        }
        : {};
    const interactiveStyle = onClick ? { cursor: 'zoom-in', boxShadow: '0 0 0 2px transparent', transition: 'box-shadow 0.15s ease' } : {};

    if (src) {
        return (
            <div
                className={className}
                {...interactive}
                style={{
                    width,
                    height,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    ...interactiveStyle,
                }}
            >
                <Image
                    src={src}
                    alt={`${firstName} ${lastName}`}
                    width={width}
                    height={height}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
            </div>
        );
    }

    // Fallback to initials
    return (
        <div
            className={className}
            {...(onClick ? { title } : {})}
            style={{
                width,
                height,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-gold) 0%, #c9a227 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize,
                flexShrink: 0,
            }}
        >
            {initials || '?'}
        </div>
    );
}
