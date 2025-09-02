import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importer les fichiers de traduction
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

// Les ressources de traduction
const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  }
};

i18n
  .use(initReactI18next) // Passe i18n à react-i18next
  .init({
    resources,
    lng: 'fr', // Langue par défaut
    fallbackLng: 'en', // Langue de secours si une traduction manque
    keySeparator: false, // Permet d'utiliser des points dans les clés de traduction si besoin, mais simple pour l'instant

    interpolation: {
      escapeValue: false // React s'occupe déjà de la protection contre les XSS
    }
  });

export default i18n;
