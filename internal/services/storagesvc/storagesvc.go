// Package storagesvc 暴露"数据存储"管理：路径查看、切换、统计。
//
// 关键约束：切换路径会改写整个进程持有的 *storage.DB 指针。
// 业务 service 通过 *storage.Holder 拿当前活跃 DB，避免持有过期句柄。
package storagesvc

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"

	"foundation/internal/storage"
)

// Service 暴露给前端：路径管理 + 统计。
type Service struct {
	holder *storage.Holder
	cfg    *storage.ConfigManager
	mu     sync.Mutex // 切换路径串行
}

func New(holder *storage.Holder, cfg *storage.ConfigManager) *Service {
	return &Service{holder: holder, cfg: cfg}
}

// Stats 设置页用于展示当前路径与占用空间。
type Stats struct {
	Path        string `json:"path"`
	IsCustom    bool   `json:"isCustom"`
	DefaultPath string `json:"defaultPath"`
	SizeBytes   int64  `json:"sizeBytes"`
}

// TableInfo 单张表的展示元数据 + 实际占用。
// 元数据来自 storage.AllModels（labelKey / clearable），用量由 dbstat 或估算得出。
type TableInfo struct {
	Name      string `json:"name"`      // SQLite 表名（如 'preferences'）
	LabelKey  string `json:"labelKey"`  // i18n key 后缀（前端拼 settings.database.tables.<key>.label）
	Clearable bool   `json:"clearable"` // 是否允许 ClearTable
	RowCount  int64  `json:"rowCount"`
	SizeBytes int64  `json:"sizeBytes"`
	Estimated bool   `json:"estimated"` // true = 用行数比例估算，false = dbstat 精确值
}

// TableStats 整体快照。Total 是所有表的占用之和；
// 与 Stats.SizeBytes 不同 —— 后者含 .db-wal / .db-shm 文件，前者只算表数据。
type TableStats struct {
	TotalBytes int64       `json:"totalBytes"`
	Tables     []TableInfo `json:"tables"`
}

// GetStats 拉取当前数据存储信息。
func (s *Service) GetStats(_ context.Context) (Stats, error) {
	def, err := storage.DefaultDBPath()
	if err != nil {
		return Stats{}, err
	}
	cfg := s.cfg.Get()
	cur := s.holder.Current().Path

	size, _ := storage.FileSize(cur) // 失败时给 0，不阻断 UI

	return Stats{
		Path:        cur,
		IsCustom:    cfg.DataPath != "",
		DefaultPath: def,
		SizeBytes:   size,
	}, nil
}

// GetTableStats 收集每张已注册表的行数 + 占用。
//
// dbstat 可用时给精确值；不可用时按行数比例估算（前端会标注"估算"）。
// 表清单严格从 storage.AllModels 取，避免任意 SQL 注入到 Raw 查询。
func (s *Service) GetTableStats(ctx context.Context) (TableStats, error) {
	current := s.holder.Current()
	descs := storage.AllModels

	names := make([]string, 0, len(descs))
	for _, d := range descs {
		names = append(names, d.TableName)
	}

	usage, err := storage.CollectTableUsage(current.GORM.WithContext(ctx), names, current.Path)
	if err != nil {
		return TableStats{}, err
	}

	// 把 usage 与 descriptor 对齐，组装 TableInfo
	usageByName := make(map[string]storage.TableUsage, len(usage))
	for _, u := range usage {
		usageByName[u.TableName] = u
	}

	tables := make([]TableInfo, 0, len(descs))
	var total int64
	for _, d := range descs {
		u := usageByName[d.TableName]
		tables = append(tables, TableInfo{
			Name:      d.TableName,
			LabelKey:  d.LabelKey,
			Clearable: d.Clearable,
			RowCount:  u.RowCount,
			SizeBytes: u.SizeBytes,
			Estimated: u.Estimated,
		})
		total += u.SizeBytes
	}

	return TableStats{TotalBytes: total, Tables: tables}, nil
}

// ClearTable 清空指定表。仅允许 storage.AllModels 中标记为 Clearable=true 的表。
//
// 安全约束：
//   - 表名必须在白名单（FindDescriptor）
//   - 表必须 clearable=true
//   - 用 GORM 的 Where("1=1").Delete 触发 hooks（如有）；不用 raw TRUNCATE，
//     避免绕过任何业务级钩子。SQLite 没有 TRUNCATE，DELETE 也是逐行；
//     脚手架场景表通常不大，直接 DELETE 足够。
func (s *Service) ClearTable(ctx context.Context, tableName string) error {
	desc := storage.FindDescriptor(tableName)
	if desc == nil {
		return fmt.Errorf("unknown table: %s", tableName)
	}
	if !desc.Clearable {
		return fmt.Errorf("table %s is not clearable", tableName)
	}
	return s.holder.Current().GORM.WithContext(ctx).
		Where("1 = 1").Delete(desc.Model).Error
}

