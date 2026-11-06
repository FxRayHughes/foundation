package app

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"

	"foundation/internal/services/preferences"
	"foundation/internal/utils/logx"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

// systrayPrefKey 是托盘开关在 preferences 表中的键；值为 JSON 布尔（"true" / "false"）。
const systrayPrefKey = "systray.enabled"

// 跨窗口广播协议（与前端 services/childwindow/bus.ts 保持一致）。
// 托盘面板的 QuickActions 通过 child:broadcast 发出下面两种消息，由后端统一处理：
// 后端直接显示 / 聚焦主窗口，避免依赖主窗口 JS 是否在运行。
const (
	broadcastEvent        = "child:broadcast"
	broadcastShowWindow   = "app:show-window"
	broadcastOpenSettings = "app:open-settings"
)

// SystrayService 在运行时创建 / 销毁系统托盘与其附着的面板窗口。
//
//   - Enable / Disable 幂等、并发安全（同一把互斥锁串行化）
//   - 开关状态持久化到 SQLite preferences 表（经 preferences.Service → holder.Current()，
//     不 capture *storage.DB），启动时由 restore() 恢复
//   - 平台差异（窗口选项、模板图标）在 systray_<os>.go
type SystrayService struct {
	prefs *preferences.Service
	icon  []byte

	app        *application.App
	mainWindow application.Window

	mu       sync.Mutex
	labels   TrayMenuLabels // 托盘右键菜单文案（前端按当前语言经 SetMenuLabels 推送）
	menu     *application.Menu
	showItem *application.MenuItem
	quitItem *application.MenuItem
	tray     *application.SystemTray
	panel    *application.WebviewWindow
	offBcast func()

	// shuttingDown 置位后，面板的关闭拦截不再生效，让应用退出时正常销毁窗口。
	shuttingDown atomic.Bool
}

// TrayMenuLabels 是托盘原生右键菜单的文案。
// 文案由前端 i18n 提供（任何人类可见字符串都走 t()），后端只保存并应用；
// 前端推送之前使用英文兜底。
type TrayMenuLabels struct {
	ShowWindow string `json:"showWindow"`
	Quit       string `json:"quit"`
}

var defaultTrayMenuLabels = TrayMenuLabels{ShowWindow: "Show Window", Quit: "Quit"}

// NewSystrayService 创建托盘服务。icon 为托盘图标字节（main.go embed）。
func NewSystrayService(prefs *preferences.Service, icon []byte) *SystrayService {
	return &SystrayService{prefs: prefs, icon: icon, labels: defaultTrayMenuLabels}
}

// SetMenuLabels 更新托盘右键菜单文案（主窗口在语言切换时调用）。托盘未启用时只保存，下次创建时生效。
func (s *SystrayService) SetMenuLabels(labels TrayMenuLabels) {
	if labels.ShowWindow == "" {
		labels.ShowWindow = defaultTrayMenuLabels.ShowWindow
	}
	if labels.Quit == "" {
		labels.Quit = defaultTrayMenuLabels.Quit
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.labels = labels
	if s.menu == nil {
		return
	}
	s.showItem.SetLabel(labels.ShowWindow)
	s.quitItem.SetLabel(labels.Quit)
	application.InvokeSync(s.menu.Update)
}

// attach 在 application.New 之后回填 app 与主窗口引用（小写：不暴露给前端 bindings）。
func (s *SystrayService) attach(app *application.App, mainWindow application.Window) {
	s.app = app
	s.mainWindow = mainWindow
	app.OnShutdown(func() { s.shuttingDown.Store(true) })
}

// restore 读取持久化的开关，若为启用则在启动时创建托盘。读失败按禁用处理。
func (s *SystrayService) restore(ctx context.Context) {
	raw, err := s.prefs.Get(ctx, systrayPrefKey)
	if err != nil {
		logx.For("systray").Warn("read systray preference failed", "err", err)
		return
	}
	if raw != "true" {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.createLocked()
}

// Enable 启用系统托盘（创建托盘图标 + 隐藏的面板窗口），并持久化开关。重复调用无副作用。
func (s *SystrayService) Enable(ctx context.Context) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.app == nil {
		return fmt.Errorf("systray: app not attached")
	}
	if s.tray == nil {
		s.createLocked()
	}
	return s.persist(ctx, true)
}

// Disable 移除系统托盘并关闭面板窗口，并持久化开关。重复调用无副作用。
func (s *SystrayService) Disable(ctx context.Context) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.tray != nil {
		s.destroyLocked()
	}
	return s.persist(ctx, false)
}

