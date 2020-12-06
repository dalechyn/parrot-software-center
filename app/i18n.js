import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "searchPkg": "Search a package",
            "loginPassed": "Logged in successfully",
            "hide": "Hide",
            "home": "Home",
            "queue": "Queue",
            "reports": "Reports",
            "mirrors": "Mirrors",
            "settings": "Settings",
            "login": "Log in",
            "logout": "Log out",
            "pkgAvailable": "packages are available for update"
        }
    },
    it: {
        translation: {
            "searchPkg": "Cerca un pacchetto",
            "hide": "Nascondi",
            "home": "Home",
            "queue": "Coda",
            "reports": "Segnalazioni",
            "mirrors": "Mirrors",
            "settings": "Impostazioni",
            "login": "Log in",
            "logout": "Log out",
            "pkgAvailable": "pacchetti disponibili per l'aggiornamento"
        }
    }
};

i18next
.use(initReactI18next)
.init({
    resources,
    debug: true,
    lng: "it",// currently how to change language
    fallbackLng: "en",
    interpolation: {
        escapeValue: false
    }
});

export default i18next;
