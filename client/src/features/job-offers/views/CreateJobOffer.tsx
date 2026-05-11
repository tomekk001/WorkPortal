import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Header } from '../../auth/Header';

export const CreateJobOffer = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', location: '', categoryId: '',
    salaryMin: '', salaryMax: '', description: '',
  });

  useEffect(() => {
    axios.get('http://localhost:3000/job-offers/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Błąd kategorii', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/job-offers', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Błąd zapisu');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      {/* TOP BAR */}
      <div style={{ background: '#0f1923', padding: '40px 0 48px' }}>
        <div style={{ width: '100%', padding: '0 32px' }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
            color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Panel Pracodawcy
          </p>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800,
            color: '#fff', margin: 0, letterSpacing: '-0.02em',
          }}>
            Nowe ogłoszenie
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>
            Wypełnij formularz, aby opublikować ofertę pracy
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={{ width: '100%', padding: '40px 32px' }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 20,
          border: '1px solid #e8e5df',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}>
          <form onSubmit={handleSubmit}>

            {/* FORM BODY */}
            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* TYTUŁ */}
              <div>
                <label style={labelStyle}>Tytuł stanowiska *</label>
                <input
                  required placeholder="np. Senior Frontend Developer"
                  onChange={set('title')}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>

              {/* LOKALIZACJA + KATEGORIA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Lokalizacja *</label>
                  <input
                    required placeholder="np. Warszawa, Zdalnie"
                    onChange={set('location')}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kategoria *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={set('categoryId')}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, { ...inputStyle, cursor: 'pointer' })}
                  >
                    <option value="" disabled>Wybierz kategorię…</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* WYNAGRODZENIE */}
              <div>
                <label style={labelStyle}>Wynagrodzenie (PLN)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
                  <input
                    type="number" placeholder="Min, np. 8 000"
                    onChange={set('salaryMin')}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                  <span style={{ color: '#9ca3af', fontWeight: 600, textAlign: 'center' }}>—</span>
                  <input
                    type="number" placeholder="Max, np. 15 000"
                    onChange={set('salaryMax')}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
              </div>

              {/* OPIS */}
              <div>
                <label style={labelStyle}>Opis stanowiska *</label>
                <textarea
                  required rows={8}
                  placeholder="Opisz wymagania, obowiązki, benefity i wymagane doświadczenie…"
                  onChange={set('description')}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => Object.assign(e.currentTarget.style, { ...inputFocusStyle, resize: 'vertical', lineHeight: '1.6' })}
                  onBlur={e => Object.assign(e.currentTarget.style, { ...inputStyle, resize: 'vertical', lineHeight: '1.6' })}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div style={{
              padding: '20px 40px',
              borderTop: '1px solid #f0ece6',
              background: '#faf9f7',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12,
            }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  padding: '11px 24px', borderRadius: 10,
                  border: '1px solid #e2ddd6',
                  background: 'transparent', color: '#6b7280',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0ece6'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '11px 28px', borderRadius: 10,
                  border: 'none',
                  background: loading ? 'rgba(125,211,176,0.5)' : '#7dd3b0',
                  color: '#0f1923',
                  fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'opacity 0.15s',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {loading ? 'Publikowanie…' : '+ Opublikuj ogłoszenie'}
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
  background: '#f9f8f6',
  border: '1.5px solid #e8e5df',
  borderRadius: 10, color: '#0f1923',
  fontSize: 15, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s, background 0.15s',
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  background: '#fff',
  border: '1.5px solid #7dd3b0',
};
