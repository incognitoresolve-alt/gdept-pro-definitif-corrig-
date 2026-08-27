import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function Login() {
  useDocumentTitle('Connexion');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      navigate('/app');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">G-Dept <span>Pro</span></div>
        <form onSubmit={login}>
          <label className="auth-label">Email</label>
          <input className="auth-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="auth-label">Mot de passe</label>
          <input className="auth-field" type="password" value={pass} onChange={e => setPass(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        </form>
        <p className="auth-switch">Pas encore de compte ? <Link to="/inscription">Créer un espace pour mon église</Link></p>
      </div>
    </div>
  );
}
