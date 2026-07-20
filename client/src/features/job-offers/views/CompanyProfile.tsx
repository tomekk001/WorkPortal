import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { Header } from '../../auth/Header';
import { API_URL } from '../../../api/axios';

interface CompanyProfileData {
  companyName: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
  nip: string | null;
  companyEmail: string | null;
}

export const CompanyProfile = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [nip, setNip] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '', description: '', website: '', location: '', companyEmail: '',
  });

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_URL}/job-offers/company-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const data: CompanyProfileData | null = res.data;
      if (data) {
        setFormData({
          companyName: data.companyName ?? '',
          description: data.description ?? '',
          website: data.website ?? '',
          location: data.location ?? '',
          companyEmail: data.companyEmail ?? '',
        });
        setLogoUrl(data.logoUrl ?? null);
        setNip(data.nip ?? null);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/job-offers/company-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || t('companyProfile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await axios.post(`${API_URL}/job-offers/company-profile/logo`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setLogoUrl(res.data.logoUrl);
    } catch (error: any) {
      alert(error.response?.data?.message || t('companyProfile.logoUploadError'));
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      <div style={{ background: '#0f1923', padding: '40px 0 48px' }}>
        <div style={{ width: '100%', padding: '0 32px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 10 }}>
            {t('companyProfile.eyebrow')}
          </p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            {t('header.companyProfile')}
          </h1>
        </div>
      </div>

      <div style={{ width: '100%', padding: '40px 32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', background: '#fff', borderRadius: 20, border: '1px solid #e8e5df', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* LOGO */}
              <div>
                <label style={labelStyle}>{t('companyProfile.logo')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 14, background: '#f9f8f6', border: '1.5px solid #e8e5df', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {logoUrl ? (
                      <img src={`${API_URL}${logoUrl}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 24, color: '#d1d5db' }}>🏢</span>
                    )}
                  </div>
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} id="logo-input" />
                    <label
                      htmlFor="logo-input"
                      style={{ display: 'inline-block', padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e8e5df', background: '#f9f8f6', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                    >
                      {uploadingLogo ? t('companyProfile.uploading') : logoUrl ? t('companyProfile.changeLogo') : t('companyProfile.uploadLogo')}
                    </label>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '8px 0 0' }}>PNG/JPG, max 3MB</p>
                  </div>
                </div>
              </div>

              {/* NAZWA */}
              <div>
                <label style={labelStyle}>{t('companyProfile.companyName')}</label>
                <input required value={formData.companyName} onChange={set('companyName')} placeholder={t('companyProfile.companyNamePlaceholder')} style={inputStyle} onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)} onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
              </div>

              {/* NIP (readonly) + E-MAIL FIRMOWY */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}>NIP</label>
                  {nip ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#f9f8f6', border: '1.5px solid #e8e5df', borderRadius: 10 }}>
                      <span style={{ fontSize: 15, color: '#0f1923', fontWeight: 600 }}>{nip}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0a7a5a', background: 'rgba(125,211,176,0.15)', padding: '2px 8px', borderRadius: 20 }}>✓ {t('companyProfile.verified')}</span>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{t('companyProfile.noNip')}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>{t('register.companyEmail')}</label>
                  <input type="email" value={formData.companyEmail} onChange={set('companyEmail')} placeholder="kontakt@twojafirma.pl" style={inputStyle} onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)} onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
                </div>
              </div>

              {/* LOKALIZACJA + STRONA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}>{t('common.location')}</label>
                  <input value={formData.location} onChange={set('location')} placeholder={t('companyProfile.locationPlaceholder')} style={inputStyle} onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)} onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
                </div>
                <div>
                  <label style={labelStyle}>{t('companyProfile.website')}</label>
                  <input value={formData.website} onChange={set('website')} placeholder="https://…" style={inputStyle} onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)} onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
                </div>
              </div>

              {/* OPIS */}
              <div>
                <label style={labelStyle}>{t('companyProfile.description')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9ca3af' }}>({t('companyProfile.descriptionHint')})</span></label>
                <textarea rows={6} value={formData.description} onChange={set('description')} placeholder={t('companyProfile.descriptionPlaceholder')} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => Object.assign(e.currentTarget.style, { ...inputFocusStyle, resize: 'vertical', lineHeight: '1.6' })} onBlur={e => Object.assign(e.currentTarget.style, { ...inputStyle, resize: 'vertical', lineHeight: '1.6' })} />
              </div>
            </div>

            <div style={{ padding: '20px 40px', borderTop: '1px solid #f0ece6', background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => navigate('/')} style={{ padding: '11px 24px', borderRadius: 10, border: '1px solid #e2ddd6', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={saving} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: saving ? 'rgba(125,211,176,0.5)' : '#7dd3b0', color: '#0f1923', fontWeight: 800, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {saving ? t('common.saving') : t('common.saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: '#6b7280', marginBottom: 8,
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: '#f9f8f6', border: '1.5px solid #e8e5df',
  borderRadius: 10, color: '#0f1923',
  fontSize: 15, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s, background 0.15s',
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle, background: '#fff', border: '1.5px solid #7dd3b0',
};
