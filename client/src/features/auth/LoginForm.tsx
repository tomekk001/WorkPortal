import { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });

      const { access_token, role } = response.data;
      login(access_token, role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd logowania. Sprawdź dane.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Logowanie</h2>
      {error && <p className="text-red-500 mb-4 bg-red-50 p-2 rounded">{error}</p>}
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email" placeholder="Adres e-mail" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password" placeholder="Hasło" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold mt-2 transition">
          Zaloguj się
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Nie masz jeszcze konta?{' '}
        <Link to="/register" className="text-blue-600 font-bold hover:underline">
          Zarejestruj się
        </Link>
      </div>
    </div>
  );
};