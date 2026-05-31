package app

import (
	"fmt"
	"net/url"
	"sync"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

// ChildWindowService 管理子窗口的创建、生命周期与通信。
//
// 事件协议（前后端共享，所有窗口均可收发）：
//   - "child:result:<id>"  — 子窗口返回结果给调用方
//   - "child:send:<id>"    — 向指定窗口发送消息（id="main" 代表主窗口）
//   - "child:broadcast"    — 广播给所有窗口
//   - "child:closed:<id>"  — 子窗口关闭通知
type ChildWindowService struct {
	app     *application.App
	windows map[string]*application.WebviewWindow
	mu      sync.RWMutex
	counter int
}

func NewChildWindowService() *ChildWindowService {
	return &ChildWindowService{
		windows: make(map[string]*application.WebviewWindow),
	}
}

func (s *ChildWindowService) AttachApp(app *application.App) {
	s.app = app
}

// ChildWindowOptions 子窗口创建参数
type ChildWindowOptions struct {
	Type    string `json:"type"`
	Title   string `json:"title"`
	Message string `json:"message"`
	Width   int    `json:"width"`
	Height  int    `json:"height"`
}

// Open 创建并显示一个子窗口，返回窗口 ID。
func (s *ChildWindowService) Open(opts ChildWindowOptions) string {
	s.mu.Lock()
	s.counter++
	id := fmt.Sprintf("child-%s-%d", opts.Type, s.counter)
	s.mu.Unlock()

	width, height := s.resolveSize(opts)

	params := url.Values{}
	params.Set("type", opts.Type)
	params.Set("id", id)
	params.Set("title", opts.Title)
	params.Set("message", opts.Message)
	childURL := "/child.html?" + params.Encode()

	window := s.app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:             id,
		Title:            opts.Title,
		Width:            width,
		Height:           height,
		Frameless:        true,
		AlwaysOnTop:      true,
		DisableResize:    true,
		Hidden:           false,
		BackgroundColour: application.NewRGB(255, 255, 255),
		URL:              childURL,
	})

	s.mu.Lock()
	s.windows[id] = window
	s.mu.Unlock()

	window.OnWindowEvent(events.Common.WindowClosing, func(e *application.WindowEvent) {
		s.mu.Lock()
		delete(s.windows, id)
		s.mu.Unlock()
		s.app.Event.Emit("child:closed:"+id, nil)
	})

	window.Center()
	return id
}

// Close 关闭指定子窗口
func (s *ChildWindowService) Close(id string) {
	s.mu.RLock()
	w, ok := s.windows[id]
	s.mu.RUnlock()
	if ok {
		w.Close()
	}
}

// List 返回当前所有子窗口 ID
func (s *ChildWindowService) List() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	ids := make([]string, 0, len(s.windows))
	for id := range s.windows {
		ids = append(ids, id)
	}
	return ids
}

func (s *ChildWindowService) resolveSize(opts ChildWindowOptions) (int, int) {
	if opts.Width > 0 && opts.Height > 0 {
		return opts.Width, opts.Height
	}
	switch opts.Type {
	case "confirm":
		return 420, 220
	case "message":
		return 420, 200
	default:
		return 600, 400
	}
}
