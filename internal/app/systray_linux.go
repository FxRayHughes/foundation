//go:build linux

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
		HideOnFocusLost: true, // 部分窗口管理器下 Wails 会自动跳过（焦点事件不可靠）
		HideOnEscape:    true,
		URL:             "/systray.html",
	}
}

func applyTrayIcon(tray *application.SystemTray, icon []byte) {
	tray.SetIcon(icon)
	tray.SetDarkModeIcon(icon)
}
