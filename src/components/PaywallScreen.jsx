import React from 'react';
import { Link } from 'react-router-dom';

export default function PaywallScreen({ isAdmin, onLogout }) {
  return (
    <div className="paywall-screen">
      <div className="paywall-card">
        <div className="auth-logo">G-Dept <span>Pro</span></div>
        <h2>Votre essai gratuit est terminé</h2>
        {isAdmin ? (
          <>
            <p>Choisissez un abonnement pour continuer à utiliser G-Dept Pro et retrouver tous vos départements.</p>
            <Link className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }} to="/app/parametres">
              Voir les abonnements
            </Link>
          </>
        ) : (
          <p>Demandez au responsable de votre église d'activer un abonnement pour retrouver l'accès.</p>
        )}
        <button className="btn-ghost" style={{ marginTop: 20 }} onClick={onLogout}>⬡ Déconnexion</button>
      </div>
    </div>
  );
}
