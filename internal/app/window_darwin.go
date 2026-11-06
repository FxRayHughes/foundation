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
			InvisibleTitleBarHeight: 40, // 与前端 macOS 标题栏高度一致（整条可拖拽）
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                macTitleBar(),
		},
	}
}

// macTitleBar：隐藏原生标题栏、内容铺满，保留红绿灯，并与前端标题栏（macOS 40px，--fd-titlebar-h）垂直居中对齐。
//
// 红绿灯位置由 NSToolbar 高度决定，Wails 没有直接设置坐标的 API：
//   - MacTitleBarHiddenInset 预设的 ToolbarStyle 是 Automatic，系统按窗口配置推断样式，
//     多数情况落到 52pt 的 Unified 工具栏（红绿灯中心 ≈ 26pt，明显偏下），进出全屏 / 不同系统版本还会变；
//   - 显式指定 UnifiedCompact（紧凑工具栏）后红绿灯中心稳定在 ≈ 19.5pt（实测），
//     前端在 macOS 上把标题栏设为 40px（--fd-titlebar-h，见 styles/global.css / index.html）与之居中对齐。
// 修改任一侧都要同步另一侧。
func macTitleBar() application.MacTitleBar {
	tb := application.MacTitleBarHiddenInset
	tb.ToolbarStyle = application.MacToolbarStyleUnifiedCompact
	return tb
}
