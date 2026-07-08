import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { SearchBar } from '../components/SearchBar';
import { JobOfferCard, type JobOffer } from '../components/JobOfferCard';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../../auth/Header';
import { Footer } from '../../layout/Footer';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: { id: number; firstName: string; lastName: string; role: string };
}

interface Conversation {
  id: number;
  createdAt: string;
  employer: { id: number; firstName: string; lastName: string };
  candidate: { id: number; firstName: string; lastName: string };
  application?: { id: number; jobOffer: { title: string } };
  messages: Message[];
}

const ConversationChat = ({ conv, token, myId, onBack }: {
  conv: Conversation; token: string; myId: number; onBack: () => void;
}) => {
  const [messages, setMessages] = useState<Message[]>(conv.messages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/messages/conversations/${conv.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setMessages(res.data.messages)).catch(console.error);
  }, [conv.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await axios.post(
        `http://localhost:3000/messages/conversations/${conv.id}/send`,
        { content: input.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(prev => [...prev, res.data]);
      setInput('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Błąd wysyłania');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 560, background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7dd3b0', fontSize: 18, lineHeight: 1, padding: 0 }}>←</button>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1923', margin: 0 }}>
            {conv.employer.firstName} {conv.employer.lastName}
          </p>
          {conv.application && (
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              {conv.application.jobOffer.title}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, background: '#faf9f7' }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, margin: 'auto 0' }}>Brak wiadomości</p>
        )}
        {messages.map(msg => {
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
          placeholder="Napisz odpowiedź… (Enter = wyślij)"
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

interface CandidateApplication {
  id: number;
  appliedAt: string;
  status: 'NEW' | 'REVIEWING' | 'REJECTED' | 'HIRED';
  expectedSalary: number | null;
  jobOffer: {
    id: number;
    title: string;
    location: string;
    company: { companyName: string; logoUrl: string | null };
  };
}

const STATUS_LABELS: Record<CandidateApplication['status'], string> = {
  NEW: 'Wysłane',
  REVIEWING: 'W trakcie oceny',
  REJECTED: 'Odrzucone',
  HIRED: 'Zaakceptowane',
};

const STATUS_COLORS: Record<CandidateApplication['status'], { bg: string; color: string }> = {
  NEW: { bg: '#eff6ff', color: '#3b82f6' },
  REVIEWING: { bg: '#fefce8', color: '#ca8a04' },
  REJECTED: { bg: '#fef2f2', color: '#ef4444' },
  HIRED: { bg: '#f0fdf4', color: '#16a34a' },
};

const ApplicationHistoryTab = ({ token }: { token: string }) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/job-offers/candidate-applications', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setApplications(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e8e5df', borderTopColor: '#0f1923', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (applications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: 16, border: '2px dashed #e8e5df' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Brak aplikacji</p>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Nie aplikowałeś jeszcze na żadną ofertę.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Table header */}
      <div className="rwd-table-grid rwd-table-header" style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px 130px', gap: 0, padding: '12px 24px', borderBottom: '1px solid #f0ece6', background: '#faf9f7' }}>
        {['Oferta', 'Firma', 'Data wysłania', 'Status'].map(h => (
          <span key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af' }}>{h}</span>
        ))}
      </div>

      {applications.map((app, i) => {
        const { bg, color } = STATUS_COLORS[app.status];
        return (
          <div
            key={app.id}
            className="rwd-table-grid"
            style={{
              display: 'grid', gridTemplateColumns: '1fr 180px 140px 130px', gap: 0,
              padding: '18px 24px', alignItems: 'center',
              borderBottom: i < applications.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}
          >
            {/* Job title + location */}
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f1923' }}>{app.jobOffer.title}</p>
              {app.jobOffer.location && (
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{app.jobOffer.location}</p>
              )}
            </div>

            {/* Company */}
            <p style={{ margin: 0, fontSize: 14, color: '#374151', fontWeight: 500 }}>{app.jobOffer.company.companyName}</p>

            {/* Date */}
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              {new Date(app.appliedAt).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>

            {/* Status badge */}
            <span style={{
              display: 'inline-block', padding: '4px 10px', borderRadius: 20,
              fontSize: 12, fontWeight: 600, background: bg, color,
            }}>
              {STATUS_LABELS[app.status]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const MessagesTab = ({ token, myId }: { token: string; myId: number }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    axios.get('http://localhost:3000/messages/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setConversations(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e8e5df', borderTopColor: '#0f1923', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (selected) {
    return <ConversationChat conv={selected} token={token} myId={myId} onBack={() => setSelected(null)} />;
  }

  if (conversations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: 16, border: '2px dashed #e8e5df' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Brak wiadomości</p>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Gdy pracodawca napisze do Ciebie, wiadomości pojawią się tutaj.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {conversations.map((conv, i) => {
        const lastMsg = conv.messages?.[0];
        const isUnread = lastMsg && lastMsg.sender?.id !== myId;
        return (
          <div
            key={conv.id}
            onClick={() => setSelected(conv)}
            style={{
              padding: '18px 24px',
              borderBottom: i < conversations.length - 1 ? '1px solid #f3f4f6' : 'none',
              display: 'flex', alignItems: 'center', gap: 16,
              cursor: 'pointer', transition: 'background 0.12s',
              background: isUnread ? '#f0fdf9' : 'transparent',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#faf9f7')}
            onMouseLeave={e => (e.currentTarget.style.background = isUnread ? '#f0fdf9' : 'transparent')}
          >
            {/* Avatar */}
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
              {conv.employer.firstName[0]}{conv.employer.lastName[0]}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontWeight: 700, color: '#0f1923', margin: 0, fontSize: 15 }}>
                  {conv.employer.firstName} {conv.employer.lastName}
                </p>
                <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                  {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString('pl-PL') : ''}
                </span>
              </div>
              {conv.application && (
                <p style={{ fontSize: 12, color: '#7dd3b0', fontWeight: 600, margin: '0 0 4px' }}>
                  {conv.application.jobOffer.title}
                </p>
              )}
              {lastMsg && (
                <p style={{ fontSize: 13, color: isUnread ? '#0f1923' : '#9ca3af', margin: 0, fontWeight: isUnread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lastMsg.sender.id === myId ? 'Ty: ' : ''}{lastMsg.content}
                </p>
              )}
            </div>

            {isUnread && (
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7dd3b0', flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CandidateDashboard = () => {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myId, setMyId] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savedOffers, setSavedOffers] = useState<JobOffer[]>([]);
  const [sortKey, setSortKey] = useState<'newest' | 'oldest' | 'salary' | 'alpha'>('newest');
  const [reportOfferId, setReportOfferId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: 'offers' | 'messages' | 'history' | 'saved' =
    rawTab === 'messages' ? 'messages'
    : rawTab === 'history' ? 'history'
    : rawTab === 'saved' ? 'saved'
    : 'offers';

  const setTab = (tab: 'offers' | 'messages' | 'history' | 'saved') => {
    if (tab === 'offers') setSearchParams({});
    else setSearchParams({ tab });
  };

  const fetchOffers = async (title?: string, location?: string, categoryId?: string, skill?: string, seniority?: string) => {
    setLoadingOffers(true);
    try {
      const params: Record<string, string | undefined> = { title, location };
      if (categoryId) params.categoryId = categoryId;
      if (skill) params.skill = skill;
      if (seniority) params.seniority = seniority;
      const response = await axios.get('http://localhost:3000/job-offers/search', { params });
      setOffers(Array.isArray(response.data) ? response.data : []);
    } catch { setOffers([]); }
    finally { setLoadingOffers(false); }
  };

  const fetchSaved = async () => {
    if (!token) return;
    try {
      const [idsRes, offersRes] = await Promise.all([
        axios.get('http://localhost:3000/job-offers/saved-ids', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/job-offers/saved', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setSavedIds(new Set(Array.isArray(idsRes.data) ? idsRes.data : []));
      setSavedOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
    } catch { /* ignore */ }
  };

  const handleSaveToggle = async (offerId: number) => {
    if (!token) return;
    const wasSaved = savedIds.has(offerId);
    // optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      wasSaved ? next.delete(offerId) : next.add(offerId);
      return next;
    });
    if (wasSaved) {
      setSavedOffers(prev => prev.filter(o => o.id !== offerId));
    } else {
      const offer = offers.find(o => o.id === offerId);
      if (offer) setSavedOffers(prev => [offer, ...prev.filter(o => o.id !== offerId)]);
    }
    try {
      await axios.post(
        `http://localhost:3000/job-offers/save/${offerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      fetchSaved(); // revert on error
    }
  };

  useEffect(() => {
    fetchOffers();
    axios.get('http://localhost:3000/job-offers/search').then(r => { if (Array.isArray(r.data)) setTotalOffers(r.data.length); }).catch(() => {});
    axios.get('http://localhost:3000/job-offers/categories').then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setMyId(payload.sub);
      axios.get('http://localhost:3000/messages/unread-count', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUnreadCount(r.data.count ?? 0)).catch(() => {});
      fetchSaved();
    }
  }, []);

  const sortOptions = [
    { value: 'newest', label: 'Od najnowszych' },
    { value: 'oldest', label: 'Od najstarszych' },
    { value: 'salary', label: 'Najwyższe wynagrodzenie' },
    { value: 'alpha',  label: 'Alfabetycznie (A–Z)' },
  ] as const;

  const sortedOffers = [...offers].sort((a, b) => {
    switch (sortKey) {
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'salary': return (b.salaryMax ?? b.salaryMin ?? -1) - (a.salaryMax ?? a.salaryMin ?? -1);
      case 'alpha':  return a.title.localeCompare(b.title, 'pl');
    }
  });

  const openReport = (offerId: number) => {
    setReportOfferId(offerId);
    setReportReason('');
    setReportDesc('');
    setReportDone(false);
  };

  const closeReport = () => {
    setReportOfferId(null);
    setReportReason('');
    setReportDesc('');
    setReportDone(false);
  };

  const submitReport = async () => {
    if (!reportReason || !token || !reportOfferId) return;
    setReportSending(true);
    try {
      await axios.post(
        `http://localhost:3000/job-offers/${reportOfferId}/report`,
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

  const handleApply = (offerId: number) => {
    navigate(`/oferta/${offerId}`);
  };

  const REPORT_REASONS = [
    'Podejrzana oferta',
    'Fałszywe informacje',
    'Nieodpowiednie treści',
    'Duplikat ogłoszenia',
    'Błędne dane kontaktowe',
    'Inne',
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      {/* MODAL ZGŁOSZENIA */}
      {reportOfferId !== null && (
        <div
          onClick={closeReport}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,25,35,0.55)', backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 20, padding: '32px',
              width: '100%', maxWidth: 460,
              boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            }}
          >
            {reportDone ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f1923', margin: '0 0 8px' }}>
                  Zgłoszenie wysłane
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
                  Dziękujemy. Administrator sprawdzi ofertę i podejmie odpowiednie działania.
                </p>
                <button
                  onClick={closeReport}
                  style={{
                    background: '#0f1923', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '11px 28px',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Zamknij
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f1923', margin: '0 0 4px' }}>
                      Zgłoś ofertę
                    </h3>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                      Pomóż nam utrzymać jakość ogłoszeń
                    </p>
                  </div>
                  <button
                    onClick={closeReport}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Powód zgłoszenia *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {REPORT_REASONS.map(reason => (
                      <label
                        key={reason}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                          border: `1.5px solid ${reportReason === reason ? '#ef4444' : '#e8e5df'}`,
                          background: reportReason === reason ? '#fff5f5' : '#faf9f7',
                          transition: 'all 0.12s',
                        }}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          checked={reportReason === reason}
                          onChange={() => setReportReason(reason)}
                          style={{ accentColor: '#ef4444' }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Dodatkowy opis (opcjonalnie)
                  </label>
                  <textarea
                    value={reportDesc}
                    onChange={e => setReportDesc(e.target.value)}
                    placeholder="Opisz dokładniej co jest nie tak z tą ofertą…"
                    rows={3}
                    maxLength={500}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      border: '1.5px solid #e8e5df', background: '#faf9f7',
                      fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none',
                      boxSizing: 'border-box', color: '#374151',
                    }}
                  />
                  <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right', margin: '4px 0 0' }}>
                    {reportDesc.length}/500
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={closeReport}
                    style={{
                      padding: '10px 20px', borderRadius: 10,
                      border: '1px solid #e8e5df', background: 'transparent',
                      color: '#6b7280', fontWeight: 600, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={submitReport}
                    disabled={!reportReason || reportSending}
                    style={{
                      padding: '10px 24px', borderRadius: 10, border: 'none',
                      background: reportReason && !reportSending ? '#ef4444' : '#f1f5f9',
                      color: reportReason && !reportSending ? '#fff' : '#9ca3af',
                      fontWeight: 700, fontSize: 14,
                      cursor: reportReason && !reportSending ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {reportSending ? 'Wysyłanie…' : 'Wyślij zgłoszenie'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{ background: '#0f1923', color: '#fff', padding: '48px 0 0' }}>
        <div style={{ width: '100%', padding: '0 32px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 12 }}>
            WorkPortal — Twoja platforma kariery
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Znajdź pracę,<br />
            <span style={{ color: '#7dd3b0' }}>która Cię nakręca.</span>
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', margin: '0 0 32px', maxWidth: 480 }}>
            {totalOffers} aktywnych ofert od sprawdzonych pracodawców.
          </p>

          {/* TABS */}
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {([
              { key: 'offers', label: 'Oferty pracy' },
              { key: 'saved', label: `Zapisane${savedIds.size > 0 ? ` (${savedIds.size})` : ''}` },
              { key: 'history', label: 'Historia aplikacji' },
              { key: 'messages', label: `Wiadomości${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                style={{
                  padding: '12px 24px', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0',
                  fontWeight: 600, fontSize: 14, transition: 'all 0.15s', fontFamily: 'inherit',
                  background: activeTab === tab.key ? '#f8f7f4' : 'transparent',
                  color: activeTab === tab.key ? '#0f1923' : (tab.key === 'messages' && unreadCount > 0 ? '#7dd3b0' : '#64748b'),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ width: '100%', padding: '40px 32px' }}>

        {activeTab === 'offers' && (
          <div className="rwd-sidebar-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
            {/* SIDEBAR */}
            <aside style={{ position: 'sticky', top: 24 }}>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 16 }}>Filtruj oferty</p>
                <SearchBar
                  categories={categories}
                  onSearch={(title, location, categoryId, skill, seniority) => fetchOffers(title, location, categoryId, skill, seniority)}
                />
              </div>
            </aside>

            {/* OFFERS */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1923', margin: 0 }}>Dostępne oferty</h2>
                  <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                    {loadingOffers ? 'Ładowanie...' : `Znaleziono ${offers.length} ofert`}
                  </p>
                </div>
                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value as typeof sortKey)}
                  style={{
                    padding: '8px 12px', borderRadius: 8,
                    border: '1.5px solid #e8e5df', background: '#fff',
                    fontSize: 13, fontWeight: 600, color: '#374151',
                    cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                  }}
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {loadingOffers && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: 12 }}>
                  <div style={{ width: 36, height: 36, border: '3px solid #e8e5df', borderTopColor: '#0f1923', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Ładowanie ofert...</p>
                </div>
              )}

              {!loadingOffers && offers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: 16, border: '2px dashed #e8e5df' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Brak wyników</p>
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Spróbuj zmienić filtry lub poczekaj na nowe ogłoszenia.</p>
                </div>
              )}

              {!loadingOffers && offers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sortedOffers.map(offer => (
                    <JobOfferCard
                      key={offer.id}
                      offer={offer}
                      onActionClick={handleApply}
                      isSaved={savedIds.has(offer.id)}
                      onSaveToggle={token ? handleSaveToggle : undefined}
                      onReport={token ? openReport : undefined}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={{ maxWidth: 860 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1923', margin: 0 }}>Zapisane oferty</h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                Oferty oznaczone gwiazdką — wróć do nich w dowolnej chwili
              </p>
            </div>

            {savedOffers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: 16, border: '2px dashed #e8e5df' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Brak zapisanych ofert</p>
                <p style={{ color: '#9ca3af', fontSize: 14 }}>
                  Kliknij gwiazdkę ☆ na dowolnej ofercie, żeby ją tutaj zapisać.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {savedOffers.map(offer => (
                  <JobOfferCard
                    key={offer.id}
                    offer={offer}
                    onActionClick={handleApply}
                    isSaved={true}
                    onSaveToggle={handleSaveToggle}
                    onReport={openReport}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && token && (
          <div style={{ maxWidth: 960 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1923', margin: 0 }}>Historia aplikacji</h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Lista ofert, na które aplikowałeś</p>
            </div>
            <ApplicationHistoryTab token={token} />
          </div>
        )}

        {activeTab === 'messages' && token && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1923', margin: 0 }}>Wiadomości</h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Konwersacje z pracodawcami</p>
            </div>
            <MessagesTab token={token} myId={myId} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
