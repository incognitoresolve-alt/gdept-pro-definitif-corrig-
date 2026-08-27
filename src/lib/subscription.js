// Logique de calcul de l'accès/abonnement — extraite d'AuthContext.jsx pour être
// testable indépendamment de React/Firebase (voir subscription.test.js).

export function computeTrialDaysLeft(org, now = Date.now()) {
  if (!org?.trialEndsAt) return 0;
  return Math.max(0, Math.ceil((org.trialEndsAt - now) / 86400000));
}

export function computeSubscriptionOk({ isSuperAdmin, org, now = Date.now() }) {
  return (
    isSuperAdmin ||
    org?.subscriptionStatus === 'active' ||
    (org?.subscriptionStatus === 'trialing' && (org?.trialEndsAt ?? 0) > now)
  );
}

// MRR estimé (back-office SUPER_ADMIN) — doit rester cohérent avec les tarifs
// affichés sur /tarifs (19,99 €/mois, 200 €/an).
export function computeMrr(orgs) {
  return orgs
    .filter((o) => o.subscriptionStatus === 'active')
    .reduce((sum, o) => sum + (o.plan === 'yearly' ? 200 / 12 : 19.99), 0);
}
