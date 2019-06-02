package buttons

import (
	"store/webview"
)

func Exit(w webview.WebView) {
	//w.Dialog(webview.DialogTypeAlert, webview.DialogFlagWarning, "Exit", "Exiting the software store")
	w.Terminate()
	w.
}
