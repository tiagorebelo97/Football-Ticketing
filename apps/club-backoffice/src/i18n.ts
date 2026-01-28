import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            pt: { translation: pt },
            es: { translation: es },
            fr: { translation: fr },
            de: { translation: de },
        },
        fallbackLng: 'pt',
        supportedLngs: ['en', 'pt', 'es', 'fr', 'de'],
        // strategies to fix language detection issues
        load: 'languageOnly', // transforms en-US to en
        debug: true, // Enable debug to see whats going on in console
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
