import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./component/Landing";
import MultiStepRegistration from "./component/MultiStepRegistration";
import Login from "./component/Login";
import MinimalDashboard from "./component/MinimalDashboard";
import CompanyDashboard from "./component/CompanyDashboard";
import CompanyRegistration from "./component/CompanyRegistration"; // Ajout de cette importation
import CreateAnnouncementForm from "./component/CreateAnnouncementForm";
import Error404 from "./component/Error404";
import OffresEtudiant from "./component/OffreEtudiant";
import JobDetail from "./component/JobDetail";
import SkillTest from "./component/SkillTest";
import StudentSkills from "./component/StudentSkills";
import NotificationsCenter from "./component/NotificationsCenter";

// ... reste du fichier inchangé
// Import du Layout et du système d'authentification
import MainLayout from "./component/MainLayout";
import { AuthProvider, useAuth } from "./component/AuthContext";
import EmailVerification from './component/EmailVerification';

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
      
      <Route path="/registration/company" element={
        <PublicRoute restricted={true}>
          <CompanyRegistration />
        </PublicRoute>
      } />
      
      <Route path="/offres" element={
        <PublicRoute>
          <RouteWithLayout element={<OffresEtudiant />} />
        </PublicRoute>
      } />
      
      <Route path="/offres/:id" element={
        <PublicRoute>
          <RouteWithLayout element={<JobDetail />} />
        </PublicRoute>
      } />
      
      <Route path="/not-found" element={<Error404 />} />
      
      {/* Routes qui nécessitent une authentification mais pas forcément un email vérifié */}
      <Route path="/verification" element={
        <ProtectedRoute>
          <RouteWithLayout element={<EmailVerification />} />
        </ProtectedRoute>
      } />
      
      {/* Routes qui nécessitent une authentification et un email vérifié */}
      
      {/* Dashboard étudiant et fonctionnalités */}
      <Route path="/dashboard/etudiant" element={
        <VerifiedEmailRoute>
          <RouteWithLayout element={<MinimalDashboard />} />
        </VerifiedEmailRoute>
      } />
      
      <Route path="/skills" element={
        <VerifiedEmailRoute>
          <RouteWithLayout element={<StudentSkills />} />
        </VerifiedEmailRoute>
      } />
      
      <Route path="/tests/:testId/candidatures/:candidatureId" element={
        <VerifiedEmailRoute>
          <SkillTest />
        </VerifiedEmailRoute>
      } />
      
      {/* Dashboard entreprise et fonctionnalités */}
      <Route path="/dashboard/entreprise" element={
        <VerifiedEmailRoute>
          <ProtectedRoute allowedRoles={['entreprise']}>
            <RouteWithLayout element={<CompanyDashboard />} />
          </ProtectedRoute>
        </VerifiedEmailRoute>
      } />
      
      <Route path="/create-announcement" element={
        <VerifiedEmailRoute>
          <ProtectedRoute allowedRoles={['entreprise']}>
            <RouteWithLayout element={<CreateAnnouncementForm />} />
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
      
      {/* Dashboard admin */}
      <Route path="/dashboard/admin" element={
        <VerifiedEmailRoute>
          <ProtectedRoute allowedRoles={['admin']}>
            <RouteWithLayout element={<MinimalDashboard />} />
          </ProtectedRoute>
        </VerifiedEmailRoute>
      } />
      
      {/* Routes communes à tous les utilisateurs authentifiés */}
      <Route path="/dashboard" element={
        <VerifiedEmailRoute>
          <RouteWithLayout element={<MinimalDashboard />} />
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