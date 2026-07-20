import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, functions } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

export default function AcceptInvite() {
  const { orgId, token } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | valid | invalid | expired | used
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'organizations', orgId, 'invitations', token));
      if (!snap.exists()) { setStatus('invalid'); return; }
      const data = snap.data();
      if (data.used) { setStatus('used'); return; }
      if (data.expiresAt < Date.now()) { setStatus('expired'); return; }
      setInvite(data);
      setStatus('valid');
    })();
  }, [orgId, token]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, invite.email, pass);
      const acceptInvitation = httpsCallable(functions, 'acceptInvitation');
      await acceptInvitation({ orgId, token, uid: cred.user.uid });
      navigate('/app');
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use'
        ? 'Un compte existe déjà avec cet email — connectez-vous plutôt.'
        : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') return <div className="auth-screen"><p className="auth-sub">Vérification de l'invitation…</p></div>;
  if (status === 'invalid') return <CenteredMsg text="Ce lien d'invitation n'existe pas." />;
  if (status === 'used') return <CenteredMsg text="Cette invitation a déjà été utilisée." />;
  if (status === 'expired') return <CenteredMsg text="Cette invitation a expiré. Demandez-en une nouvelle au responsable." />;

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">G-Dept <span>Pro</span></div>
        <p className="auth-sub">Vous avez été invité·e à rejoindre l'équipe. Choisissez un mot de passe pour {invite.email}.</p>
        <form onSubmit={submit}>
          <input className="auth-field" type="password" placeholder="Mot de passe" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} />
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Création…' : "Rejoindre l'équipe"}</button>
        </form>
      </div>
    </div>
  );
}

function CenteredMsg({ text }) {
  return (
    <div className="auth-screen">
      <div className="auth-card"><p className="auth-sub">{text}</p></div>
    </div>
  );
}
