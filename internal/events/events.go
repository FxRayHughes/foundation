package events

import "github.com/wailsapp/wails/v3/pkg/application"

// Names 集中声明前后端共享的事件名，避免硬编码字符串散落各处。
const (
	Time = "time"
	// AppSettingsChanged 在 app_settings 任一字段写入成功后广播（所有窗口都能收到）。
	// payload 为变更的字段名："themeChoice" | "customTheme" | "localeChoice"。
	// 托盘面板 / 子窗口据此重新拉取设置，实现主题、语言跨窗口实时同步。
	AppSettingsChanged = "appsettings:changed"
)

// Register 在 application 初始化前注册所有强类型事件，
// Wails 的 binding 生成器会据此为前端生成类型化 API。
func Register() {
	application.RegisterEvent[string](Time)
	application.RegisterEvent[string](AppSettingsChanged)
}
