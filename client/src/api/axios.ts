import axios from 'axios';

// W developmencie backend chodzi domyślnie na localhost:3000; w produkcji
// (Netlify) trzeba ustawić VITE_API_URL na publiczny adres wdrożonego backendu.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Tworzymy nową instancję Axios z domyślnym adresem backendu
const apiClient = axios.create({
  baseURL: API_URL,
});

// Dodajemy "interceptor" dla każdego wychodzącego zapytania
apiClient.interceptors.request.use(
  (config) => {
    // Pobierz token z localStorage (zapisaliśmy go tam podczas logowania)
    const token = localStorage.getItem('token');
    
    // Jeśli token istnieje, dodaj go do nagłówka Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;