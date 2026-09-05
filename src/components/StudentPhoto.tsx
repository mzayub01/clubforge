'use client';

// Compact avatar for staff lists: click to zoom, camera button to replace the
// photo (upload or take one). Used where the surrounding page is a server
// component (e.g. instructor "My Students").

import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import Avatar from './Avatar';
import PhotoLightbox from './PhotoLightbox';
import MemberPhotoEditor from './MemberPhotoEditor';
import ModalPortal from './admin/ModalPortal';

interface StudentPhotoProps {
    userId: string;
    src?: string | null;
    firstName: string;
    lastName: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function StudentPhoto({ userId, src, firstName, lastName, size = 'md' }: StudentPhotoProps) {
    const [url, setUrl] = useState<string | null>(src || null);
    const [zoom, setZoom] = useState(false);
    const [editing, setEditing] = useState(false);
    const fullName = `${firstName} ${lastName}`.trim();

    return (
        <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
            <Avatar
                src={url}
                firstName={firstName}
                lastName={lastName}
                size={size}
                onClick={url ? () => setZoom(true) : () => setEditing(true)}
                title={url ? 'View photo' : 'Add photo'}
            />
            <button
                type="button"
                onClick={() => setEditing(true)}
                title="Change photo"
                aria-label={`Change photo for ${fullName}`}
                style={{
                    position: 'absolute',
                    right: -4,
                    bottom: -4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid var(--bg-primary)',
                    background: 'var(--color-gold)',
                    color: 'var(--color-black)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                }}
            >
                <Camera size={11} />
            </button>

            {zoom && url && <PhotoLightbox src={url} alt={fullName} onClose={() => setZoom(false)} />}

            {editing && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setEditing(false)}>
                        <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Profile photo — {fullName}</h2>
                                <button type="button" className="btn btn-ghost btn-icon" onClick={() => setEditing(false)} aria-label="Close">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <MemberPhotoEditor
                                    userId={userId}
                                    currentUrl={url}
                                    firstName={firstName}
                                    lastName={lastName}
                                    onUpdated={(u) => setUrl(u)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => setEditing(false)}>Done</button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
