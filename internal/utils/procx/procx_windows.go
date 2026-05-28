//go:build windows

package procx

import (
	"os/exec"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

// platformState：在 Windows 上保存 JobObject 句柄。
// 每个 Process 自己一个 Job —— 既保证父进程退出 → 整组连带 kill，
// 又能用 TerminateJobObject 一刀切干净（不用枚举子树 PID）。
type platformState struct {
	job windows.Handle
}

// applyPlatformAttrs 让 cmd 起来后挂到我们的 Job 之前先"挂起"。
// CREATE_SUSPENDED 让进程主线程暂停，便于我们 AssignProcessToJobObject 后再恢复，
// 避免子进程在被绑到 Job 之前就 fork 出新进程逃逸。
func applyPlatformAttrs(cmd *exec.Cmd) {
	if cmd.SysProcAttr == nil {
		cmd.SysProcAttr = &syscall.SysProcAttr{}
	}
	cmd.SysProcAttr.CreationFlags |= windows.CREATE_SUSPENDED | windows.CREATE_NEW_PROCESS_GROUP
	cmd.SysProcAttr.HideWindow = true
}

// bindToGroup 在 Start 之后立刻调用：建 Job → 设 KILL_ON_JOB_CLOSE → 把子进程加入。
// 完成后 ResumeThread 让主线程跑起来。
func bindToGroup(p *Process) error {
	job, err := windows.CreateJobObject(nil, nil)
	if err != nil {
		_ = resumeMainThread(p) // 至少让进程别卡死
		return err
	}

	// 设 KILL_ON_JOB_CLOSE：父进程结束（所有 handle 关闭）→ Job 关闭 → 子进程被系统 kill
	info := windows.JOBOBJECT_EXTENDED_LIMIT_INFORMATION{
		BasicLimitInformation: windows.JOBOBJECT_BASIC_LIMIT_INFORMATION{
			LimitFlags: windows.JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
		},
	}
	if _, err := windows.SetInformationJobObject(
		job,
		windows.JobObjectExtendedLimitInformation,
		uintptr(unsafe.Pointer(&info)),
		uint32(unsafe.Sizeof(info)),
	); err != nil {
		_ = windows.CloseHandle(job)
		_ = resumeMainThread(p)
		return err
	}

	// 拿子进程 handle 加入 Job
	hProc, err := windows.OpenProcess(
		windows.PROCESS_SET_QUOTA|windows.PROCESS_TERMINATE,
		false,
		uint32(p.cmd.Process.Pid),
	)
	if err != nil {
		_ = windows.CloseHandle(job)
		_ = resumeMainThread(p)
		return err
	}
	defer windows.CloseHandle(hProc)

	if err := windows.AssignProcessToJobObject(job, hProc); err != nil {
		_ = windows.CloseHandle(job)
		_ = resumeMainThread(p)
		return err
	}

	p.platform.job = job

	// 主线程恢复（前面 CREATE_SUSPENDED 暂停了它）
	return resumeMainThread(p)
}

// resumeMainThread 通过 ToolHelp 找到子进程的主线程并 ResumeThread。
// 不直接用 cmd.Process.Pid 因为 Process 没有线程 handle 字段。
func resumeMainThread(p *Process) error {
	if p.cmd.Process == nil {
		return nil
	}
	pid := uint32(p.cmd.Process.Pid)
	snap, err := windows.CreateToolhelp32Snapshot(windows.TH32CS_SNAPTHREAD, 0)
	if err != nil {
		return err
	}
	defer windows.CloseHandle(snap)

	var te windows.ThreadEntry32
	te.Size = uint32(unsafe.Sizeof(te))
	if err := windows.Thread32First(snap, &te); err != nil {
		return err
	}
	for {
		if te.OwnerProcessID == pid {
			h, err := windows.OpenThread(windows.THREAD_SUSPEND_RESUME, false, te.ThreadID)
			if err == nil {
				_, _ = windows.ResumeThread(h)
				_ = windows.CloseHandle(h)
				return nil // 主线程一般是第一个；恢复一次即可
			}
		}
		if err := windows.Thread32Next(snap, &te); err != nil {
			return nil // 没找到主线程也不致命
		}
	}
}

// terminateGroup：温和信号。Windows 上没真正的 SIGTERM，能做的：
//   - GenerateConsoleCtrlEvent(CTRL_BREAK_EVENT) 给进程组（要求 CREATE_NEW_PROCESS_GROUP）
//   - 失败则等 grace 后 killGroup 兜底
func terminateGroup(p *Process) {
	if p.cmd.Process == nil {
		return
	}
	_ = windows.GenerateConsoleCtrlEvent(
		windows.CTRL_BREAK_EVENT,
		uint32(p.cmd.Process.Pid),
	)
}

// killGroup：硬终止整个 Job —— 子孙进程一起死。
func killGroup(p *Process) {
	if p.platform.job != 0 {
		_ = windows.TerminateJobObject(p.platform.job, 1)
		return
	}
	// 没绑成功 Job 时退化到单进程 kill
	if p.cmd.Process != nil {
		_ = p.cmd.Process.Kill()
	}
}

// releaseGroup：进程已退出，关闭 Job 句柄。
func releaseGroup(p *Process) {
	if p.platform.job != 0 {
		_ = windows.CloseHandle(p.platform.job)
		p.platform.job = 0
	}
}
