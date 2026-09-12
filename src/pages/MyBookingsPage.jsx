import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Ticket, 
  MapPin, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Clock, 
  Phone, 
  XCircle,
  MessageSquare
} from 'lucide-react';

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const { bookings, addReview, reviews } = useTrips();
  const { addNotification } = useNotifications();

  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const myBookings = bookings.filter(b => b.passenger_id === user?.id || b.passenger_name === user?.full_name);

  const handlePublishReview = (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setReviewError('');

    try {
      addReview({
        bookingId: reviewBooking.id,
        tripId: reviewBooking.trip_id,
        reviewerId: user?.id,
        revieweeId: reviewBooking.trip?.driver_id || 'drv-001',
        rating: rating,
        comment: comment
      });

      setReviewBooking(null);
      setComment('');
      addNotification({
        title: "Avis publié !",
        message: "Merci d'avoir évalué votre chauffeur sur Demandoo.",
        type: "success"
      });
    } catch (err) {
      setReviewError(err.message || "Erreur lors de la publication de l'avis.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-demandoo-dark tracking-tight">
          Mes Réservations de Covoiturage
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Retrouvez vos billets électroniques et l'historique de vos déplacements
        </p>
      </div>

      {myBookings.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 space-y-4 max-w-md mx-auto shadow-md">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-demandoo-dark">Aucune réservation trouvée</h3>
          <p className="text-xs text-slate-500 font-medium">Vous n'avez pas encore réservé de trajet de covoiturage.</p>
          <Link to="/trajets" className="inline-block px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-md shadow-demandoo-500/20">
            Trouver un trajet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myBookings.map(b => {
            const hasReviewed = reviews.some(r => r.booking_id === b.id);
            return (
              <div key={b.id} className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover-lift space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Réf. Billet : {b.id}</span>
                    <h3 className="text-base font-black text-demandoo-dark">
                      {b.trip?.departure_city} → {b.trip?.arrival_city}
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wide self-start sm:self-auto">
                    {b.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-extrabold uppercase">Conducteur</span>
                    <span className="font-extrabold text-demandoo-dark">{b.trip?.driver?.full_name || 'Modou Diop'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-extrabold uppercase">Contact Chauffeur</span>
                    {b.trip?.driver?.phone ? (
                      <div className="flex flex-col gap-1 mt-1">
                        <a href={`tel:${b.trip?.driver?.phone}`} className="font-bold text-demandoo-600 flex items-center gap-1 hover:underline">
                          <Phone className="w-3 h-3" />
                          {b.trip?.driver?.phone}
                        </a>
                        <a 
                          href={`https://wa.me/${(b.trip?.driver?.phone || '').replace(/[\s\-\(\)]/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Bonjour ${b.trip?.driver?.full_name || 'chauffeur'}, je suis ${b.passenger_name}, votre passager Demandoo pour le trajet ${b.trip?.departure_city} → ${b.trip?.arrival_city}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-emerald-600 flex items-center gap-1 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp direct
                        </a>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-500 italic">Non renseigné</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-extrabold uppercase">Point de rdv</span>
                    <span className="font-bold text-slate-800">{b.pickup_point}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-extrabold uppercase">Règlement direct</span>
                    <span className="font-black text-demandoo-600">{b.total_price?.toLocaleString('fr-FR')} FCFA ({b.seats_booked} pl)</span>
                    <span className="block text-[9px] text-slate-400 font-medium">À remettre au chauffeur</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  {!hasReviewed ? (
                    <button
                      onClick={() => setReviewBooking(b)}
                      className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-demandoo-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Star className="w-3.5 h-3.5 fill-demandoo-600 text-demandoo-600" />
                      Laisser un avis post-trajet
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Avis déjà publié
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* POST TRIP REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-elevated border border-slate-100 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-demandoo-dark text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Évaluer votre trajet de covoiturage
              </h3>
              <button onClick={() => setReviewBooking(null)} className="text-slate-400 font-extrabold text-xs">Annuler</button>
            </div>

            {reviewError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">{reviewError}</div>
            )}

            <form onSubmit={handlePublishReview} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Note globale (1 à 5 étoiles)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 focus:outline-none"
                    >
                      <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                  <span className="font-black text-slate-900 text-sm ml-2">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Votre commentaire (conduite, ponctualité, courtoisie...)</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: Excellent trajet, chauffeur très ponctuel et conduite très sûre..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-demandoo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-md shadow-demandoo-500/20 active:scale-95 transition-all"
              >
                Publier mon avis authentique
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
