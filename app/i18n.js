import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // SearchBar
            "searchPkg": "Search a package",
            // AuthDialog
            "loginSuccess": "Logged in successfully",
            "registerSuccess": "Registered successfully, confirm your account in a message we sent to the email",
            "register": "Register",
            "emailAddr": "Email Address",
            "wrongEmailFormat": "Wrong email format",
            "loginRequirement": "Login needs to have 3-20 symbols",
            "passVisibility": "toggle password visibility",
            "passSymbols": "Password needs to have 6-20 symbols",
            "registerNow": "Not registered? Register now.",
            "loginNow": "Already registered? Login now.",
            "cancel": "Cancel",
            // Header
            "hide": "Hide",
            "home": "Home",
            "queue": "Queue",
            "reports": "Reports",
            "mirrors": "Mirrors",
            "settings": "Settings",
            "login": "Log in",
            "logout": "Log out",
            "pkgAvailable": "packages are available for update",
            // SettingsDialog & Terminal
            "settingSaved": "Setting saved!",
            "loadCVE": "Load CVE Data (disabling may speed up the search)",
            "darkTheme": "Use Dark Theme",
            "save": "Save",
            "close": "Close"
        }
    },
    it: {
        translation: {
            // SearchBar
            "searchPkg": "Cerca un pacchetto",
            // AuthDialog
            "loginSuccess": "Accesso eseguito con successo",
            "registerSuccess": "Registrato con successo, conferma il tuo account nell'email che ti abbiamo inviato",
            "register": "Registrati",
            "emailAddr": "Indirizzo Email",
            "wrongEmailFormat": "Formato email errato",
            "loginRequirement": "Il login deve contenere 3-20 caratteri",
            "passVisibility": "attiva/disattiva la visibilità della password",
            "passSymbols": "La password deve contenere 6-20 caratteri",
            "registerNow": "Non sei registrato? Iscriviti ora.",
            "loginNow": "Già iscritto? Accedi ora.",
            "cancel": "Cancella",
            // Header
            "hide": "Nascondi",
            "home": "Home",
            "queue": "Coda",
            "reports": "Segnalazioni",
            "mirrors": "Mirrors",
            "settings": "Impostazioni",
            "login": "Accedi",
            "logout": "Log out",
            "pkgAvailable": "pacchetti disponibili per l'aggiornamento",
            // SettingsDialog & Terminal
            "settingSaved": "Impostazioni salvate!",
            "loadCVE": "Carica dati CVE (la disabilitazione può accelerare la ricerca)",
            "darkTheme": "Usa il tema dark",
            "save": "Salva",
            "close": "Chiudi"
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
