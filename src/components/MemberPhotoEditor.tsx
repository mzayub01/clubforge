'use client';

// ===============================================
// ClubForge - MemberPhotoEditor
// Staff-side control to view (zoom), upload or TAKE a member's profile photo.
// Uploads go through POST /api/staff/member-photo (admin/instructor only).
// ===============================================

import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Loader2, X, RefreshCw, ZoomIn } from 'lucide-react';
import Avatar from './Avatar';
import ModalPortal from './admin/ModalPortal';
import PhotoLightbox from './PhotoLightbox';

interface MemberPhotoEditorProps {
    userId: string;
    currentUrl?: string | null;
    firstName?: string;
    lastName?: string;
    onUpdated: (url: string) => void;
    /** 'xl' = 80px avatar with buttons beside it (edit modal); 'lg' = 56px */
    size?: 'lg' | 'xl';
}

async function uploadMemberPhoto(userId: string, file: Blob, filename: string): Promise<string> {
    const form = new FormData();
    form.append('image', file, filename);
    form.append('userId', userId);
    const res = await fetch('/api/staff/member-photo', { method: 'POST', body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Failed to upload photo');
    return json.url as string;
}

export default function MemberPhotoEditor({
    userId,
    currentUrl,
    firstName = '',
    lastName = '',
    onUpdated,
    size = 'xl',
}: MemberPhotoEditorProps) {
    const [url, setUrl] = useState<string | null>(currentUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [cameraOpen, setCameraOpen] = useState(false);
    const [zoom, setZoom] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setUrl(currentUrl || null); }, [currentUrl, userId]);

    const fullName = `${firstName} ${lastName}`.trim();

    const save = async (file: Blob, filename: string) => {
        setError('');
        setUploading(true);
        try {
            const newUrl = await uploadMemberPhoto(userId, file, filename);
            setUrl(newUrl);
            onUpdated(newUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload photo');
            throw err;
        } finally {
            setUploading(false);
        }
    };

    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Please choose an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return; }
        try { await save(file, file.name); } catch { /* shown via error state */ }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
                <Avatar
                    src={url}
                    firstName={firstName}
                    lastName={lastName}
                    size={size}
                    onClick={url ? () => setZoom(true) : undefined}
                    title={url ? 'View full size' : undefined}
                />
                {uploading && (
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Loader2 size={22} color="white" className="animate-spin" />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCameraOpen(true)} disabled={uploading}>
                        <Camera size={14} /> Take photo
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        <Upload size={14} /> Upload
                    </button>
                    {url && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setZoom(true)}>
                            <ZoomIn size={14} /> View
                        </button>
                    )}
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: error ? 'var(--color-red)' : 'var(--text-tertiary)' }}>
                    {error || (url ? 'Replace the photo if the one on file is not the member.' : 'No photo on file yet.')}
                </p>
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

            {cameraOpen && (
                <CameraCapture
                    onCapture={async (blob) => { await save(blob, `${userId}-${Date.now()}.jpg`); }}
                    onClose={() => setCameraOpen(false)}
                    subjectName={fullName}
                />
            )}

            {zoom && url && <PhotoLightbox src={url} alt={fullName} onClose={() => setZoom(false)} />}
        </div>
    );
}

// -----------------------------------------------
// Live camera capture (getUserMedia). Falls back to the device camera app via
// <input capture> where the browser refuses or has no camera.
// -----------------------------------------------
function CameraCapture({
    onCapture,
    onClose,
    subjectName,
}: {
    onCapture: (blob: Blob) => Promise<void>;
    onClose: () => void;
    subjectName?: string;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fallbackRef = useRef<HTMLInputElement>(null);
    const [facing, setFacing] = useState<'user' | 'environment'>('user');
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [canSwitch, setCanSwitch] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setReady(false);
        setError('');

        async function start() {
            streamRef.current?.getTracks().forEach(t => t.stop());
            if (!navigator.mediaDevices?.getUserMedia) {
                setError('This browser cannot open the camera here. Use your device camera instead.');
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
                    audio: false,
                });
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => { /* autoplay quirks */ });
                }
                setReady(true);
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    setCanSwitch(devices.filter(d => d.kind === 'videoinput').length > 1);
                } catch { /* ignore */ }
            } catch {
                setError('Camera not available or permission denied. Use your device camera instead.');
            }
        }
        start();

        return () => {
            cancelled = true;
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        };
    }, [facing]);

    const capture = async () => {
        const video = videoRef.current;
        if (!video || !video.videoWidth) return;
        // Square centre crop, 800px — plenty for an avatar, small to upload.
        const side = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - side) / 2;
        const sy = (video.videoHeight - side) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (facing === 'user') {
            // Preview is mirrored for a natural selfie; the saved photo should not be.
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, sx, sy, side, side, 0, 0, canvas.width, canvas.height);
        const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        if (!blob) return;
        setBusy(true);
        try {
            await onCapture(blob);
            onClose();
        } catch {
            setError('Upload failed. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const onFallbackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setBusy(true);
        try {
            await onCapture(file);
            onClose();
        } catch {
            setError('Upload failed. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <ModalPortal>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Camera size={20} /> Take photo{subjectName ? ` — ${subjectName}` : ''}
                        </h2>
                        <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="modal-body">
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '1 / 1',
                            background: '#000',
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                        }}>
                            <video
                                ref={videoRef}
                                playsInline
                                muted
                                autoPlay
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: facing === 'user' ? 'scaleX(-1)' : 'none',
                                    display: error ? 'none' : 'block',
                                }}
                            />
                            {!ready && !error && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Loader2 size={28} className="animate-spin" />
                                </div>
                            )}
                            {error && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', padding: 'var(--space-6)', textAlign: 'center', color: 'white' }}>
                                    <p style={{ margin: 0 }}>{error}</p>
                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => fallbackRef.current?.click()} disabled={busy}>
                                        <Camera size={14} /> Use device camera
                                    </button>
                                </div>
                            )}
                            {/* Framing guide */}
                            {ready && !error && (
                                <div style={{
                                    position: 'absolute', inset: '8%', borderRadius: '50%',
                                    border: '2px dashed rgba(255,255,255,0.5)', pointerEvents: 'none',
                                }} />
                            )}
                        </div>
                        <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                            Centre the face in the circle. The photo is cropped square and saved straight to the member&apos;s profile.
                        </p>
                        <input
                            ref={fallbackRef}
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={onFallbackFile}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div className="modal-footer" style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            {canSwitch && !error && (
                                <button type="button" className="btn btn-ghost" onClick={() => setFacing(f => (f === 'user' ? 'environment' : 'user'))} disabled={busy}>
                                    <RefreshCw size={16} /> Switch camera
                                </button>
                            )}
                            {!error && (
                                <button type="button" className="btn btn-ghost" onClick={() => fallbackRef.current?.click()} disabled={busy}>
                                    <Upload size={16} /> Device camera
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={capture} disabled={!ready || !!error || busy}>
                                {busy ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                {busy ? 'Saving…' : 'Capture & save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
