/**
 * Notifications SMS.
 *
 * Les clés d'API (Wave, Bictorys, NimbaSMS) ne doivent JAMAIS être dans le navigateur :
 * toute variable VITE_* est publiée dans le bundle JavaScript.
 *  - Paiements : voir api/payments/checkout.js (serveur) et src/lib/api.js
 *  - SMS : à brancher sur une fonction serveur dédiée qui vérifie le destinataire
 *    (ex. uniquement le chauffeur du trajet réservé) avant d'envoyer.
 */
export async function sendSmsNotification({ to, message }) {
  const cleanPhone = (to || '').replace(/\s+/g, '');
  if (!cleanPhone) return { success: false, error: 'Numéro manquant' };

  if (import.meta.env.DEV) {
    console.info(`[SMS simulé → ${cleanPhone}] : "${message}"`);
  }
  return { success: true, simulated: true };
}
