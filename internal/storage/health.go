package storage

import (
	"fmt"
	"os"

	"gorm.io/gorm"
)

// IntegrityCheck 跑 SQLite 的 integrity_check；返回非 ok 时报错。
// 启动时调用一次能尽早发现损坏，让用户切回备份或默认路径。
func IntegrityCheck(db *gorm.DB) error {
	var result string
	if err := db.Raw(`PRAGMA integrity_check;`).Scan(&result).Error; err != nil {
		return err
	}
	if result != "ok" {
		return fmt.Errorf("integrity_check returned: %s", result)
	}
	return nil
}

// WALCheckpoint 显式 checkpoint：把 WAL 中的数据写回主数据库，并截断 WAL。
// 切换路径前调用，确保 .db 文件本身包含最新数据。
func WALCheckpoint(db *gorm.DB) error {
	// PRAGMA wal_checkpoint(TRUNCATE) 返回 (busy, log, checkpointed)，无 error 即认为成功
	return db.Exec(`PRAGMA wal_checkpoint(TRUNCATE);`).Error
}

// FileSize 返回数据库文件总占用（含 .db / .db-wal / .db-shm）。
// 用于设置页展示"当前占用空间"。
func FileSize(path string) (int64, error) {
	var total int64
	for _, suffix := range []string{"", "-wal", "-shm"} {
		info, err := os.Stat(path + suffix)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return 0, err
		}
		total += info.Size()
	}
	return total, nil
}
