import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Import translation files
import deCommon from './locales/de/common.json';
import deForms from './locales/de/forms.json';
import deContent from './locales/de/content.json';
import deErrors from './locales/de/errors.json';

import frCommon from './locales/fr/common.json';
import frForms from './locales/fr/forms.json';
import frContent from './locales/fr/content.json';
import frErrors from './locales/fr/errors.json';

import itCommon from './locales/it/common.json';
import itForms from './locales/it/forms.json';
import itContent from './locales/it/content.json';
import itErrors from './locales/it/errors.json';

import rmCommon from './locales/rm/common.json';
import rmForms from './locales/rm/forms.json';
import rmContent from './locales/rm/content.json';
import rmErrors from './locales/rm/errors.json';

import enCommon from './locales/en/common.json';
import enForms from './locales/en/forms.json';
import enContent from './locales/en/content.json';
import enErrors from './locales/en/errors.json';

const resources = {
  de: {
    common: deCommon,
    forms: deForms,
    content: deContent,
    errors: deErrors,
  },
  fr: {
    common: frCommon,
    forms: frForms,
    content: frContent,
    errors: frErrors,
  },
  it: {
    common: itCommon,
    forms: itForms,
    content: itContent,
    errors: itErrors,
  },
  rm: {
    common: rmCommon,
    forms: rmForms,
    content: rmContent,
    errors: rmErrors,
  },
  en: {
    common: enCommon,
    forms: enForms,
    content: enContent,
    errors: enErrors,
  },
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    lng: 'de', // Default language
    debug: process.env.NODE_ENV === 'development',
    
    supportedLngs: ['de', 'fr', 'it', 'rm', 'en'],
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Enable language detection for routes without language prefix
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    defaultNS: 'common',
    ns: ['common', 'forms', 'content', 'errors'],
  });

export default i18n;