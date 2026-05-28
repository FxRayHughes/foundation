//go:build !windows

package procx

import (
	"os/exec"
	"syscall"
)

// platformState：Unix 上保存进程组 ID（pgid）。
// setpgid + Setsid 让子进程独立成进程组，Stop 时一刀切。
type platformState struct {
	pgid int
}

// applyPlatformAttrs：让 fork 后的 child 调用 setsid 形成新会话 + 进程组。
// 这样我们 kill -PGID 整组都死，子孙进程不会逃逸。
func applyPlatformAttrs(cmd *exec.Cmd) {
	if cmd.SysProcAttr == nil {
		cmd.SysProcAttr = &syscall.SysProcAttr{}
	}
	cmd.SysProcAttr.Setpgid = true
}

// bindToGroup：Unix 上 Setpgid 已经在 fork 时生效，这里只记录 pgid。
func bindToGroup(p *Process) error {
	if p.cmd.Process == nil {
		return nil
	}
	pgid, err := syscall.Getpgid(p.cmd.Process.Pid)
	if err != nil {
		// 兜底用 pid 当 pgid（我们设了 Setpgid，正常情况下 pgid==pid）
		p.platform.pgid = p.cmd.Process.Pid
		return nil
	}
	p.platform.pgid = pgid
	return nil
}

// terminateGroup：给进程组发 SIGTERM。
func terminateGroup(p *Process) {
	if p.platform.pgid == 0 {
		return
	}
	_ = syscall.Kill(-p.platform.pgid, syscall.SIGTERM)
}

// killGroup：给进程组发 SIGKILL，硬杀。
func killGroup(p *Process) {
	if p.platform.pgid == 0 {
		if p.cmd.Process != nil {
			_ = p.cmd.Process.Kill()
		}
		return
	}
	_ = syscall.Kill(-p.platform.pgid, syscall.SIGKILL)
}

// releaseGroup：Unix 不需要 close handle，留空。
func releaseGroup(_ *Process) {}
