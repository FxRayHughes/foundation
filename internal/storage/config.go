package storage

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"

	"foundation/internal/utils/filex"
)

// Config 是 storage.json 的形状。当前只有数据路径一项；将来若加"备份策略"
// 之类的元配置，请在这里追加字段并保持向后兼容（json:"-,omitempty" 等）。
type Config struct {
	// DataPath 用户自定义的数据库文件路径。空字符串表示走 DefaultDBPath。
	DataPath string `json:"dataPath,omitempty"`
}

// ConfigManager 管理 storage.json 的读写。它独立于数据库——
// 这层不能依赖 GORM，否则切换路径时会循环依赖。
type ConfigManager struct {
	path string
	mu   sync.Mutex
	cfg  Config
}

// LoadConfig 读取 storage.json；不存在或损坏时返回零值 Config（不报错），
// 这样首次启动用户什么都不需要管。
func LoadConfig() (*ConfigManager, error) {
	path, err := configFilePath()
	if err != nil {
		return nil, err
	}
	mgr := &ConfigManager{path: path}
	if err := mgr.load(); err != nil {
		// 解析失败时仅记录到内存为零值；用户后续保存会覆盖坏文件。
		mgr.cfg = Config{}
	}
	return mgr, nil
}

func (m *ConfigManager) load() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	data, err := os.ReadFile(m.path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			m.cfg = Config{}
			return nil
		}
		return err
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return err
	}
	m.cfg = cfg
	return nil
}

// Get 返回当前 Config 的拷贝（值类型，避免外部修改污染）。
func (m *ConfigManager) Get() Config {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.cfg
}

// EffectiveDBPath 返回当前生效的数据库文件路径：
//   - 用户自定义 → 返回该路径
//   - 未自定义 → 返回 DefaultDBPath
func (m *ConfigManager) EffectiveDBPath() (string, error) {
	cfg := m.Get()
	if cfg.DataPath != "" {
		return cfg.DataPath, nil
	}
	return DefaultDBPath()
}

// SetDataPath 写入新的自定义数据路径并落盘 storage.json。
// 仅更新配置；数据库迁移由调用方负责（参见 storagesvc.SetCustomPath）。
func (m *ConfigManager) SetDataPath(p string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.cfg.DataPath = p
	return m.persist()
}

// ResetDataPath 清空自定义路径，回退到平台默认。
func (m *ConfigManager) ResetDataPath() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.cfg.DataPath = ""
	return m.persist()
}

// persist 调用方需持有 m.mu。
// 走 filex.WriteAtomic：避免崩溃 / 断电时产生半截 storage.json。
func (m *ConfigManager) persist() error {
	if err := ensureDir(filepath.Dir(m.path)); err != nil {
		return err
	}
	data, err := json.MarshalIndent(m.cfg, "", "  ")
	if err != nil {
		return err
	}
	return filex.WriteAtomic(m.path, data, 0o644)
}
