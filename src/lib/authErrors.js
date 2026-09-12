/**
 * authErrors.js
 * Traduction centralisée des erreurs Supabase Auth en messages français lisibles.
 */

export function translateAuthError(error) {
  if (!error) return "Une erreur inattendue s'est produite.";

  const message = typeof error === 'string'
    ? error.toLowerCase()
    : (error?.message || '').toLowerCase();

  if (error?.message) {
    console.error('[Auth Error]', error.message, error);
  }

  if (message.includes('anonymous sign-ins are disabled') || message.includes('anonymous')) {
    return "Impossible de créer votre compte. Veuillez réessayer.";
  }
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.includes('user already registered') || message.includes('already been registered') || message.includes('already exists')) {
    return "Un compte existe déjà avec ces informations. Connectez-vous.";
  }
  if (message.includes('email not confirmed')) {
    return "Veuillez confirmer votre email avant de vous connecter.";
  }
  if (message.includes('rate limit') || message.includes('too many requests') || message.includes('over_email_send_rate_limit') || message.includes('email rate limit')) {
    return "Trop de tentatives. Veuillez réessayer dans 1 heure.";
  }
  if (message.includes('password') && message.includes('weak')) {
    return "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
  }
  if (message.includes('password should be at least')) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (message.includes('invalid email')) {
    return "Adresse email invalide.";
  }
  if (message.includes('network') || message.includes('fetch')) {
    return "Problème de connexion internet. Vérifiez votre réseau.";
  }
  if (message.includes('provider is not enabled') || message.includes('unsupported provider')) {
    return "Cette méthode de connexion n'est pas disponible pour le moment.";
  }
  if (message.includes('token') && message.includes('expired')) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }
  if (message.includes('signup is disabled')) {
    return "Les inscriptions sont temporairement désactivées. Réessayez plus tard.";
  }

  return "Impossible de traiter votre demande. Veuillez réessayer.";
}
