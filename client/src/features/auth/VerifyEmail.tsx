import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../api/axios';

export const VerifyEmail = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const requested = useRef(false);

  useEffect(() => {
    if (!token) { setStatus('error'); setError(t('verifyEmail.noToken')); return; }
    if (requested.current) return;
    requested.current = true;
    axios.post(`${API_URL}/auth/verify-email`, { token })
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setError(err.response?.data?.message || t('verifyEmail.error'));
      });
  }, [token, t]);

  return (
    <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <div style={{ padding: '20px 32px' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: '#7dd3b0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#0f1923' }}>WP</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Work<span style={{ color: '#7dd3b0' }}>Portal</span></span>
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 10 }}>{t('verifyEmail.eyebrow')}</p>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>{t('verifyEmail.title')}</h1>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 32, boxShadow: '0 24px 48px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            {status === 'verifying' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#7dd3b0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>{t('verifyEmail.verifying')}</p>
              </div>
            )}
            {status === 'success' && (
              <>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>{t('verifyEmail.success')}</p>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 20px' }}>{t('verifyEmail.successDetail')}</p>
                <button
                  onClick={() => navigate('/login')}
                  style={{ background: '#7dd3b0', color: '#0f1923', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {t('resetPassword.goToLogin')}
                </button>
              </>
            )}
            {status === 'error' && (
              <>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>{t('verifyEmail.failed')}</p>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>{error}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
