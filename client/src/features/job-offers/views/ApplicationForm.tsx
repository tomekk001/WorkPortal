import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Header } from '../../auth/Header';
import axios from 'axios';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e8e5df',
  borderRadius: 8,
  fontSize: 14,
  color: '#0f1923',
  background: '#f8f7f4',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, background 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 8,
};

const sectionStyle: React.CSSProperties = {
  borderBottom: '1px solid #f3f4f6',
  paddingBottom: 28,
  marginBottom: 28,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: '#0f1923',
  marginBottom: 20,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export const ApplicationForm = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const jobOfferId = jobId ? Number(jobId) : null;

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    startDate: '', expectedSalary: '',
    message: '', agreedToTerms: false,
  });

  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const toggleContract = (type: string) =>
    setContractTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const [files, setFiles] = useState<{ cv: File | null; additional: File | null }>({
    cv: null, additional: null,
  });

  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const viewCounted = useRef(false);
  useEffect(() => {
    if (!jobOfferId || viewCounted.current) return;
    viewCounted.current = true;
    axios.post(`http://localhost:3000/job-offers/${jobOfferId}/view`).catch(() => {});
  }, [jobOfferId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'message') {
      const truncated = value.slice(0, 500);
      setFormData({ ...formData, [name]: truncated });
      setMessageCount(truncated.length);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'cv' | 'additional') => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = fileType === 'cv' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`Plik jest za duży. Max. ${fileType === 'cv' ? '10 MB' : '5 MB'}`);
        return;
      }
      if (fileType === 'cv' && file.type !== 'application/pdf') {
        alert('CV musi być w formacie PDF');
        return;
      }
      setFiles({ ...files, [fileType]: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Wypełnij wszystkie wymagane pola.');
      return;
    }
    if (!formData.startDate || contractTypes.length === 0 || !formData.expectedSalary || !formData.agreedToTerms) {
      alert('Wypełnij wszystkie wymagane pola i zaakceptuj warunki.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('jobOfferId', String(jobOfferId));
      fd.append('firstName', formData.firstName);
      fd.append('lastName', formData.lastName);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('startDate', formData.startDate);
      fd.append('contractType', contractTypes.join(','));
      fd.append('expectedSalary', formData.expectedSalary);
      fd.append('message', formData.message);
      if (files.cv)         fd.append('cv', files.cv);
      if (files.additional) fd.append('additional', files.additional);

      await axios.post('http://localhost:3000/job-offers/submit-application', fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Aplikacja przesłana pomyślnie!');
      navigate('/');
    } catch (error: any) {
      alert(`Błąd: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!jobOfferId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#dc2626', fontSize: 16 }}>Błąd: Brak ID oferty</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      {/* HERO */}
      <div style={{ background: '#0f1923', padding: '40px 0 36px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px' }}>
          <Link to="/" style={{
            fontSize: 13, color: '#7dd3b0', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: 16, textDecoration: 'none'
          }}>
            ← Wróć do ogłoszeń
          </Link>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 8 }}>
            Formularz aplikacji
          </p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Aplikuj na stanowisko
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
            Wypełnij formularz, aby przesłać swoją kandydaturę do pracodawcy.
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={{ maxWidth: 760, margin: '32px auto', padding: '0 32px 64px' }}>
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #e8e5df',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <form onSubmit={handleSubmit} style={{ padding: '36px 40px' }}>

            {/* DANE OSOBOWE */}
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>
                <span style={{ background: '#0f1923', color: '#7dd3b0', borderRadius: 6, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>1</span>
                Dane osobowe
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { name: 'firstName', label: 'Imię *', placeholder: 'Twoje imię', type: 'text' },
                  { name: 'lastName', label: 'Nazwisko *', placeholder: 'Twoje nazwisko', type: 'text' },
                  { name: 'email', label: 'Email *', placeholder: 'adres@email.com', type: 'email' },
                  { name: 'phone', label: 'Telefon *', placeholder: '+48 123 456 789', type: 'tel' },
                ].map(field => (
                  <div key={field.name}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      required
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = '#0f1923'; e.target.style.background = '#fff'; }}
                      onBlur={e => { e.target.style.borderColor = '#e8e5df'; e.target.style.background = '#f8f7f4'; }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* DOKUMENTY */}
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>
                <span style={{ background: '#0f1923', color: '#7dd3b0', borderRadius: 6, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>2</span>
                Dokumenty
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'cv' as const, label: 'CV (PDF, max. 10 MB) *', accept: '.pdf' },
                  { key: 'additional' as const, label: 'Dodatkowy plik (max. 5 MB)', accept: '*' },
                ].map(({ key, label, accept }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <input type="file" accept={accept} onChange={e => handleFileChange(e, key)} style={{ display: 'none' }} />
                      <div style={{
                        padding: '16px', borderRadius: 8, textAlign: 'center',
                        border: `2px dashed ${files[key] ? '#7dd3b0' : '#e8e5df'}`,
                        background: files[key] ? '#f0fdf4' : '#f8f7f4',
                        transition: 'all 0.15s',
                      }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: files[key] ? '#166534' : '#6b7280', margin: 0 }}>
                          {files[key] ? `✓ ${files[key]!.name}` : 'Kliknij aby wybrać plik'}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* WARUNKI PRACY */}
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>
                <span style={{ background: '#0f1923', color: '#7dd3b0', borderRadius: 6, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>3</span>
                Warunki pracy
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <label style={labelStyle}>Termin rozpoczęcia *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { value: 'immediately', label: 'Od zaraz' },
                      { value: '2weeks', label: '2 tygodnie' },
                      { value: '1month', label: '1 miesiąc' },
                      { value: '3months', label: '3 miesiące' },
                      { value: 'more3months', label: 'Powyżej 3 miesięcy' },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="radio" name="startDate" value={opt.value}
                          checked={formData.startDate === opt.value}
                          onChange={handleInputChange} required
                          style={{ width: 16, height: 16, accentColor: '#0f1923' }}
                        />
                        <span style={{ fontSize: 14, color: '#374151' }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Forma współpracy *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { value: 'UOP', label: 'Umowa o pracę', sub: 'UOP' },
                      { value: 'UZ',  label: 'Umowa zlecenie', sub: 'UZ' },
                      { value: 'B2B', label: 'Kontrakt', sub: 'B2B' },
                    ].map(opt => {
                      const checked = contractTypes.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleContract(opt.value)}
                          style={{
                            padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                            border: checked ? '1.5px solid #0f1923' : '1.5px solid #e8e5df',
                            background: checked ? 'rgba(15,25,35,0.06)' : '#f8f7f4',
                            textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f1923' }}>{opt.sub}</span>
                            <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{opt.label}</span>
                          </div>
                          {checked && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#0f1923', background: '#e2e8f0', padding: '2px 8px', borderRadius: 4 }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* OCZEKIWANIA FINANSOWE */}
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>
                <span style={{ background: '#0f1923', color: '#7dd3b0', borderRadius: 6, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>4</span>
                Oczekiwania finansowe
              </p>
              <div style={{ maxWidth: 280 }}>
                <label style={labelStyle}>Oczekiwane wynagrodzenie brutto (PLN/mies.) *</label>
                <input
                  type="number" name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  placeholder="np. 15 000"
                  required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#0f1923'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e8e5df'; e.target.style.background = '#f8f7f4'; }}
                />
              </div>
            </div>

            {/* WIADOMOŚĆ */}
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>
                <span style={{ background: '#0f1923', color: '#7dd3b0', borderRadius: 6, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>5</span>
                Wiadomość do pracodawcy
              </p>
              <textarea
                name="message" value={formData.message}
                onChange={handleInputChange}
                placeholder="Napisz coś o sobie, swoim doświadczeniu lub dlaczego chcesz pracować w tej firmie..."
                rows={5}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                onFocus={e => { e.target.style.borderColor = '#0f1923'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e8e5df'; e.target.style.background = '#f8f7f4'; }}
              />
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, textAlign: 'right' }}>
                {messageCount} / 500
              </p>
            </div>

            {/* ZGODA + AKCJE */}
            <div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 28 }}>
                <input
                  type="checkbox" name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange} required
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: '#0f1923', flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                  Zapoznałem/am się z treścią Klauzuli Informacyjnej dotyczącej przetwarzania danych osobowych i wyrażam zgodę na ich przetwarzanie w celu przeprowadzenia rekrutacji. *
                </span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Link to="/" style={{
                  padding: '11px 24px', borderRadius: 8, border: '1px solid #e8e5df',
                  fontSize: 14, fontWeight: 600, color: '#6b7280', textDecoration: 'none',
                  transition: 'all 0.15s',
                }}>
                  Anuluj
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '11px 28px', background: loading ? '#6b7280' : '#0f1923',
                    color: '#fff', border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#1e3a5f'); }}
                  onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = '#0f1923'); }}
                >
                  {loading ? 'Wysyłanie...' : 'Wyślij aplikację →'}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
