import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  Car, 
  Star,
  Users,
  AlertCircle,
  MessageCircle,
  Clock,
  Info
} from 'lucide-react';

export const DriverProfilePage = () => {
  const { driverId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripId = searchParams.get('tripId');
  
  const { drivers, getTripById } = useTrips();
  const { user } = useAuth();
  
  const [driver, setDriver] = useState(null);
  const [trip, setTrip] = useState(null);
  
  useEffect(() => {
    // Si on a un tripId, on le récupère (il contient aussi le chauffeur si c'est mocké, 
    // mais on récupère d'abord le chauffeur explicitement)
    if (tripId) {
      const foundTrip = getTripById(tripId);
      setTrip(foundTrip);
      if (foundTrip && foundTrip.driver) {
        setDriver(foundTrip.driver);
        return;
      }
    }
    
    // Sinon, on cherche le chauffeur dans la liste
    const foundDriver = drivers.find(d => d.id === driverId);
    setDriver(foundDriver);
  }, [driverId, tripId, drivers, getTripById]);

  if (!driver) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Chauffeur introuvable</h2>
        <button onClick={() => navigate('/trajets')} className="px-6 py-3 rounded-xl font-bold text-white bg-demandoo-500 hover:bg-demandoo-600 transition-colors">
          Retour aux trajets
        </button>
      </div>
    );
  }

  const displayPhone = driver.phone;

  const cleanDriverPhone = (driver.whatsapp_phone || driver.phone || '').replace(/[\s\-\(\)\+]/g, '');

  let whatsappMessage = `Bonjour ${driver.full_name}, je vous contacte depuis Demandoo.`;
  if (trip) {
    const formattedDate = new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = new Date(trip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    whatsappMessage = `Bonjour ${driver.full_name},\n\nJe vous contacte depuis Demandoo concernant votre trajet :\n📍 ${trip.departure_city} → ${trip.arrival_city}\n📅 ${formattedDate} à ${formattedTime}\n\nJe souhaite réserver une place. Merci.`;
  }

  const memberSince = driver.created_at 
    ? new Date(driver.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : "janvier 2024";

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* ================= HEADER PROFIL ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-demandoo-50 to-white"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <img 
              src={driver.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(driver.full_name) + "&background=14B8A6&color=fff"} 
              alt={driver.full_name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-4"
            />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{driver.full_name}</h1>
            
            <div className="flex items-center gap-4 text-sm font-bold text-slate-600 mb-6">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                {driver.rating?.toFixed(1) || "N/A"}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{driver.review_count || driver.total_trips || 0} avis</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-slate-400 font-medium">Membre depuis {memberSince}</span>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${driver.is_identity_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
                {driver.is_identity_verified ? 'Identité vérifiée' : 'Identité en cours'}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${driver.is_phone_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
                {driver.is_phone_verified ? 'Téléphone vérifié' : 'Téléphone en cours'}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${driver.license_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
                {driver.license_verified ? 'Permis vérifié' : 'Permis en cours'}
              </div>
            </div>
          </div>
        </div>

        {/* ================= TRAJET (SI CONTEXTE) ================= */}
        {trip && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Détails du trajet</h2>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
                <div className="w-3 h-3 rounded-full border-2 border-demandoo-500"></div>
                <div className="w-0.5 h-10 bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-demandoo-500"></div>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-base font-black text-slate-900">{trip.departure_city}</h4>
                  <p className="text-xs text-slate-500">{trip.departure_address}</p>
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{trip.arrival_city}</h4>
                  <p className="text-xs text-slate-500">{trip.arrival_address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Date</span>
                <span className="text-xs font-black text-slate-800">
                  {new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Heure</span>
                <span className="text-xs font-black text-slate-800">
                  {new Date(trip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Places dispo</span>
                <span className="text-xs font-black text-emerald-600">{trip.seats_available}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Prix indicatif</span>
                <span className="text-xs font-black text-demandoo-600">{trip.price_per_seat} FCFA</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2 pt-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Le prix est affiché à titre indicatif. Le paiement se fait directement avec le chauffeur au moment du départ. Demandoo ne prélève aucune commission.
              </p>
            </div>
          </div>
        )}

        {/* ================= LE VÉHICULE ================= */}
        {driver.vehicle && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Car className="w-6 h-6 text-demandoo-500" />
                Le véhicule
              </h2>
              {driver.vehicle_verified && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Vérifié
                </span>
              )}
            </div>

            {/* Photos */}
            {driver.vehicle.photos && driver.vehicle.photos.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
                {driver.vehicle.photos.map((photo, idx) => (
                  <img 
                    key={idx} 
                    src={photo} 
                    alt={`Véhicule photo ${idx+1}`} 
                    className="w-64 h-48 rounded-2xl object-cover shrink-0 snap-center shadow-sm border border-slate-100" 
                  />
                ))}
              </div>
            ) : driver.vehicle.image_url ? (
              <img 
                src={driver.vehicle.image_url} 
                alt="Véhicule" 
                className="w-full h-48 sm:h-64 rounded-2xl object-cover shadow-sm border border-slate-100" 
              />
            ) : null}

            {/* Informations */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Véhicule</span>
                <span className="text-sm font-black text-slate-800">{driver.vehicle.make} {driver.vehicle.model}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Couleur</span>
                <span className="text-sm font-black text-slate-800">{driver.vehicle.color}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Type</span>
                <span className="text-sm font-black text-slate-800">{driver.vehicle.vehicle_type || 'Standard'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Immatriculation</span>
                <span className="text-sm font-black text-slate-800">
                  {driver.vehicle.license_plate 
                    ? driver.vehicle.license_plate.replace(/([A-Z]+-)(\d{4})(-[A-Z]+)/, "$1****$3") 
                    : "DK-****-XX"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Confort</span>
                <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                  {driver.vehicle.air_conditioning ? "Climatisé" : "Non climatisé"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Places passagers</span>
                <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  {driver.vehicle.seats_count} places
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= CONTACT DESKTOP ONLY ================= */}
        <div className="hidden sm:block bg-demandoo-50 rounded-3xl p-8 border border-demandoo-100 text-center space-y-6">
          <h3 className="text-xl font-black text-slate-900">Contacter {driver.full_name.split(' ')[0]}</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href={`tel:${driver.phone}`} 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black transition-colors"
            >
              <Phone className="w-5 h-5" />
              Appeler le {displayPhone}
            </a>
            <a 
              href={`https://wa.me/${cleanDriverPhone}?text=${encodeURIComponent(whatsappMessage)}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-2xl font-black transition-colors shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            La réservation s'effectue de gré à gré sans commission de Demandoo.
          </p>
        </div>

      </div>

      <div className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="flex gap-3">
          <a 
            href={`tel:${driver.phone}`} 
            className="flex-1 flex flex-col items-center justify-center py-3 bg-slate-100 text-slate-900 rounded-2xl transition-colors active:bg-slate-200"
          >
            <Phone className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Appeler</span>
          </a>
          <a 
            href={`https://wa.me/${cleanDriverPhone}?text=${encodeURIComponent(whatsappMessage)}`} 
            target="_blank" 
            rel="noreferrer"
            className="flex-[2] flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-2xl shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-black">WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
};
