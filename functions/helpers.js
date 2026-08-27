const { HttpsError } = require('firebase-functions/v2/https');
const { z } = require('zod');

// ---------------------------------------------------------------
// Validation des entrées (zod) — rejette toute requête malformée avant
// qu'elle touche Firestore/Stripe, avec un message générique côté client.
// ---------------------------------------------------------------
function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpsError('invalid-argument', 'Paramètres invalides.');
  }
  return result.data;
}

const orgIdSchema = z.string().min(1).max(200);
const tokenSchema = z.string().min(1).max(200);
const roleSchema = z.enum(['RESPONSABLE', 'EQUIPE']);

const createOrganizationSchema = z.object({
  churchName: z.string().trim().min(1, "Le nom de l'église est requis.").max(200),
  email: z.string().trim().email().max(320),
});

const createInvitationSchema = z.object({
  orgId: orgIdSchema,
  email: z.string().trim().email().max(320),
  role: roleSchema,
});

const acceptInvitationSchema = z.object({
  orgId: orgIdSchema,
  token: tokenSchema,
});

const createCheckoutSessionSchema = z.object({
  orgId: orgIdSchema,
  priceId: z.string().min(1).max(200),
});

const createBillingPortalSessionSchema = z.object({
  orgId: orgIdSchema,
});

// ---------------------------------------------------------------
// Autorisation — le responsable (ou le super admin) de l'organisation.
// `db` est injecté explicitement plutôt que lu depuis un singleton, pour
// rester testable avec un faux Firestore dans helpers.test.js.
// ---------------------------------------------------------------
async function assertIsResponsable(db, uid, orgId) {
  const userSnap = await db.collection('users').doc(uid).get();
  const user = userSnap.data();
  if (!user || user.orgId !== orgId || (user.role !== 'RESPONSABLE' && user.role !== 'SUPER_ADMIN')) {
    throw new HttpsError('permission-denied', "Action réservée au responsable de l'église.");
  }
}

function mapStripeStatus(status) {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'unpaid') return 'past_due';
  if (status === 'canceled') return 'canceled';
  return status;
}

function intervalToPlan(interval) {
  if (interval === 'month') return 'monthly';
  if (interval === 'year') return 'yearly';
  return null;
}

module.exports = {
  validate,
  orgIdSchema,
  tokenSchema,
  roleSchema,
  createOrganizationSchema,
  createInvitationSchema,
  acceptInvitationSchema,
  createCheckoutSessionSchema,
  createBillingPortalSessionSchema,
  assertIsResponsable,
  mapStripeStatus,
  intervalToPlan,
};
