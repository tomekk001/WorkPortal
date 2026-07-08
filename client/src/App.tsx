import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { LoginForm } from './features/auth/LoginForm';
import { RegisterForm } from './features/auth/RegisterForm';
import { CandidateDashboard } from './features/job-offers/views/CandidateDashboard';
import { EmployerDashboard } from './features/job-offers/views/EmployerDashboard';
import { CreateJobOffer } from './features/job-offers/views/CreateJobOffer';
import { ApplicationForm } from './features/job-offers/views/ApplicationForm';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { EditJobOffer } from './features/job-offers/views/EditJobOffer';
import { CompanyProfile } from './features/job-offers/views/CompanyProfile';
import { StaticPage } from './features/pages/StaticPage';
import { ContactForm } from './features/pages/ContactForm';
import { ForgotPassword } from './features/auth/ForgotPassword';
import { ResetPassword } from './features/auth/ResetPassword';
import { JobOfferDetails } from './features/job-offers/views/JobOfferDetails';
import { CompanyPublicPage } from './features/job-offers/views/CompanyPublicPage';
import './App.css';

const ProtectedRoute = () => {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (role === 'ADMIN')     return <AdminDashboard />;
  if (role === 'EMPLOYER')  return <EmployerDashboard />;
  return <CandidateDashboard />;
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthLayout><LoginForm /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><RegisterForm /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
          <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
          <Route path="/" element={<ProtectedRoute />} />
          <Route path="/add-offer" element={<CreateJobOffer />} />
          <Route path="/edit-offer/:offerId" element={<EditJobOffer />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/apply/:jobId" element={<ApplicationForm />} />
          <Route path="/oferta/:offerId" element={<JobOfferDetails />} />
          <Route path="/firma/:companyId" element={<CompanyPublicPage />} />
          <Route path="/p/:slug" element={<StaticPage />} />
          <Route path="/kontakt" element={<ContactForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;