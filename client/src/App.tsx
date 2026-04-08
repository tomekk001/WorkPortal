import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { LoginForm } from './features/auth/LoginForm';
import { RegisterForm } from './features/auth/RegisterForm';
import { CandidateDashboard } from './features/job-offers/views/CandidateDashboard';
import { EmployerDashboard } from './features/job-offers/views/EmployerDashboard';
import './App.css';

const ProtectedRoute = () => {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'EMPLOYER') {
    return <EmployerDashboard />;
  }

  return <CandidateDashboard />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <main className="p-4">
            <Routes>
              {/* Osobne podstrony na logowanie i rejestrację */}
              <Route path="/login" element={
                <div className="mt-10">
                  <h1 className="text-center text-2xl font-bold mb-6">Zaloguj się do Job Board</h1>
                  <LoginForm />
                </div>
              } />
              <Route path="/register" element={
                <div className="mt-10">
                  <h1 className="text-center text-2xl font-bold mb-6">Załóż konto</h1>
                  <RegisterForm />
                </div>
              } />

              {/* Główny panel (widoczny tylko po zalogowaniu) */}
              <Route path="/" element={<ProtectedRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;