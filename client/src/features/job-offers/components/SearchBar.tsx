import { useState } from 'react';

interface SearchBarProps {
  onSearch: (title: string, location: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(title, location);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Znajdź pracę marzeń</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        
        <input
          type="text"
          placeholder="Tytuł stanowiska (np. Frontend Developer)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-2 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
        >
          <option value="">Cała Polska</option>
          <option value="Warszawa">Warszawa</option>
          <option value="Kraków">Kraków</option>
          <option value="Wrocław">Wrocław</option>
          <option value="Zdalnie">Zdalnie</option>
        </select>

        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-200"
        >
          Szukaj
        </button>
      </form>
    </div>
  );
};