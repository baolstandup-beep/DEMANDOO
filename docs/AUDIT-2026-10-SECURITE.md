# Audit Demandoo — octobre 2026 : corrections et mise en production

Branche : `fix/audit-securite-ux`

## ⚠️ Ordre de mise en production (important)

Le code et la base doivent être mis à jour **ensemble**. Sinon, l'offre gratuite et le paiement ne fonctionnent pas.

1. **Supabase → SQL Editor** : exécuter `supabase/migrations/05_security_hardening.sql`.
2. **Vercel → Settings → Environment Variables** (Production) :
   | Variable | Rôle |
   |---|---|
   | `SUPABASE_SERVICE_ROLE_KEY` | requise par `/api/payments/checkout` et `/api/verify-kyc` |
   | `WAVE_API_KEY` et/ou `BICTORYS_API_KEY` | paiement réel (sans clé : message « paiement indisponible ») |
   | `GEMINI_API_KEY` | pré-vérification IA des permis (sans clé : revue manuelle) |
   | `ALLOWED_ORIGINS`, `PUBLIC_SITE_URL` | à mettre à jour si vous passez sur un nom de domaine |
   | `N8N_VOICE_WEBHOOK_URL`, `DEMANDOO_VOICE_KEY` | facultatif (voir § Recherche vocale) |
   Supprimer `VITE_WAVE_API_KEY`, `VITE_BICTORYS_API_KEY`, `VITE_NIMBASMS_*` s'ils existent : tout `VITE_*` est public.
3. **Supabase → Edge Functions** : redéployer `payment_webhook`, puis
   `supabase secrets set WAVE_WEBHOOK_SECRET=… PAYMENT_WEBHOOK_SECRET=…`.
   Chez Wave / Bictorys, déclarer l'URL du webhook :
   `https://izoytsibwmnzagbraqdg.supabase.co/functions/v1/payment_webhook`.
4. Déployer la branche sur Vercel (merge dans `main`).

## Failles corrigées

| # | Gravité | Problème | Correction |
|---|---|---|---|
| 1 | Critique | `/abonnement?payment=success&plan_id=…` activait un abonnement **et** passait le chauffeur en « VÉRIFIÉ », sans paiement ni KYC | Activation uniquement par webhook signé (`activate_paid_subscription`) ; offre gratuite via RPC `start_free_trial` (1 fois) |
| 2 | Critique | RPC `mock_payment_webhook` appelable par tout utilisateur → plan Pro gratuit | Fonction supprimée |
| 3 | Critique | `completeDriverOnboarding` posait `driver_status = VERIFIED` depuis le navigateur | Le navigateur ne peut plus que soumettre (`PENDING`) ; trigger SQL sur les champs sensibles |
| 4 | Critique | `/api/verify-kyc` sans authentification : n'importe qui pouvait valider ou **refuser** n'importe quel chauffeur | Identité tirée du jeton Supabase, limite de débit, l'IA ne peut qu'approuver (doute → revue humaine) |
| 5 | Haute | Webhook `payment_webhook` sans signature : un simple POST activait un abonnement | Signature Wave (HMAC + anti-rejeu) ou secret partagé ; montant contrôlé côté base |
| 6 | Haute | `DriverRouteGuard` ignorait `allowedStatuses` : un chauffeur non vérifié pouvait publier | Garde corrigé + politique RLS restrictive sur `trips` |
| 7 | Haute | Écriture directe dans `driver_subscriptions` / `payments` autorisée aux utilisateurs | `REVOKE` + suppression des politiques INSERT |
| 8 | Haute | Erreurs serveur transformées en « succès » local (localStorage) en production | Mode démo limité au développement (`import.meta.env.DEV`) |
| 9 | Moyenne | Connexion : recherche `ilike` dans `profiles` exposant e-mails/téléphones | Recherche supprimée |
| 10 | Moyenne | CORS `/api/auth/*` reflétait toute origine avec cookies | CORS restreint aux origines Demandoo |
| 11 | Moyenne | Clés Wave/Bictorys/NimbaSMS prévues en `VITE_*` (donc publiques) | Paiement déplacé dans `/api/payments/checkout` |
| 12 | Moyenne | Webhook n8n de recherche vocale appelé directement | Proxy `/api/voice` (taille, débit, secret partagé) |
| 13 | Basse | Traces d'erreur JavaScript affichées aux visiteurs | Écran d'erreur propre ; détails seulement en dev |

## Accessibilité, SEO, performance, UX

- Zoom réactivé (`user-scalable=no` retiré) ; 30+ champs reliés à leur label ; lien « Aller au contenu » ; interrupteur « Conducteurs vérifiés » utilisable au clavier ; liens sociaux morts retirés.
- Open Graph / Twitter (aperçu WhatsApp avec `og-image.jpg` 1200×630), canonical, JSON-LD, `robots.txt`, `sitemap.xml`, titres harmonisés.
- JS initial : **981 Ko → ~520 Ko** (gzip 263 → ~149 Ko) grâce au découpage par route ; Leaflet chargé seulement avec la carte ; CSS Leaflet d'unpkg supprimé ; `console.log` retirés en production ; en-têtes de cache et de sécurité dans `vercel.json`.
- Service worker : pages en réseau d'abord, fichiers `/assets` en cache, jamais `/api`.
- Hero : contenu visible immédiatement sur mobile (plus de bloc vide), image qui ne chevauche plus le texte.
- Témoignages : les 6 avis fictifs (photos Unsplash) sont remplacés par les **vrais avis** de la table `reviews` ; la section est masquée tant qu'il y en a moins de 3.
- État vide « Aucun trajet » remplacé par des lignes populaires cliquables.
- Géolocalisation demandée uniquement aux chauffeurs en ligne (plus à chaque visiteur).
- `node_modules` (7 873 fichiers) retiré du dépôt git.

## Reste à faire (décisions produit)

- **Code PIN à 4 chiffres** : 10 000 combinaisons. Passer à un OTP SMS (Supabase Auth Phone) ou à 6 chiffres, et réduire la limite de connexion dans Supabase > Auth > Rate Limits.
- **Position GPS des chauffeurs** stockée dans `profiles` (lisible publiquement selon vos politiques RLS) : la déplacer dans une table dédiée, lisible uniquement par les passagers ayant réservé.
- **SMS de notification** : désactivés côté navigateur ; à brancher sur une fonction serveur qui vérifie le destinataire.
- **Workflow n8n** : vérifier l'en-tête `X-Demandoo-Key`, puis changer l'URL du webhook (l'actuelle est publique).
- **SEO avancé** : pré-rendu des pages de lignes (« Touba → Dakar ») ou migration Next.js.
- Images : convertir `images/UUU.png` (312 Ko) en WebP/AVIF.
- Fichiers obsolètes à la racine : `SearchPage_backup.jsx`, `admin.html.bak`, `scratch_return.jsx`, `test_*.cjs`.
