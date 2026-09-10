import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locals/en.json'
import bn from './locals/bn.json'
import hi from './locals/hi.json'
import mr from './locals/mr.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      bn: {
        translation: bn
      },
      hi: {
        translation: hi
      },
      mr: {
        translation: mr
      }
    },

    fallbackLng: 'en',

    supportedLngs: ['en', 'bn', 'hi', 'mr'],

    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n