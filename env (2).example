import React from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  { n: '01', title: 'Procédure', desc: "Chaque département a sa marche à suivre écrite noire sur blanc — imprimable, jamais perdue quand quelqu'un change de rôle." },
  { n: '02', title: 'Checklist', desc: "La liste des tâches du dimanche, du culte de semaine ou d'un événement, cochée en direct par l'équipe sur place." },
  { n: '03', title: 'Rappels', desc: "Les échéances importantes (réunions, renouvellements, préparatifs) apparaissent avant qu'il ne soit trop tard." },
  { n: '04', title: 'Suivi équipe', desc: "Les remarques et tâches en cours restent visibles jusqu'à validation par le responsable — rien ne se perd dans un groupe WhatsApp." },
];

const DEPTS = [
  { name: 'Louange', status: '3 tâches' },
  { name: 'Accueil', status: 'À jour' },
  { name: 'Enfants', status: '1 rappel' },
  { name: 'Média', status: 'À jour' },
  { name: 'Sécurité', status: '2 tâches' },
];

export default function Landing() {
  return (
    <div className="site-scroll">
      <SiteHeader />

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <div className="eyebrow">Pour les églises francophones</div>
          <h1>Chaque département de votre église,<br />organisé comme un vrai bulletin.</h1>
          <p className="hero-sub">
            Procédures, checklists, rappels et suivi d'équipe — dans un seul outil que vos bénévoles
            ouvrent sur leur téléphone, plutôt que dans dix conversations WhatsApp différentes.
          </p>
          <div className="hero-ctas">
            <Link to="/inscription" className="btn-hero-primary">Démarrer l'essai gratuit</Link>
            <Link to="/tarifs" className="btn-hero-secondary">Voir les tarifs</Link>
          </div>
          <div className="hero-note">14 jours gratuits · sans carte bancaire · résiliable à tout moment</div>
        </div>

        <div className="hero-mock">
          <div className="mock-window">
            <div className="mock-window-bar">
              <span /><span /><span />
              <span className="mock-window-title">Ma Église — Départements</span>
            </div>
            <div className="mock-window-body">
              {DEPTS.map(d => (
                <div key={d.name} className="mock-dept-row">
                  <span className="mock-dept-name">{d.name}</span>
                  <span className="mock-dept-status">{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section section-alt">
        <div className="section-inner narrow">
          <h2>Vous connaissez déjà le problème.</h2>
          <p className="section-lede">
            Le responsable de la louange part en voyage et personne ne sait où est la procédure du dimanche.
            Le groupe WhatsApp de l'accueil compte 400 messages non lus. Les tâches "à faire pour le culte"
            sont notées sur trois carnets différents. G-Dept Pro remplace tout ça par un seul endroit,
            organisé par département, que chacun retrouve en un clic.
          </p>
        </div>
      </section>

      {/* FEATURES / STEPS */}
      <section className="section">
        <div className="section-inner">
          <h2 className="section-title-center">Comment ça s'organise</h2>
          <div className="steps-grid">
            {STEPS.map(s => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <h2>Essayez avec votre église, gratuitement pendant 14 jours.</h2>
        <Link to="/inscription" className="btn-hero-primary">Créer mon espace</Link>
      </section>

      <SiteFooter />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="site-logo">G-Dept <span>Pro</span></Link>
      <nav className="site-nav">
        <Link to="/tarifs">Tarifs</Link>
        <Link to="/connexion">Se connecter</Link>
        <Link to="/inscription" className="btn-nav-cta">Essai gratuit</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>© {new Date().getFullYear()} G-Dept Pro. Fait pour les églises francophones.</div>
      <div className="site-footer-links">
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/confidentialite">Confidentialité</Link>
      </div>
    </footer>
  );
}
