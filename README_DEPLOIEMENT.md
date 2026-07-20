# G-Dept Pro — Checklist de déploiement

Suis ces étapes dans l'ordre. Compte environ 2-3h la première fois (hors relecture juridique).

## 1. Nouveau projet Firebase (ne pas réutiliser l'ancien "g-dept")

1. https://console.firebase.google.com → Créer un projet → nomme-le par ex. `gdept-pro-prod`
2. Active **Authentication** → méthode "Email/Mot de passe"
3. Active **Firestore Database** → mode production → région `europe-west1` (Belgique = proche, et conforme RGPD)
4. Active **Cloud Functions** (nécessite le plan Blaze — pay-as-you-go ; le coût réel avec peu d'utilisateurs est de quelques centimes/mois)
5. Récupère la config web : Paramètres du projet → Général → "Ajouter une application" → Web → copie les valeurs dans `.env` (voir `.env.example`)

## 2. Créer ton compte SUPER_ADMIN

Après ton premier déploiement, crée un compte normal via `/inscription`, puis dans la console Firestore,
modifie manuellement ton document `users/{ton-uid}` : change `role` en `"SUPER_ADMIN"`.
Tu pourras alors accéder à `/admin`.

## 3. Stripe

1. Crée un compte sur https://dashboard.stripe.com (mode Belgique/EUR)
2. Produits → Créer un produit "G-Dept Pro"
   - Prix récurrent mensuel : 19,99 € / mois → copie le `price_id` dans `VITE_STRIPE_PRICE_MONTHLY`
   - Prix récurrent annuel : 200 € / an → copie le `price_id` dans `VITE_STRIPE_PRICE_YEARLY`
3. Développeurs → Webhooks → Ajouter un endpoint :
   - URL : `https://europe-west1-<TON-PROJET>.cloudfunctions.net/stripeWebhook`
   - Événements à écouter : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copie le "Signing secret" (`whsec_...`)
4. Active le **Customer Portal** (Paramètres → Portail client) pour que les églises puissent gérer/résilier elles-mêmes
5. Reste en mode **Test** tant que tu n'as pas fini de tester tout le flow (cartes de test : 4242 4242 4242 4242)

## 4. Configurer les secrets des Cloud Functions

⚠️ Firebase déprécie l'ancienne méthode `functions:config:set` (retrait définitif fin mars 2027, mais
déjà déconseillée). On utilise donc **Secret Manager** pour les valeurs sensibles (clés Stripe) et un
fichier `.env` pour la seule valeur non sensible (l'URL du site).

```bash
cd functions
npm install
firebase use gdept-pro-prod

# Valeur non sensible → fichier .env
cp .env.example .env
# puis édite functions/.env et mets APP_URL=https://ton-domaine.be

# Secrets sensibles → Secret Manager (la CLI te demande de coller la valeur, rien ne s'affiche en clair)
firebase functions:secrets:set STRIPE_SECRET
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

firebase deploy --only functions
```

Pour tester en local avec l'émulateur, crée `functions/.secret.local` (à ajouter au `.gitignore`, déjà fait)
avec les mêmes valeurs en clair, uniquement pour ton poste.

## 5. Déployer les règles Firestore

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 6. Frontend

```bash
npm install
cp .env.example .env   # puis remplis les valeurs Firebase + Stripe (clé PUBLIQUE + price IDs)
npm run build
```

Déploie le dossier `dist/` sur Netlify (comme tes autres projets). Pense à ajouter les variables
d'environnement `VITE_*` dans les paramètres Netlify (Site settings → Environment variables), pas
seulement dans le `.env` local.

## 7. Nom de domaine

Achète un nom de domaine dédié (ex. `gdeptpro.be` ou `.com`) plutôt que de vendre un produit commercial
sur un sous-domaine Netlify — ça compte pour la crédibilité auprès des églises. Pointe-le vers Netlify,
puis mets à jour `app.url` dans la config des Cloud Functions et les URLs de succès/annulation Stripe.

## 8. Avant la première vente réelle

- [ ] Faire relire les pages Mentions légales / Confidentialité par toi-même a minima, idéalement un
      professionnel — les emplacements `[À COMPLÉTER]` dans `src/pages/Legal.jsx` doivent être remplis
      (numéro d'entreprise, régime TVA applicable à ton activité indépendante, etc.)
- [ ] Tester le parcours complet une fois en mode Stripe Test : inscription → essai → paiement →
      webhook reçu → statut `active` visible dans `/admin`
- [ ] Tester l'invitation d'un membre EQUIPE de bout en bout
- [ ] Basculer Stripe en mode Live et remplacer `sk_test_`/`whsec_test_` par les valeurs live
- [ ] Vérifier que `firestore.rules` est bien déployé (pas juste en local) avant d'inviter de vrais clients

## Limitations connues de cette V1 (à itérer ensuite)

- Pas d'envoi d'email automatique pour les invitations (le lien est affiché à copier-coller manuellement)
- Pas de rappel automatique avant fin d'essai (le bandeau dans l'app suffit pour un lancement, un email
  à J-3 serait une bonne V2 via une Cloud Function planifiée)
- Le PIN admin pour valider une tâche "en cours" (`VITE_ADMIN_PIN`) est un code partagé simple, pas un
  vrai contrôle d'accès — acceptable pour un usage interne église, à muscler si besoin plus tard
