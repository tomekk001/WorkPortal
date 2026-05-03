import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Header } from '../../auth/Header';
import axios from 'axios';

export const ApplicationForm = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Upewniamy się że jobId jest liczbą
  const jobOfferId = jobId ? Number(jobId) : null;

  if (!jobOfferId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">Błąd: Brak ID oferty</p>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    startDate: '',
    contractType: '',
    expectedSalary: '',
    message: '',
    agreedToTerms: false,
  });

  const [files, setFiles] = useState<{ cv: File | null; additional: File | null }>({
    cv: null,
    additional: null,
  });

  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === 'message') {
      const truncated = value.slice(0, 500);
      setFormData({ ...formData, [name]: truncated });
      setMessageCount(truncated.length);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'cv' | 'additional') => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = fileType === 'cv' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`Plik jest za duży. Max. ${fileType === 'cv' ? '10 MB' : '5 MB'}`);
        return;
      }
      if (fileType === 'cv' && file.type !== 'application/pdf') {
        alert('CV musi być w formacie PDF');
        return;
      }
      setFiles({ ...files, [fileType]: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Wypełnij wszystkie wymagane pola.');
      return;
    }

    // Pliki są opcjonalne na razie
    if (!formData.startDate || !formData.contractType || !formData.expectedSalary || !formData.agreedToTerms) {
      alert('Wypełnij wszystkie wymagane pola i zaakceptuj warunki.');
      return;
    }

    setLoading(true);

    try {
      // Wysyłamy JSON zamiast FormData
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        startDate: formData.startDate,
        contractType: formData.contractType,
        expectedSalary: formData.expectedSalary,
        message: formData.message,
        jobOfferId: jobOfferId,
        cvFileName: files.cv?.name || null,
        additionalFileName: files.additional?.name || null,
      };

      await axios.post('http://localhost:3000/job-offers/submit-application', dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      alert('✅ Aplikacja przesłana pomyślnie! Pracodawca otrzymał Twoją aplikację.');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(`❌ Błąd: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            
            {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
            <Link to="/" className="text-blue-100 hover:text-white mb-4 inline-block text-sm">
              ← Wróć do ogłoszeń
            </Link>
            <h2 className="text-4xl font-bold text-white">Aplikuj na stanowisko</h2>
            <p className="text-blue-100 mt-3 text-lg">Wypełnij poniższy formularz, aby przesłać swoją aplikację</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* DANE OSOBOWE */}
            <div className="border-b-2 border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Dane osobowe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Imię *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Twoje imię"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Nazwisko *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Twoje nazwisko"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="twój.email@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Numer telefonu *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+48 123 456 789"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* DOKUMENTY */}
            <div className="border-b-2 border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Dokumenty</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Załącznik - CV (PDF, max. 10 MB) *
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 relative cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'cv')}
                      className="hidden"
                    />
                    <div className="px-6 py-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors text-center">
                      <p className="text-blue-600 font-medium">
                        {files.cv ? `✓ ${files.cv.name}` : 'Kliknij aby wybrać plik'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Dodatkowe pliki (max. 5 MB)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 relative cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'additional')}
                      className="hidden"
                    />
                    <div className="px-6 py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-center">
                      <p className="text-gray-600 font-medium">
                        {files.additional ? `✓ ${files.additional.name}` : 'Kliknij aby wybrać plik'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* WARUNKI PRACY */}
            <div className="border-b-2 border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Warunki pracy</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Kiedy możesz rozpocząć nową pracę? *
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'immediately', label: 'Od zaraz' },
                    { value: '2weeks', label: '2 tygodnie' },
                    { value: '1month', label: '1 miesiąc' },
                    { value: '3months', label: '3 miesiące' },
                    { value: 'more3months', label: 'Więcej niż 3 miesiące' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="startDate"
                        value={option.value}
                        checked={formData.startDate === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                        required
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Wybierz oczekiwaną formę współpracy *
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'UOP', label: 'UOP (Umowa o pracę)' },
                    { value: 'UZ', label: 'UZ (Umowa zlecenie)' },
                    { value: 'B2B', label: 'B2B' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="contractType"
                        value={option.value}
                        checked={formData.contractType === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                        required
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* OCZEKIWANIA */}
            <div className="border-b-2 border-gray-200 pb-6">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Jakie są Twoje miesięczne oczekiwania finansowe brutto (PLN)? *
              </label>
              <input
                type="number"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleInputChange}
                placeholder="np. 15000"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>

            {/* WIADOMOŚĆ */}
            <div className="border-b-2 border-gray-200 pb-6">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Miejsce na Twoją wiadomość
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Podziel się dodatkowymi informacjami na Twój temat..."
                maxLength={500}
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">{messageCount}/500</p>
            </div>

            {/* ZGODA */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 mt-1"
                  required
                />
                <span className="text-gray-700 text-sm">
                  Zapoznałem(am) się z treścią Klauzuli Informacyjnej. (*)
                </span>
              </label>
            </div>

            {/* AKCJE */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6">
              <Link
                to="/"
                className="w-full sm:w-auto px-8 py-3 text-center text-gray-700 font-semibold hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-gray-300 hover:border-gray-400"
              >
                Anuluj
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wysyłanie...' : '✓ Wyślij aplikację'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
    </>
  );
};
