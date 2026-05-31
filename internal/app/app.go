// Package app 封装 Wails 应用的启动逻辑。
// main.go 只保留 embed.FS 与 Run 调用，业务装配集中在这里。
package app

import (
	"embed"
	"fmt"
	"log/slog"
	"time"

	"foundation/internal/events"
	"foundation/internal/services/appsettings"
	"foundation/internal/services/greet"
	"foundation/internal/services/preferences"
	"foundation/internal/services/storagesvc"
	"foundation/internal/services/subprocess"
	"foundation/internal/storage"
	"foundation/internal/utils/httpx"
	"foundation/internal/utils/logx"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// Run 创建 Wails 应用、注册服务、打开主窗口并启动事件循环。
// assets 由调用方（main.go）通过 //go:embed 注入。
func Run(assets embed.FS, trayIcon []byte) error {
	// —— 工具层先就绪：日志 → HTTP UA → 后续模块都能直接用 ——
	if err := logx.Init(logx.Config{
		Level:          slog.LevelInfo,
		ConsoleEnabled: true,
	}); err != nil {
		// 日志初始化失败不应阻断启动；降级到默认 stderr logger（logx.For 内部已兜底）
		fmt.Println("warn: logx init failed:", err)
	}
	httpx.SetUserAgent("Foundation/1.0 (+wails-v3)")

	events.Register()

	// —— 持久化层启动顺序 ——
	// 1) 读 storage.json：用户自定义路径 / 默认路径
	// 2) 用 effectivePath 打开 SQLite（PRAGMA + AutoMigrate + IntegrityCheck）
	// 3) 包成 Holder，业务 service 全部走 holder.Current() 拿活跃 DB
	cfgMgr, err := storage.LoadConfig()
	if err != nil {
		return fmt.Errorf("load storage config: %w", err)
	}
	dbPath, err := cfgMgr.EffectiveDBPath()
	if err != nil {
		return fmt.Errorf("resolve db path: %w", err)
	}
	db, err := storage.Open(dbPath)
	if err != nil {
		return fmt.Errorf("open db: %w", err)
	}
	holder := storage.NewHolder(db)
	logx.For("app").Info("storage opened", "path", dbPath)

	// subprocess service 需要 *application.App 才能向前端 Emit 事件。
	// 但 application.New 又需要 services 列表 —— 用预创建 + Bind 模式：
	//   先 new 一个空 service 占位，然后在 app.New 之后回填 app 引用。
	subSvc := subprocess.New(nil) // app 暂为 nil
	childWinSvc := NewChildWindowService()

	app := application.New(application.Options{
		Name:        "Foundation",
		Description: "Wails v3 + React 19 + MUI scaffold",
		Services: []application.Service{
			application.NewService(greet.New()),
			application.NewService(preferences.New(holder)),
			application.NewService(appsettings.New(holder)),
			application.NewService(storagesvc.New(holder, cfgMgr)),
			application.NewService(subSvc),
			application.NewService(childWinSvc),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})
	subSvc.AttachApp(app)
	childWinSvc.AttachApp(app)

	app.Window.NewWithOptions(windowOptions())

	// 系统托盘默认禁用，后续通过配置启用
	// setupSystray(app, trayIcon)

	go emitTimeLoop(app)

	defer logx.Close()
	return app.Run()
}

// emitTimeLoop 演示后端主动推事件给前端的链路。
// 真实业务可参考此结构注册自己的后台 goroutine。
func emitTimeLoop(app *application.App) {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for range ticker.C {
		app.Event.Emit(events.Time, time.Now().Format(time.RFC1123))
	}
}
