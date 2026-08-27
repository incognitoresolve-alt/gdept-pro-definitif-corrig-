import { Link } from 'react-router-dom';
import { SiteHeader, SiteFooter } from './Landing';
import { useDocumentTitle } from '../lib/useDocumentTitle';

const FAQS = [
  { q: "Peut-on résilier à tout moment ?", a: "Oui. Vous gérez votre abonnement vous-même depuis les paramètres, sans nous contacter, et vous gardez l'accès jusqu'à la fin de la période déjà payée." },
  { q: "Où sont hébergées les données de notre église ?", a: "Sur des serveurs européens (Google Cloud / Firebase, région Europe), conformes RGPD. Vos données restent uniquement visibles par les membres de votre église." },
  { q: "Combien de membres d'équipe peut-on inviter ?", a: "Autant que nécessaire, sans supplément — le prix ne dépend pas du nombre de bénévoles ou de responsables." },
  { q: "Y a-t-il un engagement de durée ?", a: "Aucun. Le plan mensuel est sans engagement, le plan annuel est payé une fois par an au tarif réduit." },
  { q: "Y a-t-il une application mobile ?", a: "G-Dept Pro s'utilise directement depuis le navigateur de votre téléphone, sans rien installer — l'interface est conçue pour le mobile au même titre que l'ordinateur." },
];

export default function Pricing() {
  useDocumentTitle('Tarifs');
  return (
    <div className="site-scroll">
      <SiteHeader />

      <section className="pricing-hero">
        <div className="eyebrow">Tarifs</div>
        <h1>Un prix simple, pour toute l'église.</h1>
        <p className="hero-sub">Nombre illimité de départements et de membres d'équipe, sur les deux formules.</p>
      </section>

      <section className="section">
        <div className="section-inner narrow">
          <div className="pricing-cards">
            <div className="price-card">
              <div className="price-card-name">Mensuel</div>
              <div className="price-card-amount">19,99 €<span>/mois</span></div>
              <ul className="price-card-list">
                <li>Départements illimités</li>
                <li>Membres d'équipe illimités</li>
                <li>Procédures, checklists, rappels</li>
                <li>Export PDF</li>
                <li>Sans engagement</li>
              </ul>
              <Link to="/inscription" className="btn-hero-outline-dark" style={{ width: '100%', textAlign: 'center' }}>Démarrer l'essai gratuit</Link>
            </div>

            <div className="price-card price-card-featured">
              <div className="plan-badge">2 mois offerts</div>
              <div className="price-card-name">Annuel</div>
              <div className="price-card-amount">200 €<span>/an</span></div>
              <ul className="price-card-list">
                <li>Tout le contenu du plan mensuel</li>
                <li>Facturation unique, une fois par an</li>
                <li>Équivaut à 16,67 €/mois</li>
              </ul>
              <Link to="/inscription" className="btn-hero-primary" style={{ width: '100%', textAlign: 'center' }}>Démarrer l'essai gratuit</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-inner narrow">
          <h2 className="section-title-center">Questions fréquentes</h2>
          <div className="faq-list">
            {FAQS.map(f => (
              <div key={f.q} className="faq-item">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
