//go:build windows

package app

import "github.com/wailsapp/wails/v3/pkg/application"

// windowOptions 为 Windows 平台返回无边框窗口配置，
// 标题栏完全由前端 React 组件自绘（拖拽、最小化/最大化/关闭）。
func windowOptions() application.WebviewWindowOptions {
	return application.WebviewWindowOptions{
		Title:            "Foundation",
		Width:            1280,
		Height:           800,
		MinWidth:         960,
		MinHeight:        600,
		Frameless:        true,
		BackgroundColour: application.NewRGB(255, 255, 255),
		URL:              "/",
	}
}
