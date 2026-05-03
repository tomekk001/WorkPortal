import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Nowe stany dla roli i firmy
  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE');
  const [companyName, setCompanyName] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      await axios.post('http://localhost:3000/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role,
        // Jeśli to pracodawca, dołączamy nazwę firmy do payloadu
        ...(role === 'EMPLOYER' && { companyName }), 
      });

      setSuccess(true);
      // Czyszczenie formularza
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('CANDIDATE');
      setCompanyName('');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd podczas rejestracji');
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h2>Rejestracja zakończona sukcesem!</h2>
        <p>Możesz się teraz zalogować.</p>
        <Link 
          to="/login" 
          className="inline-block w-full bg-blue-600 text-white font-semibold py-3 px-8 rounded hover:bg-blue-700 transition-colors"
        >
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Rejestracja Konta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* WYBÓR ROLI (Radio Buttons) */}
        <div style={{ display: 'flex', gap: '15px', padding: '10px 0' }}>
          <label style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="role" 
              value="CANDIDATE" 
              checked={role === 'CANDIDATE'} 
              onChange={() => setRole('CANDIDATE')} 
            /> Szukam pracy (Kandydat)
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="role" 
              value="EMPLOYER" 
              checked={role === 'EMPLOYER'} 
              onChange={() => setRole('EMPLOYER')} 
            /> Szukam pracownika (Firma)
          </label>
        </div>

        <input
          type="text"
          placeholder="Imię"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nazwisko"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        
        {/* WARUNKOWE POLE: Tylko dla pracodawcy */}
        {role === 'EMPLOYER' && (
          <input
            type="text"
            placeholder="Nazwa firmy"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Adres e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" style={{ marginTop: '10px', padding: '10px' }}>Zarejestruj się</button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Masz już konto?{' '}
        <Link to="/login" className="text-blue-600 font-bold hover:underline">
          Zaloguj się
        </Link>
      </div>
    </div>
  );
};