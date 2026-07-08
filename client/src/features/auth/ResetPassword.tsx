import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

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
};

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/auth/reset-password', { token, newPassword });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd resetowania hasła.');
    } finally {
      setLoading(false);
    }
  };

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
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 10 }}>Reset hasła</p>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Ustaw nowe hasło</h1>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 32, boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
            {!token ? (
              <p style={{ color: '#fca5a5', fontSize: 14 }}>Brak tokenu resetu w linku. Poproś o nowy link.</p>
            ) : done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>Hasło zmienione</p>
                <button
                  onClick={() => navigate('/login')}
                  style={{ marginTop: 12, background: '#7dd3b0', color: '#0f1923', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Przejdź do logowania →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '12px 16px' }}>
                    <p style={{ color: '#fca5a5', fontSize: 14, margin: 0, fontWeight: 500 }}>{error}</p>
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Nowe hasło</label>
                  <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="min. 6 znaków" style={inputStyle} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ marginTop: 8, background: loading ? 'rgba(125,211,176,0.5)' : '#7dd3b0', color: '#0f1923', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                >
                  {loading ? 'Zapisywanie…' : 'Ustaw nowe hasło →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
