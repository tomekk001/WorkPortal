import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '../../api/axios';

export const LoginForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { access_token, role } = response.data;
      login(access_token, role);
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1923',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      {/* TOP BAR */}
      <div style={{ padding: '20px 32px' }}>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 32, height: 32, background: '#7dd3b0', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: '#0f1923',
          }}>WP</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Work<span style={{ color: '#7dd3b0' }}>Portal</span>
          </span>
        </Link>
      </div>

      {/* MAIN */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 16px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* HEADING */}
          <div style={{ marginBottom: 32 }}>
            <p style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
              color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 10,
            }}>{t('login.welcomeBack')}</p>
            <h1 style={{
              fontSize: 32, fontWeight: 800, color: '#fff',
              letterSpacing: '-0.02em', margin: 0,
            }}>{t('login.title')}</h1>
            <p style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>
              {t('login.noAccount')}{' '}
              <Link to="/register" style={{ color: '#7dd3b0', fontWeight: 600, textDecoration: 'none' }}>
                {t('login.registerLink')}
              </Link>
            </p>
          </div>

          {/* CARD */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20,
            padding: '32px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
          }}>
            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 10, padding: '12px 16px',
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <p style={{ color: '#fca5a5', fontSize: 14, margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>{t('common.email')}</label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>

              <div>
                <label style={labelStyle}>{t('login.password')}</label>
                <input
                  type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>

              <Link to="/forgot-password" style={{ alignSelf: 'flex-end', fontSize: 13, color: '#7dd3b0', fontWeight: 600, textDecoration: 'none' }}>
                {t('login.forgotPassword')}
              </Link>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  background: loading ? 'rgba(125,211,176,0.5)' : '#7dd3b0',
                  color: '#0f1923',
                  border: 'none', borderRadius: 10,
                  padding: '14px', fontWeight: 800, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                  fontFamily: 'inherit', letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {loading ? t('login.loggingIn') : t('login.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#94a3b8', marginBottom: 8, letterSpacing: '0.01em',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, color: '#fff',
  fontSize: 15, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s, background 0.15s',
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  background: 'rgba(125,211,176,0.07)',
  border: '1px solid rgba(125,211,176,0.4)',
};
