import { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchBar } from '../components/SearchBar';
import { JobOfferCard, type JobOffer } from '../components/JobOfferCard';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../auth/Header';

export const CandidateDashboard = () => {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchOffers = async (title?: string, location?: string, categoryId?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | undefined> = { title, location };
      if (categoryId) {
        params.categoryId = categoryId;
      }
      const response = await axios.get('http://localhost:3000/job-offers/search', {
        params,
      });
      
      if (Array.isArray(response.data)) {
        setOffers(response.data);
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error('Błąd pobierania ofert:', error);
      setOffers([]); 
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalOffers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/job-offers/search');
      if (Array.isArray(response.data)) {
        setTotalOffers(response.data.length);
      }
    } catch (error) {
      console.error('Błąd pobierania całkowitej liczby ofert:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/job-offers/categories');
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchTotalOffers();
    fetchCategories();
  }, []);

  const handleApply = (offerId: number) => {
    if (!token) {
      alert('Musisz być zalogowany, aby aplikować na stanowisko.');
      return;
    }
    navigate(`/apply/${offerId}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          
          {/* HERO BANNER */}
          <div className="mb-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">
              Szukasz nowej pracy?
            </h1>
            <p className="text-blue-100 text-lg">
              Znaleźliśmy dla Ciebie <span className="font-bold text-2xl">{totalOffers}</span> ofert pracy od najlepszych pracodawców
            </p>
          </div>

          {/* SEARCH SECTION */}
          <div className="mb-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtruj oferty</h2>
              <SearchBar
                categories={categories}
                onSearch={(title, location, categoryId) => fetchOffers(title, location, categoryId)}
              />
            </div>
          </div>

          {/* OFFERS LIST */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dostępne oferty pracy</h2>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Ładowanie...' : `Znaleziono ${offers.length} ofert${offers.length !== 1 ? '' : ''}`}
                </p>
              </div>
            </div>
            
            {loading && (
              <div className="flex justify-center py-12">
                <div className="text-gray-500 flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p>Ładowanie najnowszych ofert...</p>
                </div>
              </div>
            )}
            
            {!loading && offers.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg mb-2">😕 Niestety, nie znaleźliśmy ofert spełniających te kryteria.</p>
                <p className="text-gray-400 text-sm">Spróbuj zmienić filtry lub poczekaj na nowe ogłoszenia.</p>
              </div>
            )}

            {!loading && offers.length > 0 && (
              <div className="space-y-4">
                {Array.isArray(offers) && offers.map((offer) => (
                  <JobOfferCard 
                    key={offer.id} 
                    offer={offer} 
                    onActionClick={handleApply} 
                    actionLabel="Aplikuj" 
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};