// IsEnabled 返回托盘当前是否存在。
func (s *SystrayService) IsEnabled() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.tray != nil
}

func (s *SystrayService) persist(ctx context.Context, enabled bool) error {
	value := "false"
	if enabled {
		value = "true"
	}
	if err := s.prefs.Set(ctx, systrayPrefKey, value); err != nil {
		return fmt.Errorf("systray: persist preference: %w", err)
	}
	return nil
}

// createLocked 创建面板窗口与托盘。调用方必须持有 s.mu。
//
// 应用运行中调用时，SystemTray.New() 会立即在主线程创建原生托盘项，
// 之后的 SetIcon / SetMenu 走运行时更新路径；AttachWindow 只是记录字段，
// 左键点击在 processClick 时读取，因此运行时附着同样生效。
func (s *SystrayService) createLocked() {
	panel := s.app.Window.NewWithOptions(systrayWindowOptions())

	// 用户若用系统快捷键关闭面板（Cmd+W / Alt+F4），改为隐藏，避免托盘挂着一个已销毁的窗口。
	// Disable 与应用退出时放行真正的关闭。
	panel.RegisterHook(events.Common.WindowClosing, func(e *application.WindowEvent) {
		if s.shuttingDown.Load() {
			return
		}
		s.mu.Lock()
		owned := s.panel == panel
		s.mu.Unlock()
		if owned {
			e.Cancel()
			panel.Hide()
		}
	})

	tray := s.app.SystemTray.New()
	tray.SetTooltip(s.app.Config().Name)
	applyTrayIcon(tray, s.icon)

	menu := s.app.NewMenu()
	s.showItem = menu.Add(s.labels.ShowWindow).OnClick(func(*application.Context) { s.showMainWindow() })
	menu.AddSeparator()
	s.quitItem = menu.Add(s.labels.Quit).OnClick(func(*application.Context) { s.app.Quit() })
	tray.SetMenu(menu)
	s.menu = menu

	// 左键：切换面板（Wails 默认行为，基于 AttachWindow）；右键：原生菜单（未设 OnRightClick 时的默认行为）。
	tray.AttachWindow(panel).WindowOffset(5)

	s.offBcast = s.app.Event.On(broadcastEvent, s.handleBroadcast)
	s.tray = tray
	s.panel = panel
	logx.For("systray").Info("systray enabled")
}

// destroyLocked 移除托盘并关闭面板。调用方必须持有 s.mu。
func (s *SystrayService) destroyLocked() {
	if s.offBcast != nil {
		s.offBcast()
		s.offBcast = nil
	}
	tray, panel := s.tray, s.panel
	s.tray, s.panel = nil, nil
	s.menu, s.showItem, s.quitItem = nil, nil, nil // 先解除归属，关闭拦截 hook 据此放行

	// 原生托盘的移除必须在主线程（macOS NSStatusBar 等）。
	application.InvokeSync(tray.Destroy)
	panel.Close()
	logx.For("systray").Info("systray disabled")
}

func (s *SystrayService) handleBroadcast(e *application.CustomEvent) {
	msg, ok := e.Data.(map[string]any)
	if !ok {
		return
	}
	switch msg["type"] {
	case broadcastShowWindow, broadcastOpenSettings:
		s.mu.Lock()
		panel := s.panel
		s.mu.Unlock()
		if panel != nil {
			panel.Hide()
		}
		s.showMainWindow()
	}
}

func (s *SystrayService) showMainWindow() {
	if s.mainWindow == nil {
		return
	}
	s.mainWindow.UnMinimise()
	s.mainWindow.Show()
	s.mainWindow.Focus()
}
