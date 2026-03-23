import { useState } from 'react';
import axios from 'axios';

export const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        role: 'CANDIDATE', // Domyślnie rejestrujemy jako kandydat
      });

      setSuccess(true);
      // Czyszczenie formularza po sukcesie
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd podczas rejestracji');
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h2>Rejestracja zakończona sukcesem!</h2>
        <p>Możesz się teraz zalogować.</p>
        {/* Tu w przyszłości dodam link do logowania */}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Rejestracja Konta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        <button type="submit">Zarejestruj się</button>
      </form>
    </div>
  );
};