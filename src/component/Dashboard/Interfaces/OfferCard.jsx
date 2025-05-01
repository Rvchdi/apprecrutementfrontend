import React from 'react';

// Helper to format offer type string (optional but nice)
const formatOfferType = (type) => {
  switch (type) {
    case 'stage': return 'Stage';
    case 'emploi': return 'Emploi';
    case 'alternance': return 'Alternance';
    default: return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A'; // Capitalize or default
  }
};

// Helper to get dynamic style for the match percentage badge
const getMatchPercentageStyle = (percentage) => {
  let backgroundColor = '#e0e0e0'; // Default grey
  let color = '#333';
  if (percentage >= 75) {
    backgroundColor = '#c8e6c9'; // Light Green
    color = '#2e7d32';          // Dark Green
  } else if (percentage >= 50) {
    backgroundColor = '#fff9c4'; // Light Yellow
    color = '#fbc02d';          // Dark Yellow/Orange
  } else {
    backgroundColor = '#ffcdd2'; // Light Red
    color = '#c62828';          // Dark Red
  }
  return {
    ...styles.badge, // Base badge styles
    backgroundColor,
    color,
  };
};

function OfferCard({ offer }) {
  if (!offer) return null; // Safety check

  return (
    <div style={styles.card}> {/* Replace with your theme's card class */}
      <div style={styles.cardHeader}>
        <span style={styles.companyName}>
          {offer.entreprise?.nom || 'Entreprise inconnue'}
          {/* You could add a logo here: <img src={offer.entreprise?.logo} alt="" style={styles.logo} /> */}
        </span>
        <span style={getMatchPercentageStyle(offer.match_percentage)}>
          {offer.match_percentage}% Match
        </span>
      </div>

      <h3 style={styles.offerTitle}>{offer.titre || 'Titre non disponible'}</h3>

      <div style={styles.details}>
        <span title="Localisation">📍 {offer.localisation || 'N/A'}</span>
        <span title="Type d'offre">💼 {formatOfferType(offer.type)}</span>
        {/* Show duration only if relevant (Stage/Alternance) and available */}
        {(offer.type === 'stage' || offer.type === 'alternance') && offer.duree && (
          <span title="Durée">⏱️ {offer.duree} mois</span>
        )}
         <span title="Publiée le">📅 {new Date(offer.created_at).toLocaleDateString()}</span>
      </div>

      {/* Optional: Display required skills */}
      {offer.competences && offer.competences.length > 0 && (
         <div style={styles.skillsSection}>
             <strong>Compétences requises :</strong>
             <div style={styles.skillsTags}>
                 {offer.competences.map(comp => (
                     <span key={comp.id} style={styles.skillTag}>{comp.nom}</span>
                 ))}
             </div>
         </div>
      )}

      {/* Link to the full offer details page */}
      {/* Adjust the 'href' based on your routing setup */}
      <a href={`/offres/${offer.id}`} style={styles.detailsButton}>
        Voir Détails
      </a>

      {/* Optional: Display score breakdown for debugging/info - remove for production */}
      {/*
      <details style={{marginTop: '10px', fontSize: '0.8em', opacity: 0.7}}>
          <summary>Détails du score</summary>
          <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.9em'}}>
              Compétences: {offer.score_details?.competences}% |
              Localisation: {offer.score_details?.localisation}% |
              Disponibilité: {offer.score_details?.disponibilite}% |
              Fraîcheur: {offer.score_details?.fraicheur}%
          </pre>
      </details>
      */}
    </div>
  );
}

// --- Basic Placeholder Styles ---
// Replace with your actual theme styles
const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px 20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px', // Spacing between elements
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '5px'
  },
  companyName: {
    fontWeight: 'bold',
    color: '#555',
  },
  badge: { // Base style for the match percentage badge
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '0.9em',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  offerTitle: {
    margin: '5px 0',
    fontSize: '1.2em',
    color: '#333',
    fontWeight: '600',
  },
  details: {
    display: 'flex',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
    gap: '15px', // Space between detail items
    color: '#666',
    fontSize: '0.9em',
  },
   skillsSection: {
      marginTop: '5px',
      fontSize: '0.9em',
  },
  skillsTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '5px',
      marginTop: '5px',
  },
  skillTag: {
      backgroundColor: '#f0f0f0',
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '0.85em',
      color: '#555',
  },
  detailsButton: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 18px',
    backgroundColor: '#007bff', // Example primary color
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    textAlign: 'center',
    fontWeight: '500',
    alignSelf: 'flex-start', // Don't stretch full width
    transition: 'background-color 0.2s ease',
  },
  detailsButtonHover: { // You'd handle hover with CSS typically
     backgroundColor: '#0056b3',
  },
  // logo: { width: '30px', height: '30px', marginRight: '8px', verticalAlign: 'middle' } // Example logo style
};


export default OfferCard;