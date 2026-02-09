export default function DashboardLoading() {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '64px 24px', gap: 16,
        }}>
            <div className="spinner spinner-lg" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
    );
}
