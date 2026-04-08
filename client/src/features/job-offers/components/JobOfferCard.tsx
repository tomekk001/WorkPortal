// Eksportujemy interfejs, by móc go użyć również w głównym widoku
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
  createdAt: string;
}

interface JobOfferCardProps {
  offer: JobOffer;
  // Opcjonalna funkcja, jeśli chcemy mieć przycisk akcji (np. "Aplikuj" lub "Edytuj")
  onActionClick?: (offerId: number) => void; 
  actionLabel?: string;
}

export const JobOfferCard = ({ offer, onActionClick, actionLabel = "Aplikuj" }: JobOfferCardProps) => {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      
      <div>
        <h4 className="text-lg font-bold text-blue-700 mb-1">{offer.title}</h4>
        <p className="font-semibold text-gray-800 mb-1">{offer.company?.companyName || 'Brak nazwy firmy'}</p>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <span>📍</span> {offer.location}
        </p>
      </div>

      <div className="flex flex-col sm:items-end w-full sm:w-auto gap-3">
        {offer.salaryMin && offer.salaryMax ? (
          <p className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm inline-block">
            {offer.salaryMin} - {offer.salaryMax} {offer.currency}
          </p>
        ) : (
          <p className="text-gray-400 text-sm italic">Wynagrodzenie do negocjacji</p>
        )}
        
        {onActionClick && (
          <button 
            onClick={() => onActionClick(offer.id)}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-6 rounded-md transition-colors w-full sm:w-auto"
          >
            {actionLabel}
          </button>
        )}
      </div>

    </div>
  );
};