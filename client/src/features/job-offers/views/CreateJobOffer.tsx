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
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [seniority, setSeniority] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    title: '', location: '', categoryId: '',
    salaryMin: '', salaryMax: '', description: '',
  });

  const toggleContract = (type: string) =>
    setContractTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (value && !skills.includes(value)) setSkills(prev => [...prev, value]);
    setSkillInput('');
  };
  const removeSkill = (skill: string) => setSkills(prev => prev.filter(s => s !== skill));

  useEffect(() => {
    axios.get('http://localhost:3000/job-offers/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Błąd kategorii', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (contractTypes.length === 0) {
        alert('Wybierz co najmniej jedną formę współpracy.');
        setLoading(false);
        return;
      }

      await axios.post('http://localhost:3000/job-offers', { ...formData, contract: contractTypes.join(','), durationMonths, seniority: seniority || undefined, skills }, {
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
                    min={0} max={999999}
                    onChange={set('salaryMin')}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                  <span style={{ color: '#9ca3af', fontWeight: 600, textAlign: 'center' }}>—</span>
                  <input
                    type="number" placeholder="Max, np. 15 000"
                    min={0} max={999999}
                    onChange={set('salaryMax')}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
              </div>

              {/* FORMA WSPÓŁPRACY */}
              <div>
                <label style={labelStyle}>Forma współpracy *</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { value: 'UOP', label: 'Umowa o pracę', sub: 'UOP' },
                    { value: 'UZ',  label: 'Umowa zlecenie', sub: 'UZ' },
                    { value: 'B2B', label: 'Kontrakt',       sub: 'B2B' },
                  ].map(opt => {
                    const checked = contractTypes.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleContract(opt.value)}
                        style={{
                          flex: 1, padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                          border: checked ? '1.5px solid #7dd3b0' : '1.5px solid #e8e5df',
                          background: checked ? 'rgba(125,211,176,0.08)' : '#f9f8f6',
                          textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: checked ? '#0a7a5a' : '#0f1923', marginBottom: 2 }}>
                          {opt.sub}
                        </div>
                        <div style={{ fontSize: 11, color: checked ? '#7dd3b0' : '#9ca3af' }}>
                          {opt.label}
                        </div>
                        {checked && (
                          <div style={{ marginTop: 6, display: 'inline-block', background: '#7dd3b0', color: '#0f1923', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                            ✓ Wybrano
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SENIORITY + UMIEJĘTNOŚCI */}
              <div>
                <label style={labelStyle}>Poziom doświadczenia</label>
                <select value={seniority} onChange={e => setSeniority(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)} onBlur={e => Object.assign(e.currentTarget.style, { ...inputStyle, cursor: 'pointer' })}>
                  <option value="">Nie określono</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Umiejętności / stos technologiczny <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9ca3af' }}>(Enter, aby dodać)</span></label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="np. React, TypeScript, Docker"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                />
                {skills.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {skills.map(skill => (
                      <button
                        key={skill} type="button" onClick={() => removeSkill(skill)}
                        style={{ fontSize: 12, padding: '4px 10px 4px 12px', borderRadius: 20, background: '#0f1923', color: '#7dd3b0', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
                      >
                        {skill} <span style={{ color: '#94a3b8' }}>×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CZAS WYSTAWIENIA */}
              <div>
                <label style={labelStyle}>Czas wystawienia oferty * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9ca3af' }}>(max. 4 miesiące)</span></label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[1, 2, 3, 4].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMonths(m)}
                      style={{
                        flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                        border: durationMonths === m ? '1.5px solid #7dd3b0' : '1.5px solid #e8e5df',
                        background: durationMonths === m ? 'rgba(125,211,176,0.08)' : '#f9f8f6',
                        fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 800, color: durationMonths === m ? '#0a7a5a' : '#0f1923' }}>{m}</div>
                      <div style={{ fontSize: 11, color: durationMonths === m ? '#7dd3b0' : '#9ca3af', marginTop: 2 }}>
                        {m === 1 ? 'miesiąc' : 'miesiące'}
                      </div>
                    </button>
                  ))}
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
