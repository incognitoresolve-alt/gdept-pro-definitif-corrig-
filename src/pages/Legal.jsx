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
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}.</p>

          <h2>1. Responsable du traitement</h2>
          <p>
            Les données sont traitées par l'éditeur de G-Dept Pro, Boris Y. Akoe (Cellule TEMPUS), qui agit en
            tant que responsable de traitement au sens du Règlement (UE) 2016/679 (RGPD). Pour toute question
            relative à vos données ou pour exercer vos droits, contactez : [email de contact à compléter].
          </p>

          <h2>2. Données collectées</h2>
          <p>
            Nous collectons uniquement les données nécessaires au fonctionnement du service : l'email et le mot
            de passe (géré par Firebase Authentication, jamais stocké en clair par nos soins) du responsable et
            des membres d'équipe d'une église, le nom de l'église, ainsi que le contenu que vous créez
            vous-même dans l'application (procédures, checklists, rappels, tâches en cours, invitations
            d'équipe). Pour la facturation, les informations de paiement sont traitées directement par Stripe et
            ne transitent jamais par nos serveurs.
          </p>

          <h2>3. Finalités et bases légales</h2>
          <ul>
            <li>Fourniture du service et gestion de votre compte : exécution du contrat qui vous lie à G-Dept Pro.</li>
            <li>Facturation et gestion de l'abonnement : exécution du contrat et obligations légales comptables.</li>
            <li>Sécurité, prévention des abus et support technique : intérêt légitime à assurer le bon fonctionnement et la sécurité du service.</li>
          </ul>

          <h2>4. Destinataires et sous-traitants</h2>
          <p>
            Vos données sont hébergées par <strong>Firebase / Google Cloud</strong> (région Europe) pour
            l'authentification et le stockage (Firestore), et par <strong>Stripe</strong> pour le traitement des
            paiements et abonnements. Ces prestataires agissent en tant que sous-traitants au sens du RGPD et
            peuvent, pour certaines opérations techniques, faire appel à des infrastructures situées hors de
            l'Union européenne ; dans ce cas, les transferts sont encadrés par des clauses contractuelles types
            de la Commission européenne ou un mécanisme équivalent. Nous ne vendons ni ne partageons vos données
            à des fins publicitaires.
          </p>

          <h2>5. Durée de conservation</h2>
          <p>
            Les données de votre église sont conservées tant que votre abonnement ou votre période d'essai est
            active. En cas de résiliation ou de suppression du compte, elles sont supprimées de nos bases sous
            30 jours, à l'exception des données que Stripe est légalement tenu de conserver à des fins
            comptables et fiscales. Les remarques archivées (onglet « En cours ») sont automatiquement effacées
            31 jours après validation, et les départements archivés dans la corbeille sont supprimés
            automatiquement 15 jours après leur archivage.
          </p>

          <h2>6. Vos droits</h2>
          <p>
            Conformément aux articles 15 à 22 du RGPD, vous disposez d'un droit d'accès, de rectification,
            d'effacement, de limitation, d'opposition et de portabilité sur vos données. Vous pouvez exercer ces
            droits, ou demander l'export ou la suppression complète des données de votre église, à tout moment
            en nous contactant à l'adresse indiquée au point 1. Nous répondons à toute demande dans un délai
            maximum d'un mois. Vous disposez également du droit d'introduire une réclamation auprès de
            l'autorité de protection des données compétente (en Belgique : l'Autorité de protection des
            données, www.autoriteprotectiondonnees.be).
          </p>

          <h2>7. Sécurité</h2>
          <p>
            Les données de chaque église sont isolées des autres organisations par des règles de sécurité
            Firestore appliquées côté serveur (chaque utilisateur ne peut accéder qu'aux données de sa propre
            église). Les échanges avec l'application sont chiffrés en transit (HTTPS/TLS).
          </p>

          <h2>8. Cookies et traceurs</h2>
          <p>
            G-Dept Pro n'utilise pas de cookies publicitaires ni d'outils de suivi tiers. Seuls des identifiants
            techniques strictement nécessaires à la connexion (session Firebase Authentication) sont utilisés.
          </p>

          <h2>9. Modification de cette politique</h2>
          <p>
            Cette politique peut être mise à jour pour refléter une évolution du service ou de la réglementation.
            La date de dernière mise à jour figure en haut de cette page.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
