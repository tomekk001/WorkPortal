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
      if (categoryId) params.categoryId = categoryId;
      const response = await axios.get('http://localhost:3000/job-offers/search', { params });
      setOffers(Array.isArray(response.data) ? response.data : []);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalOffers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/job-offers/search');
      if (Array.isArray(response.data)) setTotalOffers(response.data.length);
    } catch {}
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/job-offers/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch {
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
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      {/* HERO */}
      <div style={{ background: '#0f1923', color: '#fff', padding: '56px 0 48px' }}>
        <div style={{ width: '100%', padding: '0 32px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 12 }}>
            WorkPortal — Twoja platforma kariery
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Znajdź pracę,<br />
            <span style={{ color: '#7dd3b0' }}>która Cię nakręca.</span>
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', margin: '0 0 32px', maxWidth: 480 }}>
            {totalOffers} aktywnych ofert od sprawdzonych pracodawców. Filtruj, szukaj, aplikuj.
          </p>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Wszystkich ofert', value: totalOffers },
              { label: 'Wyświetlanych', value: offers.length },
              { label: 'Kategorii', value: categories.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
       <div style={{ width: '100%', padding: '40px 32px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>

        {/* SIDEBAR */}
        <aside style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 16 }}>
              Filtruj oferty
            </p>
            <SearchBar
              categories={categories}
              onSearch={(title, location, categoryId) => fetchOffers(title, location, categoryId)}
            />
          </div>
        </aside>

        {/* OFFERS */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1923', margin: 0 }}>Dostępne oferty</h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                {loading ? 'Ładowanie...' : `Znaleziono ${offers.length} ofert`}
              </p>
            </div>
          </div>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: 12 }}>
              <div style={{
                width: 36, height: 36, border: '3px solid #e8e5df',
                borderTopColor: '#0f1923', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <p style={{ color: '#9ca3af', fontSize: 14 }}>Ładowanie ofert...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loading && offers.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '64px 32px',
              background: '#fff', borderRadius: 16,
              border: '2px dashed #e8e5df'
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Brak wyników</p>
              <p style={{ color: '#9ca3af', fontSize: 14 }}>Spróbuj zmienić filtry lub poczekaj na nowe ogłoszenia.</p>
            </div>
          )}

          {!loading && offers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {offers.map((offer) => (
                <JobOfferCard
                  key={offer.id}
                  offer={offer}
                  onActionClick={handleApply}
                  actionLabel="Aplikuj"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
