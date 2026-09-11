import React from 'react';

export const DriverStats = ({ publishedTripsThisMonth, limit, receivedBookings, offeredSeats, acceptedBookingsCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-0.5 transition-transform">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Trajets ce mois-ci
        </span>
        <div className="text-2xl font-black text-slate-900">
          {publishedTripsThisMonth} {limit ? `/ ${limit}` : ''}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-0.5 transition-transform">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Demandes reçues
        </span>
        <div className="text-2xl font-black text-slate-900">{receivedBookings}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-0.5 transition-transform">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Places disponibles
        </span>
        <div className="text-2xl font-black text-slate-900">{offeredSeats}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-0.5 transition-transform group relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Réservations confirmées
          </span>
          <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 cursor-help" title="Nombre de passagers dont vous avez accepté la demande.">
            ?
          </span>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {acceptedBookingsCount}
        </div>
      </div>
    </div>
  );
};
