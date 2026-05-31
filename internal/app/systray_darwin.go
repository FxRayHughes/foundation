//go:build darwin

package app

import "github.com/wailsapp/wails/v3/pkg/application"

func systrayWindowOptions() application.WebviewWindowOptions {
	return application.WebviewWindowOptions{
		Name:          "systray-panel",
		Title:         "Foundation",
		Width:         320,
		Height:        420,
		Frameless:     true,
		AlwaysOnTop:   true,
		Hidden:        true,
		DisableResize: true,
		URL:           "/systray.html",
	}
}
