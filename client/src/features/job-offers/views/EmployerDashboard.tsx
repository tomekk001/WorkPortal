import { useAuth } from '../../auth/AuthContext';
import { Header } from '../../auth/Header';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Application {
  id: number;
  appliedAt: string;
  status: string;
  startDate?: string;
  contractType?: string;
  expectedSalary?: number;
  coverMessage?: string;
  cvFileName?: string;
  additionalFileName?: string;
  user: { id: number; firstName: string; lastName: string; email: string; phone?: string };
  jobOffer: { id: number; title: string };
  conversations: { id: number }[];
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: { id: number; firstName: string; lastName: string; role: string };
}

interface Conversation {
  id: number;
  messages: Message[];
  employer: { id: number; firstName: string; lastName: string };
  candidate: { id: number; firstName: string; lastName: string };
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    NEW:       { label: 'Nowa',         bg: '#e0f2fe', color: '#0369a1' },
    REVIEWING: { label: 'Przegląd',    bg: '#fef9c3', color: '#92400e' },
    REJECTED:  { label: 'Odrzucona',   bg: '#fee2e2', color: '#991b1b' },
    HIRED:     { label: 'Zatrudniona', bg: '#dcfce7', color: '#166534' },
  };
  const s = map[status] ?? { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

const startDateLabel: Record<string, string> = {
  immediately: 'Od zaraz', '2weeks': '2 tygodnie',
  '1month': '1 miesiąc', '3months': '3 miesiące', 'more3months': 'Powyżej 3 miesięcy',
};

const ChatPanel = ({ application, token, myId, onClose }: {
  application: Application; token: string; myId: number; onClose: () => void;
}) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const existingConvId = application.conversations?.[0]?.id;

  useEffect(() => {
    if (existingConvId) {
      axios.get(`http://localhost:3000/messages/conversations/${existingConvId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setConversation(res.data)).catch(console.error);
    }
  }, [existingConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      if (!conversation) {
        const res = await axios.post('http://localhost:3000/messages/start', {
          candidateId: application.user.id,
          applicationId: application.id,
          firstMessage: input.trim(),
        }, { headers: { Authorization: `Bearer ${token}` } });
        setConversation(res.data);
      } else {
        const res = await axios.post(
          `http://localhost:3000/messages/conversations/${conversation.id}/send`,
          { content: input.trim() },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setConversation(prev => prev ? { ...prev, messages: [...prev.messages, res.data] } : prev);
      }
      setInput('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Błąd wysyłania');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f1923', margin: 0 }}>
            💬 {application.user.firstName} {application.user.lastName}
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{application.user.email}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1 }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, background: '#faf9f7' }}>
        {!conversation && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, margin: 'auto 0' }}>
            Napisz pierwszą wiadomość do kandydata.
          </p>
        )}
        {conversation?.messages.map(msg => {
          const isMe = msg.sender.id === myId;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '10px 14px',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isMe ? '#0f1923' : '#fff',
                color: isMe ? '#fff' : '#0f1923',
                fontSize: 14, lineHeight: 1.5,
                border: isMe ? 'none' : '1px solid #e8e5df',
              }}>
                <p style={{ margin: 0 }}>{msg.content}</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: isMe ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}>
                  {new Date(msg.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0ece6', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Napisz wiadomość… (Enter = wyślij)"
          rows={2}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e8e5df', background: '#fff', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none' }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: input.trim() ? '#7dd3b0' : '#e8e5df',
            color: input.trim() ? '#0f1923' : '#9ca3af',
            fontWeight: 700, fontSize: 14, cursor: input.trim() ? 'pointer' : 'default',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          {sending ? '…' : 'Wyślij'}
        </button>
      </div>
    </div>
  );
};

