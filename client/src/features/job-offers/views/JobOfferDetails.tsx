import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { Header } from '../../auth/Header';
import { JobOfferCard, SENIORITY_LABELS, type JobOffer } from '../components/JobOfferCard';

interface OfferDetails extends JobOffer {
  description: string;
  contract: string;
  workMode: string;
  isActive: boolean;
  isApproved: boolean;
  validUntil: string;
  company: {
    id: number;
    companyName: string;
    logoUrl: string | null;
    description: string | null;
    website: string | null;
    location: string | null;
  };
}

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: 'Zdalnie',
  HYBRID: 'Hybrydowo',
  ONSITE: 'Stacjonarnie',
};

const REPORT_REASONS = [
  'Podejrzana oferta', 'Fałszywe informacje', 'Nieodpowiednie treści',
  'Duplikat ogłoszenia', 'Błędne dane kontaktowe', 'Inne',
];

export const JobOfferDetails = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [similar, setSimilar] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  useEffect(() => {
    if (!offerId) return;
    setLoading(true);
    setNotFound(false);
    axios.get(`http://localhost:3000/job-offers/${offerId}`)
      .then(res => setOffer(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    axios.get(`http://localhost:3000/job-offers/${offerId}/similar`)
      .then(res => setSimilar(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
    axios.post(`http://localhost:3000/job-offers/${offerId}/view`).catch(() => {});
  }, [offerId]);

  const handleApply = () => {
    if (!token) { alert('Musisz być zalogowany, aby aplikować.'); return; }
    navigate(`/apply/${offerId}`);
  };

  const submitReport = async () => {
    if (!reportReason || !token || !offerId) return;
    setReportSending(true);
    try {
      await axios.post(
        `http://localhost:3000/job-offers/${offerId}/report`,
        { reason: reportReason, description: reportDesc },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReportDone(true);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Błąd podczas zgłaszania.');
    } finally {
      setReportSending(false);
    }
  };

  const closeReport = () => {
    setReportOpen(false);
    setReportReason('');
    setReportDesc('');
    setReportDone(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e8e5df', borderTopColor: '#0f1923', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (notFound || !offer) return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />
      <div style={{ textAlign: 'center', padding: '96px 32px' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0f1923' }}>Oferta nie została znaleziona</p>
        <Link to="/" style={{ color: '#0a7a5a', fontWeight: 600 }}>← Wróć do listy ofert</Link>
      </div>
    </div>
  );

  const closedOrPending = !offer.isActive || !offer.isApproved;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      {/* MODAL ZGŁOSZENIA */}
      {reportOpen && (
        <div onClick={closeReport} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,25,35,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
            {reportDone ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f1923', margin: '0 0 8px' }}>Zgłoszenie wysłane</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Dziękujemy. Administrator sprawdzi ofertę.</p>
                <button onClick={closeReport} style={{ background: '#0f1923', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Zamknij</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f1923', margin: '0 0 4px' }}>Zgłoś ofertę</h3>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Pomóż nam utrzymać jakość ogłoszeń</p>
                  </div>
                  <button onClick={closeReport} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1, padding: 0 }}>×</button>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Powód zgłoszenia *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {REPORT_REASONS.map(reason => (
                      <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${reportReason === reason ? '#ef4444' : '#e8e5df'}`, background: reportReason === reason ? '#fff5f5' : '#faf9f7' }}>
                        <input type="radio" name="reason" value={reason} checked={reportReason === reason} onChange={() => setReportReason(reason)} style={{ accentColor: '#ef4444' }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Dodatkowy opis (opcjonalnie)</label>
                  <textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} rows={3} maxLength={500} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e8e5df', background: '#faf9f7', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', color: '#374151' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={closeReport} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e8e5df', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Anuluj</button>
                  <button onClick={submitReport} disabled={!reportReason || reportSending} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: reportReason && !reportSending ? '#ef4444' : '#f1f5f9', color: reportReason && !reportSending ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 14, cursor: reportReason && !reportSending ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                    {reportSending ? 'Wysyłanie…' : 'Wyślij zgłoszenie'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{ background: '#0f1923', padding: '40px 0 48px' }}>
        <div style={{ width: '100%', padding: '0 32px', maxWidth: 960, margin: '0 auto' }}>
          {closedOrPending && (
            <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', display: 'inline-block' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>
                {!offer.isApproved ? '⏳ Ta oferta oczekuje na zatwierdzenie przez administratora' : '⏸ Ta oferta jest obecnie zamknięta'}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{offer.title}</h1>
            {offer.isPromoted && <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fbbf24', color: '#78350f' }}>⭐ Wyróżniona</span>}
          </div>
          <Link to={`/firma/${offer.company.id}`} style={{ fontSize: 15, color: '#7dd3b0', fontWeight: 600, textDecoration: 'none' }}>
            {offer.company.companyName}
          </Link>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <span style={heroBadge}>📍 {offer.location}</span>
            <span style={heroBadge}>{WORK_MODE_LABELS[offer.workMode] ?? offer.workMode}</span>
            <span style={heroBadge}>{offer.contract}</span>
            {offer.seniority && SENIORITY_LABELS[offer.seniority] && <span style={heroBadge}>{SENIORITY_LABELS[offer.seniority]}</span>}
            {offer.salaryMin && offer.salaryMax ? (
              <span style={{ ...heroBadge, background: 'rgba(125,211,176,0.15)', color: '#7dd3b0', fontWeight: 700 }}>
                {offer.salaryMin.toLocaleString('pl-PL')} – {offer.salaryMax.toLocaleString('pl-PL')} {offer.currency}
              </span>
            ) : (
              <span style={{ ...heroBadge, fontStyle: 'italic' }}>Wynagrodzenie do negocjacji</span>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ width: '100%', padding: '40px 32px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }} className="rwd-sidebar-layout">
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8e5df', padding: '32px 36px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {offer.skills && offer.skills.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {offer.skills.map(skill => (
                  <span key={skill} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#0f1923', color: '#7dd3b0', fontWeight: 600 }}>{skill}</span>
                ))}
              </div>
            )}
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>{offer.description}</p>

            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <button onClick={handleApply} disabled={closedOrPending} style={{ padding: '13px 32px', borderRadius: 10, border: 'none', background: closedOrPending ? '#e8e5df' : '#7dd3b0', color: closedOrPending ? '#9ca3af' : '#0f1923', fontWeight: 800, fontSize: 15, cursor: closedOrPending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                Aplikuj →
              </button>
              {token && (
                <button onClick={() => setReportOpen(true)} style={{ padding: '13px 20px', borderRadius: 10, border: '1px solid #e8e5df', background: 'transparent', color: '#9ca3af', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ⚑ Zgłoś ofertę
                </button>
              )}
            </div>
          </div>

          <aside>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                {offer.company.logoUrl ? (
                  <img src={`http://localhost:3000${offer.company.logoUrl}`} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1px solid #e8e5df' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f9f8f6', border: '1px solid #e8e5df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
                )}
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0f1923' }}>{offer.company.companyName}</p>
                  {offer.company.location && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{offer.company.location}</p>}
                </div>
              </div>
              {offer.company.description && (
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: '0 0 16px' }}>{offer.company.description}</p>
              )}
              <Link to={`/firma/${offer.company.id}`} style={{ display: 'block', textAlign: 'center', padding: '9px', borderRadius: 8, border: '1px solid #e8e5df', color: '#374151', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Zobacz profil firmy
              </Link>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f1923', margin: '0 0 16px' }}>Podobne oferty</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {similar.map(s => (
                <JobOfferCard key={s.id} offer={s} onActionClick={id => navigate(`/oferta/${id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const heroBadge: React.CSSProperties = {
  fontSize: 13, padding: '5px 14px', borderRadius: 20,
  background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 500,
};
