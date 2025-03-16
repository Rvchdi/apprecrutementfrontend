import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./component/Landing";
import MultiStepRegistration from "./component/MultiStepRegistration";
import Login from "./component/Login";
import MinimalDashboard from "./component/MinimalDashboard";
import CompanyRegistration from "./component/CompanyRegistration";
import CreateAnnouncementForm from "./component/CreateAnnouncementForm";
import Error404 from "./component/Error404";
import OffresEtudiant from "./component/OffreEtudiant";

// Import du Layout et du système d'authentification
import MainLayout from "./component/MainLayout";
import { AuthProvider, useAuth } from "./component/AuthContext";
import EmailVerification from './component/EmailVerification';

// Composant pour routes protégées avec redirection vers login si non authentifié
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour routes publiques avec redirection vers dashboard si déjà authentifié
const PublicRoute = ({ children, restricted = false }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  // Si l'utilisateur est connecté et que la route est restreinte (comme login), rediriger vers dashboard
  if (isAuthenticated && restricted) {
    // Rediriger vers le dashboard approprié en fonction du rôle
    const userRole = localStorage.getItem('user_role');
    let dashboardPath = '/dashboard';
    
    if (userRole === 'etudiant') {
      dashboardPath = '/dashboard/etudiant';
    } else if (userRole === 'entreprise') {
      dashboardPath = '/dashboard/entreprise';
    } else if (userRole === 'admin') {
      dashboardPath = '/dashboard/admin';
    }
    
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Routes avec Layout pour les pages authentifiées
const RouteWithLayout = ({ element }) => {
  return (
    <MainLayout>
      {element}
    </MainLayout>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={
        <PublicRoute>
          <Landing />
        </PublicRoute>
      } />
      
      <Route path="/login" element={
        <PublicRoute restricted={true}>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/registration" element={
        <PublicRoute restricted={true}>
          <MultiStepRegistration />
        </PublicRoute>
      } />
      
      <Route path="/registration/company" element={
        <PublicRoute restricted={true}>
          <CompanyRegistration />
        </PublicRoute>
      } />
      
      <Route path="/not-found" element={<Error404 />} />
      
      {/* Routes protégées avec navbar fixe */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <RouteWithLayout element={<MinimalDashboard />} />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/etudiant" element={
        <ProtectedRoute>
          <RouteWithLayout element={<MinimalDashboard />} />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/entreprise" element={
        <ProtectedRoute>
          <RouteWithLayout element={<MinimalDashboard />} />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/admin" element={
        <ProtectedRoute>
          <RouteWithLayout element={<MinimalDashboard />} />
        </ProtectedRoute>
      } />
      
      <Route path="/verification" element={
        <ProtectedRoute>
          <RouteWithLayout element={<EmailVerification />} />
        </ProtectedRoute>
      } />    
      
      <Route path="/offers" element={
        <ProtectedRoute>
          <RouteWithLayout element={<OffresEtudiant />} />
        </ProtectedRoute>
      } />
      
      <Route path="/create-announcement" element={
        <ProtectedRoute>
          <RouteWithLayout element={<CreateAnnouncementForm />} />
        </ProtectedRoute>
      } />
      
      {/* Route par défaut */}
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}