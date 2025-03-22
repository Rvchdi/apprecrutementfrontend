import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./component/Landing";
import MultiStepRegistration from "./component/Authentication/MultiStepRegistration";
import Login from "./component/Authentication/Login";
import MinimalDashboard from "./component/Dashboard/MinimalDashboard";
import CreateAnnouncementForm from "./component/CreateOffreForm";
import Error404 from "./component/Error404";
import OffresEtudiant from "./component/OffreEtudiant";
import JobDetail from "./component/JobDetail";
import SkillTest from "./component/SkillTest";
import StudentSkills from "./component/StudentSkills";
import NotificationsCenter from "./component/NotificationsCenter";

// Import du Layout et du système d'authentification
import MainLayout from "./component/Dashboard/MainLayout";
import { AuthProvider, useAuth } from "./component/Authentication/AuthContext";
import EmailVerification from './component/Authentication/EmailVerification';
import OffresList from './component/Dashboard/Interfaces/OffresList';
import TestsList from './component/Dashboard/Tests/TestsList';
import TestCreationForm from './component/Dashboard/Tests/TestCreationForm';
import CreateOffreForm from './component/CreateOffreForm';

// Composant pour routes protégées avec redirection vers login si non authentifié
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Vérifier si l'utilisateur a un rôle autorisé
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Composant pour routes publiques avec redirection vers dashboard si déjà authentifié
const PublicRoute = ({ children, restricted = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  // Si l'utilisateur est connecté et que la route est restreinte (comme login), rediriger vers dashboard
  if (isAuthenticated && restricted) {
    // Rediriger vers le dashboard approprié en fonction du rôle
    let dashboardPath = '/dashboard';
    
    if (user.role === 'etudiant') {
      dashboardPath = '/dashboard/etudiant';
    } else if (user.role === 'entreprise') {
      dashboardPath = '/dashboard/entreprise';
    } else if (user.role === 'admin') {
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

// Vérification de l'email pour les routes qui nécessitent une email vérifié
const VerifiedEmailRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !user.email_verified_at) {
    return <Navigate to="/verification" replace />;
  }
  
  return children;
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
      
      {/* Supprimé /registration/company car MultiStepRegistration peut le gérer */}
      <Route path="/entreprises" element={
        <PublicRoute>
          <RouteWithLayout element={<OffresList />} />
        </PublicRoute>
      } />
      <Route path="/offres" element={
        <PublicRoute>
          <RouteWithLayout element={<OffresList />} />
        </PublicRoute>
      } />
      
      <Route path="/offres/:id" element={
        <PublicRoute>
          <RouteWithLayout element={<JobDetail />} />
        </PublicRoute>
      } />
      
      <Route path="/not-found" element={<Error404 />} />
      
      <Route path="/verification" element={
        <ProtectedRoute>
          <RouteWithLayout element={<EmailVerification />} />
        </ProtectedRoute>
      } />
      
      {/* Consolidé les dashboards en un seul, MinimalDashboard peut afficher le contenu en fonction du rôle */}
      <Route path="/dashboard" element={
        <VerifiedEmailRoute>
          <RouteWithLayout element={<MinimalDashboard />} />
        </VerifiedEmailRoute>
      } />
      
      {/* Gestion des tests */}
      <Route path="/tests" element={
        <VerifiedEmailRoute>
          <RouteWithLayout element={<TestsList />} />
        </VerifiedEmailRoute>
      } />
      
      <Route path="/tests/create" element={
        <VerifiedEmailRoute>
          <ProtectedRoute allowedRoles={['entreprise', 'admin']}>
            <RouteWithLayout element={<TestCreationForm />} />
          </ProtectedRoute>
        </VerifiedEmailRoute>
      } />
      
      <Route path="/tests/:id/edit" element={
        <VerifiedEmailRoute>
          <ProtectedRoute allowedRoles={['entreprise', 'admin']}>
            <RouteWithLayout element={<TestCreationForm />} />
          </ProtectedRoute>
        </VerifiedEmailRoute>
      } />
      
      <Route path="/tests/:testId/candidatures/:candidatureId" element={
        <VerifiedEmailRoute>
          <SkillTest />
        </VerifiedEmailRoute>
      } />
      
      <Route path="/skills" element={
        <VerifiedEmailRoute>
          <RouteWithLayout element={<StudentSkills />} />
        </VerifiedEmailRoute>
      } />
      
      <Route path="/create-offer" element={
        <VerifiedEmailRoute>
          <ProtectedRoute allowedRoles={['entreprise']}>
            <RouteWithLayout element={<CreateOffreForm />} />
          </ProtectedRoute>
        </VerifiedEmailRoute>
      } />
      
      <Route path="/offres/:id/edit" element={
        <VerifiedEmailRoute>
          <ProtectedRoute allowedRoles={['entreprise']}>
            <RouteWithLayout element={<CreateAnnouncementForm />} />
          </ProtectedRoute>
        </VerifiedEmailRoute>
      } />
      
      <Route path="/notifications" element={
        <VerifiedEmailRoute>
          <RouteWithLayout element={<NotificationsCenter />} />
        </VerifiedEmailRoute>
      } />
      
      <Route path="/candidatures/:id" element={
        <VerifiedEmailRoute>
          <RouteWithLayout element={<JobDetail />} />
        </VerifiedEmailRoute>
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