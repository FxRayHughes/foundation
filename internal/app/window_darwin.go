//go:build darwin

package app

import "github.com/wailsapp/wails/v3/pkg/application"

// windowOptions 为 macOS 平台返回沉浸式标题栏配置，
// 保留系统红绿灯按钮（traffic lights），但隐藏标题栏背景，
// 让前端在按钮右侧绘制自定义标题文本。
func windowOptions() application.WebviewWindowOptions {
	return application.WebviewWindowOptions{
		Title:            "Foundation",
		Width:            1280,
		Height:           800,
		MinWidth:         960,
		MinHeight:        600,
		BackgroundColour: application.NewRGB(255, 255, 255),
		URL:              "/",
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 28,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
	}
}
