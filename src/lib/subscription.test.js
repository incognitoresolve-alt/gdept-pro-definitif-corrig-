import { describe, it, expect } from 'vitest';
import { computeTrialDaysLeft, computeSubscriptionOk, computeMrr } from './subscription';

const DAY = 86400000;

describe('computeTrialDaysLeft', () => {
  it('renvoie 0 sans org / sans trialEndsAt', () => {
    expect(computeTrialDaysLeft(null)).toBe(0);
    expect(computeTrialDaysLeft({})).toBe(0);
  });
  it('arrondit au jour supérieur restant', () => {
    const now = 1000000 * DAY;
    expect(computeTrialDaysLeft({ trialEndsAt: now + 5 * DAY }, now)).toBe(5);
    expect(computeTrialDaysLeft({ trialEndsAt: now + 0.5 * DAY }, now)).toBe(1);
  });
  it('ne descend jamais sous 0 (essai déjà expiré)', () => {
    const now = 1000000 * DAY;
    expect(computeTrialDaysLeft({ trialEndsAt: now - 10 * DAY }, now)).toBe(0);
  });
});

describe('computeSubscriptionOk', () => {
  const now = 1000000 * DAY;

  it('autorise toujours un SUPER_ADMIN, quel que soit le statut de l\'org', () => {
    expect(computeSubscriptionOk({ isSuperAdmin: true, org: null, now })).toBe(true);
    expect(computeSubscriptionOk({ isSuperAdmin: true, org: { subscriptionStatus: 'canceled' }, now })).toBe(true);
  });

  it('autorise un abonnement actif', () => {
    expect(computeSubscriptionOk({ isSuperAdmin: false, org: { subscriptionStatus: 'active' }, now })).toBe(true);
  });

  it('autorise un essai en cours (trialEndsAt dans le futur)', () => {
    const org = { subscriptionStatus: 'trialing', trialEndsAt: now + DAY };
    expect(computeSubscriptionOk({ isSuperAdmin: false, org, now })).toBe(true);
  });

  it('refuse un essai expiré', () => {
    const org = { subscriptionStatus: 'trialing', trialEndsAt: now - DAY };
    expect(computeSubscriptionOk({ isSuperAdmin: false, org, now })).toBe(false);
  });

  it('refuse past_due / canceled', () => {
    expect(computeSubscriptionOk({ isSuperAdmin: false, org: { subscriptionStatus: 'past_due' }, now })).toBe(false);
    expect(computeSubscriptionOk({ isSuperAdmin: false, org: { subscriptionStatus: 'canceled' }, now })).toBe(false);
  });

  it('refuse en l\'absence d\'organisation', () => {
    expect(computeSubscriptionOk({ isSuperAdmin: false, org: null, now })).toBe(false);
  });
});

describe('computeMrr', () => {
  it('ignore les organisations non actives (trialing/past_due/canceled)', () => {
    const orgs = [
      { subscriptionStatus: 'trialing', plan: 'monthly' },
      { subscriptionStatus: 'past_due', plan: 'monthly' },
      { subscriptionStatus: 'canceled', plan: 'yearly' },
    ];
    expect(computeMrr(orgs)).toBe(0);
  });

  it('compte 19,99 pour un plan mensuel actif', () => {
    expect(computeMrr([{ subscriptionStatus: 'active', plan: 'monthly' }])).toBeCloseTo(19.99);
  });

  it('compte 200/12 pour un plan annuel actif', () => {
    expect(computeMrr([{ subscriptionStatus: 'active', plan: 'yearly' }])).toBeCloseTo(200 / 12);
  });

  it('additionne plusieurs organisations mixtes', () => {
    const orgs = [
      { subscriptionStatus: 'active', plan: 'monthly' },
      { subscriptionStatus: 'active', plan: 'yearly' },
      { subscriptionStatus: 'trialing', plan: 'monthly' },
    ];
    expect(computeMrr(orgs)).toBeCloseTo(19.99 + 200 / 12);
  });
});
