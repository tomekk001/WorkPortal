import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export const CreateJobOffer = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    categoryId: '',
    salaryMin: '',
    salaryMax: '',
    description: ''
  });

  // Pobierz kategorie przy ładowaniu strony
  useEffect(() => {
    axios.get('http://localhost:3000/job-offers/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Błąd kategorii", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/job-offers', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Ogłoszenie dodane!');
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Błąd zapisu');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 mt-10 mb-10">
      
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Stwórz nowe ogłoszenie</h2>
        <p className="text-gray-500 mt-2">Wypełnij poniższe dane, aby opublikować ofertę pracy na portalu.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* TYTUŁ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tytuł stanowiska *</label>
          <input 
            placeholder="np. Senior Frontend Developer" required 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LOKALIZACJA */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Lokalizacja *</label>
            <input 
              placeholder="np. Warszawa, Zdalnie" required 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>
          
          {/* WYBÓR KATEGORII */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kategoria *</label>
            <select 
              required 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={formData.categoryId}
              onChange={e => setFormData({...formData, categoryId: e.target.value})}
            >
              <option value="" disabled>Wybierz z listy...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WYNAGRODZENIE MIN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Wynagrodzenie Min (PLN)</label>
            <input 
              type="number" placeholder="np. 10000" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
              onChange={e => setFormData({...formData, salaryMin: e.target.value})}
            />
          </div>
          {/* WYNAGRODZENIE MAX */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Wynagrodzenie Max (PLN)</label>
            <input 
              type="number" placeholder="np. 15000" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
              onChange={e => setFormData({...formData, salaryMax: e.target.value})}
            />
          </div>
        </div>

        {/* OPIS */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Opis stanowiska *</label>
          <textarea 
            placeholder="Opisz wymagania, obowiązki i benefity..." required rows={6}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm resize-y"
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <hr className="border-gray-100 my-6" />

        {/* AKCJE */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
          <Link 
            to="/" 
            className="w-full sm:w-auto px-6 py-3 text-center text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Anuluj
          </Link>
          <button 
            type="submit" 
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all"
          >
            Opublikuj ogłoszenie
          </button>
        </div>
        
      </form>
    </div>
  );
};