import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from '../../locales/en.json';

const resources = {
  en,
};

const fallback = { languageTag: 'en', isRTL: false };
const locale = RNLocalize.findBestAvailableLanguage(Object.keys(resources)) || fallback;

const languageDetector = {
  init: Function.prototype,
  type: 'languageDetector',
  detect: () => locale.languageTag,
  cacheUserLanguage: Function.prototype,
};

const i18nInstance = i18n.createInstance();

i18nInstance
  .use(initReactI18next)
  // @ts-ignore
  .use(languageDetector)
  .init({
    fallbackLng: 'en',
    debug: false,
    resources,
    ns: ['newRoom'],
    react: {
      useSuspense: false,
    },
  });

export default i18nInstance;
