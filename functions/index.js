const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const {
  validate,
  createOrganizationSchema,
  createInvitationSchema,
  acceptInvitationSchema,
  createCheckoutSessionSchema,
  createBillingPortalSessionSchema,
  assertIsResponsable,
  mapStripeStatus,
  intervalToPlan,
} = require('./helpers');

admin.initializeApp();
const db = admin.firestore();

const REGION = 'europe-west1';
const TRIAL_DAYS = 14;

// Secrets stockés dans Secret Manager (voir README_DEPLOIEMENT.md pour les commandes de configuration)
const STRIPE_SECRET = defineSecret('STRIPE_SECRET');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
// Valeurs non sensibles, définies dans functions/.env (voir functions/.env.example) — doivent
// correspondre aux VITE_STRIPE_PRICE_MONTHLY / VITE_STRIPE_PRICE_YEARLY du frontend, et servent
// ici à vérifier qu'un client n'envoie pas un price id arbitraire à createCheckoutSession.
const APP_URL = defineString('APP_URL');
const PRICE_MONTHLY = defineString('STRIPE_PRICE_MONTHLY');
const PRICE_YEARLY = defineString('STRIPE_PRICE_YEARLY');

// ---------------------------------------------------------------
// 1. Création d'une organisation à l'inscription
// ---------------------------------------------------------------
exports.createOrganization = onCall({ region: REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const { churchName, email } = validate(createOrganizationSchema, request.data);
  const uid = request.auth.uid;

  const orgRef = db.collection('organizations').doc();
  const now = Date.now();

  const batch = db.batch();
  batch.set(orgRef, {
    name: churchName.trim(),
    createdAt: now,
    createdBy: uid,
    plan: null,
    subscriptionStatus: 'trialing',
    trialEndsAt: now + TRIAL_DAYS * 24 * 60 * 60 * 1000,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    logoUrl: null,
  });
  batch.set(db.collection('users').doc(uid), {
    email, orgId: orgRef.id, role: 'RESPONSABLE',
  });
  batch.set(orgRef.collection('members').doc(uid), {
    email, role: 'RESPONSABLE', joinedAt: now, invitedBy: null,
  });
  // Quelques départements de démarrage pour montrer la valeur immédiatement
  ['Louange', 'Accueil', 'Enfants'].forEach((name) => {
    const deptRef = orgRef.collection('departments').doc();
    batch.set(deptRef, {
      name, procedure: '', checklist: [], reminders: [], pendingTasks: [], archives: [], createdAt: now,
    });
  });

  await batch.commit();
  return { orgId: orgRef.id };
});

// ---------------------------------------------------------------
// 2. Invitation d'un membre d'équipe
// ---------------------------------------------------------------
exports.createInvitation = onCall({ region: REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const { orgId, email, role } = validate(createInvitationSchema, request.data);
  await assertIsResponsable(db, request.auth.uid, orgId);

  const token = db.collection('_').doc().id; // génère un id aléatoire réutilisé comme token
  const now = Date.now();
  await db.collection('organizations').doc(orgId).collection('invitations').doc(token).set({
    email, role, createdAt: now, expiresAt: now + 7 * 24 * 60 * 60 * 1000, used: false,
  });

  return { link: `${APP_URL.value()}/invitation/${orgId}/${token}` };
});

exports.acceptInvitation = onCall({ region: REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const { orgId, token } = validate(acceptInvitationSchema, request.data);
  const uid = request.auth.uid;

  const inviteRef = db.collection('organizations').doc(orgId).collection('invitations').doc(token);
  const inviteSnap = await inviteRef.get();
  if (!inviteSnap.exists) throw new HttpsError('not-found', 'Invitation introuvable.');
  const invite = inviteSnap.data();
  if (invite.used) throw new HttpsError('failed-precondition', 'Invitation déjà utilisée.');
  if (invite.expiresAt < Date.now()) throw new HttpsError('failed-precondition', 'Invitation expirée.');

  const batch = db.batch();
  batch.set(db.collection('users').doc(uid), { email: invite.email, orgId, role: invite.role });
  batch.set(db.collection('organizations').doc(orgId).collection('members').doc(uid), {
    email: invite.email, role: invite.role, joinedAt: Date.now(), invitedBy: null,
  });
  batch.update(inviteRef, { used: true });
  await batch.commit();

  return { ok: true };
});

