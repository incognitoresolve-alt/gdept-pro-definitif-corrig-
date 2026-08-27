import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TabContent from '../components/TabContent';
import TrialBanner from '../components/TrialBanner';
import PaywallScreen from '../components/PaywallScreen';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function AppShell() {
  const { org, isResponsable, signOut, subscriptionOk } = useAuth();
  useDocumentTitle(org?.name || 'Application');
  const [departments, setDepartments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('procedure');
  const [menuOpen, setMenuOpen] = useState(false);

  const orgId = org?.id;

  useEffect(() => {
    if (!orgId) return;
    const q = query(collection(db, 'organizations', orgId, 'departments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setDepartments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [orgId]);

  const isAdmin = isResponsable;
  const activeDepts = departments.filter(d => !d.deletedAt);
  const activeDept = activeDepts.find(d => d.id === selectedId);

  const addDept = async () => {
    const n = prompt("Nom du département :");
    if (n && n.trim()) {
      await addDoc(collection(db, 'organizations', orgId, 'departments'), {
        name: n.trim(), procedure: '', checklist: [],
        reminders: [], pendingTasks: [], archives: [], createdAt: Date.now()
      });
    }
  };

  const deleteDept = async (id, e) => {
    e.stopPropagation();
    if (confirm("Archiver ce département ?")) {
      await updateDoc(doc(db, 'organizations', orgId, 'departments', id), { deletedAt: Date.now() });
      if (selectedId === id) setSelectedId(null);
    }
  };

  // Abonnement expiré et pas d'essai en cours : on bloque l'accès aux données,
  // sauf pour le RESPONSABLE qui doit pouvoir aller réactiver l'abonnement.
  if (!subscriptionOk) {
    return <PaywallScreen isAdmin={isAdmin} onLogout={signOut} />;
  }

  return (
    <div className="app">
      <button className="hamburger no-print" onClick={() => setMenuOpen(true)}>☰</button>
      <div className={`overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} style={{ display: menuOpen ? 'block' : 'none', position: 'fixed', inset: 0, zIndex: 35, background: 'rgba(0,0,0,0.7)' }} />

      <Sidebar
        isAdmin={isAdmin} activeDepts={activeDepts} selectedId={selectedId}
        setSelectedId={setSelectedId} setActiveTab={setActiveTab}
        menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        addDept={addDept} deleteDept={deleteDept} logout={signOut}
      />

      <main className="main">
        <TrialBanner />
        {selectedId === 'TRASH' ? (
          <TabContent type="TRASH" departments={departments} isAdmin={isAdmin} />
        ) : !activeDept ? (
          <div className="empty">
            <div className="empty-icon">📂</div>
            <h3>Aucun département sélectionné</h3>
            {isAdmin && <Link to="/app/parametres" className="link-settings">⚙ Paramètres de l'église</Link>}
          </div>
        ) : (
          <>
            <header className="main-header no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="dept-title">{activeDept.name}</span>
                {isAdmin && <span className="badge badge-violet" style={{ color: 'var(--brand-violet)' }}>Admin</span>}
              </div>
              <div className="tabs">
                {['procedure', 'checklist', 'reminders', 'pending', 'report'].map(t => (
                  <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                    {t === 'procedure' ? '📄 Procédure' : t === 'checklist' ? '✅ Checklist' : t === 'reminders' ? '🔔 Rappels' : t === 'pending' ? '⏳ En cours' : '🗓️ Rapport hebdo'}
                  </button>
                ))}
              </div>
            </header>
            <div className="main-body">
              <TabContent type={activeTab} dept={activeDept} isAdmin={isAdmin} departments={departments} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
