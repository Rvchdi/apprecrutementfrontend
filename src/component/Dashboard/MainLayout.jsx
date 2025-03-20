import React from 'react';
import FixedNavbar from './FixedNavbar'; // Chemin correct pour un composant dans le même dossier

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FixedNavbar />
      {/* Le contenu principal est décalé de 64px (h-16) pour compenser la navbar fixe */}
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;