import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function SuperAdmin() {
  const { isSuperAdmin, signOut } = useAuth();
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    return onSnapshot(collection(db, 'organizations'), (snap) => {
      setOrgs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [isSuperAdmin]);

  if (!isSuperAdmin) return <div className="settings-wrap"><p>Accès réservé.</p></div>;

  const active = orgs.filter(o => o.subscriptionStatus === 'active');
  const trialing = orgs.filter(o => o.subscriptionStatus === 'trialing');
  const mrr = active.reduce((sum, o) => sum + (o.plan === 'yearly' ? 200 / 12 : 19.99), 0);

  return (
    <div className="settings-wrap">
      <div className="settings-row" style={{ justifyContent: 'space-between' }}>
        <h2>Back-office — Toutes les églises</h2>
        <button className="btn-ghost" onClick={signOut}>⬡ Déconnexion</button>
      </div>

      <div className="admin-stats">
        <div className="stat-card"><div className="stat-value">{orgs.length}</div><div className="stat-label">Églises inscrites</div></div>
        <div className="stat-card"><div className="stat-value">{active.length}</div><div className="stat-label">Abonnements actifs</div></div>
        <div className="stat-card"><div className="stat-value">{trialing.length}</div><div className="stat-label">En essai</div></div>
        <div className="stat-card"><div className="stat-value">{mrr.toFixed(0)} €</div><div className="stat-label">MRR estimé</div></div>
      </div>

      <table className="admin-table">
        <thead>
          <tr><th>Église</th><th>Statut</th><th>Plan</th><th>Créée le</th></tr>
        </thead>
        <tbody>
          {orgs.map(o => (
            <tr key={o.id}>
              <td>{o.name}</td>
              <td><span className={`status-pill status-${o.subscriptionStatus}`}>{o.subscriptionStatus}</span></td>
              <td>{o.plan || '—'}</td>
              <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
