import React from 'react';
import { SiteHeader, SiteFooter } from './Landing';

export function MentionsLegales() {
  return (
    <div className="site-scroll">
      <SiteHeader />
      <section className="section">
        <div className="section-inner narrow legal-content">
          <h1>Mentions légales</h1>
          <p>
            [À COMPLÉTER : raison sociale, forme juridique (indépendant / société), numéro d'entreprise BCE,
            adresse du siège, email de contact, et le fait que G-Dept Pro est édité par Boris Y. Akoe /
            Cellule TEMPUS. Ce texte doit être relu par un professionnel avant mise en ligne.]
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

export function Confidentialite() {
  return (
    <div className="site-scroll">
      <SiteHeader />
      <section className="section">
        <div className="section-inner narrow legal-content">
          <h1>Politique de confidentialité</h1>
          <p>
            G-Dept Pro stocke les données de votre église (départements, procédures, membres) sur des serveurs
            Firebase situés en Europe. Ces données ne sont accessibles qu'aux membres de votre organisation et
            à l'équipe technique en cas de nécessité de support. Vous pouvez demander l'export ou la suppression
            complète des données de votre église à tout moment en nous contactant.
          </p>
          <p>
            [À COMPLÉTER avant mise en ligne : base légale du traitement, durée de conservation, sous-traitants
            (Firebase/Google, Stripe), droits RGPD et procédure d'exercice de ces droits, coordonnées du
            responsable de traitement.]
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