// ---------------------------------------------------------------
// 3. Stripe — Checkout (souscription)
// ---------------------------------------------------------------
exports.createCheckoutSession = onCall({ region: REGION, secrets: [STRIPE_SECRET] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const stripe = Stripe(STRIPE_SECRET.value());
  const { orgId, priceId } = validate(createCheckoutSessionSchema, request.data);
  const allowedPrices = [PRICE_MONTHLY.value(), PRICE_YEARLY.value()].filter(Boolean);
  if (!allowedPrices.includes(priceId)) {
    throw new HttpsError('invalid-argument', 'Prix invalide.');
  }
  await assertIsResponsable(db, request.auth.uid, orgId);

  const orgRef = db.collection('organizations').doc(orgId);
  const org = (await orgRef.get()).data();

  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: request.auth.token.email,
      metadata: { orgId },
    });
    customerId = customer.id;
    await orgRef.update({ stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL.value()}/app/parametres?checkout=success`,
    cancel_url: `${APP_URL.value()}/app/parametres?checkout=cancel`,
    metadata: { orgId },
    subscription_data: { metadata: { orgId } },
  });

  return { url: session.url };
});

// ---------------------------------------------------------------
// 4. Stripe — Portail client (gérer / résilier)
// ---------------------------------------------------------------
exports.createBillingPortalSession = onCall({ region: REGION, secrets: [STRIPE_SECRET] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const stripe = Stripe(STRIPE_SECRET.value());
  const { orgId } = validate(createBillingPortalSessionSchema, request.data);
  await assertIsResponsable(db, request.auth.uid, orgId);

  const org = (await db.collection('organizations').doc(orgId).get()).data();
  if (!org.stripeCustomerId) throw new HttpsError('failed-precondition', 'Aucun abonnement Stripe pour cette église.');

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${APP_URL.value()}/app/parametres`,
  });

  return { url: session.url };
});

// ---------------------------------------------------------------
// 5. Stripe — Webhook (source de vérité pour le statut d'abonnement)
// ---------------------------------------------------------------
exports.stripeWebhook = onRequest({ region: REGION, secrets: [STRIPE_SECRET, STRIPE_WEBHOOK_SECRET] }, async (req, res) => {
  const stripe = Stripe(STRIPE_SECRET.value());
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET.value());
  } catch (err) {
    console.error('Signature webhook invalide', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const obj = event.data.object;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const orgId = obj.metadata?.orgId;
        if (orgId) {
          const sub = await stripe.subscriptions.retrieve(obj.subscription);
          await db.collection('organizations').doc(orgId).update({
            subscriptionStatus: 'active',
            stripeSubscriptionId: sub.id,
            plan: intervalToPlan(sub.items.data[0]?.price?.recurring?.interval),
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const orgId = obj.metadata?.orgId;
        if (orgId) {
          await db.collection('organizations').doc(orgId).update({
            subscriptionStatus: mapStripeStatus(obj.status),
            plan: intervalToPlan(obj.items.data[0]?.price?.recurring?.interval),
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const orgId = obj.metadata?.orgId;
        if (orgId) {
          await db.collection('organizations').doc(orgId).update({ subscriptionStatus: 'canceled' });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const customerId = obj.customer;
        const orgSnap = await db.collection('organizations').where('stripeCustomerId', '==', customerId).limit(1).get();
        if (!orgSnap.empty) await orgSnap.docs[0].ref.update({ subscriptionStatus: 'past_due' });
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook', err);
    res.status(500).send('Erreur interne');
  }
});
