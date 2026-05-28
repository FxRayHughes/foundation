package storage

import "gorm.io/gorm"

// ModelDescriptor 是模型在持久化层的"元数据"包装：
// 除了 GORM struct 本身，还附带表名 / i18n 标签 key / 是否允许"手动清空"。
//
// 这样数据存储设置页可以列出每张表的占用情况、并对"非敏感、可重建"的表
// 提供一键清空。新增表时遵循同样规范，i18n 键名由开发者填，UI 自动展示。
type ModelDescriptor struct {
	// Model 是 GORM 模型实例的指针（&Preference{}）。
	Model any
	// TableName SQLite 中的实际表名。
	// 必须显式提供：业务方可能用 GORM TableName() 钩子重命名，避免推断不一致。
	TableName string
	// LabelKey 设置页展示的 i18n 路径，文案在
	// settings.database.tables.<key>.{label,description}。
	LabelKey string
	// Clearable=true 表示允许在设置页手动清空。
	// 涉及"用户输入" / "敏感凭据" / "无法重建的关键状态"的表设为 false。
	// 当前两张表的判断：
	//   - preferences   = true：UI 行为开关，重置即默认
	//   - app_settings  = false：主题选择 / 自定义主题 / 语言，"全清"会重置用户视觉设置，应让用户走具体的"重置"动作
	Clearable bool
}

// AllModels 是 AutoMigrate 与设置页的注册中心。
// 加新表只需要：
//  1. 在 storage 包内新建 *.go 文件定义 GORM 结构体
//  2. 把对应 ModelDescriptor 追加到这里
//  3. 重启应用 → 自动建表
//
// AutoMigrate 会自动做：建表、加列、加索引、加外键、改列类型。
// 不会做：删列、删表、重命名（保留旧 schema 不丢数据，但不会清理）。
//
// 重命名字段需手写一次性数据迁移钩子；这种情况极少见。
var AllModels = []ModelDescriptor{
	{
		Model:     &Preference{},
		TableName: "preferences",
		LabelKey:  "preferences",
		Clearable: true,
	},
	{
		Model:     &AppSettings{},
		TableName: "app_settings",
		LabelKey:  "appSettings",
		Clearable: false,
	},
}

// Preference 行式偏好存储：每个键一行，便于增量加新键不改 schema。
// Value 用 TEXT 存 JSON，让前端可以直接放任意可序列化值。
type Preference struct {
	Key       string `gorm:"primaryKey;size:128"`
	Value     string `gorm:"type:text;not null"`
	UpdatedAt int64  `gorm:"autoUpdateTime:milli"`
}

// AppSettings 是单行表（CHECK id=1 锁死）：
// 保存"必有且唯一"的应用级配置。和 Preference 的区别：
//   - 这里的字段是已知有限集，schema 强校验
//   - Preference 是开放键值，业务方可以随时塞新键
type AppSettings struct {
	ID            uint   `gorm:"primaryKey;check:id = 1"`
	ThemeChoice   string `gorm:"size:64;not null;default:'system'"`
	CustomTheme   string `gorm:"type:text"`                       // JSON: { mode, palette }
	LocaleChoice  string `gorm:"size:32;not null;default:'auto'"` // 'auto' | LocaleCode
	UpdatedAt     int64  `gorm:"autoUpdateTime:milli"`
}

// modelObjs 把 ModelDescriptor 列表展开成 AutoMigrate 需要的 any 切片。
func modelObjs() []any {
	out := make([]any, 0, len(AllModels))
	for _, m := range AllModels {
		out = append(out, m.Model)
	}
	return out
}

// autoMigrate 把所有 model 同步到当前数据库。
func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(modelObjs()...)
}

// FindDescriptor 按表名查找 ModelDescriptor；找不到返回 nil。
// storagesvc.ClearTable 用它做白名单校验，避免任意 SQL 注入。
func FindDescriptor(tableName string) *ModelDescriptor {
	for i := range AllModels {
		if AllModels[i].TableName == tableName {
			return &AllModels[i]
		}
	}
	return nil
}

// ensureSingletonSettings 保证 app_settings 至少存在一行，让上层
// 可以直接 First / Save 而不需要 First or Create 两段逻辑。
func ensureSingletonSettings(db *gorm.DB) error {
	var count int64
	if err := db.Model(&AppSettings{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	return db.Create(&AppSettings{
		ID:           1,
		ThemeChoice:  "system",
		LocaleChoice: "auto",
	}).Error
}
