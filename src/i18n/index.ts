import i18next, { type Resource } from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import en from './locales/en';
import pt from './locales/pt';

export const NAUTH_NAMESPACE = 'nauth';

export const defaultTranslations = { en, pt };

export function createNAuthI18nInstance(
  language: string = 'en',
  customTranslations?: Record<string, Record<string, unknown>>
) {
  const instance = i18next.createInstance();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resources: Record<string, Record<string, any>> = {
    en: { [NAUTH_NAMESPACE]: { ...en } },
    pt: { [NAUTH_NAMESPACE]: { ...pt } },
  };

  // Merge custom translations
  if (customTranslations) {
    for (const [lang, translations] of Object.entries(customTranslations)) {
      if (resources[lang]) {
        resources[lang][NAUTH_NAMESPACE] = {
          ...resources[lang][NAUTH_NAMESPACE],
          ...translations,
        };
      } else {
        resources[lang] = { [NAUTH_NAMESPACE]: { ...translations } };
      }
    }
  }

  instance.use(initReactI18next).init({
    resources: resources as Resource,
    lng: language,
    fallbackLng: 'en',
    defaultNS: NAUTH_NAMESPACE,
    ns: [NAUTH_NAMESPACE],
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false,
  });

  return instance;
}

export function useNAuthTranslation() {
  return useTranslation(NAUTH_NAMESPACE);
}
