export interface JobOffer {
  id: number;
  title: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  company: {
    companyName: string;
    logoUrl: string | null;
  };
  category?: {
    name: string;
  };
  createdAt: string;
}

interface JobOfferCardProps {
  offer: JobOffer;
  onActionClick?: (offerId: number) => void;
  actionLabel?: string;
  isSaved?: boolean;
  onSaveToggle?: (offerId: number) => void;
}

export const JobOfferCard = ({
  offer,
  onActionClick,
  actionLabel = 'Aplikuj',
  isSaved = false,
  onSaveToggle,
}: JobOfferCardProps) => {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #e8e5df',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#c9c5be';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e5df';
      }}
    >
      {/* LEWA: info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontSize: 16, fontWeight: 700, color: '#0f1923',
          margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {offer.title}
        </h4>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px', fontWeight: 500 }}>
          {offer.company?.companyName || 'Brak nazwy firmy'}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: 12, padding: '3px 10px', borderRadius: 6,
            background: '#f1f5f9', color: '#475569', fontWeight: 500
          }}>
            📍 {offer.location}
          </span>
          {offer.category && (
            <span style={{
              fontSize: 12, padding: '3px 10px', borderRadius: 6,
              background: '#ede9fe', color: '#5b21b6', fontWeight: 600
            }}>
              {offer.category.name}
            </span>
          )}
          {offer.salaryMin && offer.salaryMax ? (
            <span style={{
              fontSize: 12, padding: '3px 10px', borderRadius: 6,
              background: '#dcfce7', color: '#166534', fontWeight: 600
            }}>
              {offer.salaryMin.toLocaleString('pl-PL')} – {offer.salaryMax.toLocaleString('pl-PL')} {offer.currency}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
              Wynagrodzenie do negocjacji
            </span>
          )}
        </div>
      </div>

      {/* PRAWA: gwiazdka + data + przycisk */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onSaveToggle && (
            <button
              onClick={e => { e.stopPropagation(); onSaveToggle(offer.id); }}
              title={isSaved ? 'Usuń z zapisanych' : 'Zapisz ofertę'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: 20,
                lineHeight: 1,
                color: isSaved ? '#f59e0b' : '#d1d5db',
                transition: 'color 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = isSaved ? '#d97706' : '#f59e0b';
                e.currentTarget.style.transform = 'scale(1.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = isSaved ? '#f59e0b' : '#d1d5db';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isSaved ? '★' : '☆'}
            </button>
          )}
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
            {new Date(offer.createdAt).toLocaleDateString('pl-PL')}
          </span>
        </div>
        {onActionClick && (
          <button
            onClick={() => onActionClick(offer.id)}
            style={{
              background: '#0f1923', color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '9px 20px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1e3a5f')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0f1923')}
          >
            {actionLabel} →
          </button>
        )}
      </div>
    </div>
  );
};
