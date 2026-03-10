'use client';

// ===============================================
// ClubForge - Platform Mail Merge
// Upload CSV / paste recipients, compose template,
// merge {{club_name}} in subject+body, mass send
// ===============================================

import { useState, useRef, useCallback } from 'react';
import {
    Mail,
    Upload,
    Trash2,
    Eye,
    Send,
    CheckCircle,
    AlertTriangle,
    Loader2,
    ArrowLeft,
    ArrowRight,
    Plus,
    FileText,
    X,
    Users,
} from 'lucide-react';

interface Recipient {
    name: string;
    email: string;
}

type Step = 'recipients' | 'template' | 'send';

export default function MailMergePage() {
    // Recipients
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [pasteText, setPasteText] = useState('');
    const [parseError, setParseError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Template
    const [subject, setSubject] = useState('');
    const [bodyTemplate, setBodyTemplate] = useState('');
    const [fromName, setFromName] = useState('');
    const [fromEmail, setFromEmail] = useState('');

    // Flow
    const [step, setStep] = useState<Step>('recipients');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ sent: number; failed: number; errors?: string[] } | null>(null);
    const [error, setError] = useState('');

    // ── Parse recipients from text ──────────────────────────
    const parseRecipients = useCallback((text: string): Recipient[] => {
        const lines = text.trim().split(/\n/);
        const parsed: Recipient[] = [];
        const seen = new Set<string>();

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Skip header row
            if (/^(name|club|club_name)/i.test(trimmed)) continue;

            // Try comma-separated, tab-separated, or pipe-separated
            let parts: string[] = [];
            if (trimmed.includes('\t')) {
                parts = trimmed.split('\t');
            } else if (trimmed.includes('|')) {
                parts = trimmed.split('|');
            } else {
                // For CSV, handle quoted fields
                const match = trimmed.match(/^"?([^"]*?)"?\s*,\s*"?([^"]*?)"?\s*$/);
                if (match) {
                    parts = [match[1], match[2]];
                } else {
                    parts = trimmed.split(',');
                }
            }

            if (parts.length >= 2) {
                const name = parts[0].trim().replace(/^["']|["']$/g, '');
                const email = parts[parts.length >= 2 ? 1 : 0].trim().replace(/^["']|["']$/g, '').toLowerCase();

                // Basic email validation
                if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !seen.has(email)) {
                    parsed.push({ name, email });
                    seen.add(email);
                }
            }
        }

        return parsed;
    }, []);

    const handlePasteImport = () => {
        setParseError('');
        const parsed = parseRecipients(pasteText);
        if (parsed.length === 0) {
            setParseError('No valid recipients found. Use format: Club Name, email@example.com (one per line)');
            return;
        }

        // Merge with existing, dedup by email
        const existing = new Set(recipients.map(r => r.email));
        const newRecipients = parsed.filter(r => !existing.has(r.email));
        setRecipients(prev => [...prev, ...newRecipients]);
        setPasteText('');
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setParseError('');

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const parsed = parseRecipients(text);
            if (parsed.length === 0) {
                setParseError('No valid recipients found in CSV. Ensure it has name and email columns.');
                return;
            }

            const existing = new Set(recipients.map(r => r.email));
            const newRecipients = parsed.filter(r => !existing.has(r.email));
            setRecipients(prev => [...prev, ...newRecipients]);
        };
        reader.readAsText(file);

        // Reset input so same file can be re-uploaded
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeRecipient = (email: string) => {
        setRecipients(prev => prev.filter(r => r.email !== email));
    };

    const clearAll = () => {
        setRecipients([]);
        setPasteText('');
        setParseError('');
    };

    // ── Template preview ────────────────────────────────────
    const previewName = recipients.length > 0 ? recipients[0].name : 'Example Club';

    const previewSubject = subject.replace(/\{\{club_name\}\}/gi, previewName);
    const previewBody = bodyTemplate.replace(/\{\{club_name\}\}/gi, previewName);

    // ── Send ────────────────────────────────────────────────
    const handleSend = async () => {
        setError('');
        setSending(true);
        setResult(null);

        try {
            const res = await fetch('/api/platform/mail-merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    subject: subject.trim(),
                    bodyTemplate: bodyTemplate.trim(),
                    ...(fromName.trim() ? { fromName: fromName.trim() } : {}),
                    ...(fromEmail.trim() ? { fromEmail: fromEmail.trim() } : {}),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to send emails');
                return;
            }

            setResult({ sent: data.sent, failed: data.failed, errors: data.errors });
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSending(false);
        }
    };

    // ── Insert placeholder helper ───────────────────────────
    const insertPlaceholder = (target: 'subject' | 'body') => {
        if (target === 'subject') {
            setSubject(prev => prev + '{{club_name}}');
        } else {
            setBodyTemplate(prev => prev + '{{club_name}}');
        }
    };

    // ── Render ──────────────────────────────────────────────
    return (
        <div className="mail-merge-page">
            <div className="platform-page-header">
                <h1>Mail Merge</h1>
                <p>Send personalized emails to clubs with merged placeholders</p>
            </div>

            {/* Step indicator */}
            <div className="steps-bar">
                <button
                    className={`step-btn ${step === 'recipients' ? 'active' : ''} ${recipients.length > 0 ? 'done' : ''}`}
                    onClick={() => setStep('recipients')}
                >
                    <Users size={14} />
                    <span>1. Recipients</span>
                    {recipients.length > 0 && <span className="step-count">{recipients.length}</span>}
                </button>
                <div className="step-divider" />
                <button
                    className={`step-btn ${step === 'template' ? 'active' : ''} ${subject && bodyTemplate ? 'done' : ''}`}
                    onClick={() => recipients.length > 0 && setStep('template')}
                    disabled={recipients.length === 0}
                >
                    <FileText size={14} />
                    <span>2. Template</span>
                </button>
                <div className="step-divider" />
                <button
                    className={`step-btn ${step === 'send' ? 'active' : ''} ${result ? 'done' : ''}`}
                    onClick={() => recipients.length > 0 && subject && bodyTemplate && setStep('send')}
                    disabled={!subject || !bodyTemplate || recipients.length === 0}
                >
                    <Send size={14} />
                    <span>3. Send</span>
                </button>
            </div>

            {/* ─── STEP 1: Recipients ─────────────────────────── */}
            {step === 'recipients' && (
                <div className="step-content">
                    <div className="merge-grid">
                        {/* Input panel */}
                        <div className="card">
                            <div className="card-header">
                                <Plus size={16} />
                                <h2>Add Recipients</h2>
                            </div>

                            <div className="input-methods">
                                {/* CSV Upload */}
                                <button
                                    className="upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={16} />
                                    Upload CSV
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleCSVUpload}
                                    style={{ display: 'none' }}
                                />
                                <span className="or-divider">or paste below</span>
                            </div>

                            <div className="form-group">
                                <label>Paste Club Names & Emails</label>
                                <textarea
                                    placeholder={`Club Name, email@example.com\nAnother Club, info@club.com\nThird Club, hello@third.com`}
                                    value={pasteText}
                                    onChange={e => setPasteText(e.target.value)}
                                    rows={8}
                                />
                                <span className="hint">One per line: Name, Email (comma, tab, or pipe separated)</span>
                            </div>

                            {parseError && (
                                <div className="error-banner">
                                    <AlertTriangle size={14} />
                                    {parseError}
                                </div>
                            )}

                            <button
                                className="action-btn"
                                onClick={handlePasteImport}
                                disabled={!pasteText.trim()}
                            >
                                <Plus size={16} />
                                Import Recipients
                            </button>
                        </div>

                        {/* Recipients list */}
                        <div className="card">
                            <div className="card-header">
                                <Users size={16} />
                                <h2>Recipients ({recipients.length})</h2>
                                {recipients.length > 0 && (
                                    <button className="clear-btn" onClick={clearAll}>
                                        <Trash2 size={13} />
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {recipients.length === 0 ? (
                                <div className="empty-state">
                                    <Mail size={28} />
                                    <p>No recipients yet</p>
                                    <p className="hint">Upload a CSV or paste data to add recipients</p>
                                </div>
                            ) : (
                                <div className="recipients-table-wrap">
                                    <table className="recipients-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Club Name</th>
                                                <th>Email</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recipients.map((r, i) => (
                                                <tr key={r.email}>
                                                    <td className="row-num">{i + 1}</td>
                                                    <td>{r.name}</td>
                                                    <td className="email-cell">{r.email}</td>
                                                    <td>
                                                        <button
                                                            className="remove-btn"
                                                            onClick={() => removeRecipient(r.email)}
                                                            title="Remove"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="step-nav">
                        <div />
                        <button
                            className="nav-btn primary"
                            onClick={() => setStep('template')}
                            disabled={recipients.length === 0}
                        >
                            Next: Compose Template
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── STEP 2: Template ───────────────────────────── */}
            {step === 'template' && (
                <div className="step-content">
                    <div className="merge-grid">
                        {/* Compose */}
                        <div className="card">
                            <div className="card-header">
                                <FileText size={16} />
                                <h2>Compose Email</h2>
                            </div>

                            <div className="placeholder-hint">
                                <span className="placeholder-badge">{'{{club_name}}'}</span>
                                will be replaced with each club&apos;s name
                            </div>

                            <div className="form-group">
                                <label>
                                    Subject Line
                                    <button
                                        className="insert-btn"
                                        onClick={() => insertPlaceholder('subject')}
                                        type="button"
                                    >
                                        + Insert {'{{club_name}}'}
                                    </button>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Hi {{club_name}} — grow your club with ClubForge"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                />
                            </div>

                            <div className="sender-fields">
                                <div className="form-group">
                                    <label>Your Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Zubair Ayub"
                                        value={fromName}
                                        onChange={e => setFromName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Your Email</label>
                                    <input
                                        type="email"
                                        placeholder="e.g. zubair@clubforgehq.com"
                                        value={fromEmail}
                                        onChange={e => setFromEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <span className="hint" style={{ marginBottom: '16px', marginTop: '-8px' }}>Emails will be sent from this identity. Replies go to this address.</span>

                            <div className="form-group">
                                <label>
                                    Email Body
                                    <button
                                        className="insert-btn"
                                        onClick={() => insertPlaceholder('body')}
                                        type="button"
                                    >
                                        + Insert {'{{club_name}}'}
                                    </button>
                                </label>
                                <textarea
                                    placeholder={`Hi {{club_name}},\n\nI came across your club and wanted to reach out...\n\nBest regards,\nThe ClubForge Team`}
                                    value={bodyTemplate}
                                    onChange={e => setBodyTemplate(e.target.value)}
                                    rows={12}
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="card">
                            <div className="card-header">
                                <Eye size={16} />
                                <h2>Preview</h2>
                                {recipients.length > 0 && (
                                    <span className="preview-using">for &ldquo;{previewName}&rdquo;</span>
                                )}
                            </div>

                            {!subject && !bodyTemplate ? (
                                <div className="empty-state">
                                    <Eye size={28} />
                                    <p>Start typing to see preview</p>
                                </div>
                            ) : (
                                <div className="email-preview">
                                    {(fromName || fromEmail) && (
                                        <div className="preview-field">
                                            <span className="preview-label">From:</span>
                                            <span className="preview-value">
                                                {fromName && fromEmail
                                                    ? `${fromName} <${fromEmail}>`
                                                    : fromEmail || fromName}
                                            </span>
                                        </div>
                                    )}
                                    <div className="preview-field">
                                        <span className="preview-label">Subject:</span>
                                        <span className="preview-value">{previewSubject || '(no subject)'}</span>
                                    </div>
                                    <div className="preview-divider" />
                                    <div className="preview-body">
                                        {previewBody.split('\n').map((line, i) => (
                                            <p key={i}>{line || '\u00A0'}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="step-nav">
                        <button className="nav-btn" onClick={() => setStep('recipients')}>
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <button
                            className="nav-btn primary"
                            onClick={() => setStep('send')}
                            disabled={!subject.trim() || !bodyTemplate.trim()}
                        >
                            Next: Review & Send
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── STEP 3: Send ───────────────────────────────── */}
            {step === 'send' && (
                <div className="step-content">
                    <div className="send-card card">
                        <div className="card-header">
                            <Send size={16} />
                            <h2>Review & Send</h2>
                        </div>

                        {!result && !sending && (
                            <>
                                <div className="send-summary">
                                    <div className="summary-row">
                                        <span className="summary-label">Recipients</span>
                                        <span className="summary-value">{recipients.length} clubs</span>
                                    </div>
                                    {(fromName || fromEmail) && (
                                        <div className="summary-row">
                                            <span className="summary-label">From</span>
                                            <span className="summary-value">
                                                {fromName && fromEmail
                                                    ? `${fromName} <${fromEmail}>`
                                                    : fromEmail || fromName}
                                            </span>
                                        </div>
                                    )}
                                    <div className="summary-row">
                                        <span className="summary-label">Subject</span>
                                        <span className="summary-value">{subject}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="summary-label">Placeholders</span>
                                        <span className="summary-value">
                                            {'{{club_name}}'} → personalized per recipient
                                        </span>
                                    </div>
                                </div>

                                <div className="send-preview">
                                    <h3>Sample email (to {previewName})</h3>
                                    <div className="email-preview compact">
                                        <div className="preview-field">
                                            <span className="preview-label">Subject:</span>
                                            <span className="preview-value">{previewSubject}</span>
                                        </div>
                                        <div className="preview-divider" />
                                        <div className="preview-body">
                                            {previewBody.split('\n').map((line, i) => (
                                                <p key={i}>{line || '\u00A0'}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="error-banner">
                                        <AlertTriangle size={14} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    className="send-btn"
                                    onClick={handleSend}
                                    disabled={sending}
                                >
                                    <Send size={16} />
                                    Send {recipients.length} Emails
                                </button>
                            </>
                        )}

                        {sending && (
                            <div className="sending-state">
                                <Loader2 size={32} className="spin" />
                                <p>Sending {recipients.length} emails...</p>
                                <p className="hint">This may take a moment. Please don&apos;t close this page.</p>
                            </div>
                        )}

                        {result && (
                            <div className="result-state">
                                {result.failed === 0 ? (
                                    <CheckCircle size={40} className="result-icon success" />
                                ) : (
                                    <AlertTriangle size={40} className="result-icon warning" />
                                )}

                                <h3>
                                    {result.failed === 0
                                        ? 'All emails sent successfully!'
                                        : `Completed with ${result.failed} failures`}
                                </h3>

                                <div className="result-stats">
                                    <div className="result-stat success">
                                        <span className="stat-number">{result.sent}</span>
                                        <span className="stat-label">Sent</span>
                                    </div>
                                    <div className="result-stat failed">
                                        <span className="stat-number">{result.failed}</span>
                                        <span className="stat-label">Failed</span>
                                    </div>
                                </div>

                                {result.errors && result.errors.length > 0 && (
                                    <div className="error-list">
                                        <h4>Errors:</h4>
                                        {result.errors.map((err, i) => (
                                            <p key={i} className="error-line">{err}</p>
                                        ))}
                                    </div>
                                )}

                                <button
                                    className="nav-btn primary"
                                    onClick={() => {
                                        setResult(null);
                                        setRecipients([]);
                                        setSubject('');
                                        setBodyTemplate('');
                                        setFromName('');
                                        setFromEmail('');
                                        setStep('recipients');
                                    }}
                                    style={{ marginTop: 20 }}
                                >
                                    Start New Mail Merge
                                </button>
                            </div>
                        )}
                    </div>

                    {!result && !sending && (
                        <div className="step-nav">
                            <button className="nav-btn" onClick={() => setStep('template')}>
                                <ArrowLeft size={16} />
                                Back
                            </button>
                            <div />
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .mail-merge-page {
                    max-width: 1200px;
                }

                .platform-page-header {
                    margin-bottom: 20px;
                }

                .platform-page-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 6px;
                    letter-spacing: -0.025em;
                }

                .platform-page-header p {
                    font-size: 14px;
                    color: #71717a;
                    margin: 0;
                }

                /* Steps bar */
                .steps-bar {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    margin-bottom: 24px;
                    padding: 6px;
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                }

                .step-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    color: #52525b;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    white-space: nowrap;
                }

                .step-btn:hover:not(:disabled) {
                    color: #a1a1aa;
                }

                .step-btn.active {
                    background: rgba(167, 139, 250, 0.1);
                    color: #a78bfa;
                }

                .step-btn.done:not(.active) {
                    color: #10b981;
                }

                .step-btn:disabled {
                    cursor: not-allowed;
                    opacity: 0.4;
                }

                .step-count {
                    background: rgba(167, 139, 250, 0.15);
                    color: #a78bfa;
                    font-size: 11px;
                    padding: 1px 7px;
                    border-radius: 20px;
                    font-weight: 600;
                }

                .step-divider {
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.06);
                    margin: 0 4px;
                }

                /* Cards */
                .card {
                    background: #16161d;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 20px;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    color: #a78bfa;
                }

                .card-header h2 {
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                    margin: 0;
                }

                .merge-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                /* Form elements */
                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #a1a1aa;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    font-weight: 500;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 10px 14px;
                    background: #0a0a0f;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: #e4e4e7;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.15s ease;
                    font-family: inherit;
                    box-sizing: border-box;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: rgba(167, 139, 250, 0.4);
                }

                .form-group input::placeholder,
                .form-group textarea::placeholder {
                    color: #3f3f46;
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .hint {
                    display: block;
                    font-size: 11px;
                    color: #52525b;
                    margin-top: 4px;
                }

                .optional {
                    text-transform: none;
                    font-weight: 400;
                    color: #52525b;
                }

                /* Input methods */
                .input-methods {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .upload-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: rgba(167, 139, 250, 0.08);
                    border: 1px dashed rgba(167, 139, 250, 0.3);
                    border-radius: 8px;
                    color: #a78bfa;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .upload-btn:hover {
                    background: rgba(167, 139, 250, 0.15);
                }

                .or-divider {
                    font-size: 12px;
                    color: #3f3f46;
                }

                .sender-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 4px;
                }

                .sender-fields .form-group {
                    margin-bottom: 0;
                }

                /* Action button */
                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px;
                    background: rgba(167, 139, 250, 0.1);
                    border: 1px solid rgba(167, 139, 250, 0.2);
                    border-radius: 8px;
                    color: #a78bfa;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .action-btn:hover:not(:disabled) {
                    background: rgba(167, 139, 250, 0.2);
                }

                .action-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                /* Clear button */
                .clear-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-left: auto;
                    padding: 4px 10px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 6px;
                    color: #ef4444;
                    font-size: 11px;
                    cursor: pointer;
                }

                .clear-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                }

                /* Recipients table */
                .recipients-table-wrap {
                    max-height: 400px;
                    overflow-y: auto;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.04);
                }

                .recipients-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .recipients-table thead {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                .recipients-table th {
                    padding: 8px 12px;
                    text-align: left;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: #71717a;
                    background: #0a0a0f;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    font-weight: 500;
                }

                .recipients-table td {
                    padding: 8px 12px;
                    color: #d4d4d8;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }

                .recipients-table tr:hover td {
                    background: rgba(255,255,255,0.02);
                }

                .row-num {
                    color: #3f3f46;
                    width: 30px;
                }

                .email-cell {
                    color: #a78bfa;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 12px;
                }

                .remove-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: #3f3f46;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.1s ease;
                }

                .remove-btn:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                /* Empty state */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 40px 20px;
                    color: #3f3f46;
                }

                .empty-state p {
                    color: #52525b;
                    font-size: 13px;
                    margin: 0;
                }

                /* Placeholder hint */
                .placeholder-hint {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(167, 139, 250, 0.06);
                    border: 1px solid rgba(167, 139, 250, 0.12);
                    border-radius: 8px;
                    font-size: 12px;
                    color: #a1a1aa;
                    margin-bottom: 16px;
                }

                .placeholder-badge {
                    padding: 2px 8px;
                    background: rgba(167, 139, 250, 0.15);
                    border-radius: 4px;
                    color: #a78bfa;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 12px;
                    font-weight: 600;
                }

                .insert-btn {
                    padding: 2px 8px;
                    background: rgba(167, 139, 250, 0.1);
                    border: 1px solid rgba(167, 139, 250, 0.2);
                    border-radius: 4px;
                    color: #a78bfa;
                    font-size: 10px;
                    cursor: pointer;
                    text-transform: none;
                    letter-spacing: 0;
                    font-weight: 600;
                }

                .insert-btn:hover {
                    background: rgba(167, 139, 250, 0.2);
                }

                /* Email preview */
                .email-preview {
                    background: #0a0a0f;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .email-preview.compact {
                    background: #0d0d14;
                }

                .preview-field {
                    display: flex;
                    gap: 8px;
                    padding: 10px 14px;
                    font-size: 13px;
                }

                .preview-label {
                    color: #52525b;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .preview-value {
                    color: #e4e4e7;
                }

                .preview-divider {
                    height: 1px;
                    background: rgba(255,255,255,0.06);
                }

                .preview-body {
                    padding: 14px;
                    font-size: 13px;
                    color: #d4d4d8;
                    line-height: 1.6;
                }

                .preview-body p {
                    margin: 0 0 4px;
                }

                .preview-using {
                    font-size: 11px;
                    color: #52525b;
                    font-weight: 400;
                    margin-left: auto;
                }

                /* Step navigation */
                .step-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;
                }

                .nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 8px;
                    color: #a1a1aa;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .nav-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.08);
                    color: white;
                }

                .nav-btn.primary {
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    border: none;
                    color: white;
                    font-weight: 600;
                }

                .nav-btn.primary:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .nav-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                /* Send step */
                .send-card {
                    max-width: 700px;
                }

                .send-summary {
                    margin-bottom: 20px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    font-size: 13px;
                }

                .summary-label {
                    color: #71717a;
                    font-weight: 500;
                }

                .summary-value {
                    color: #e4e4e7;
                    text-align: right;
                    max-width: 60%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .send-preview {
                    margin-bottom: 20px;
                }

                .send-preview h3 {
                    font-size: 12px;
                    color: #71717a;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin: 0 0 10px;
                    font-weight: 500;
                }

                .send-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.15s ease;
                }

                .send-btn:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Sending / Result states */
                .sending-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 60px 20px;
                    color: #a78bfa;
                }

                .sending-state p {
                    color: #d4d4d8;
                    font-size: 15px;
                    margin: 0;
                }

                .result-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 40px 20px;
                    text-align: center;
                }

                .result-icon.success {
                    color: #10b981;
                }

                .result-icon.warning {
                    color: #f59e0b;
                }

                .result-state h3 {
                    font-size: 18px;
                    color: white;
                    margin: 0;
                }

                .result-stats {
                    display: flex;
                    gap: 32px;
                    margin: 12px 0;
                }

                .result-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }

                .stat-number {
                    font-size: 28px;
                    font-weight: 700;
                }

                .result-stat.success .stat-number {
                    color: #10b981;
                }

                .result-stat.failed .stat-number {
                    color: #ef4444;
                }

                .stat-label {
                    font-size: 12px;
                    color: #71717a;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .error-list {
                    width: 100%;
                    max-width: 500px;
                    background: rgba(239, 68, 68, 0.06);
                    border: 1px solid rgba(239, 68, 68, 0.15);
                    border-radius: 8px;
                    padding: 12px;
                    text-align: left;
                }

                .error-list h4 {
                    font-size: 12px;
                    color: #ef4444;
                    margin: 0 0 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .error-line {
                    font-size: 12px;
                    color: #fca5a5;
                    margin: 0 0 4px;
                    font-family: 'SF Mono', Monaco, monospace;
                    word-break: break-all;
                }

                /* Banners */
                .error-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 8px;
                    color: #f87171;
                    font-size: 13px;
                    margin-bottom: 16px;
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .merge-grid {
                        grid-template-columns: 1fr;
                    }

                    .steps-bar {
                        overflow-x: auto;
                    }
                }
            `}</style>
        </div>
    );
}
