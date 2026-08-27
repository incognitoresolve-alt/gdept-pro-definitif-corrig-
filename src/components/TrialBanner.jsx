import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TrialBanner() {
  const { org, isResponsable, trialDaysLeft } = useAuth();
  if (!org || org.subscriptionStatus !== 'trialing') return null;

  return (
    <div className="trial-banner no-print">
      <span>
        {trialDaysLeft > 0
          ? `Essai gratuit : ${trialDaysLeft} jour${trialDaysLeft > 1 ? 's' : ''} restant${trialDaysLeft > 1 ? 's' : ''}.`
          : "Votre essai gratuit se termine aujourd'hui."}
      </span>
      {isResponsable && <Link to="/app/parametres">Choisir un abonnement →</Link>}
    </div>
  );
}
