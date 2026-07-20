import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Header } from '../auth/Header';
import { API_URL } from '../../api/axios';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #e8e5df', borderRadius: 8,
  fontSize: 14, color: '#0f1923', background: '#f8f7f4',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: '#6b7280', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: 8,
};

export const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await axios.post(`${API_URL}/contact`, formData);
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('contactForm.sendError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      <div style={{ background: '#0f1923', padding: '40px 0 48px' }}>
        <div style={{ width: '100%', padding: '0 32px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 10 }}>{t('footer.support')}</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{t('footer.contact')}</h1>
          <p style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>{t('contactForm.subtitle')}</p>
        </div>
      </div>

      <div style={{ width: '100%', padding: '40px 32px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 20, border: '1px solid #e8e5df', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '36px 40px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f1923', margin: '0 0 8px' }}>{t('contactForm.sent')}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{t('contactForm.sentDetail')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>{t('employerDashboard.modal.fullName')} *</label>
                  <input required value={formData.name} onChange={set('name')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('common.email')} *</label>
                  <input required type="email" value={formData.email} onChange={set('email')} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t('contactForm.subject')} *</label>
                <input required value={formData.subject} onChange={set('subject')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('contactForm.message')} *</label>
                <textarea required rows={6} value={formData.message} onChange={set('message')} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={sending}
                style={{ alignSelf: 'flex-end', padding: '11px 28px', borderRadius: 10, border: 'none', background: sending ? 'rgba(125,211,176,0.5)' : '#7dd3b0', color: '#0f1923', fontWeight: 800, fontSize: 14, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {sending ? t('common.sending') : t('contactForm.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
