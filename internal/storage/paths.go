// Package storage 提供 SQLite + GORM 持久化层。
//
// 设计目标：让上层完全不需要关心 SQL / 迁移 / 平台差异：
//   - 模型只在 models.go 注册一次，启动自动 AutoMigrate
//   - 路径在平台默认与用户自定义之间切换（见 config.go）
//   - 读写并发由 SQLite WAL + 单连接池兜底（见 db.go / pragma.go）
package storage

import (
	"errors"
	"os"
	"path/filepath"
	"runtime"
)

// AppDirName 是写到用户数据目录下的子文件夹名称。
// 改成业务名时，连同 Wails 的 Name 一起改。
const AppDirName = "Foundation"

// DBFileName 是 SQLite 主文件名（WAL/SHM 由 SQLite 自动管理为 .db-wal / .db-shm）。
const DBFileName = "foundation.db"

// ConfigFileName 路径配置（独立于数据库本身，因此不能存到 db 里——鸡生蛋）。
const ConfigFileName = "storage.json"

// ErrNoUserDir 表示无法解析用户数据目录。
var ErrNoUserDir = errors.New("storage: cannot resolve user data directory")

// userDataDir 返回平台规范的用户数据根目录：
//   - Windows: %AppData%\Foundation
//   - macOS:   ~/Library/Application Support/Foundation
//   - Linux:   $XDG_DATA_HOME/Foundation 或 ~/.local/share/Foundation
//
// 不创建目录，只算路径——是否落地交给调用方。
func userDataDir() (string, error) {
	switch runtime.GOOS {
	case "windows":
		if v := os.Getenv("AppData"); v != "" {
			return filepath.Join(v, AppDirName), nil
		}
		// 兜底：os.UserConfigDir 返回 %AppData%
		base, err := os.UserConfigDir()
		if err != nil {
			return "", ErrNoUserDir
		}
		return filepath.Join(base, AppDirName), nil
	case "darwin":
		home, err := os.UserHomeDir()
		if err != nil {
			return "", ErrNoUserDir
		}
		return filepath.Join(home, "Library", "Application Support", AppDirName), nil
	default:
		// Linux / *BSD：遵循 XDG 规范
		if v := os.Getenv("XDG_DATA_HOME"); v != "" {
			return filepath.Join(v, AppDirName), nil
		}
		home, err := os.UserHomeDir()
		if err != nil {
			return "", ErrNoUserDir
		}
		return filepath.Join(home, ".local", "share", AppDirName), nil
	}
}

// DefaultDBPath 返回平台默认数据库文件完整路径。
// 该路径所在目录可能尚不存在；调用者通过 ensureDir 创建。
func DefaultDBPath() (string, error) {
	dir, err := userDataDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, DBFileName), nil
}

// configFilePath 返回 storage.json 的完整路径。
// 它和默认数据库放在同一目录，但不受用户切换数据路径影响。
func configFilePath() (string, error) {
	dir, err := userDataDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, ConfigFileName), nil
}

// ensureDir 创建目录（含父级）；已存在不报错。
func ensureDir(path string) error {
	return os.MkdirAll(path, 0o755)
}
