import axios from 'axios';

// Tworzymy nową instancję Axios z domyślnym adresem backendu
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
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