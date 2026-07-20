import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Header } from '../auth/Header';
import { API_URL } from '../../api/axios';

export const StaticPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    axios.get(`${API_URL}/pages/${slug}`)
      .then(res => setPage(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Header />
      <div style={{ width: '100%', padding: '48px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', borderRadius: 20, border: '1px solid #e8e5df', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '44px 48px' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #e8e5df', borderTopColor: '#0f1923', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          {!loading && notFound && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#0f1923' }}>{t('staticPage.notFound')}</p>
              <Link to="/" style={{ color: '#0a7a5a', fontWeight: 600 }}>← {t('staticPage.backToHome')}</Link>
            </div>
          )}
          {!loading && page && (
            <>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0f1923', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
                {page.title}
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>
                {page.content}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
