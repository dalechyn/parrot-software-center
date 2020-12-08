import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // ***************** Components *****************
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
            "close": "Close",
            // RatingDialog
            "reviewSent": "Your review is sent!",
            "shareReview": "Share your review!",
            "commentary": "Commentary",
            "send": "Send",
            // ReportDialog
            "reportReview": "Report review",
            "sentReport": "Your report is sent!",
            "infoReport": "Report information",
            // Review
            "delete": "Delete",
            "report": "Report",
            // ReviewDialog
            "sentReview": "Review sent!",
            "review": "Review",
            "delUsrReview": "Delete user review",
            "banUsr": "Ban user",
            "putReview": "Put your review here",
            // UpgradeFormIndex
            "update": "updates available! Upgrade now!",
            "systemUpdated": "Your system is up to date",
            "upgrade": "packages are waiting for upgrade! Upgrade now!",
            "upgradeBtn": "Upgrade",
            // UpgradeFormUpdateList
            "noPkgFound": "No Package Found",
            "from": "From",
            "moreInfo": "More info",
            "package": "Package",
            "queueUpgrade": "queued for upgrade",
            // Report
            "reportedBy": "Reported by",
            // SearchPreview
            "monthCVEs": "This months CVEs",
            "critical": "Critical",
            "high": "High",
            "medium": "Medium",
            "low": "Low",
            "dequeued": "dequeued",
            "queuedUpgrade": "queued for upgrade",
            "cancelUpgrade": "Cancel Upgrade",
            "upgradePkg": "Upgrade",
            "queuedDel": "queued for deletion",
            "uninstall": "Uninstall",
            "install": "Install",
            "queueInst": "queued for installation",
            // ***************** Containers *****************
            // AptPackageInfo
            "goback": "Go Back",
            "pkgNotAvailable": "This package is not available",
            "generalInfo": "General info",
            "version": "Version",
            "mantainer": "Mantainer",
            "description": "Description",
            "additionalInfo": "Additional info",
            "reviews": "Reviews",
        }
    },
    it: {
        translation: {
            // ***************** Components *****************
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
            "logout": "Esci",
            "pkgAvailable": "pacchetti disponibili per l'aggiornamento",
            // SettingsDialog & Terminal
            "settingSaved": "Impostazioni salvate!",
            "loadCVE": "Carica dati CVE (la disabilitazione può accelerare la ricerca)",
            "darkTheme": "Usa il tema dark",
            "save": "Salva",
            "close": "Chiudi",
            // RatingDialog
            "reviewSent": "La tua recensione è stata inviata!",
            "shareReview": "Condividi la tua opinione!",
            "commentary": "Commento",
            "send": "Invia",
            // ReportDialog
            "reportReview": "Segnala recensione",
            "sentReport": "La tua segnalazione è stata inviata!",
            "infoReport": "Info sulla segnalazione",
            // Review
            "delete": "Elimina",
            "report": "Segnala",
            // ReviewDialog
            "sentReview": "Recensione inviata!",
            "review": "Recensione",
            "delUsrReview": "Elimina la recensione dell'utente",
            "banUsr": "Blocca l'utente",
            "putReview": "Inserisci qui la tua recensione",
            // UpgradeFormIndex
            "update": "aggiornamenti disponibili! Aggiorna ora!",
            "systemUpdated": "Il tuo sistema è aggiornato",
            "upgrade": "pacchetti in attesa di una nuova versione! Aggiorna adesso!",
            "upgradeBtn": "Aggiorna",
            // UpgradeFormUpdateList
            "noPkgFound": "Nessun pacchetto trovato",
            "from": "Da",
            "moreInfo": "Più informazioni",
            "package": "Pacchetto",
            "queueUpgrade": "in coda per l'aggiornamento",
            // Report
            "reportedBy": "Segnalato da",
            // SearchPreview
            "monthCVEs": "Le CVE di questo mese",
            "critical": "Critico",
            "high": "Alto",
            "medium": "Medio",
            "low": "Basso",
            "dequeued": "rimosso dalla coda",
            "queuedUpgrade": "in coda per l'aggiornamento",
            "cancelUpgrade": "Non aggiornare",
            "upgradePkg": "Aggiorna",
            "queuedDel": "in coda per la rimozione",
            "uninstall": "Disinstalla",
            "install": "Installa",
            "queuedInst": "in coda per l'installazione",
            // ***************** Containers *****************
            // AptPackageInfo
            "goback": "Torna indietro",
            "pkgNotAvailable": "Questo pacchetto non è disponibile",
            "generalInfo": "Informazioni generali",
            "version": "Versione",
            "mantainer": "Mantainer",
            "description": "Descrizione",
            "additionalInfo": "Informazioni aggiuntive",
            "reviews": "Recensioni",
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
