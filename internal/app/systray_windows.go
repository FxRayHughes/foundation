//go:build windows

package app

import "github.com/wailsapp/wails/v3/pkg/application"

func systrayWindowOptions() application.WebviewWindowOptions {
	return application.WebviewWindowOptions{
		Name:            "systray-panel",
		Title:           "Foundation",
		Width:           320,
		Height:          420,
		Frameless:       true,
		AlwaysOnTop:     true,
		Hidden:          true,
		DisableResize:   true,
		HideOnFocusLost: true,
		HideOnEscape:    true,
		URL:             "/systray.html",
		Windows: application.WindowsWindow{
			HiddenOnTaskbar: true,
		},
	}
}

func applyTrayIcon(tray *application.SystemTray, icon []byte) {
	tray.SetIcon(icon)
	tray.SetDarkModeIcon(icon)
}
