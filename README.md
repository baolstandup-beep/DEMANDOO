# DEMANDOO — Inscription & Sauvegarde Automatique des Conducteurs

Application Web moderne pour la gestion et l'inscription automatique des nouveaux conducteurs sur **Supabase** (PostgreSQL + Storage + RLS).

## 🚀 Fonctionnalités

- 📝 **Formulaire d'inscription** : Nom, prénom, téléphone, email, numéro de permis, type de véhicule et ville.
- 📄 **Upload des permis de conduire** : Téléversement automatique des scans/photos du permis dans Supabase Storage (`permis-conducteurs`).
- ⚡ **Sauvegarde instantanée** : Insertion automatique dans la base PostgreSQL Supabase via PostgREST.
- 📊 **Tableau de bord en temps réel** : Affichage et filtrage des conducteurs inscrits.
- 🔒 **Sécurisé** : Activation du Row Level Security (RLS) pour la protection des données.

## 📁 Structure du projet

```
demandoo/
├── index.html            # Interface web (Formulaire & Dashboard)
├── styles.css            # Styles modernes et responsive
├── supabase_schema.sql   # Script SQL complet de configuration Supabase
└── js/
    ├── supabaseClient.js # Configuration des clés API Supabase
    └── app.js            # Logique métier et requêtes Supabase
```

## 🛠️ Configuration & Installation

1. **Supabase BDD & Storage** :
   - Exécutez le fichier `supabase_schema.sql` dans le **SQL Editor** de Supabase.
2. **Clés d'API** :
   - Mettez à jour `js/supabaseClient.js` avec votre `SUPABASE_URL` et `SUPABASE_ANON_KEY`.
3. **Lancer l'application** :
   - Ouvrez `index.html` dans n'importe quel navigateur Web.
