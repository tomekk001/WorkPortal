import { useAuth } from '../../auth/AuthContext';
import { Header } from '../../auth/Header';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    NEW:       { label: 'Nowa',      bg: '#e0f2fe', color: '#0369a1' },
    REVIEWING: { label: 'Przegląd', bg: '#fef9c3', color: '#92400e' },
    REJECTED:  { label: 'Odrzucona', bg: '#fee2e2', color: '#991b1b' },
    HIRED:     { label: 'Zatrudniona', bg: '#dcfce7', color: '#166534' },
  };
  const s = map[status] ?? { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, background: s.bg, color: s.color
    }}>
      {s.label}
    </span>
  );
};

export const EmployerDashboard = () => {
  const { token } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offers' | 'applications'>('offers');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, appsRes] = await Promise.all([
          axios.get('http://localhost:3000/job-offers/my-offers', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/job-offers/my-applications', {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);
        setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
        setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const newAppsCount = applications.filter(a => a.status === 'NEW').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      {/* TOP BAR */}
      <div style={{ background: '#0f1923', padding: '40px 0 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 8 }}>
                Panel Pracodawcy
              </p>
              <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Zarządzaj rekrutacją
              </h1>
            </div>
            <Link
              to="/add-offer"
              style={{
                background: '#7dd3b0', color: '#0f1923',
                padding: '12px 24px', borderRadius: 10,
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'opacity 0.15s',
                whiteSpace: 'nowrap'
              }}
            >
              + Nowe ogłoszenie
            </Link>
          </div>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Aktywne ogłoszenia', value: loading ? '—' : offers.length, accent: '#7dd3b0' },
              { label: 'Wszystkie aplikacje', value: loading ? '—' : applications.length, accent: '#60a5fa' },
              { label: 'Nowe aplikacje', value: loading ? '—' : newAppsCount, accent: '#fbbf24' },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: 12,
                padding: '20px 24px', border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, margin: '0 0 8px' }}>{label}</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: accent, margin: 0, lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['offers', 'applications'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0',
                  fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
                  background: activeTab === tab ? '#f8f7f4' : 'transparent',
                  color: activeTab === tab ? '#0f1923' : '#64748b',
                }}
              >
                {tab === 'offers' ? `Ogłoszenia (${offers.length})` : `Aplikacje (${applications.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>

        {/* OFFERS TAB */}
        {activeTab === 'offers' && (
          <div>
            {loading ? (
              <LoadingSpinner color="#0f1923" />
            ) : offers.length === 0 ? (
              <EmptyState
                icon="📭"
                title="Brak ogłoszeń"
                desc="Dodaj pierwsze ogłoszenie, aby zacząć rekrutować."
                action={<Link to="/add-offer" style={linkBtnStyle}>Dodaj ogłoszenie</Link>}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {offers.map((offer) => (
                  <div key={offer.id} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f1923', margin: '0 0 8px' }}>
                          {offer.title}
                        </h3>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span style={metaStyle}>📍 {offer.location}</span>
                          <span style={metaStyle}>📅 {new Date(offer.createdAt).toLocaleDateString('pl-PL')}</span>
                          {offer.category && <span style={metaStyle}>🏷 {offer.category.name}</span>}
                        </div>
                        {offer.salaryMin && offer.salaryMax && (
                          <span style={{
                            display: 'inline-block', marginTop: 8,
                            background: '#dcfce7', color: '#166534',
                            fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 6
                          }}>
                            {offer.salaryMin.toLocaleString()} – {offer.salaryMax.toLocaleString()} {offer.currency}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          background: '#eff6ff', borderRadius: 10, padding: '12px 20px',
                          display: 'inline-block'
                        }}>
                          <div style={{ fontSize: 28, fontWeight: 800, color: '#1d4ed8', lineHeight: 1 }}>
                            {offer.applications?.length ?? 0}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>
                            aplikacji
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div>
            {loading ? (
              <LoadingSpinner color="#0f1923" />
            ) : applications.length === 0 ? (
              <EmptyState
                icon="📨"
                title="Brak aplikacji"
                desc="Gdy kandydaci zaaplikują na Twoje oferty, pojawią się tutaj."
              />
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {applications.map((app, i) => (
                  <div
                    key={app.id}
                    style={{
                      padding: '20px 24px',
                      borderBottom: i < applications.length - 1 ? '1px solid #f3f4f6' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 16, flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: '#e0f2fe', color: '#0369a1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 15, flexShrink: 0
                      }}>
                        {(app.user?.firstName?.[0] ?? '?')}{(app.user?.lastName?.[0] ?? '')}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#0f1923', margin: '0 0 4px', fontSize: 15 }}>
                          {app.user?.firstName} {app.user?.lastName}
                        </p>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                          {app.user?.email}
                          {app.user?.phone && <> &nbsp;·&nbsp; {app.user.phone}</>}
                        </p>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>
                          Stanowisko: <strong style={{ color: '#374151' }}>{app.jobOffer?.title}</strong>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {new Date(app.appliedAt).toLocaleDateString('pl-PL')}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Helpers ----

const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 14,
  border: '1px solid #e8e5df', padding: '20px 24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  transition: 'box-shadow 0.15s',
};

const metaStyle: React.CSSProperties = {
  fontSize: 13, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 4,
};

const linkBtnStyle: React.CSSProperties = {
  display: 'inline-block', marginTop: 12, padding: '10px 24px',
  background: '#0f1923', color: '#fff', borderRadius: 8,
  fontWeight: 600, fontSize: 14, textDecoration: 'none',
};

const LoadingSpinner = ({ color }: { color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: 12 }}>
    <div style={{
      width: 36, height: 36, border: '3px solid #e8e5df',
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p style={{ color: '#9ca3af', fontSize: 14 }}>Ładowanie...</p>
  </div>
);

const EmptyState = ({ icon, title, desc, action }: {
  icon: string; title: string; desc: string; action?: React.ReactNode
}) => (
  <div style={{
    textAlign: 'center', padding: '64px 32px',
    background: '#fff', borderRadius: 16, border: '2px dashed #e8e5df'
  }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{title}</p>
    <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 0 }}>{desc}</p>
    {action}
  </div>
);
