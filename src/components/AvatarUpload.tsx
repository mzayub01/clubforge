'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import Avatar from './Avatar';

interface AvatarUploadProps {
    currentUrl?: string | null;
    userId: string;
    firstName?: string;
    lastName?: string;
    onUploadComplete: (url: string) => void;
    size?: 'md' | 'lg' | 'xl';
}

export default function AvatarUpload({
    currentUrl,
    userId,
    firstName = '',
    lastName = '',
    onUploadComplete,
    size = 'lg',
}: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError('');
        setUploading(true);

        try {
            // Create preview
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);

            // Upload server-side via admin client (bypasses Storage RLS) — the same
            // reliable path used at registration. The old client-side upload to the
            // `profile-images` bucket could fail silently.
            const imgForm = new FormData();
            imgForm.append('image', file);
            imgForm.append('userId', userId);
            const uploadRes = await fetch('/api/upload-profile-image', {
                method: 'POST',
                body: imgForm,
            });

            if (!uploadRes.ok) {
                const errJson = await uploadRes.json().catch(() => ({}));
                throw new Error(errJson.error || 'Failed to upload image');
            }

            const { url } = await uploadRes.json();
            onUploadComplete(url);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const displayUrl = previewUrl || currentUrl;

    const sizeStyles = {
        md: { width: 64, height: 64 },
        lg: { width: 96, height: 96 },
        xl: { width: 128, height: 128 },
    };

    const { width, height } = sizeStyles[size];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
                style={{
                    position: 'relative',
                    width,
                    height,
                    cursor: 'pointer',
                }}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                <Avatar
                    src={displayUrl}
                    firstName={firstName}
                    lastName={lastName}
                    size={size === 'md' ? 'lg' : 'xl'}
                />

                {/* Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: uploading ? 1 : 0,
                        transition: 'opacity 0.2s',
                    }}
                    className="avatar-overlay"
                >
                    {uploading ? (
                        <Loader2 size={24} color="white" className="spinner" />
                    ) : (
                        <Camera size={24} color="white" />
                    )}
                </div>

                {/* Hover overlay */}
                <style jsx>{`
                    .avatar-overlay:hover {
                        opacity: 1 !important;
                    }
                `}</style>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
                {uploading ? (
                    <>
                        <Loader2 size={14} className="spinner" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload size={14} />
                        {currentUrl ? 'Change Photo' : 'Upload Photo'}
                    </>
                )}
            </button>

            {error && (
                <p style={{ color: 'var(--color-red)', fontSize: 'var(--text-sm)', margin: 0 }}>
                    {error}
                </p>
            )}
        </div>
    );
}
