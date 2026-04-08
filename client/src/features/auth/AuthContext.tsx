import { createContext, useState, useContext, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  token: string | null;
  role: 'CANDIDATE' | 'EMPLOYER' | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, role: 'CANDIDATE' | 'EMPLOYER') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthState>(() => ({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role') as 'CANDIDATE' | 'EMPLOYER' | null,
  }));

  const login = (token: string, role: 'CANDIDATE' | 'EMPLOYER') => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setAuthState({ token, role });
    navigate('/'); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthState({ token: null, role: null });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth musi być użyte wewnątrz AuthProvider');
  return context;
};