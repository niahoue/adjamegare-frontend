import { useEffect } from 'react';
import { preloadTravelData } from '../src/hooks/useTravelData';

/**
 * Composant d'initialisation de l'application
 * À placer au niveau racine (App.jsx) pour précharger les données critiques
 */
const AppInitializer = ({ children }) => {
  useEffect(() => {
    // Préchargement des données critiques au démarrage de l'application
    const initializeApp = async () => {
      try {
        // Précharger les données de voyage (villes et compagnies)
        await preloadTravelData();
        
        // Optionnel : précharger d'autres données critiques
        // await preloadCriticalData(); // fonction depuis apiService.js
        
        console.log('✅ Application initialisée avec succès');
      } catch (error) {
        console.warn('⚠️ Erreur lors de l\'initialisation de l\'application:', error);
        // L'application peut continuer à fonctionner même en cas d'erreur de préchargement
      }
    };

    initializeApp();
  }, []);

  return children;
};

export default AppInitializer;