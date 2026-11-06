//go:build darwin

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
	}
}

// applyTrayIcon：macOS 菜单栏使用模板图标，系统按明暗模式自动着色。
func applyTrayIcon(tray *application.SystemTray, icon []byte) {
	tray.SetTemplateIcon(icon)
}
