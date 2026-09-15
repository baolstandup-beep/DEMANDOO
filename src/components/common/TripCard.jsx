import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

export const TripCard = ({ trip, index = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Plafond du délai à 250ms max (index * 50)
  const delayMs = Math.min(index * 50, 250);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms',
        // Sur mobile, on annule le hover
      }}
      className={`
        group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm 
        flex flex-col justify-between space-y-4
        transition-all duration-[350ms] ease-out
        ${!hasMounted ? 'opacity-100' : isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 motion-reduce:opacity-100 motion-reduce:translate-y-0'}
        focus-within:ring-2 focus-within:ring-demandoo-500/20 focus-within:border-demandoo-200
        hover:shadow-md hover:border-demandoo-200 hover:-translate-y-[3px]
      `}
    >
      <style>{`
        @media (hover: none) {
          .group:hover {
            transform: none !important;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
          }
        }
      `}</style>
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img 
            src={trip.driver?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
            alt={trip.driver?.full_name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-demandoo-50 shadow-sm" 
            loading="lazy"
          />
          <div className="min-w-0">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-1 line-clamp-1">
              <span className="truncate">{trip.driver?.full_name}</span>
              {trip.driver?.driver_status === 'VERIFIED' && <ShieldCheck className="w-3.5 h-3.5 text-demandoo-500 shrink-0" title="Profil vérifié" />}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
        <div className="bg-slate-50 px-3 py-1 rounded-full text-slate-600 font-bold text-xs border border-slate-100 shrink-0 ml-2">
          {trip.seats_available} places
        </div>
      </div>

      <div className="relative pl-6 space-y-4 my-2 border-l-2 border-slate-100">
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-demandoo-500 border-4 border-white shadow-sm" />
          <p className="font-black text-slate-900 line-clamp-1">{trip.departure_city}</p>
          <p className="text-xs text-slate-500 font-medium">
            {new Date(trip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-800 border-4 border-white shadow-sm" />
          <p className="font-black text-slate-900 line-clamp-1">{trip.arrival_city}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
        <p className="text-xl font-black text-demandoo-600 truncate">
          {trip.price_per_seat.toLocaleString('fr-FR')} FCFA
        </p>
        <Link 
          to={`/trajet/${trip.id}`} 
          className="min-h-[44px] min-w-[44px] shrink-0 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-95 transition-all duration-[200ms] flex items-center justify-center"
          aria-label={`Voir le trajet de ${trip.departure_city} à ${trip.arrival_city}`}
        >
          Voir le trajet
        </Link>
      </div>
    </div>
  );
};
