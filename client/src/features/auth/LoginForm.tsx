import { useState } from 'react';
import axios from 'axios';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });

      // Zapisz token w localStorage
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      
      // Zapisz rolę, żeby wiedzieć, co pokazać użytkownikowi
      localStorage.setItem('role', response.data.role);

      alert('Zalogowano pomyślnie!');
      // Tutaj możesz użyć np. react-router-dom do przekierowania
      // window.location.href = '/dashboard';
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd logowania');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Logowanie</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        />
        <button type="submit">Zaloguj się</button>
      </form>
    </div>
  );
};