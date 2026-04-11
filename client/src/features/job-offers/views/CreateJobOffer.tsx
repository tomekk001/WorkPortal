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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
            <h2 className="text-4xl font-bold text-white">Stwórz nowe ogłoszenie</h2>
            <p className="text-blue-100 mt-3 text-lg">Wypełnij formularz, aby opublikować ofertę pracy na portalu</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* TYTUŁ */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Tytuł stanowiska *</label>
              <input 
                placeholder="np. Senior Frontend Developer" required 
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LOKALIZACJA */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Lokalizacja *</label>
                <input 
                  placeholder="np. Warszawa, Zdalnie" required 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              
              {/* WYBÓR KATEGORII */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Kategoria *</label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all appearance-none cursor-pointer"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* WYNAGRODZENIE MIN */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Wynagrodzenie Min (PLN)</label>
                <input 
                  type="number" placeholder="np. 10000" 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  onChange={e => setFormData({...formData, salaryMin: e.target.value})}
                />
              </div>
              {/* WYNAGRODZENIE MAX */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Wynagrodzenie Max (PLN)</label>
                <input 
                  type="number" placeholder="np. 15000" 
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  onChange={e => setFormData({...formData, salaryMax: e.target.value})}
                />
              </div>
            </div>

            {/* OPIS */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Opis stanowiska *</label>
              <textarea 
                placeholder="Opisz wymagania, obowiązki, benefity, wymagane doświadczenie..." required rows={7}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="border-t-2 border-gray-200 pt-8" />

            {/* AKCJE */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
              <Link 
                to="/" 
                className="w-full sm:w-auto px-8 py-3 text-center text-gray-700 font-semibold hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-gray-300 hover:border-gray-400"
              >
                Anuluj
              </Link>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all"
              >
                ✓ Opublikuj ogłoszenie
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};