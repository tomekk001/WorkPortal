import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';

export const EmployerDashboard = () => {
  const { logout } = useAuth();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Panel Pracodawcy</h2>
        <button onClick={logout} className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50">
          Wyloguj się
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Twoje ogłoszenia</h3>
          <p className="text-gray-600">Zarządzaj swoimi procesami rekrutacyjnymi.</p>
        </div>
        <Link 
          to="/add-offer" 
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-bold transition"
        >
          + Dodaj nowe ogłoszenie
        </Link>
      </div>

      {/* Tu w przyszłości wstawimy listę ogłoszeń dodanych przez pracodawcę używając JobOfferCard */}
      <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded">
        Nie masz jeszcze żadnych aktywnych ogłoszeń.
      </div>
    </div>
  );
};