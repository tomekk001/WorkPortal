import { useAuth } from '../../auth/AuthContext';
import { Header } from '../../auth/Header';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const EmployerDashboard = () => {
  const { token } = useAuth();
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
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          
          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Active Offers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Aktywne ogłoszenia</p>
                  <p className="text-4xl font-bold text-green-600 mt-3">{loading ? '-' : offers.length}</p>
                </div>
                <div className="text-5xl opacity-10">📋</div>
              </div>
            </div>

            {/* New Applications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Nowe aplikacje</p>
                  <p className="text-4xl font-bold text-blue-600 mt-3">{loading ? '-' : applications.length}</p>
                </div>
                <div className="text-5xl opacity-10">📧</div>
              </div>
            </div>
          </div>

          {/* OFFERS SECTION */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Twoje ogłoszenia</h2>
                <p className="text-gray-600 mt-2">Zarządzaj swoimi procesami rekrutacyjnymi i śledź aplikacje kandydatów.</p>
              </div>
              <Link 
                to="/add-offer" 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ml-4"
              >
                <span>+</span> Nowe ogłoszenie
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-gray-500 flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p>Ładowanie ogłoszeń...</p>
                </div>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 text-lg mb-2">📭 Nie masz jeszcze żadnych ogłoszeń</p>
                <p className="text-gray-400 text-sm mb-4">Zacznij korzystać z platformy, dodając swoje pierwsze ogłoszenie!</p>
                <Link 
                  to="/add-offer" 
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Dodaj ogłoszenie
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition hover:border-gray-300">
                    <div className="flex justify-between items-start gap-6 flex-col sm:flex-row">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-blue-700 mb-2">{offer.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>📍 {offer.location}</span>
                          <span>📅 {new Date(offer.createdAt).toLocaleDateString('pl-PL')}</span>
                        </div>
                        {offer.salaryMin && offer.salaryMax && (
                          <p className="inline-block text-sm font-semibold text-white bg-green-600 px-3 py-1 rounded-full">
                            {offer.salaryMin} - {offer.salaryMax} {offer.currency}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-50 px-4 py-3 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{offer.applications?.length || 0}</p>
                          <p className="text-xs text-gray-600 mt-1">aplikacji</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* APPLICATIONS SECTION */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Otrzymane aplikacje</h2>
            <p className="text-gray-600 mb-8">Przejrzyj i zarządzaj aplikacjami od kandydatów na Twoje oferty pracy.</p>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-gray-500 flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p>Ładowanie aplikacji...</p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 text-lg mb-2">📨 Brak aplikacji</p>
                <p className="text-gray-400 text-sm">Widoczne tu będą aplikacje od kandydatów zainteresowanych Twoimi ogłoszeniami.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <div key={app.id} className="py-6 first:pt-0 last:pb-0 hover:bg-gray-50 px-4 rounded transition">
                    <div className="flex justify-between items-start gap-6 flex-col sm:flex-row">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800">
                          {app.user?.firstName} {app.user?.lastName}
                        </h4>
                        <p className="text-sm text-gray-600 mt-2">
                          📧 {app.user?.email}
                        </p>
                        {app.user?.phone && (
                          <p className="text-sm text-gray-600">
                            📱 {app.user?.phone}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          Stanowisko: <span className="font-semibold text-gray-700">{app.jobOffer?.title}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(app.appliedAt).toLocaleDateString('pl-PL')}
                        </p>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};