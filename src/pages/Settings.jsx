import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db, functions } from '../firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function Settings() {
  useDocumentTitle('Paramètres');
  const { org, isResponsable } = useAuth();
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EQUIPE');
  const [inviteLink, setInviteLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  // Capturé une seule fois au montage puis conservé en state, pour que le
  // message reste affiché même une fois le paramètre ?checkout=... retiré
  // de l'URL (sinon il disparaîtrait au re-rendu suivant).
  const [checkoutResult] = useState(() => searchParams.get('checkout'));

  const orgId = org?.id;

  useEffect(() => {
    if (!checkoutResult) return;
    setSearchParams((prev) => { prev.delete('checkout'); return prev; }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (org?.name) setOrgName(org.name); }, [org?.name]);

  useEffect(() => {
    if (!orgId) return;
    return onSnapshot(collection(db, 'organizations', orgId, 'members'), (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [orgId]);

  const saveName = async () => {
    if (!orgName.trim()) return;
    await updateDoc(doc(db, 'organizations', orgId), { name: orgName.trim() });
  };

  const invite = async (e) => {
    e.preventDefault();
    setBusy(true);
    setInviteLink('');
    try {
      const createInvitation = httpsCallable(functions, 'createInvitation');
      const res = await createInvitation({ orgId, email: inviteEmail, role: inviteRole });
      setInviteLink(res.data.link);
      setInviteEmail('');
    } finally {
      setBusy(false);
    }
  };

  const openBillingPortal = async () => {
    setBusy(true);
    try {
      const createPortalSession = httpsCallable(functions, 'createBillingPortalSession');
      const res = await createPortalSession({ orgId });
      window.location.href = res.data.url;
    } finally {
      setBusy(false);
    }
  };

  const subscribe = async (priceId) => {
    setBusy(true);
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const res = await createCheckoutSession({ orgId, priceId });
      window.location.href = res.data.url;
    } finally {
      setBusy(false);
    }
  };

  if (!org) return null;
  if (!isResponsable) return <div className="settings-wrap"><p>Seul le responsable peut accéder aux paramètres.</p></div>;

  return (
    <div className="settings-wrap">
      <Link to="/app" className="settings-back">← Retour à l'application</Link>
      <h2>Paramètres de l'église</h2>

      {checkoutResult === 'success' && (
        <div className="settings-status" style={{ color: 'var(--accent-hover)', fontWeight: 700, marginBottom: 8 }}>
          ✓ Merci ! Votre paiement a été confirmé, votre abonnement est en cours d'activation.
        </div>
      )}
      {checkoutResult === 'cancel' && (
        <div className="settings-status" style={{ color: 'var(--danger)', marginBottom: 8 }}>
          Paiement annulé — aucun montant n'a été prélevé, vous pouvez réessayer ci-dessous.
        </div>
      )}

      <section className="settings-section">
        <h3>Nom de l'église</h3>
        <div className="settings-row">
          <input className="auth-field" style={{ marginBottom: 0 }} value={orgName} onChange={e => setOrgName(e.target.value)} />
          <button className="btn btn-primary" onClick={saveName}>Enregistrer</button>
        </div>
      </section>

      <section className="settings-section">
        <h3>Abonnement</h3>
        <p className="settings-status">
          Statut actuel : <strong>{statusLabel(org.subscriptionStatus, org.trialEndsAt)}</strong>
        </p>
        {org.subscriptionStatus === 'active' ? (
          <button className="btn btn-outline" onClick={openBillingPortal} disabled={busy}>Gérer mon abonnement / ma facture</button>
        ) : (
          <div className="settings-plans">
            <div className="plan-card">
              <div className="plan-price">19,99 €<span>/mois</span></div>
              <button className="btn btn-primary" onClick={() => subscribe(import.meta.env.VITE_STRIPE_PRICE_MONTHLY)} disabled={busy}>Choisir mensuel</button>
            </div>
            <div className="plan-card plan-card-featured">
              <div className="plan-badge">2 mois offerts</div>
              <div className="plan-price">200 €<span>/an</span></div>
              <button className="btn btn-primary" onClick={() => subscribe(import.meta.env.VITE_STRIPE_PRICE_YEARLY)} disabled={busy}>Choisir annuel</button>
            </div>
          </div>
        )}
      </section>

      <section className="settings-section">
        <h3>Équipe</h3>
        <div className="members-list">
          {members.map(m => (
            <div key={m.id} className="member-row">
              <span>{m.email}</span>
              <span className="badge badge-violet">{m.role}</span>
            </div>
          ))}
        </div>

        <form className="invite-form" onSubmit={invite}>
          <input className="auth-field" style={{ marginBottom: 0 }} type="email" placeholder="email@exemple.be" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
          <select className="auth-field" style={{ marginBottom: 0 }} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
            <option value="EQUIPE">Équipe</option>
            <option value="RESPONSABLE">Responsable</option>
          </select>
          <button className="btn btn-primary" type="submit" disabled={busy}>Inviter</button>
        </form>
        {inviteLink && (
          <div className="invite-link-box">
            Lien à envoyer manuellement (email automatique à venir) :
            <code>{inviteLink}</code>
          </div>
        )}
      </section>
    </div>
  );
}

function statusLabel(status, trialEndsAt) {
  if (status === 'trialing') {
    const days = Math.max(0, Math.ceil((trialEndsAt - Date.now()) / 86400000));
    return `Essai gratuit (${days} j restants)`;
  }
  if (status === 'active') return 'Actif';
  if (status === 'past_due') return 'Paiement en retard';
  if (status === 'canceled') return 'Résilié';
  return status || 'Inconnu';
}
