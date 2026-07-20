# G-Dept Pro — SaaS multi-églises

Application de gestion des départements d'église (procédures, checklists, rappels, suivi d'équipe),
en abonnement mensuel (19,99 €) ou annuel (200 €).

## Stack
- **Frontend** : React 18 + Vite + react-router-dom
- **Backend** : Firebase (Firestore, Authentication, Cloud Functions v2)
- **Paiement** : Stripe (Checkout + Customer Portal)

## Démarrer en local

```bash
npm install
cp .env.example .env        # remplir avec ton projet Firebase + tes clés Stripe publiques
npm run dev
```

## Déploiement en production

➡️ Suivre **`README_DEPLOIEMENT.md`** dans l'ordre — il couvre Firebase, Stripe, Cloud Functions
(Secret Manager), les règles Firestore, et l'hébergement du frontend.

## Structure du projet

```
src/
  pages/         # Landing, Pricing, Login, Signup, AppShell, Settings, SuperAdmin, AcceptInvite, Legal
  components/    # Sidebar, TabContent, TrialBanner, PaywallScreen, ProtectedRoute
  context/       # AuthContext (auth + organisation + statut abonnement)
functions/       # Cloud Functions : création d'organisation, invitations, Stripe (checkout/portail/webhook)
firestore.rules  # Isolation des données par organisation (multi-tenant)
FIRESTORE_SCHEMA.md  # Détail des collections Firestore
```

## À compléter avant mise en ligne commerciale
Voir la section "Avant la première vente réelle" de `README_DEPLOIEMENT.md`, notamment les mentions
légales (`src/pages/Legal.jsx`, marqué `[À COMPLÉTER]`).
