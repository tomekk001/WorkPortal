import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { LoginForm } from './features/auth/LoginForm';
import { RegisterForm } from './features/auth/RegisterForm';
import { CandidateDashboard } from './features/job-offers/views/CandidateDashboard';
import { EmployerDashboard } from './features/job-offers/views/EmployerDashboard';
import { CreateJobOffer } from './features/job-offers/views/CreateJobOffer';
import { ApplicationForm } from './features/job-offers/views/ApplicationForm';
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

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-md mx-auto py-12 px-4">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Routes>
            {/* Authentication pages (without header) */}
            <Route path="/login" element={
              <AuthLayout>
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h1 className="text-3xl font-bold mb-2 text-center">Job Board</h1>
                  <p className="text-gray-600 text-center mb-6">Zaloguj się na swoje konto</p>
                  <LoginForm />
                </div>
              </AuthLayout>
            } />
            <Route path="/register" element={
              <AuthLayout>
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h1 className="text-3xl font-bold mb-2 text-center">Job Board</h1>
                  <p className="text-gray-600 text-center mb-6">Załóż nowe konto</p>
                  <RegisterForm />
                </div>
              </AuthLayout>
            } />

            {/* Protected pages (with header) */}
            <Route path="/" element={<ProtectedRoute />} />
            <Route path="/add-offer" element={<CreateJobOffer />} />
            <Route path="/apply/:jobId" element={<ApplicationForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;