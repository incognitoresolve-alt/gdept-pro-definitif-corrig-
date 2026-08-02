import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

/*
 * RECONSTRUCTION — ce fichier n'existait dans aucun commit du dépôt (vérifié
 * via `git log --all`). Il a été reconstruit à partir de tous les points
 * d'usage de useAuth() trouvés dans le reste du code (App.jsx, AppShell.jsx,
 * Login/Settings/Sidebar/SuperAdmin/TabContent) et du schéma documenté dans
 * FIRESTORE_SCHEMA.md. Merci de relire attentivement avant mise en prod.
 *
 * Forme exposée par useAuth(), déduite des usages :
 *   firebaseUser, userDoc, org, loading,
 *   isResponsable, isSuperAdmin, subscriptionOk, trialDaysLeft,
 *   signOut
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [org, setOrg] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [userDocResolved, setUserDocResolved] = useState(false);
  const [orgResolved, setOrgResolved] = useState(true); // true tant qu'on n'a pas d'orgId à écouter

  // 1. État de connexion Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthResolved(true);
      if (!user) {
        setUserDoc(null);
        setOrg(null);
        setUserDocResolved(true);
        setOrgResolved(true);
      }
    });
    return unsub;
  }, []);

  // 2. Document users/{uid} → donne orgId + role (voir FIRESTORE_SCHEMA.md)
  useEffect(() => {
    if (!firebaseUser) return;
    setUserDocResolved(false);
    const unsub = onSnapshot(
      doc(db, 'users', firebaseUser.uid),
      (snap) => {
        setUserDoc(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setUserDocResolved(true);
      },
      () => setUserDocResolved(true)
    );
    return unsub;
  }, [firebaseUser]);

  // 3. Document organizations/{orgId}
  useEffect(() => {
    const orgId = userDoc?.orgId;
    if (!orgId) {
      setOrg(null);
      setOrgResolved(true);
      return;
    }
    setOrgResolved(false);
    const unsub = onSnapshot(
      doc(db, 'organizations', orgId),
      (snap) => {
        setOrg(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setOrgResolved(true);
      },
      () => setOrgResolved(true)
    );
    return unsub;
  }, [userDoc?.orgId]);

  const loading = !authResolved || !userDocResolved || !orgResolved;

  const isSuperAdmin = userDoc?.role === 'SUPER_ADMIN';
  const isResponsable = userDoc?.role === 'RESPONSABLE';

  const trialDaysLeft = org?.trialEndsAt
    ? Math.max(0, Math.ceil((org.trialEndsAt - Date.now()) / 86400000))
    : 0;

  const subscriptionOk =
    isSuperAdmin ||
    org?.subscriptionStatus === 'active' ||
    (org?.subscriptionStatus === 'trialing' && (org?.trialEndsAt ?? 0) > Date.now());

  const signOut = () => firebaseSignOut(auth);

  const value = {
    firebaseUser,
    userDoc,
    org,
    loading,
    isResponsable,
    isSuperAdmin,
    subscriptionOk,
    trialDaysLeft,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() doit être utilisé à l\'intérieur de <AuthProvider>');
  return ctx;
}
