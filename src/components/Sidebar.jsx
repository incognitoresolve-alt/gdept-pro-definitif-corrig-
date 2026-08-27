import { Link } from 'react-router-dom';

export default function Sidebar({ isAdmin, activeDepts, selectedId, setSelectedId, setActiveTab, menuOpen, setMenuOpen, addDept, deleteDept, logout }) {
  const select = (id) => { setSelectedId(id); setActiveTab('procedure'); setMenuOpen(false); };

  return (
    <aside className={`sidebar no-print ${menuOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div><h1>G-Dept <span>Pro</span></h1></div>
      </div>
      <nav className="sidebar-nav">
        {isAdmin && <button className="btn-new" onClick={addDept}>+ Nouveau département</button>}
        {activeDepts.map(d => {
          const pendingCount = (d.pendingTasks || []).filter(t => t.status === 'pending').length;
          return (
            <div key={d.id} className={`dept-item ${selectedId === d.id ? 'active' : ''}`} onClick={() => select(d.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
                <span className="dept-name">{d.name}</span>
                {pendingCount > 0 && <span className="dept-badge">{pendingCount}</span>}
              </div>
              {isAdmin && <button className="dept-del" onClick={(e) => deleteDept(d.id, e)}>✕</button>}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="btn-ghost" onClick={() => select('TRASH')}>🗑️ Corbeille</button>
        {isAdmin && <Link className="btn-ghost" to="/app/parametres" onClick={() => setMenuOpen(false)}>⚙ Paramètres</Link>}
        <button className="btn-ghost" onClick={logout} style={{color: '#fca5a5'}}>⬡ Déconnexion</button>
      </div>
    </aside>
  );
}
