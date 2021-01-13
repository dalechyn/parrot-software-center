import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpApi from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18next
  .use(initReactI18next)
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    debug: true,
    defaultNS: 'translation',
    ns: ['translation'],
    preload: ['en', 'it', 'ru'],
    fallbackLng: 'en',
    supportedLngs: ['en', 'it', 'ru'],
    nonExplicitSupportedLngs: true,
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
      allowMultiLoading: false
    },
    react: {
      wait: true,
      useSuspense: false
    },
    interpolation: {
      escapeValue: false
    }
  })
export default i18next
