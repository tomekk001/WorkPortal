import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';

export const Header = () => {
  const { t } = useTranslation();
  const { logout, role, token } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const roleLabel = role === 'EMPLOYER' ? t('header.roleEmployer') : t('header.roleCandidate');
  const roleInitial = role === 'EMPLOYER' ? t('header.roleEmployerInitial') : t('header.roleCandidateInitial');
  const roleColor = role === 'EMPLOYER' ? '#7dd3b0' : '#60a5fa';

  // Zamknij menu po kliknięciu poza nim
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Polling powiadomień co 30 sekund
  useEffect(() => {
    if (!token) return;
    const fetchUnread = async () => {
      try {
        const res = await axios.get('http://localhost:3000/messages/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.count ?? 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <header style={{
      background: '#0f1923',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <div className="rwd-header-inner" style={{
        width: '100%',
        padding: '0 32px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>

        {/* LOGO */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textDecoration: 'none' }}
        >
          <div style={{
            width: 32, height: 32,
            background: '#7dd3b0',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: '#0f1923',
            letterSpacing: '-0.03em',
            flexShrink: 0,
          }}>
            WP
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Work<span style={{ color: '#7dd3b0' }}>Portal</span>
          </span>
        </div>

        {/* NAV LINKS (tylko dla pracodawcy) */}
        {role === 'EMPLOYER' && (
          <nav className="rwd-hide-mobile" style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => navigate('/')}
              style={navBtnStyle}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
            >
              {t('header.myOffers')}
            </button>
            <button
              onClick={() => navigate('/add-offer')}
              style={{
                ...navBtnStyle,
                background: 'rgba(125,211,176,0.12)',
                color: '#7dd3b0',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(125,211,176,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(125,211,176,0.12)')}
            >
              + {t('header.newOffer')}
            </button>
          </nav>
        )}

        {/* JĘZYK */}
        <LanguageSwitcher />

        {/* NOTIFICATION BELL */}
        <button
          onClick={() => { navigate('/?tab=messages'); setUnreadCount(0); }}
          style={{
            position: 'relative', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            width: 40, height: 40, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          title={t('header.messages')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#f87171', color: '#fff',
              fontSize: 10, fontWeight: 800, lineHeight: 1,
              padding: '3px 5px', borderRadius: 20,
              minWidth: 16, textAlign: 'center',
              border: '2px solid #0f1923',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* USER MENU */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '6px 12px 6px 6px',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: roleColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, color: '#0f1923',
              flexShrink: 0,
            }}>
              {roleInitial}
            </div>
            <div className="rwd-hide-mobile" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                {roleLabel}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.2 }}>{t('header.myAccount')}</div>
            </div>
            {/* Chevron */}
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{ marginLeft: 2, transition: 'transform 0.15s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path d="M2 4L6 8L10 4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* DROPDOWN */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#1a2636',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: 6,
              minWidth: 180,
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              animation: 'fadeDown 0.12s ease',
            }}>
              <style>{`
                @keyframes fadeDown {
                  from { opacity: 0; transform: translateY(-6px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
              `}</style>

              {/* Info row */}
              <div style={{
                padding: '10px 12px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 6,
              }}>
                <div style={{
                  display: 'inline-block', fontSize: 11, fontWeight: 700,
                  background: role === 'EMPLOYER' ? 'rgba(125,211,176,0.15)' : 'rgba(96,165,250,0.15)',
                  color: roleColor, padding: '3px 10px', borderRadius: 20, marginBottom: 2,
                }}>
                  {roleLabel}
                </div>
              </div>

              {role === 'EMPLOYER' && (
                <DropdownItem
                  icon="📋"
                  label={t('header.myOffers')}
                  onClick={() => { navigate('/'); setMenuOpen(false); }}
                />
              )}
              {role === 'EMPLOYER' && (
                <DropdownItem
                  icon="🏢"
                  label={t('header.companyProfile')}
                  onClick={() => { navigate('/company-profile'); setMenuOpen(false); }}
                />
              )}
              <DropdownItem
                icon="➕"
                label={role === 'EMPLOYER' ? t('header.newOffer') : t('header.browseOffers')}
                onClick={() => { navigate(role === 'EMPLOYER' ? '/add-offer' : '/'); setMenuOpen(false); }}
              />

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 6, paddingTop: 6 }} />

              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#f87171',
                  transition: 'background 0.12s', fontFamily: 'inherit',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 14 }}>🚪</span>
                {t('header.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const navBtnStyle: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 8, border: 'none',
  background: 'transparent', cursor: 'pointer',
  fontSize: 13, fontWeight: 600, color: '#94a3b8',
  transition: 'all 0.15s', fontFamily: 'inherit',
};

const DropdownItem = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 8, border: 'none',
      background: 'transparent', cursor: 'pointer',
      fontSize: 13, fontWeight: 600, color: '#cbd5e1',
      transition: 'background 0.12s', fontFamily: 'inherit',
      textAlign: 'left',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    <span style={{ fontSize: 14 }}>{icon}</span>
    {label}
  </button>
);
