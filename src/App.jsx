import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import des composants
import Landing from "./component/Landing";
import MultiStepRegistration from "./component/Authentication/MultiStepRegistration";
import Login from "./component/Authentication/Login";
import EmailVerification from './component/Authentication/EmailVerification';
import ForgotPassword from './component/Authentication/ForgotPassword';
import ResetPassword from './component/Authentication/ResetPassword';
import Unauthorized from './component/Authentication/Unauthorized';
import Dashboard from "./component/Dashboard/MinimalDashboard";
import CreateOffreForm from "./component/CreateOffreForm";
import OffresEtudiant from "./component/OffreEtudiant";
import JobDetail from "./component/JobDetail";
import SkillTest from "./component/SkillTest";
import NotificationsCenter from "./component/NotificationsCenter";
import Error404 from "./component/Error404";

// Import du layout et du contexte d'authentification
import MainLayout from "./component/Dashboard/MainLayout";
import { AuthProvider } from "./component/Authentication/AuthContext";
import { 
  PublicRoute, 
  PrivateRoute, 
  VerifiedRoute, 
  GuestRoute, 
  RoleRoute 
} from "./component/Authentication/AuthRoutes";

// Autres composants dashboard
import OffresList from './component/Dashboard/Interfaces/OffresList';
import TestsList from './component/Dashboard/Tests/TestsList';
import TestCreationForm from './component/Dashboard/Tests/TestCreationForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/offres" element={
              <MainLayout>
                <OffresList />
              </MainLayout>
            } />
            <Route path="/offres/:id" element={
              <MainLayout>
                <JobDetail />
              </MainLayout>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/not-found" element={<Error404 />} />
          </Route>

          {/* Routes accessibles uniquement aux visiteurs (non connectés) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<MultiStepRegistration />} />
            <Route path="/registration/company" element={<MultiStepRegistration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Routes protégées - nécessite une authentification */}
          <Route element={<PrivateRoute />}>
            {/* Page de vérification d'email (accessible même sans email vérifié) */}
            <Route path="/verification" element={<EmailVerification />} />
          </Route>

          {/* Routes nécessitant une authentification ET un email vérifié */}
          <Route element={<VerifiedRoute />}>
            {/* Dashboard et composants associés */}
            <Route path="/dashboard" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />
            
            <Route path="/dashboard/:tab" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />

            <Route path="/notifications" element={
              <MainLayout>
                <NotificationsCenter />
              </MainLayout>
            } />

            {/* Tests */}
            <Route path="/tests" element={
              <MainLayout>
                <TestsList />
              </MainLayout>
            } />
            
            <Route path="/tests/:testId/candidatures/:candidatureId" element={<SkillTest />} />

            {/* Routes spécifiques aux entreprises */}
            <Route element={<RoleRoute roles={['entreprise', 'admin']} />}>
              <Route path="/tests/create" element={
                <MainLayout>
                  <TestCreationForm />
                </MainLayout>
              } />
              
              <Route path="/tests/:id/edit" element={
                <MainLayout>
                  <TestCreationForm />
                </MainLayout>
              } />
              
              <Route path="/create-offer" element={
                <MainLayout>
                  <CreateOffreForm />
                </MainLayout>
              } />
              
              <Route path="/offres/:id/edit" element={
                <MainLayout>
                  <CreateOffreForm />
                </MainLayout>
              } />
            </Route>
          </Route>

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;