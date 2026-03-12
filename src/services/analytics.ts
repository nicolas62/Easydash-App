import ReactGA from 'react-ga4';

export const MEASUREMENT_ID = 'G-YJZZ70VHG0'; // Remplacez par votre ID de mesure GA4

export const initGA = () => {
  // Vérifie si GA est déjà initialisé pour éviter les doubles initialisations
  // ReactGA4 gère cela en interne, mais on peut ajouter une vérification supplémentaire si nécessaire
  // Ici on initialise simplement avec l'ID de mesure
  if (MEASUREMENT_ID) {
    ReactGA.initialize(MEASUREMENT_ID);
    console.log('GA4 Initialized');
  } else {
    console.warn('GA4 Measurement ID is missing.');
  }
};

export const logEvent = (category: string, action: string, label?: string) => {
  // Vérifie si le consentement est donné avant d'envoyer l'événement
  const consent = localStorage.getItem('analytics_consent');
  
  if (consent === 'granted' && MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
    });
  }
};
