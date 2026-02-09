export default function InstructorLoading() {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '64px 24px', gap: 16,
        }}>
            <div className="spinner spinner-lg" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading instructor panel...</p>
        </div>
    );
}
