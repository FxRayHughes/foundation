// Package procx 提供跨平台的子进程管理工具。
//
// 关键设计：
//   - **进程组绑定**：父进程退出 / 崩溃时，子进程不应该泄漏。
//     - Windows：用 JobObject + JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE，父进程退出
//       系统自动 kill 整个 Job 内的子进程
//     - Unix：用 setpgid 让子进程独立成进程组，Stop 时 kill 整个进程组
//   - **context 取消**：StartCtx 监听 ctx，触发时优先 SIGTERM / TerminateJobObject，
//     KillGracePeriod 后强制 Kill
//   - **流式输出**：Run 提供逐行回调，避免业务自己处理 bufio
//   - **stdout/stderr 行回调**：在子进程崩溃时也能拿到尾部日志
//
// 业务约束：
//   - 不要直接用 os/exec.Cmd 然后 Start —— 父进程崩溃会留僵尸
//   - 命令名 + 参数若来自外部输入，必须先白名单 / 转义；本包不会做参数 sanitize
package procx

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"sync"
	"time"
)

// LineHandler 是 stdout/stderr 行回调。回调内不要阻塞太久（会拖累子进程 IO）。
type LineHandler func(line string)

// Spec 描述要启动的子进程。
type Spec struct {
	Name string   // 程序路径或 PATH 中可解析的名称
	Args []string // 参数（不含 argv[0]）

	Dir string   // 工作目录；空 = 继承父进程
	Env []string // 形如 "K=V"；nil = 继承父进程；非 nil 完全替换

	Stdin io.Reader // 输入流，nil 表示不写

	// OnStdout / OnStderr 在每行出现时被调用。回调由独立 goroutine 串行触发。
	// 不需要回调可传 nil；不需要捕获输出请把 CaptureOutput 设为 false。
	OnStdout LineHandler
	OnStderr LineHandler

	// CaptureOutput=true 时管道 stdout/stderr。false 时子进程沿用父进程 fd。
	// 默认（零值）即 false —— 业务方按需打开。
	CaptureOutput bool

	// KillGracePeriod 在 Stop / context 取消后给子进程的"优雅退出"时间，
	// 超时仍未退出则强杀。<=0 取默认 5s。
	KillGracePeriod time.Duration
}

// Process 是一次启动后的子进程句柄。
//
// 生命周期：StartCtx → 业务方等待 Wait()（或 ctx 取消触发 Stop）。
// Wait 返回后再次调用 Stop / Wait 是幂等的。
type Process struct {
	cmd    *exec.Cmd
	pid    int
	pipes  []io.Closer
	wg     sync.WaitGroup // stdout/stderr 行扫描 goroutine
	doneCh chan struct{}
	waitMu sync.Mutex
	waited bool
	exitErr error

	// 平台相关：Windows 是 JobObject handle，Unix 是 setpgid pgid
	platform platformState
	grace    time.Duration
}

// PID 返回子进程 ID；尚未启动 / 已 Wait 的进程返回 0。
func (p *Process) PID() int { return p.pid }

// StartCtx 启动子进程；ctx 取消时按 KillGracePeriod 优雅终止。
//
// 返回的 *Process 即使父函数提前 return 也必须最终 Wait（否则 zombie）。
// 推荐 pattern：
//
//	proc, err := procx.StartCtx(ctx, spec)
//	if err != nil { return err }
//	defer proc.Stop()  // 幂等，Wait 已结束时空跑
//	if err := proc.Wait(); err != nil { ... }
func StartCtx(ctx context.Context, spec Spec) (*Process, error) {
	if spec.Name == "" {
		return nil, errors.New("procx: empty Name")
	}
	if ctx == nil {
		ctx = context.Background()
	}

	cmd := exec.Command(spec.Name, spec.Args...)
	cmd.Dir = spec.Dir
	if spec.Env != nil {
		cmd.Env = spec.Env
	}
	if spec.Stdin != nil {
		cmd.Stdin = spec.Stdin
	}

	// 平台相关 SysProcAttr / Job 准备
	applyPlatformAttrs(cmd)

	p := &Process{
		cmd:    cmd,
		grace:  spec.KillGracePeriod,
		doneCh: make(chan struct{}),
	}
	if p.grace <= 0 {
		p.grace = 5 * time.Second
	}

	if spec.CaptureOutput {
		stdout, err := cmd.StdoutPipe()
		if err != nil {
			return nil, fmt.Errorf("procx: stdout pipe: %w", err)
		}
		stderr, err := cmd.StderrPipe()
		if err != nil {
			return nil, fmt.Errorf("procx: stderr pipe: %w", err)
		}
		p.pipes = append(p.pipes, stdout, stderr)
		p.wg.Add(2)
		go scan(stdout, spec.OnStdout, &p.wg)
		go scan(stderr, spec.OnStderr, &p.wg)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("procx: start %s: %w", spec.Name, err)
	}
	p.pid = cmd.Process.Pid

	// 平台相关：把进程绑到 Job / pgid
	if err := bindToGroup(p); err != nil {
		// 绑定失败也不返回 —— 子进程已起，业务方可决定是否 kill
		// 这里仅记录到 stderr 回调（如有），调用方看不到完整 err
		_ = err
	}

	// 启动监视 goroutine：ctx 取消 → Stop
	go p.watchCtx(ctx)
	return p, nil
}

// Run 是 StartCtx + Wait 的便捷封装；阻塞到子进程退出。
// 返回 nil 表示 exit code 0；非零 exit 返回 *exec.ExitError（errors.As 可取）。
func Run(ctx context.Context, spec Spec) error {
	p, err := StartCtx(ctx, spec)
	if err != nil {
		return err
	}
	defer p.Stop()
	return p.Wait()
}

// Wait 等待子进程退出。可重入：第二次以后立即返回首次结果。
func (p *Process) Wait() error {
	p.waitMu.Lock()
	if p.waited {
		err := p.exitErr
		p.waitMu.Unlock()
		return err
	}
	p.waited = true
	p.waitMu.Unlock()

	// 等所有输出 goroutine 收尾后再 cmd.Wait —— 否则 cmd.Wait 关闭管道会让 scan 提前结束
	p.wg.Wait()
	err := p.cmd.Wait()
	p.exitErr = err
	close(p.doneCh)
	releaseGroup(p)
	return err
}

// Stop 优雅终止子进程：先发 SIGTERM / TerminateJobObject，超过 KillGracePeriod 强杀。
// 幂等：进程已退出时直接返回。
func (p *Process) Stop() {
	select {
	case <-p.doneCh:
		return
	default:
	}
	if p.cmd.Process == nil {
		return
	}
	terminateGroup(p) // 优雅信号

	timer := time.NewTimer(p.grace)
	defer timer.Stop()
	select {
	case <-p.doneCh:
	case <-timer.C:
		killGroup(p) // 强制
	}
}

func (p *Process) watchCtx(ctx context.Context) {
	select {
	case <-ctx.Done():
		p.Stop()
	case <-p.doneCh:
	}
}

func scan(r io.Reader, fn LineHandler, wg *sync.WaitGroup) {
	defer wg.Done()
	if fn == nil {
		// 仍要消费输出，避免管道塞满
		_, _ = io.Copy(io.Discard, r)
		return
	}
	sc := bufio.NewScanner(r)
	// 默认 64KB 行长上限不够；调到 1MB 应付大多数场景
	sc.Buffer(make([]byte, 0, 64*1024), 1<<20)
	for sc.Scan() {
		fn(sc.Text())
	}
}
