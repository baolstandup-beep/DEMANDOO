import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export const ReviewModal = ({ isOpen, onClose, trip, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !trip) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Veuillez sélectionner une note entre 1 et 5 étoiles.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: dbError } = await supabase.from('reviews').insert([
        {
          trip_id: trip.id,
          driver_id: trip.driver_id,
          passenger_id: user.id,
          rating: rating,
          comment: comment.trim()
        }
      ]);

      if (dbError) {
        if (dbError.code === '23505') {
          throw new Error("Vous avez déjà laissé un avis pour ce trajet.");
        }
        throw dbError;
      }

      setLoading(false);
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de l'envoi de votre avis.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800">Évaluer ce trajet</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm font-bold text-slate-700">
              Comment s'est passé votre trajet avec <span className="text-demandoo-600">{trip.driver?.full_name}</span> ?
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Laissez un commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Le conducteur était très ponctuel et agréable..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 resize-none"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-xs text-rose-700 font-medium text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-demandoo-500 hover:bg-demandoo-600 text-white rounded-xl font-bold text-sm transition-colors flex justify-center items-center shadow-lg shadow-demandoo-500/25 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Envoyer mon avis'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
