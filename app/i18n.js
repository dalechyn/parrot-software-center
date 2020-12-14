import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpApi from "i18next-http-backend"

i18next
.use(initReactI18next)
.use(HttpApi)
.init({
    debug: true,
    defaultNS: "translation",
    preload: ["en", "it"],
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "it"],
    backend: {
        loadPath: './locales/{{lng}}/{{ns}}.json',
        allowMultiLoading: false,
    },
    react: {
        wait: true,
        useSuspense: true,
    },
    interpolation: {
        escapeValue: false,
    }
});

export default i18next;
