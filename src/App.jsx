import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AcceptInvite from './pages/AcceptInvite';
import AppShell from './pages/AppShell';
import Settings from './pages/Settings';
import SuperAdmin from './pages/SuperAdmin';
import { MentionsLegales, Confidentialite } from './pages/Legal';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/tarifs" element={<Pricing />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Signup />} />
          <Route path="/invitation/:orgId/:token" element={<AcceptInvite />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />

          {/* Application (église connectée) */}
          <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/app/parametres" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Back-office éditeur */}
          <Route path="/admin" element={<ProtectedRoute requireSuperAdmin><SuperAdmin /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
