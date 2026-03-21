import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '@/locales/en.json'
import tn from '@/locales/tn.json'


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tn: { translation: tn },
    },
    fallbackLng:   'en',
    supportedLngs: ['en', 'tn'],
    interpolation: { escapeValue: false },
    detection: {
      order:  ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
