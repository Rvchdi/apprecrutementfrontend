import React from 'react';
import { 
  UsersIcon, 
  BriefcaseIcon, 
  TagIcon, 
  UserGroupIcon,
  OfficeBuildingIcon,
  DocumentTextIcon
} from '@heroicons/react/outline';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Enregistrer les composants ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardStats = ({ stats, loading }) => {
  // Configuration pour le graphique à barres
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistiques globales',
      },
    },
  };

  const barData = {
    labels: ['Utilisateurs', 'Offres', 'Candidatures', 'Compétences'],
    datasets: [
      {
        label: 'Nombre total',
        data: [stats.users, stats.offers, stats.applications, stats.competences],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)'],
      },
    ],
  };

  // Configuration pour le diagramme circulaire
  const pieData = {
    labels: ['Étudiants', 'Entreprises', 'Administrateurs'],
    datasets: [
      {
        data: [stats.students, stats.companies, 1], // Supposons qu'il y a au moins 1 administrateur
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Cartes de statistiques
  const statCards = [
    { 
      title: 'Utilisateurs', 
      value: stats.users,
      icon: <UsersIcon className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-100'
    },
    { 
      title: 'Étudiants', 
      value: stats.students, 
      icon: <UserGroupIcon className="w-8 h-8 text-green-500" />,
      color: 'bg-green-100'
    },
    { 
      title: 'Entreprises', 
      value: stats.companies, 
      icon: <OfficeBuildingIcon className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-100'
    },
    { 
      title: 'Offres', 
      value: stats.offers, 
      icon: <BriefcaseIcon className="w-8 h-8 text-red-500" />,
      color: 'bg-red-100'
    },
    { 
      title: 'Candidatures', 
      value: stats.applications, 
      icon: <DocumentTextIcon className="w-8 h-8 text-yellow-500" />,
      color: 'bg-yellow-100'
    },
    { 
      title: 'Compétences', 
      value: stats.competences, 
      icon: <TagIcon className="w-8 h-8 text-indigo-500" />,
      color: 'bg-indigo-100'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-teal-500 transition ease-in-out duration-150">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement des statistiques...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="pb-4">
        <h2 className="text-xl font-bold text-gray-800">Tableau de bord administrateur</h2>
        <p className="text-gray-600">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Répartition par catégorie</h3>
          <div className="h-80">
            <Bar options={barOptions} data={barData} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Répartition des utilisateurs</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="w-64">
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Activité récente</h3>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-3 flex items-start">
              <div className="flex-shrink-0 mr-3">
                {i % 2 === 0 ? (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UsersIcon className="w-4 h-4 text-blue-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <BriefcaseIcon className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-800">
                  {i % 2 === 0 
                    ? 'Nouvel utilisateur inscrit : Jean Dupont' 
                    : 'Nouvelle offre publiée : Développeur Frontend React'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Il y a {(i + 1) * 10} minutes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;