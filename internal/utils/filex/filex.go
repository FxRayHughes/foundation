// Package filex 是文件 IO 工具的集合。
//
// 当前提供：
//   - WriteAtomic：原子写文件（.tmp + fsync + rename），保护配置文件
//   - ReadLimit：带上限的读取，防止恶意 / 失控大文件
//   - EnsureDir：mkdir -p 的同义词，便于上层语义化
//
// 设计要点：
//   - 原子写流程：os.WriteFile 直接写在崩溃 / 断电时可能产生半截文件；
//     WriteAtomic 写到同目录的 .tmp 后 rename 替换原文件 —— rename 在
//     POSIX 与 Windows 上对单一目录内的同盘符路径是原子操作
//   - 临时文件失败时自动清理，避免目录里累积 .tmp 残骸
package filex

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// WriteAtomic 把 data 写到 path：先写临时文件 .tmp.<rand> 再 rename 替换。
//
// perm 仅在新文件创建时生效；若 path 已存在，rename 不改变其权限。
//
// 注意：若调用者要保护"目录里若干文件的整体一致性"（比如同时写两个文件），
// 仅靠这函数是不够的，需要更高层的事务（或者直接用 SQLite）。
func WriteAtomic(path string, data []byte, perm os.FileMode) error {
	if path == "" {
		return errors.New("filex: empty path")
	}
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("filex: ensure dir: %w", err)
	}

	// CreateTemp 自动确保不重名，避免并发调用碰撞
	tmp, err := os.CreateTemp(dir, ".tmp-"+filepath.Base(path)+"-*")
	if err != nil {
		return fmt.Errorf("filex: create tmp: %w", err)
	}
	tmpName := tmp.Name()

	// 任何路径失败都要清理 tmp，避免目录里累积残骸
	cleanup := func() { _ = os.Remove(tmpName) }

	if _, err := tmp.Write(data); err != nil {
		_ = tmp.Close()
		cleanup()
		return fmt.Errorf("filex: write tmp: %w", err)
	}
	// fsync：确保数据真的落盘，rename 之后系统崩溃也不会丢
	if err := tmp.Sync(); err != nil {
		_ = tmp.Close()
		cleanup()
		return fmt.Errorf("filex: sync tmp: %w", err)
	}
	if err := tmp.Close(); err != nil {
		cleanup()
		return fmt.Errorf("filex: close tmp: %w", err)
	}
	// 调权限到目标 perm（CreateTemp 默认 0o600）
	if err := os.Chmod(tmpName, perm); err != nil {
		cleanup()
		return fmt.Errorf("filex: chmod tmp: %w", err)
	}
	// rename 是原子的（同一目录内）
	if err := os.Rename(tmpName, path); err != nil {
		cleanup()
		return fmt.Errorf("filex: rename: %w", err)
	}
	return nil
}

// ReadLimit 读取文件，但拒绝超过 max 字节的输入；防止恶意 / 失控大文件耗内存。
// max <= 0 时退化为 8MB 默认上限。
func ReadLimit(path string, max int64) ([]byte, error) {
	if max <= 0 {
		max = 8 << 20
	}
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	st, err := f.Stat()
	if err != nil {
		return nil, err
	}
	if st.Size() > max {
		return nil, fmt.Errorf("filex: file %s exceeds %d bytes", path, max)
	}
	return io.ReadAll(io.LimitReader(f, max))
}

// EnsureDir 是 os.MkdirAll(path, 0o755) 的语义化包装。
// 已存在不报错；目标是一个文件时报错。
func EnsureDir(path string) error {
	return os.MkdirAll(path, 0o755)
}
