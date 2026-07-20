import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../api/axios';

export const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await axios.post(`${API_URL}/newsletter/subscribe`, { email });
      setStatus('done');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || t('footer.subscribeError'));
    }
  };

  return (
    <footer style={{ background: '#0f1923', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 48, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <div style={{ width: '100%', padding: '40px 32px', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between' }}>

        {/* NEWSLETTER */}
        <div style={{ maxWidth: 360 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{t('footer.newsletterTitle')}</p>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px' }}>{t('footer.newsletterSubtitle')}</p>
          {status === 'done' ? (
            <p style={{ fontSize: 13, color: '#7dd3b0', fontWeight: 600, margin: 0 }}>✓ {t('footer.subscribed')}</p>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                  color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: '#7dd3b0', color: '#0f1923', fontWeight: 700, fontSize: 13,
                  cursor: status === 'sending' ? 'default' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                {status === 'sending' ? '…' : t('common.save')}
              </button>
            </form>
          )}
          {status === 'error' && <p style={{ fontSize: 12, color: '#f87171', margin: '8px 0 0' }}>{errorMsg}</p>}
        </div>

        {/* LINKS */}
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>{t('footer.information')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/p/o-nas" style={footerLinkStyle}>{t('footer.about')}</Link>
              <Link to="/p/regulamin" style={footerLinkStyle}>{t('footer.terms')}</Link>
              <Link to="/p/polityka-prywatnosci" style={footerLinkStyle}>{t('footer.privacyPolicy')}</Link>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>{t('footer.support')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/kontakt" style={footerLinkStyle}>{t('footer.contact')}</Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px' }}>
        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>© {new Date().getFullYear()} WorkPortal</p>
      </div>
    </footer>
  );
};

const footerLinkStyle: React.CSSProperties = {
  fontSize: 13, color: '#94a3b8', textDecoration: 'none',
};
