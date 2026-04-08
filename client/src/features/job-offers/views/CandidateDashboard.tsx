import { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchBar } from '../components/SearchBar';
import { JobOfferCard, type JobOffer } from '../components/JobOfferCard';
import { useAuth } from '../../auth/AuthContext'; // 1. DODANY IMPORT KONTEKSTU

export const CandidateDashboard = () => {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { logout } = useAuth(); // 2. WYCIĄGAMY FUNKCJĘ WYLOGOWANIA

  const fetchOffers = async (title?: string, location?: string) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/job-offers/search', {
        params: { title, location }
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

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleApply = (offerId: number) => {
    console.log(`Przechodzę do aplikacji na ofertę o ID: ${offerId}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Panel Kandydata</h2>
        <button 
          onClick={logout} 
          className="text-gray-600 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition font-medium"
        >
          Wyloguj się
        </button>
      </div>

      <SearchBar onSearch={(title, location) => fetchOffers(title, location)} />
      {/* 2. Lista ofert */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Znalezione oferty <span className="text-gray-500 text-lg font-normal">({offers.length})</span>
        </h3>
        
        {loading && <p className="text-gray-500 animate-pulse">Trwa ładowanie najnowszych ofert...</p>}
        
        {!loading && offers.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Niestety, nie znaleźliśmy ofert spełniających te kryteria.</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Mapujemy tablicę na zewnętrzne kafelki JobOfferCard */}
          {Array.isArray(offers) && offers.map((offer) => (
            <JobOfferCard 
              key={offer.id} 
              offer={offer} 
              onActionClick={handleApply} 
              actionLabel="Aplikuj teraz" 
            />
          ))}
        </div>
      </div>

    </div>
  );
};