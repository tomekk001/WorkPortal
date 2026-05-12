import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { SearchBar } from '../components/SearchBar';
import { JobOfferCard, type JobOffer } from '../components/JobOfferCard';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../../auth/Header';

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px 130px', gap: 0, padding: '12px 24px', borderBottom: '1px solid #f0ece6', background: '#faf9f7' }}>
        {['Oferta', 'Firma', 'Data wysłania', 'Status'].map(h => (
          <span key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af' }}>{h}</span>
        ))}
      </div>

      {applications.map((app, i) => {
        const { bg, color } = STATUS_COLORS[app.status];
        return (
          <div
            key={app.id}
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

  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: 'offers' | 'messages' | 'history' =
    rawTab === 'messages' ? 'messages' : rawTab === 'history' ? 'history' : 'offers';

  const setTab = (tab: 'offers' | 'messages' | 'history') => {
    if (tab === 'offers') setSearchParams({});
    else setSearchParams({ tab });
  };

  const fetchOffers = async (title?: string, location?: string, categoryId?: string) => {
    setLoadingOffers(true);
    try {
      const params: Record<string, string | undefined> = { title, location };
      if (categoryId) params.categoryId = categoryId;
      const response = await axios.get('http://localhost:3000/job-offers/search', { params });
      setOffers(Array.isArray(response.data) ? response.data : []);
    } catch { setOffers([]); }
    finally { setLoadingOffers(false); }
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
    }
  }, []);

  const handleApply = (offerId: number) => {
    if (!token) { alert('Musisz być zalogowany, aby aplikować.'); return; }
    navigate(`/apply/${offerId}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

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
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
            {/* SIDEBAR */}
            <aside style={{ position: 'sticky', top: 24 }}>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 16 }}>Filtruj oferty</p>
                <SearchBar
                  categories={categories}
                  onSearch={(title, location, categoryId) => fetchOffers(title, location, categoryId)}
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
                  {offers.map(offer => (
                    <JobOfferCard key={offer.id} offer={offer} onActionClick={handleApply} actionLabel="Aplikuj" />
                  ))}
                </div>
              )}
            </section>
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
    </div>
  );
};
