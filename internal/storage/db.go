package storage

import (
	"errors"
	"fmt"
	"path/filepath"
	"sync"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB 是上层使用的句柄。
//
// 设计取舍（桌面单用户场景）：
//   - 单一连接 + WAL：MaxOpenConns=1，写串行，避免 SQLITE_BUSY
//   - 读也走同一连接：依靠 WAL 让多线程读少量阻塞；并发不高足够
//   - 上层 service 只需要 db.GORM.WithContext(ctx).XXX
//
// 切换路径需要：Close → 用新路径调 Open → 替换业务 service 持有的指针。
// 我们用 storagesvc 内的互斥保护这个流程。
type DB struct {
	GORM *gorm.DB
	Path string
}

var (
	openMu sync.Mutex
)

// Open 打开（或新建）位于 path 的 SQLite 数据库，注入 PRAGMA + AutoMigrate + 健康检查。
// 失败会返回 error 而不是 panic，便于上层在切换路径失败时回滚。
func Open(path string) (*DB, error) {
	openMu.Lock()
	defer openMu.Unlock()

	if path == "" {
		return nil, errors.New("storage: empty database path")
	}
	if err := ensureDir(filepath.Dir(path)); err != nil {
		return nil, fmt.Errorf("storage: ensure dir: %w", err)
	}

	gdb, err := gorm.Open(sqlite.Open(path), &gorm.Config{
		// 静音 GORM 默认日志（debug 时改 logger.Info）
		Logger: logger.Default.LogMode(logger.Warn),
		// 禁用默认事务提交：单写场景用不到外层事务包裹
		SkipDefaultTransaction: true,
	})
	if err != nil {
		return nil, fmt.Errorf("storage: open db: %w", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		return nil, fmt.Errorf("storage: get sql.DB: %w", err)
	}
	// 单连接：避免 SQLITE_BUSY；MaxIdle=1 配合长连接复用
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)

	if err := applyPragmas(gdb); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("storage: apply pragmas: %w", err)
	}

	if err := autoMigrate(gdb); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("storage: auto migrate: %w", err)
	}

	if err := ensureSingletonSettings(gdb); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("storage: ensure singleton settings: %w", err)
	}

	if err := IntegrityCheck(gdb); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("storage: integrity check: %w", err)
	}

	return &DB{GORM: gdb, Path: path}, nil
}

// MustOpen 打开数据库，失败直接 panic。仅用于 main / 启动路径，
// 切换路径等运行时操作请用 Open（可恢复）。
func MustOpen(path string) *DB {
	db, err := Open(path)
	if err != nil {
		panic(err)
	}
	return db
}

// Close 关闭底层连接池。在切换路径或退出时调用。
func (d *DB) Close() error {
	if d == nil || d.GORM == nil {
		return nil
	}
	sqlDB, err := d.GORM.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
