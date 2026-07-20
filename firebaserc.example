import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, functions } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

export default function Signup() {
  const [churchName, setChurchName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (pass.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      // La Cloud Function crée : organizations/{orgId}, users/{uid}, members/{uid}
      // + démarre l'essai gratuit de 14 jours. On fait ça côté serveur pour que
      // les règles Firestore n'aient jamais à autoriser la création d'orga côté client.
      const createOrganization = httpsCallable(functions, 'createOrganization');
      await createOrganization({ churchName, uid: cred.user.uid, email });
      navigate('/app');
    } catch (err) {
      setError(mapError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">G-Dept <span>Pro</span></div>
        <p className="auth-sub">14 jours d'essai gratuit, sans carte bancaire.</p>
        <form onSubmit={submit}>
          <label className="auth-label">Nom de votre église</label>
          <input className="auth-field" type="text" placeholder="Église de la Grâce" value={churchName} onChange={e => setChurchName(e.target.value)} required />
          <label className="auth-label">Email du responsable</label>
          <input className="auth-field" type="email" placeholder="pasteur@monEglise.be" value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="auth-label">Mot de passe</label>
          <input className="auth-field" type="password" placeholder="6 caractères minimum" value={pass} onChange={e => setPass(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Création en cours…' : 'Créer mon espace'}
          </button>
        </form>
        <p className="auth-switch">Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
      </div>
    </div>
  );
}

function mapError(err) {
  switch (err.code) {
    case 'auth/email-already-in-use': return 'Un compte existe déjà avec cet email.';
    case 'auth/invalid-email': return 'Adresse email invalide.';
    default: return "Une erreur est survenue. Réessayez dans un instant.";
  }
}
