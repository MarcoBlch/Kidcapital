import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';
import ptTranslations from './locales/pt.json';
import deTranslations from './locales/de.json';
import { safeGetItem } from '../utils/safeStorage';

const SUPPORTED_LANGS = ['en', 'fr', 'es', 'pt', 'de'];

// Get the user's browser language, default to 'en'
const getBrowserLanguage = () => {
    if (typeof navigator === 'undefined' || !navigator.language) return 'en';
    const lang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGS.includes(lang)) {
        return lang;
    }
    return 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            fr: { translation: frTranslations },
            es: { translation: esTranslations },
            pt: { translation: ptTranslations },
            de: { translation: deTranslations }
        },
        lng: safeGetItem('kidcapital_language') || getBrowserLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes values
        },
        react: {
            useSuspense: false // Disable suspense to prevent blank screen crashes without an explicit <Suspense> boundary
        }
    });

export default i18n;
