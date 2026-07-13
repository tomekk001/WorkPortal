import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Header } from '../../auth/Header';
import { JobOfferCard, type JobOffer } from '../components/JobOfferCard';
import { setSeoTags, resetSeoTags } from '../../../utils/seo';

interface CompanyPublicData {
  id: number;
  companyName: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
}

export const CompanyPublicPage = () => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyPublicData | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    setNotFound(false);
    axios.get(`http://localhost:3000/job-offers/company/${companyId}`)
      .then(res => {
        setCompany(res.data.company);
        setOffers(Array.isArray(res.data.offers) ? res.data.offers : []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    if (!company) return;
    setSeoTags({
      title: `${company.companyName} — oferty pracy | WorkPortal`,
      description: company.description?.slice(0, 200) || `Zobacz aktualne oferty pracy firmy ${company.companyName} na WorkPortal.`,
      url: `${window.location.origin}/firma/${company.id}`,
      image: company.logoUrl ? `http://localhost:3000${company.logoUrl}` : undefined,
    });
    return () => resetSeoTags();
  }, [company]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e8e5df', borderTopColor: '#0f1923', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (notFound || !company) return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />
      <div style={{ textAlign: 'center', padding: '96px 32px' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🏢</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0f1923' }}>{t('companyPublicPage.notFound')}</p>
        <Link to="/" style={{ color: '#0a7a5a', fontWeight: 600 }}>← {t('jobOfferDetails.backToList')}</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />

      <div style={{ background: '#0f1923', padding: '40px 0 48px' }}>
        <div style={{ width: '100%', padding: '0 32px', maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          {company.logoUrl ? (
            <img src={`http://localhost:3000${company.logoUrl}`} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: 14, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🏢</div>
          )}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#7dd3b0', textTransform: 'uppercase', marginBottom: 6 }}>{t('header.companyProfile')}</p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{company.companyName}</h1>
            {company.location && <p style={{ fontSize: 14, color: '#94a3b8', margin: '6px 0 0' }}>📍 {company.location}</p>}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', padding: '40px 32px', maxWidth: 960, margin: '0 auto' }}>
        {(company.description || company.website) && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5df', padding: '24px 28px', marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {company.description && (
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: company.website ? '0 0 12px' : 0 }}>{company.description}</p>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#0a7a5a', fontWeight: 600, textDecoration: 'none' }}>
                🔗 {company.website}
              </a>
            )}
          </div>
        )}

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f1923', margin: '0 0 16px' }}>
          {t('companyPublicPage.activeOffers', { count: offers.length })}
        </h2>

        {offers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: 16, border: '2px dashed #e8e5df' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ color: '#374151', fontWeight: 600, fontSize: 16 }}>{t('companyPublicPage.noOffers')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {offers.map(offer => (
              <JobOfferCard key={offer.id} offer={offer} onActionClick={id => navigate(`/oferta/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
