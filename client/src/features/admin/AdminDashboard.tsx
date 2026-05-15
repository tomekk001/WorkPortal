import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { Header } from '../auth/Header';

interface Report {
  id: number;
  createdAt: string;
  reason: string;
  description: string | null;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  user: { id: number; firstName: string; lastName: string; email: string };
  jobOffer: { id: number; title: string; company: { companyName: string } };
}

interface Stats {
  totalUsers: number;
  totalOffers: number;
  totalReports: number;
  pendingReports: number;
}

const STATUS_META = {
  PENDING:  { label: 'Oczekujące', bg: '#fef9c3', color: '#92400e' },
  REVIEWED: { label: 'W trakcie',  bg: '#dbeafe', color: '#1e40af' },
  RESOLVED: { label: 'Rozwiązane', bg: '#dcfce7', color: '#166534' },
};

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [users, setUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'RESOLVED'>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          axios.get('http://localhost:3000/admin/stats', { headers }),
          axios.get('http://localhost:3000/admin/reports', { headers }),
        ]);
        setStats(statsRes.data);
        setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      axios.get('http://localhost:3000/admin/users', { headers })
        .then(r => setUsers(Array.isArray(r.data) ? r.data : []))
        .catch(console.error);
    }
  }, [activeTab]);

  const updateStatus = async (reportId: number, status: Report['status']) => {
    setUpdatingId(reportId);
    try {
      await axios.patch(
        `http://localhost:3000/admin/reports/${reportId}/status`,
        { status },
        { headers },
      );
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      setStats(prev => {
        if (!prev) return prev;
        const oldReport = reports.find(r => r.id === reportId);
        const wasPending = oldReport?.status === 'PENDING';
        const isPending = status === 'PENDING';
        return { ...prev, pendingReports: prev.pendingReports + (isPending ? 1 : 0) - (wasPending ? 1 : 0) };
      });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Błąd aktualizacji');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReports = statusFilter === 'ALL'
    ? reports
    : reports.filter(r => r.status === statusFilter);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      {/* TOP BAR */}
      <div style={{ background: '#0f1923', padding: '40px 0 0' }}>
        <div style={{ padding: '0 32px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8 }}>
            Panel Administratora
          </p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 800, color: '#fff', margin: '0 0 32px', letterSpacing: '-0.02em' }}>
            Zarządzanie platformą
          </h1>

          {/* STATS */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Użytkownicy',       value: stats.totalUsers,    accent: '#7dd3b0' },
                { label: 'Ogłoszenia',         value: stats.totalOffers,   accent: '#60a5fa' },
                { label: 'Wszystkie zgłoszenia', value: stats.totalReports, accent: '#f59e0b' },
                { label: 'Oczekujące',         value: stats.pendingReports, accent: '#ef4444' },
              ].map(({ label, value, accent }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, margin: '0 0 8px' }}>{label}</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: accent, margin: 0, lineHeight: 1 }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* TABS */}
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'reports', label: `Zgłoszenia${stats ? ` (${stats.pendingReports} nowych)` : ''}` },
              { key: 'users',   label: 'Użytkownicy' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 24px', border: 'none', cursor: 'pointer',
                  borderRadius: '8px 8px 0 0', fontWeight: 600, fontSize: 14,
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  background: activeTab === tab.key ? '#f8f7f4' : 'transparent',
                  color: activeTab === tab.key ? '#0f1923'
                    : (tab.key === 'reports' && stats && stats.pendingReports > 0 ? '#f59e0b' : '#64748b'),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '32px 32px' }}>

        {/* ── REPORTS TAB ── */}
        {activeTab === 'reports' && (
          <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f1923', margin: 0 }}>Zgłoszenia nadużyć</h2>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                  {loading ? 'Ładowanie…' : `${filteredReports.length} zgłoszeń`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['ALL', 'PENDING', 'REVIEWED', 'RESOLVED'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, border: 'none',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      fontFamily: 'inherit', transition: 'all 0.12s',
                      background: statusFilter === s ? '#0f1923' : '#e8e5df',
                      color: statusFilter === s ? '#fff' : '#6b7280',
                    }}
                  >
                    {s === 'ALL' ? 'Wszystkie' : STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e8e5df', borderTopColor: '#0f1923', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {!loading && filteredReports.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: 16, border: '2px dashed #e8e5df' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <p style={{ color: '#374151', fontWeight: 600, fontSize: 16 }}>Brak zgłoszeń</p>
              </div>
            )}

            {!loading && filteredReports.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredReports.map(report => {
                  const { bg, color } = STATUS_META[report.status];
                  return (
                    <div
                      key={report.id}
                      style={{
                        background: '#fff', borderRadius: 14,
                        border: `1.5px solid ${report.status === 'PENDING' ? '#fde68a' : '#e8e5df'}`,
                        padding: '20px 24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        {/* LEFT */}
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: bg, color }}>
                              {STATUS_META[report.status].label}
                            </span>
                            <span style={{ fontSize: 12, color: '#9ca3af' }}>
                              #{report.id} · {new Date(report.createdAt).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 15, color: '#0f1923' }}>
                            {report.reason}
                          </p>
                          {report.description && (
                            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                              {report.description}
                            </p>
                          )}

                          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>Zgłoszone ogłoszenie</p>
                              <p style={{ fontSize: 13, color: '#374151', margin: 0, fontWeight: 600 }}>
                                {report.jobOffer.title}
                                <span style={{ fontWeight: 400, color: '#9ca3af' }}> · {report.jobOffer.company.companyName}</span>
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>Zgłaszający</p>
                              <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
                                {report.user.firstName} {report.user.lastName}
                                <span style={{ color: '#9ca3af' }}> · {report.user.email}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* STATUS ACTIONS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Zmień status</p>
                          {(['PENDING', 'REVIEWED', 'RESOLVED'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(report.id, s)}
                              disabled={report.status === s || updatingId === report.id}
                              style={{
                                padding: '7px 16px', borderRadius: 8, border: 'none',
                                cursor: report.status === s ? 'default' : 'pointer',
                                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                                background: report.status === s ? STATUS_META[s].bg : '#f1f5f9',
                                color: report.status === s ? STATUS_META[s].color : '#6b7280',
                                opacity: updatingId === report.id ? 0.6 : 1,
                                transition: 'all 0.12s',
                              }}
                              onMouseEnter={e => { if (report.status !== s) e.currentTarget.style.background = STATUS_META[s].bg; }}
                              onMouseLeave={e => { if (report.status !== s) e.currentTarget.style.background = '#f1f5f9'; }}
                            >
                              {report.status === s ? '✓ ' : ''}{STATUS_META[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f1923', margin: 0 }}>Użytkownicy</h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{users.length} kont</p>
            </div>

            {users.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e8e5df', borderTopColor: '#0f1923', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 80px', padding: '12px 24px', background: '#faf9f7', borderBottom: '1px solid #f0ece6' }}>
                  {['Użytkownik', 'Firma / Rola', 'Data rejestracji', 'Aplikacje'].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af' }}>{h}</span>
                  ))}
                </div>
                {users.map((user, i) => {
                  const roleColors: Record<string, { bg: string; color: string }> = {
                    CANDIDATE: { bg: '#eff6ff', color: '#3b82f6' },
                    EMPLOYER:  { bg: '#f0fdf4', color: '#16a34a' },
                    ADMIN:     { bg: '#fef3c7', color: '#d97706' },
                  };
                  const rc = roleColors[user.role] ?? { bg: '#f3f4f6', color: '#374151' };
                  return (
                    <div
                      key={user.id}
                      style={{
                        display: 'grid', gridTemplateColumns: '1fr 140px 100px 80px',
                        padding: '16px 24px', alignItems: 'center',
                        borderBottom: i < users.length - 1 ? '1px solid #f3f4f6' : 'none',
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0f1923' }}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{user.email}</p>
                      </div>
                      <div>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: rc.bg, color: rc.color }}>
                          {user.role}
                        </span>
                        {user.companyProfile && (
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{user.companyProfile.companyName}</p>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                        {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                      </p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#374151', textAlign: 'center' }}>
                        {user._count?.applications ?? 0}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
