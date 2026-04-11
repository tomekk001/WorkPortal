import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const EmployerDashboard = () => {
  const { logout, token } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pobieranie ogłoszeń
        const offersResponse = await axios.get('http://localhost:3000/job-offers/my-offers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOffers(Array.isArray(offersResponse.data) ? offersResponse.data : []);

        // Pobieranie aplikacji
        const applicationsResponse = await axios.get('http://localhost:3000/job-offers/my-applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(Array.isArray(applicationsResponse.data) ? applicationsResponse.data : []);
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* BANERY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Liczba ogłoszeń */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold text-green-100">Aktywne ogłoszenia</h3>
          <p className="text-4xl font-bold mt-2">{loading ? '...' : offers.length}</p>
        </div>

        {/* Liczba aplikacji */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold text-blue-100">Nowe aplikacje</h3>
          <p className="text-4xl font-bold mt-2">{loading ? '...' : applications.length}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Panel Pracodawcy</h2>
        <button onClick={logout} className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50 font-medium">
          Wyloguj się
        </button>
      </div>

      {/* SEKCJA OGŁOSZEŃ */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
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

        {loading ? (
          <p className="text-gray-500 animate-pulse">Ładowanie ogłoszeń...</p>
        ) : offers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded">
            Nie masz jeszcze żadnych aktywnych ogłoszeń.
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-blue-700">{offer.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">📍 {offer.location}</p>
                    {offer.salaryMin && offer.salaryMax && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        {offer.salaryMin} - {offer.salaryMax} {offer.currency}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      {offer.applications?.length || 0} aplikacji
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(offer.createdAt).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEKCJA APLIKACJI */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Otrzymane aplikacje</h3>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Ładowanie aplikacji...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded">
            Nie ma jeszcze żadnych aplikacji.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Kandydat</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Telefon</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Stanowisko</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Data aplikacji</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {app.user?.firstName} {app.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.user?.email}</td>
                    <td className="px-4 py-3 text-gray-600">{app.user?.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{app.jobOffer?.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(app.appliedAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'REVIEWING' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {app.status === 'NEW' ? '🆕 Nowa' :
                         app.status === 'REVIEWING' ? '👀 Przegląd' :
                         app.status === 'REJECTED' ? '❌ Odrzucona' :
                         '✅ Zatrudniona'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};