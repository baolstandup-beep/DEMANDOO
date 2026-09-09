import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { VerifiedDriverBadge, PhoneVerifiedBadge, IdentityVerifiedBadge, VehicleVerifiedBadge } from '../components/common/Badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  ShieldCheck, 
  Star, 
  Phone, 
  Info, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Users,
  ShieldAlert
} from 'lucide-react';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTripById } = useTrips();
  const { user } = useAuth();

  const trip = getTripById(id);

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Trajet introuvable</h2>
        <p className="text-xs text-slate-500">Ce trajet n'existe pas ou a été retiré par le conducteur.</p>
        <Link to="/trajets" className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-demandoo-500">
          Retour aux trajets
        </Link>
      </div>
    );
  }

  // Mask plate number for privacy (e.g. DK-8492-BC -> DK-***-BC)
  const formatMaskedPlate = (plate) => {
    if (!plate) return "DK-***-SN";
    const parts = plate.split('-');
    if (parts.length >= 3) {
      return `${parts[0]}-***-${parts[2]}`;
    }
    return `${plate.substring(0, 2)}-***-${plate.substring(plate.length - 2)}`;
  };

  const handleBookClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/reservation/${trip.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* BACK NAVIGATION */}
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-demandoo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux résultats
      </button>

      {/* HEADER TITLE CARD */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-extrabold text-demandoo-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
              Trajet Programmé
            </span>
            <h1 className="text-2xl font-black text-demandoo-dark mt-2">
              {trip.departure_city} → {trip.arrival_city}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Départ prévu le {new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Prix par passager</span>
            <span className="text-2xl font-black text-demandoo-600">
              {trip.price_per_seat.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        {/* ITINERARY DETAILED TIMELINE */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              <MapPin className="w-4 h-4 text-demandoo-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lieu de rendez-vous (Départ)</span>
              <h4 className="text-sm font-black text-demandoo-dark">{trip.departure_city}</h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{trip.departure_address}</p>
            </div>
          </div>

          <div className="ml-4 pl-7 border-l-2 border-dashed border-demandoo-400/50 py-1 text-xs text-slate-500 flex items-center gap-2 font-bold">
            <Clock className="w-3.5 h-3.5 text-demandoo-600" />
            Durée estimée : {trip.estimated_duration}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              <MapPin className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Point d'arrivée</span>
              <h4 className="text-sm font-black text-demandoo-dark">{trip.arrival_city}</h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{trip.arrival_address}</p>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* DRIVER INFO & BADGES (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-black text-demandoo-dark border-b border-slate-100 pb-3">
              Le conducteur
            </h3>

            <div className="flex items-start gap-4">
              <img 
                src={trip.driver?.avatar_url} 
                alt={trip.driver?.full_name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-demandoo-500 shrink-0 shadow-sm"
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-black text-demandoo-dark">{trip.driver?.full_name}</h4>
                  <VerifiedDriverBadge />
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {trip.driver?.rating} ({trip.driver?.total_trips} trajets)
                  </span>
                  <span>•</span>
                  <span>Permis & CNI Vérifiés</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <IdentityVerifiedBadge />
                  <PhoneVerifiedBadge />
                  <VehicleVerifiedBadge />
                </div>
              </div>
            </div>

            {/* VEHICLE DETAILS CARD */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Car className="w-6 h-6 text-demandoo-600" />
                <div>
                  <h5 className="font-extrabold text-demandoo-dark">
                    {trip.driver?.vehicle?.make} {trip.driver?.vehicle?.model} ({trip.driver?.vehicle?.color})
                  </h5>
                  <p className="text-[11px] text-slate-500 font-medium">Véhicule climatisé et entretenu</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-200 text-slate-700 tracking-wider">
                IMMAT : {formatMaskedPlate(trip.driver?.vehicle?.plate)}
              </span>
            </div>

          </div>

          {/* TRIP AMENITIES & RULES */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-black text-demandoo-dark border-b border-slate-100 pb-3">
              Conditions de voyage
            </h3>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Bagages autorisés en coffre
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Climatisation à bord
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Véhicule non-fumeur
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Paiement sécurisé Wave & OM
              </li>
            </ul>
          </div>

        </div>

        {/* BOOKING SIDEBAR ACTION CARD (1 col) */}
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-xl sticky top-20 space-y-5">
            <div className="border-b border-slate-100 pb-3 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Disponibilité</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-demandoo-dark flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-demandoo-600" />
                  {trip.seats_available} place(s) restante(s)
                </span>
                <span className="text-xl font-black text-demandoo-600">
                  {trip.price_per_seat.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <button
              onClick={handleBookClick}
              className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-lg shadow-demandoo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Réserver ce trajet
            </button>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1 font-medium">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-demandoo-600" />
                Garantie de remboursement
              </div>
              <p>Annulation gratuite jusqu'à 24h avant le départ du trajet.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
