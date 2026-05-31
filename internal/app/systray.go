package app

import (
	"runtime"

	"foundation/internal/utils/logx"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// setupSystray 在 app.Run() 之前调用，创建系统托盘 + 面板窗口。
func setupSystray(app *application.App, iconData []byte) {
	window := app.Window.NewWithOptions(systrayWindowOptions())

	tray := app.SystemTray.New()

	if runtime.GOOS == "darwin" {
		tray.SetTemplateIcon(iconData)
	} else {
		tray.SetIcon(iconData)
		tray.SetDarkModeIcon(iconData)
	}

	tray.AttachWindow(window)
	tray.WindowOffset(5)

	menu := app.NewMenu()
	menu.Add("Show Window").OnClick(func(ctx *application.Context) {
		app.Event.Emit("app:show-window", nil)
	})
	menu.AddSeparator()
	menu.Add("Quit").OnClick(func(ctx *application.Context) {
		app.Quit()
	})
	tray.SetMenu(menu)

	tray.OnRightClick(func() {
		tray.OpenMenu()
	})

	logx.For("app").Info("systray initialized")
}
