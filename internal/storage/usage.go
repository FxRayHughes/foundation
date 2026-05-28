package storage

import (
	"fmt"
	"strings"

	"gorm.io/gorm"
)

// TableUsage 是单张表的占用统计。
// SizeBytes 在 dbstat 不可用时退化为按行数比例估算（标记为 Estimated=true）。
type TableUsage struct {
	TableName string `json:"tableName"`
	RowCount  int64  `json:"rowCount"`
	SizeBytes int64  `json:"sizeBytes"`
	Estimated bool   `json:"estimated"`
}

// CollectTableUsage 收集一组表的占用情况。
//
// 优先策略：SQLite 的 dbstat 虚表 —— 这是 SQLite 官方在 SQLITE_ENABLE_DBSTAT_VTAB
// 编译时打开的内省视图，逐表汇总 pgsize 即可拿到精确字节数。
// modernc/sqlite 默认开启该编译选项；上游 mattn/go-sqlite3 默认不开。
//
// 退化策略：dbstat 不可用时，用主数据库文件总大小按行数比例估算，
// 这种情况下 Estimated 标 true，UI 会注明"估算"。
func CollectTableUsage(db *gorm.DB, tableNames []string, dbFilePath string) ([]TableUsage, error) {
	out := make([]TableUsage, 0, len(tableNames))

	// 先查每张表行数（每张表都需要，无论后面用哪种字节计算）
	rowCounts := make(map[string]int64, len(tableNames))
	for _, name := range tableNames {
		var n int64
		// 表名走白名单（来自 AllModels.TableName），不会是用户输入；
		// 仍然手动包反引号防御，避免任何 reserved word 冲突。
		if err := db.Raw(fmt.Sprintf("SELECT COUNT(*) FROM `%s`", name)).Scan(&n).Error; err != nil {
			return nil, fmt.Errorf("count %s: %w", name, err)
		}
		rowCounts[name] = n
	}

	// 优先尝试 dbstat：每行有 pgsize（页大小），按 name 聚合。
	dbstatSizes, dbstatOK := tryDbstat(db, tableNames)

	if dbstatOK {
		for _, name := range tableNames {
			out = append(out, TableUsage{
				TableName: name,
				RowCount:  rowCounts[name],
				SizeBytes: dbstatSizes[name],
				Estimated: false,
			})
		}
		return out, nil
	}

	// dbstat 不可用：按行数比例估算
	totalRows := int64(0)
	for _, n := range rowCounts {
		totalRows += n
	}
	totalSize, _ := FileSize(dbFilePath) // 失败时 0；估算结果都是 0 也不影响显示

	for _, name := range tableNames {
		var size int64
		if totalRows > 0 {
			size = totalSize * rowCounts[name] / totalRows
		}
		out = append(out, TableUsage{
			TableName: name,
			RowCount:  rowCounts[name],
			SizeBytes: size,
			Estimated: true,
		})
	}
	return out, nil
}

// tryDbstat 尝试通过 sqlite_dbstat（dbstat 虚表）汇总每张表的总占用。
// 第二个返回值表示该路径是否可用——任意一步出错均返回 false，调用方退化。
//
// 注意：dbstat 把"表"和"索引"分开统计；这里只取 type='table' 行，
// 索引占用不算在表里（避免重复 / 误导）。
func tryDbstat(db *gorm.DB, tableNames []string) (map[string]int64, bool) {
	if len(tableNames) == 0 {
		return map[string]int64{}, true
	}

	// 用 IN(?,?,...) 占位
	placeholders := strings.Repeat("?,", len(tableNames))
	placeholders = strings.TrimSuffix(placeholders, ",")

	args := make([]any, 0, len(tableNames))
	for _, n := range tableNames {
		args = append(args, n)
	}

	type row struct {
		Name  string
		Bytes int64
	}
	var rows []row
	q := fmt.Sprintf(
		`SELECT name AS name, COALESCE(SUM(pgsize), 0) AS bytes
		   FROM dbstat
		  WHERE name IN (%s)
		  GROUP BY name`,
		placeholders,
	)
	if err := db.Raw(q, args...).Scan(&rows).Error; err != nil {
		return nil, false
	}

	out := make(map[string]int64, len(tableNames))
	for _, n := range tableNames {
		out[n] = 0 // 缺失的也补 0，避免 UI 出现 undefined
	}
	for _, r := range rows {
		out[r.Name] = r.Bytes
	}
	return out, true
}
