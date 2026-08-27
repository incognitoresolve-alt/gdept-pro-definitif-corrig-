import { describe, it, expect } from 'vitest';
import helpers from './helpers.js';

// functions/ reste en CommonJS (require Firebase Functions Node) — ce fichier de
// test est le seul en ESM (Vitest 4 l'exige), d'où l'import par défaut + destructuring.
const {
  mapStripeStatus,
  intervalToPlan,
  validate,
  assertIsResponsable,
  createOrganizationSchema,
  createInvitationSchema,
  acceptInvitationSchema,
  createCheckoutSessionSchema,
  createBillingPortalSessionSchema,
} = helpers;

describe('mapStripeStatus (mapping du statut Stripe -> statut abonnement)', () => {
  it('mappe active/trialing sur "active"', () => {
    expect(mapStripeStatus('active')).toBe('active');
    expect(mapStripeStatus('trialing')).toBe('active');
  });
  it('mappe past_due/unpaid sur "past_due"', () => {
    expect(mapStripeStatus('past_due')).toBe('past_due');
    expect(mapStripeStatus('unpaid')).toBe('past_due');
  });
  it('mappe canceled sur "canceled"', () => {
    expect(mapStripeStatus('canceled')).toBe('canceled');
  });
  it('laisse passer un statut inconnu tel quel', () => {
    expect(mapStripeStatus('incomplete_expired')).toBe('incomplete_expired');
  });
});

describe('intervalToPlan (mapping intervalle Stripe -> plan)', () => {
  it('mappe month -> monthly, year -> yearly', () => {
    expect(intervalToPlan('month')).toBe('monthly');
    expect(intervalToPlan('year')).toBe('yearly');
  });
  it('renvoie null pour un intervalle inconnu ou absent', () => {
    expect(intervalToPlan('week')).toBeNull();
    expect(intervalToPlan(undefined)).toBeNull();
  });
});

describe('validate (schémas zod des Cloud Functions)', () => {
  it('createOrganizationSchema accepte des données valides et trim le nom', () => {
    const out = validate(createOrganizationSchema, { churchName: '  Église Test  ', email: 'a@b.com' });
    expect(out.churchName).toBe('Église Test');
    expect(out.email).toBe('a@b.com');
  });
  it('createOrganizationSchema rejette un nom vide', () => {
    expect(() => validate(createOrganizationSchema, { churchName: '   ', email: 'a@b.com' })).toThrow();
  });
  it('createOrganizationSchema rejette un email invalide', () => {
    expect(() => validate(createOrganizationSchema, { churchName: 'Test', email: 'pas-un-email' })).toThrow();
  });

  it('createInvitationSchema rejette un role hors RESPONSABLE/EQUIPE', () => {
    expect(() => validate(createInvitationSchema, { orgId: 'org1', email: 'a@b.com', role: 'ADMIN' })).toThrow();
  });
  it('createInvitationSchema accepte RESPONSABLE et EQUIPE', () => {
    expect(validate(createInvitationSchema, { orgId: 'org1', email: 'a@b.com', role: 'RESPONSABLE' }).role).toBe('RESPONSABLE');
    expect(validate(createInvitationSchema, { orgId: 'org1', email: 'a@b.com', role: 'EQUIPE' }).role).toBe('EQUIPE');
  });

  it('acceptInvitationSchema rejette un orgId ou token manquant', () => {
    expect(() => validate(acceptInvitationSchema, { orgId: '', token: 'abc' })).toThrow();
    expect(() => validate(acceptInvitationSchema, { orgId: 'org1' })).toThrow();
  });

  it('createCheckoutSessionSchema rejette un payload sans priceId', () => {
    expect(() => validate(createCheckoutSessionSchema, { orgId: 'org1' })).toThrow();
  });

  it('createBillingPortalSessionSchema rejette un orgId absent', () => {
    expect(() => validate(createBillingPortalSessionSchema, {})).toThrow();
  });

  it('rejette une charge utile complètement invalide (mauvais type)', () => {
    expect(() => validate(createOrganizationSchema, 'not-an-object')).toThrow();
    expect(() => validate(createOrganizationSchema, null)).toThrow();
  });
});

// Faux Firestore minimal : simule db.collection('users').doc(uid).get() -> { data() }
function fakeDb(userData) {
  return {
    collection: () => ({
      doc: () => ({
        get: async () => ({ data: () => userData }),
      }),
    }),
  };
}

describe('assertIsResponsable (autorisation)', () => {
  it('autorise un RESPONSABLE de la bonne organisation', async () => {
    const db = fakeDb({ orgId: 'org1', role: 'RESPONSABLE' });
    await expect(assertIsResponsable(db, 'uid1', 'org1')).resolves.toBeUndefined();
  });

  it('refuse un membre EQUIPE (pas responsable)', async () => {
    const db = fakeDb({ orgId: 'org1', role: 'EQUIPE' });
    await expect(assertIsResponsable(db, 'uid1', 'org1')).rejects.toThrow();
  });

  it("refuse un responsable d'une autre organisation", async () => {
    const db = fakeDb({ orgId: 'org2', role: 'RESPONSABLE' });
    await expect(assertIsResponsable(db, 'uid1', 'org1')).rejects.toThrow();
  });

  it("refuse si l'utilisateur n'existe pas", async () => {
    const db = fakeDb(undefined);
    await expect(assertIsResponsable(db, 'uid1', 'org1')).rejects.toThrow();
  });

  // NOTE : ce test documente un comportement existant, pas nécessairement voulu.
  // Le SUPER_ADMIN doit AUSSI avoir user.orgId === orgId pour passer : le rôle
  // SUPER_ADMIN ne donne pas, tel quel, un accès à une organisation arbitraire
  // via ces Cloud Functions (contrairement à l'accès en lecture globale que lui
  // donnent les règles Firestore côté client). À signaler/clarifier si ce n'est
  // pas le comportement voulu.
  it("un SUPER_ADMIN sans orgId correspondant est aussi refusé", async () => {
    const db = fakeDb({ orgId: 'org-perso-du-super-admin', role: 'SUPER_ADMIN' });
    await expect(assertIsResponsable(db, 'uid1', 'org1')).rejects.toThrow();
  });
});
