'use client';

import Link from 'next/link';
import {
    Calendar, MapPin, CreditCard, Users, Video,
    Bell, UserPlus, Award, FileText, Plus
} from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

const ICON_STYLE: React.CSSProperties = {
    margin: '0 auto var(--space-4)',
    opacity: 0.6,
};

export default function EmptyState({
    icon: Icon = FileText,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-12) var(--space-6)',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            border: '2px dashed var(--border-light)',
        }}>
            <div style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(197, 164, 86, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)',
            }}>
                <Icon size={32} color="var(--color-gold)" />
            </div>

            <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                margin: '0 0 var(--space-2) 0',
                color: 'var(--text-primary)',
            }}>
                {title}
            </h3>

            <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                maxWidth: '380px',
                lineHeight: '1.6',
                margin: '0 0 var(--space-5) 0',
            }}>
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-5)',
                        background: 'var(--color-gold)',
                        color: 'var(--color-black)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: '700',
                        fontSize: 'var(--text-sm)',
                        textDecoration: 'none',
                        transition: 'opacity 0.2s ease',
                    }}
                >
                    <Plus size={16} />
                    {actionLabel}
                </Link>
            )}

            {actionLabel && onAction && !actionHref && (
                <button
                    onClick={onAction}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-5)',
                        background: 'var(--color-gold)',
                        color: 'var(--color-black)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: '700',
                        fontSize: 'var(--text-sm)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                    }}
                >
                    <Plus size={16} />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// Pre-configured empty states for common admin pages
export const EMPTY_STATES = {
    classes: {
        icon: Calendar,
        title: 'No classes yet',
        description: 'Create your first class to start scheduling training sessions for your members.',
        actionLabel: 'Create First Class',
    },
    membershipTypes: {
        icon: CreditCard,
        title: 'No membership plans yet',
        description: 'Set up your membership plans so new members can sign up and join your club.',
        actionLabel: 'Create Membership Plan',
    },
    members: {
        icon: Users,
        title: 'No members yet',
        description: 'Share your registration link with your community to get your first member signed up.',
        actionLabel: 'Share Registration Link',
        actionHref: '/admin/invite',
    },
    videos: {
        icon: Video,
        title: 'No videos yet',
        description: 'Upload technique videos to help your members train between sessions.',
        actionLabel: 'Upload First Video',
    },
    announcements: {
        icon: Bell,
        title: 'No announcements yet',
        description: 'Post your first announcement to keep your members informed.',
        actionLabel: 'Post Announcement',
    },
    locations: {
        icon: MapPin,
        title: 'No locations yet',
        description: 'Add your first training location with address and capacity details.',
        actionLabel: 'Add Location',
    },
    instructors: {
        icon: Award,
        title: 'No instructors yet',
        description: 'Invite instructors to help manage classes and track attendance.',
        actionLabel: 'Add Instructor',
    },
    waitlist: {
        icon: Users,
        title: 'No one on the waitlist',
        description: 'When locations reach capacity, interested members will appear here.',
    },
};
