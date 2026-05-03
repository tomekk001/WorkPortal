import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  const getRoleLabel = () => {
    if (role === 'EMPLOYER') return 'Pracodawca';
    return 'Kandydat';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Home */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">JB</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:inline">JobBoard</span>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Zalogowano jako</p>
              <p className="text-sm font-semibold text-gray-800 bg-blue-50 px-3 py-1 rounded">
                {getRoleLabel()}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
