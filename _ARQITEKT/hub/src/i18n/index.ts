import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';
import en from './locales/en.json';

const savedLanguage = localStorage.getItem('arqitekt-language') || 'de';

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: 'de',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('arqitekt-language', lng);
  document.documentElement.lang = lng;
});

export default i18n;
