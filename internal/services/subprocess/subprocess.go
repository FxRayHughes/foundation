// Package subprocess 把 procx 的能力暴露给前端。
//
// 安全模型（**重要**）：
//
//   - 白名单驱动：只有在 commands.go 里显式注册的命令才能被前端调用
//   - 参数校验：每个白名单命令可声明允许的"参数模式"（regexp / 枚举）
//   - 子进程绑定父：复用 procx，父进程崩溃自动连带 kill
//   - 输出走事件流：前端用 Wails Events 订阅 stdout/stderr 行
//
// 业务方加新命令前请仔细想：
//   - 参数能否被攻击者污染？UI 输入要严格校验
//   - 命令的副作用范围？写文件 / 网络 / 装载内核模块都要慎重
//   - 是否允许同一命令并发多个实例？默认允许；要限制就在 Run 入口判断
package subprocess

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"sync/atomic"

	"foundation/internal/utils/logx"
	"foundation/internal/utils/procx"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// Service 提供给 Wails 注册。
type Service struct {
	// app 用来 Emit 事件给前端；nil 时输出降级为只写 logger。
	app *application.App

	mu      sync.Mutex
	procs   map[uint64]*tracked
	nextID  atomic.Uint64
	logger  *slogger
}

// EventNamePrefix 是输出事件的前缀。前端订阅 'subprocess:stdout:<id>' 之类。
// 不写成常量是为了允许多实例并存（虽然单进程 app 里一个实例就够）。
func (s *Service) EventNamePrefix() string { return "subprocess" }

// New 构造 Service。app 可为 nil（unit test 时方便）。
// 真实启动序列里 app 在 Service 之后才 New，业务方调 AttachApp 把引用回填。
func New(app *application.App) *Service {
	return &Service{
		app:    app,
		procs:  make(map[uint64]*tracked),
		logger: &slogger{l: logx.For("subprocess")},
	}
}

// AttachApp 在 application.New 之后回填 app 引用，让 Run 能 Emit 事件。
// 不持有 app 的话，前端永远收不到 stdout / stderr / exit 事件。
func (s *Service) AttachApp(app *application.App) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.app = app
}

type tracked struct {
	id   uint64
	name string
	proc *procx.Process
}

// RunSpec 是前端发来的启动请求。
type RunSpec struct {
	// Name 是白名单中的命令名（commands.go 的 key），不是可执行文件路径。
	Name string `json:"name"`
	// Args 业务参数；会经过白名单 ArgPattern 校验。
	Args []string `json:"args"`
	// Cwd 工作目录；空 = 继承父进程。允许列表由白名单条目决定。
	Cwd string `json:"cwd"`
}

// RunResult 启动成功的句柄信息。
type RunResult struct {
	ID  uint64 `json:"id"`
	PID int    `json:"pid"`
}

// Run 启动一个白名单命令。失败返回详细错误。
//
// 启动后进程独立运行；前端用 ID 订阅事件、调 Stop。
func (s *Service) Run(ctx context.Context, spec RunSpec) (RunResult, error) {
	cmd, ok := lookupCommand(spec.Name)
	if !ok {
		return RunResult{}, fmt.Errorf("subprocess: command %q not in whitelist", spec.Name)
	}
	if err := cmd.validateArgs(spec.Args); err != nil {
		return RunResult{}, err
	}
	if err := cmd.validateCwd(spec.Cwd); err != nil {
		return RunResult{}, err
	}

	id := s.nextID.Add(1)

	pspec := procx.Spec{
		Name:          cmd.Exe,
		Args:          append(append([]string{}, cmd.PrependArgs...), spec.Args...),
		Dir:           spec.Cwd,
		CaptureOutput: true,
		OnStdout:      s.makeLineEmitter(id, "stdout"),
		OnStderr:      s.makeLineEmitter(id, "stderr"),
	}
	proc, err := procx.StartCtx(context.Background(), pspec)
	if err != nil {
		return RunResult{}, err
	}

	t := &tracked{id: id, name: spec.Name, proc: proc}
	s.mu.Lock()
	s.procs[id] = t
	s.mu.Unlock()

	s.logger.l.Info("started", "id", id, "name", spec.Name, "pid", proc.PID())

	// 监视退出，发"exit"事件 + 从 map 移除
	go func() {
		err := proc.Wait()
		exitCode := 0
		errMsg := ""
		if err != nil {
			errMsg = err.Error()
			exitCode = -1
		}
		s.emit(fmt.Sprintf("%s:exit:%d", s.EventNamePrefix(), id), map[string]any{
			"id":       id,
			"exitCode": exitCode,
			"error":    errMsg,
		})
		s.mu.Lock()
		delete(s.procs, id)
		s.mu.Unlock()
		s.logger.l.Info("exited", "id", id, "name", spec.Name, "err", errMsg)
	}()

	return RunResult{ID: id, PID: proc.PID()}, nil
}

// Stop 优雅终止指定 ID 的子进程；找不到 / 已退出返回 nil（幂等）。
func (s *Service) Stop(_ context.Context, id uint64) error {
	s.mu.Lock()
	t, ok := s.procs[id]
	s.mu.Unlock()
	if !ok {
		return nil
	}
	t.proc.Stop()
	return nil
}

// Item 列表里展示的字段（不包含敏感参数）。
type Item struct {
	ID   uint64 `json:"id"`
	Name string `json:"name"`
	PID  int    `json:"pid"`
}

// List 当前活跃子进程。
func (s *Service) List(_ context.Context) ([]Item, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]Item, 0, len(s.procs))
	for _, t := range s.procs {
		out = append(out, Item{ID: t.id, Name: t.name, PID: t.proc.PID()})
	}
	return out, nil
}

// AvailableCommand 给前端发现哪些命令可用（用于 UI 渲染）。
type AvailableCommand struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// AvailableCommands 列出白名单。
func (s *Service) AvailableCommands(_ context.Context) ([]AvailableCommand, error) {
	out := make([]AvailableCommand, 0, len(whitelist))
	for _, c := range whitelist {
		out = append(out, AvailableCommand{Name: c.Name, Description: c.Description})
	}
	return out, nil
}

// makeLineEmitter 构造 stdout/stderr 行回调；既写日志又通过 Wails 事件流给前端。
func (s *Service) makeLineEmitter(id uint64, stream string) procx.LineHandler {
	event := fmt.Sprintf("%s:%s:%d", s.EventNamePrefix(), stream, id)
	return func(line string) {
		s.emit(event, map[string]any{
			"id":     id,
			"stream": stream,
			"line":   line,
		})
		s.logger.l.Debug("line", "id", id, "stream", stream, "line", line)
	}
}

func (s *Service) emit(name string, payload any) {
	if s.app == nil {
		return
	}
	s.app.Event.Emit(name, payload)
}

// 占位错误（保留扩展）
var _ = errors.New

// slogger 包一层避免直接暴露 logx 句柄；将来要换 logger 实现只动这里。
type slogger struct {
	l interface {
		Debug(msg string, args ...any)
		Info(msg string, args ...any)
		Warn(msg string, args ...any)
		Error(msg string, args ...any)
	}
}
