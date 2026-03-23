import { useState } from 'react'
import { LoginForm } from './features/auth/LoginForm';
import { RegisterForm } from './features/auth/RegisterForm';
import './App.css'

function App() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Witaj w Job Board</h1>
      
      {/* Przyciski do nawigacji */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={() => setShowLogin(true)} 
          style={{ 
            padding: '10px 20px', 
            fontWeight: showLogin ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          Zaloguj się
        </button>
        <button 
          onClick={() => setShowLogin(false)} 
          style={{ 
            padding: '10px 20px', 
            fontWeight: !showLogin ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          Zarejestruj się
        </button>
      </div>

      {/* Wyświetlanie odpowiedniego formularza */}
      {showLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}

export default App