// SetCustomPath 把数据库迁移到新位置。
//
// 流程（保证不丢数据）：
//  1. 校验目标目录可写
//  2. 当前 DB 做 wal_checkpoint，落盘所有数据
//  3. 关闭当前 DB
//  4. 复制 .db / .db-wal / .db-shm 到新位置
//  5. 在新位置打开（含 IntegrityCheck）
//  6. 通过 → 删旧文件 + 写 storage.json + 替换 holder
//  7. 任意步骤失败 → 删除新位置已写文件 + 重开旧 DB + 报错
func (s *Service) SetCustomPath(_ context.Context, newPath string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if newPath == "" {
		return errors.New("path required")
	}
	abs, err := filepath.Abs(newPath)
	if err != nil {
		return fmt.Errorf("abs path: %w", err)
	}
	current := s.holder.Current()
	if filepath.Clean(abs) == filepath.Clean(current.Path) {
		return nil // 无变化
	}

	if err := preflightWritable(abs); err != nil {
		return fmt.Errorf("target not writable: %w", err)
	}

	// 1) checkpoint：让 .db 包含最新数据
	if err := storage.WALCheckpoint(current.GORM); err != nil {
		return fmt.Errorf("checkpoint: %w", err)
	}

	// 2) 关闭当前
	oldPath := current.Path
	if err := current.Close(); err != nil {
		return fmt.Errorf("close current: %w", err)
	}

	// 3) 复制 .db / -wal / -shm
	written, err := copyDBSet(oldPath, abs)
	if err != nil {
		s.tryReopenLegacy(oldPath)
		removeAll(written)
		return fmt.Errorf("copy db set: %w", err)
	}

	// 4) 打开新位置
	next, err := storage.Open(abs)
	if err != nil {
		s.tryReopenLegacy(oldPath)
		removeAll(written)
		return fmt.Errorf("open new: %w", err)
	}

	// 5) 替换 holder & 持久化配置
	prev := s.holder.Swap(next)
	_ = prev // 已在第 2 步关闭

	if err := s.cfg.SetDataPath(abs); err != nil {
		_ = next.Close()
		removeAll(written)
		s.tryReopenLegacy(oldPath)
		return fmt.Errorf("persist config: %w", err)
	}

	// 6) 删旧位置文件
	for _, suffix := range []string{"", "-wal", "-shm"} {
		_ = os.Remove(oldPath + suffix)
	}
	return nil
}

// ResetPath 把数据库迁回平台默认位置。
func (s *Service) ResetPath(ctx context.Context) error {
	def, err := storage.DefaultDBPath()
	if err != nil {
		return err
	}
	current := s.holder.Current()
	if filepath.Clean(def) == filepath.Clean(current.Path) {
		// 已经是默认位置：仅清空 storage.json 中的自定义路径配置
		return s.cfg.ResetDataPath()
	}
	if err := s.SetCustomPath(ctx, def); err != nil {
		return err
	}
	return s.cfg.ResetDataPath()
}

func (s *Service) tryReopenLegacy(oldPath string) {
	db, err := storage.Open(oldPath)
	if err != nil {
		panic(fmt.Errorf("storagesvc: failed to reopen legacy db at %s: %w", oldPath, err))
	}
	s.holder.Swap(db)
}

// preflightWritable 校验目标文件所在目录可写。
func preflightWritable(path string) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	test := filepath.Join(dir, ".foundation-write-test")
	f, err := os.Create(test)
	if err != nil {
		return err
	}
	_ = f.Close()
	return os.Remove(test)
}

// copyDBSet 把 src.db / src.db-wal / src.db-shm 复制到 dst.db 同名集。
func copyDBSet(src, dst string) ([]string, error) {
	var written []string
	for _, suffix := range []string{"", "-wal", "-shm"} {
		s := src + suffix
		d := dst + suffix
		if _, err := os.Stat(s); err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return written, err
		}
		if err := copyFile(s, d); err != nil {
			return written, err
		}
		written = append(written, d)
	}
	return written, nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o644)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err := io.Copy(out, in); err != nil {
		return err
	}
	return out.Sync()
}

func removeAll(paths []string) {
	for _, p := range paths {
		_ = os.Remove(p)
	}
}
