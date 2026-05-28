package storage

import "gorm.io/gorm"

// pragmaSet 在打开连接后立即执行，决定 SQLite 的并发与性能基线。
//
// 关键项说明：
//   - journal_mode=WAL：读不阻塞写，多读 + 单写并行的核心
//   - synchronous=NORMAL：WAL 下安全，比 FULL 快数倍（电源故障下最多丢最近事务）
//   - busy_timeout=5000：写冲突时等 5s 而非立即 SQLITE_BUSY
//   - cache_size=-64000：64MB 缓存（负数表示 KB）
//   - mmap_size=268435456：256MB mmap，加速大表只读扫描
//   - temp_store=MEMORY：临时表 / 排序中间结果放内存
//   - foreign_keys=ON：开启外键约束（默认是关的，反直觉）
//   - wal_autocheckpoint=1000：每 1000 帧自动 checkpoint
var pragmaSet = []string{
	`PRAGMA journal_mode = WAL;`,
	`PRAGMA synchronous = NORMAL;`,
	`PRAGMA busy_timeout = 5000;`,
	`PRAGMA cache_size = -64000;`,
	`PRAGMA mmap_size = 268435456;`,
	`PRAGMA temp_store = MEMORY;`,
	`PRAGMA foreign_keys = ON;`,
	`PRAGMA wal_autocheckpoint = 1000;`,
}

// applyPragmas 在已打开的 *gorm.DB 上批量执行 PRAGMA。
// 注意：journal_mode 是连接级 → 数据库级粘性切换；后续新连接也会沿用 WAL 模式。
func applyPragmas(db *gorm.DB) error {
	for _, sql := range pragmaSet {
		if err := db.Exec(sql).Error; err != nil {
			return err
		}
	}
	return nil
}
