# Schéma Firestore — G-Dept Pro (multi-tenant)

## Collections

### `organizations/{orgId}`
```
{
  name: string,                 // "Église de la Grâce"
  createdAt: number,
  createdBy: uid,
  plan: "monthly" | "yearly" | null,
  subscriptionStatus: "trialing" | "active" | "past_due" | "canceled",
  trialEndsAt: number,           // timestamp, 14 jours après création
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null,
  logoUrl: string | null
}
```

### `organizations/{orgId}/departments/{deptId}`
(inchangé par rapport à l'existant, juste déplacé sous l'organisation)
```
{
  name: string,
  procedure: string,
  checklist: [{ id, text, done }],
  reminders: [{ id, text, dueDate, notified }],
  pendingTasks: [{ id, text, assignedTo }],
  archives: [...],
  createdAt: number,
  deletedAt: number | null
}
```

### `organizations/{orgId}/members/{uid}`
```
{
  email: string,
  role: "RESPONSABLE" | "EQUIPE",
  joinedAt: number,
  invitedBy: uid | null
}
```

### `organizations/{orgId}/invitations/{token}`
```
{
  email: string,
  role: "RESPONSABLE" | "EQUIPE",
  createdAt: number,
  expiresAt: number,     // +7 jours
  used: boolean
}
```

### `users/{uid}` (racine, hors organisation — sert à retrouver l'orgId d'un utilisateur après login)
```
{
  email: string,
  orgId: string,
  role: "RESPONSABLE" | "EQUIPE" | "SUPER_ADMIN"
}
```

## Règles de sécurité (`firestore.rules`)

Principe : un utilisateur ne peut lire/écrire QUE les documents de son propre `orgId`, sauf le SUPER_ADMIN qui a un accès global en lecture (back-office).

Voir le fichier `firestore.rules` du projet pour l'implémentation complète.
