import { useState, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const FREE_EMAIL_DOMAINS = ['gmail.com', 'wp.pl', 'o2.pl', 'interia.pl', 'onet.pl', 'yahoo.com', 'outlook.com', 'hotmail.com'];

type NipStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export const RegisterForm = () => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE');
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [nipStatus, setNipStatus] = useState<NipStatus>('idle');
  const [nipMessage, setNipMessage] = useState('');
  const [nipCompanyInfo, setNipCompanyInfo] = useState<{ name: string; address?: string } | null>(null);
  const nipCheckSeq = useRef(0);

  const navigate = useNavigate();

  const companyEmailDomain = companyEmail.split('@')[1]?.toLowerCase();
  const companyEmailIsFree = companyEmailDomain && FREE_EMAIL_DOMAINS.includes(companyEmailDomain);

  const checkNip = async (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length !== 10) {
      setNipStatus('idle');
      setNipMessage(digits.length > 0 ? t('register.nipLength') : '');
      setNipCompanyInfo(null);
      return;
    }
    const seq = ++nipCheckSeq.current;
    setNipStatus('checking');
    setNipMessage('');
    try {
      const res = await axios.get(`http://localhost:3000/auth/verify-nip/${digits}`);
      if (seq !== nipCheckSeq.current) return; // nowszy request w toku — ignoruj wynik
      if (res.data.valid) {
        setNipStatus('valid');
        setNipCompanyInfo({ name: res.data.name, address: res.data.address });
        setCompanyName(prev => prev.trim() ? prev : res.data.name);
      } else {
        setNipStatus('invalid');
        setNipMessage(res.data.message || t('register.nipInvalid'));
        setNipCompanyInfo(null);
      }
    } catch {
      if (seq !== nipCheckSeq.current) return;
      setNipStatus('invalid');
      setNipMessage(t('register.nipCheckFailed'));
      setNipCompanyInfo(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Pracodawca ma tylko jeden adres e-mail (firmowy) — służy zarówno do
      // logowania, jak i jako kontakt firmy, więc musi zostać przez niego zweryfikowany.
      const accountEmail = role === 'EMPLOYER' ? companyEmail : email;
      await axios.post('http://localhost:3000/auth/register', {
        firstName, lastName, email: accountEmail, password, role,
        ...(role === 'EMPLOYER' && { companyName, nip: nip.replace(/[^0-9]/g, ''), companyEmail }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = loading || (role === 'EMPLOYER' && nipStatus !== 'valid');

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
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
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
        <div style={{ width: '100%', maxWidth: 460 }}>

          {success ? (
            /* SUCCESS STATE */
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20, padding: '48px 32px',
              textAlign: 'center',
              boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(125,211,176,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 20px',
              }}>✓</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                {t('register.successTitle')}
              </h2>
              <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 32px' }}>
                {role === 'EMPLOYER' ? t('register.successSubtitleEmployer') : t('register.successSubtitle')}
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: '#7dd3b0', color: '#0f1923',
                  border: 'none', borderRadius: 10,
                  padding: '14px 32px', fontWeight: 800, fontSize: 15,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {t('register.goToLogin')}
              </button>
            </div>
          ) : (
            <>
              {/* HEADING */}
              <div style={{ marginBottom: 32 }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                  color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 10,
                }}>{t('register.newAccount')}</p>
                <h1 style={{
                  fontSize: 32, fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.02em', margin: 0,
                }}>{t('register.title')}</h1>
                <p style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>
                  {t('register.haveAccount')}{' '}
                  <Link to="/login" style={{ color: '#7dd3b0', fontWeight: 600, textDecoration: 'none' }}>
                    {t('login.submitPlain')}
                  </Link>
                </p>
              </div>

              {/* CARD */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 20, padding: '32px',
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

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* ROLE SELECTOR */}
                  <div>
                    <label style={labelStyle}>{t('register.iAm')}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {([
                        { value: 'CANDIDATE', icon: '🎯', label: t('register.candidate'), sub: t('register.candidateSub') },
                        { value: 'EMPLOYER',  icon: '🏢', label: t('register.employer'), sub: t('register.employerSub') },
                      ] as const).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRole(opt.value)}
                          style={{
                            padding: '14px 12px',
                            borderRadius: 10,
                            border: role === opt.value
                              ? '1.5px solid rgba(125,211,176,0.6)'
                              : '1.5px solid rgba(255,255,255,0.08)',
                            background: role === opt.value
                              ? 'rgba(125,211,176,0.1)'
                              : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                            fontFamily: 'inherit',
                          }}
                        >
                          <div style={{ fontSize: 18, marginBottom: 4 }}>{opt.icon}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: role === opt.value ? '#7dd3b0' : '#cbd5e1' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NAME ROW */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>{t('register.firstName')}</label>
                      <input
                        type="text" required
                        value={firstName} onChange={e => setFirstName(e.target.value)}
                        placeholder="John"
                        style={inputStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                        onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('register.lastName')}</label>
                      <input
                        type="text" required
                        value={lastName} onChange={e => setLastName(e.target.value)}
                        placeholder="Smith"
                        style={inputStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                        onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                      />
                    </div>
                  </div>

                  {/* COMPANY (employer only) */}
                  {role === 'EMPLOYER' && (
                    <>
                      <div>
                        <label style={labelStyle}>{t('register.nip')}</label>
                        <input
                          type="text" required inputMode="numeric" maxLength={10}
                          value={nip}
                          onChange={e => setNip(e.target.value.replace(/[^0-9]/g, ''))}
                          onBlur={e => checkNip(e.target.value)}
                          placeholder="e.g. 5260250995"
                          style={{
                            ...inputStyle,
                            border: nipStatus === 'valid' ? '1px solid rgba(125,211,176,0.6)'
                              : nipStatus === 'invalid' ? '1px solid rgba(248,113,113,0.5)'
                              : inputStyle.border,
                          }}
                          onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                        />
                        {nipStatus === 'checking' && (
                          <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>{t('register.nipChecking')}</p>
                        )}
                        {nipStatus === 'valid' && nipCompanyInfo && (
                          <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(125,211,176,0.1)', border: '1px solid rgba(125,211,176,0.25)' }}>
                            <p style={{ fontSize: 12, color: '#7dd3b0', fontWeight: 700, margin: 0 }}>✓ {t('register.nipVerified', { name: nipCompanyInfo.name })}</p>
                            {nipCompanyInfo.address && (
                              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{nipCompanyInfo.address}</p>
                            )}
                          </div>
                        )}
                        {nipStatus === 'invalid' && nipMessage && (
                          <p style={{ fontSize: 12, color: '#fca5a5', margin: '6px 0 0' }}>{nipMessage}</p>
                        )}
                      </div>

                      <div>
                        <label style={labelStyle}>{t('register.companyName')}</label>
                        <input
                          type="text" required
                          value={companyName} onChange={e => setCompanyName(e.target.value)}
                          placeholder="Acme Inc."
                          style={inputStyle}
                          onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>{t('register.companyEmail')}</label>
                        <input
                          type="email" required
                          value={companyEmail} onChange={e => setCompanyEmail(e.target.value)}
                          placeholder="contact@yourcompany.com"
                          style={inputStyle}
                          onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        />
                        <p style={{ fontSize: 12, color: '#64748b', margin: '6px 0 0' }}>
                          {t('register.companyEmailHint')}
                        </p>
                        {companyEmailIsFree && (
                          <p style={{ fontSize: 12, color: '#fbbf24', margin: '6px 0 0' }}>
                            {t('register.freeEmailWarning')}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {role !== 'EMPLOYER' && (
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
                  )}

                  <div>
                    <label style={labelStyle}>{t('login.password')}</label>
                    <input
                      type="password" required minLength={6}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={t('register.passwordPlaceholder')}
                      style={inputStyle}
                      onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitDisabled}
                    style={{
                      marginTop: 8,
                      background: submitDisabled ? 'rgba(125,211,176,0.5)' : '#7dd3b0',
                      color: '#0f1923',
                      border: 'none', borderRadius: 10,
                      padding: '14px', fontWeight: 800, fontSize: 15,
                      cursor: submitDisabled ? 'not-allowed' : 'pointer',
                      transition: 'opacity 0.15s',
                      fontFamily: 'inherit', letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={e => { if (!submitDisabled) e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {loading ? t('register.creating') : role === 'EMPLOYER' && nipStatus !== 'valid' ? t('register.verifyNipFirst') : t('register.submit')}
                  </button>
                </form>
              </div>
            </>
          )}
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
