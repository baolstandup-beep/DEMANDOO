import React from 'react';
import { RequestCard } from './RequestCard';
import { Ticket } from 'lucide-react';

export const RecentRequests = ({ bookings, onAccept, onReject, driverName, tripId = null }) => {
  
  const relevantBookings = tripId 
    ? bookings.filter(b => b.trip_id === tripId)
    : bookings.slice(0, 5); // Show only recent 5 on dashboard

  if (relevantBookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
        <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <h3 className="text-base font-black text-slate-900">Aucune nouvelle demande</h3>
        <p className="text-sm text-slate-500 mt-1">Les demandes de réservation de vos passagers apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {relevantBookings.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map(booking => (
        <RequestCard 
          key={booking.id}
          booking={booking}
          onAccept={onAccept}
          onReject={onReject}
          driverName={driverName}
        />
      ))}
    </div>
  );
};
