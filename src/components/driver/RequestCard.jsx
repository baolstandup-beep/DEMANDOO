import React from 'react';
import { WhatsAppButton } from './WhatsAppButton';

export const RequestCard = ({ booking, onAccept, onReject, driverName }) => {
  const tripTitle = booking.trip ? `${booking.trip.departure_city} → ${booking.trip.arrival_city}` : 'Trajet inconnu';
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-slate-100 flex flex-col md:flex-row gap-5 justify-between hover:border-demandoo-200 transition-colors">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={booking.passenger?.avatar_url || "https://i.pravatar.cc/150"} 
              alt={booking.passenger_name} 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div>
              <h4 className="font-black text-slate-900 text-sm leading-tight">{booking.passenger_name}</h4>
              <p className="text-xs text-slate-500 font-medium">
                {booking.status === 'accepted' || booking.status === 'completed' 
                  ? booking.passenger_phone 
                  : 'Contact masqué'}
              </p>
            </div>
          </div>
          
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
            ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
              booking.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
              booking.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 
              'bg-slate-100 text-slate-500'}`}
          >
            {booking.status === 'pending' ? 'En attente' : 
             booking.status === 'accepted' ? 'Acceptée' : 
             booking.status === 'rejected' ? 'Refusée' : booking.status}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100/50">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Trajet</span>
            <span className="font-bold text-slate-700">{tripTitle}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Places</span>
            <span className="font-bold text-slate-700">{booking.seats_booked}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Date</span>
            <span className="font-bold text-slate-700">
              {booking.trip ? new Date(booking.trip.departure_datetime).toLocaleDateString('fr-FR') : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row md:flex-col gap-2 md:w-32 shrink-0 justify-center">
        {booking.status === 'pending' && (
          <>
            <button 
              onClick={() => onAccept(booking.id)} 
              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Accepter
            </button>
            <button 
              onClick={() => onReject(booking.id)} 
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
            >
              Refuser
            </button>
          </>
        )}
        {['accepted', 'completed'].includes(booking.status) && (
          <WhatsAppButton 
            phone={booking.passenger_phone}
            passengerName={booking.passenger_name}
            driverName={driverName}
            tripTitle={tripTitle}
          />
        )}
      </div>
    </div>
  );
};