const ApplicationModal = ({ application, token, myId, onClose, onDownloadCv, downloadingId }: {
  application: Application; token: string; myId: number; onClose: () => void;
  onDownloadCv: (id: number, e: React.MouseEvent) => void;
  downloadingId: number | null;
}) => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 860, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f1923', margin: 0 }}>
              {application.user.firstName} {application.user.lastName}
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
              Aplikacja na: <strong style={{ color: '#0f1923' }}>{application.jobOffer.title}</strong>
              {' · '}{new Date(application.appliedAt).toLocaleDateString('pl-PL')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <StatusBadge status={application.status} />
            <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 20, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', minHeight: 0 }}>

          {/* Details */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Section title="📋 Dane kontaktowe">
              <Row label="Imię i nazwisko" value={`${application.user.firstName} ${application.user.lastName}`} />
              <Row label="E-mail" value={application.user.email} />
              <Row label="Telefon" value={application.user.phone || '—'} />
            </Section>

            <Section title="💼 Oczekiwania">
              <Row label="Termin rozpoczęcia" value={startDateLabel[application.startDate ?? ''] ?? application.startDate ?? '—'} />
              <Row label="Forma współpracy" value={application.contractType ?? '—'} />
              <Row label="Oczekiwane wynagrodzenie" value={application.expectedSalary ? `${application.expectedSalary.toLocaleString()} PLN / mies.` : '—'} />
            </Section>

            {application.coverMessage && (
              <Section title="✉️ Wiadomość od kandydata">
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', background: '#faf9f7', padding: '14px 16px', borderRadius: 10, border: '1px solid #f0ece6' }}>
                  {application.coverMessage}
                </p>
              </Section>
            )}

            <Section title="📎 Dokumenty">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#9ca3af', minWidth: 190, flexShrink: 0 }}>CV</span>
                {application.cvFileName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#0f1923', fontWeight: 600 }}>{application.cvFileName}</span>
                    <button
                      onClick={e => onDownloadCv(application.id, e)}
                      disabled={downloadingId === application.id}
                      style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: '#0f1923', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                    >
                      {downloadingId === application.id ? '⏳' : '⬇ Pobierz'}
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>Nie dołączono</span>
                )}
              </div>
              <Row label="Dodatkowy plik" value={application.additionalFileName ?? 'Nie dołączono'} />
            </Section>

            {!showChat && (
              <button onClick={() => setShowChat(true)} style={{ alignSelf: 'flex-start', padding: '11px 24px', borderRadius: 10, background: '#0f1923', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                💬 Napisz do kandydata
              </button>
            )}
          </div>

          {/* Chat */}
          {showChat && (
            <div style={{ width: 360, borderLeft: '1px solid #f0ece6', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <ChatPanel application={application} token={token} myId={myId} onClose={() => setShowChat(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, margin: '0 0 12px' }}>{title}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', gap: 12 }}>
    <span style={{ fontSize: 13, color: '#9ca3af', minWidth: 190, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#0f1923', fontWeight: 600 }}>{value}</span>
  </div>
);

export const EmployerDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offers' | 'applications'>('offers');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [myId, setMyId] = useState<number>(0);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownloadCv = async (applicationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(applicationId);
    try {
      const response = await axios.get(
        `http://localhost:3000/job-offers/applications/${applicationId}/download-cv`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${applicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Nie udało się pobrać CV. Kandydat mógł nie dołączyć pliku.');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, appsRes] = await Promise.all([
          axios.get('http://localhost:3000/job-offers/my-offers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/job-offers/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
        setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);

        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setMyId(payload.sub);
        }
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
        <div style={{ width: '100%', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 8 }}>Panel Pracodawcy</p>
              <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Zarządzaj rekrutacją</h1>
            </div>
            <Link to="/add-offer" style={{ background: '#7dd3b0', color: '#0f1923', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              + Nowe ogłoszenie
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Aktywne ogłoszenia', value: loading ? '—' : offers.length, accent: '#7dd3b0' },
              { label: 'Wszystkie aplikacje', value: loading ? '—' : applications.length, accent: '#60a5fa' },
              { label: 'Nowe aplikacje', value: loading ? '—' : newAppsCount, accent: '#fbbf24' },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, margin: '0 0 8px' }}>{label}</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: accent, margin: 0, lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {(['offers', 'applications'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 24px', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0', fontWeight: 600, fontSize: 14, transition: 'all 0.15s', background: activeTab === tab ? '#f8f7f4' : 'transparent', color: activeTab === tab ? '#0f1923' : '#64748b' }}>
                {tab === 'offers' ? `Ogłoszenia (${offers.length})` : `Aplikacje (${applications.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ width: '100%', padding: '32px 32px' }}>

        {activeTab === 'offers' && (
          loading ? <LoadingSpinner color="#0f1923" /> : offers.length === 0 ? (
            <EmptyState icon="📭" title="Brak ogłoszeń" desc="Dodaj pierwsze ogłoszenie, aby zacząć rekrutować." action={<Link to="/add-offer" style={linkBtnStyle}>Dodaj ogłoszenie</Link>} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {offers.map(offer => (
                <div key={offer.id} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f1923', margin: '0 0 8px' }}>{offer.title}</h3>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span style={metaStyle}>📍 {offer.location}</span>
                        <span style={metaStyle}>📅 {new Date(offer.createdAt).toLocaleDateString('pl-PL')}</span>
                        {offer.category && <span style={metaStyle}>🏷 {offer.category.name}</span>}
                      </div>
                      {offer.salaryMin && offer.salaryMax && (
                        <span style={{ display: 'inline-block', marginTop: 8, background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 6 }}>
                          {offer.salaryMin.toLocaleString()} – {offer.salaryMax.toLocaleString()} {offer.currency}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: '#eff6ff', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#1d4ed8', lineHeight: 1 }}>{offer.applications?.length ?? 0}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>aplikacji</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                          onClick={() => navigate(`/edit-offer/${offer.id}`)}
                          style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e8e5df', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#7dd3b0'; e.currentTarget.style.color = '#0a7a5a'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e5df'; e.currentTarget.style.color = '#374151'; }}
                        >
                          ✏️ Edytuj
                        </button>
                        {offer.validUntil && (
                          <span style={{ fontSize: 11, color: new Date(offer.validUntil) < new Date() ? '#ef4444' : '#9ca3af', textAlign: 'center', fontWeight: 500 }}>
                            {new Date(offer.validUntil) < new Date() ? '⚠ Wygasła' : `Ważna do ${new Date(offer.validUntil).toLocaleDateString('pl-PL')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'applications' && (
          loading ? <LoadingSpinner color="#0f1923" /> : applications.length === 0 ? (
            <EmptyState icon="📨" title="Brak aplikacji" desc="Gdy kandydaci zaaplikują na Twoje oferty, pojawią się tutaj." />
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {applications.map((app, i) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  style={{ padding: '20px 24px', borderBottom: i < applications.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf9f7')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      {(app.user?.firstName?.[0] ?? '?')}{(app.user?.lastName?.[0] ?? '')}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0f1923', margin: '0 0 4px', fontSize: 15 }}>
                        {app.user?.firstName} {app.user?.lastName}
                      </p>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                        {app.user?.email}{app.user?.phone && <> &nbsp;·&nbsp; {app.user.phone}</>}
                      </p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>
                        {app.jobOffer?.title}
                        {app.expectedSalary && <> &nbsp;·&nbsp; <span style={{ color: '#166534', fontWeight: 600 }}>{app.expectedSalary.toLocaleString()} PLN</span></>}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {app.conversations?.length > 0 && (
                      <span style={{ fontSize: 12, color: '#7dd3b0', fontWeight: 600 }}>💬</span>
                    )}
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(app.appliedAt).toLocaleDateString('pl-PL')}</span>
                    <StatusBadge status={app.status} />
                    <span style={{ color: '#d1d5db', fontSize: 14 }}>›</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {selectedApp && token && (
        <ApplicationModal application={selectedApp} token={token} myId={myId} onClose={() => setSelectedApp(null)} onDownloadCv={handleDownloadCv} downloadingId={downloadingId} />
      )}
    </div>
  );
};

const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid #e8e5df', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const metaStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 4 };
const linkBtnStyle: React.CSSProperties = { display: 'inline-block', marginTop: 12, padding: '10px 24px', background: '#0f1923', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' };

const LoadingSpinner = ({ color }: { color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: 12 }}>
    <div style={{ width: 36, height: 36, border: '3px solid #e8e5df', borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p style={{ color: '#9ca3af', fontSize: 14 }}>Ładowanie...</p>
  </div>
);

const EmptyState = ({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: React.ReactNode }) => (
  <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: 16, border: '2px dashed #e8e5df' }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{title}</p>
    <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 0 }}>{desc}</p>
    {action}
  </div>
);
