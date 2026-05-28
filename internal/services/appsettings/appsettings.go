// Package appsettings 提供"应用设置"单行表的读写。
//
// 单行表（CHECK id=1）保存"必有且唯一"的配置项：
// 主题选择、自定义主题 JSON、语言选择。
//
// 与 preferences 的区别：
//   - 这里字段是已知有限集，schema 强校验
//   - preferences 是开放键值，业务方可以随时塞新键
package appsettings

import (
	"context"

	"foundation/internal/storage"

	"gorm.io/gorm"
)

type Service struct {
	holder *storage.Holder
}

func New(holder *storage.Holder) *Service {
	return &Service{holder: holder}
}

func (s *Service) db() *gorm.DB {
	return s.holder.Current().GORM
}

// Snapshot 是对外暴露的整体快照，前端启动时一次拉取。
type Snapshot struct {
	ThemeChoice  string `json:"themeChoice"`
	CustomTheme  string `json:"customTheme"` // JSON: { mode, palette }；空字符串=未设置
	LocaleChoice string `json:"localeChoice"`
}

// Get 一次性返回完整快照。
func (s *Service) Get(ctx context.Context) (Snapshot, error) {
	var row storage.AppSettings
	if err := s.db().WithContext(ctx).First(&row, "id = ?", 1).Error; err != nil {
		return Snapshot{}, err
	}
	return Snapshot{
		ThemeChoice:  row.ThemeChoice,
		CustomTheme:  row.CustomTheme,
		LocaleChoice: row.LocaleChoice,
	}, nil
}

// SetThemeChoice 仅更新主题选择。
func (s *Service) SetThemeChoice(ctx context.Context, choice string) error {
	return s.db().WithContext(ctx).
		Model(&storage.AppSettings{}).
		Where("id = ?", 1).
		Update("theme_choice", choice).Error
}

// SetCustomTheme 写入自定义主题 JSON（前端 stringify 后传入）。
// 传空字符串等价于"未设置"。
func (s *Service) SetCustomTheme(ctx context.Context, json string) error {
	return s.db().WithContext(ctx).
		Model(&storage.AppSettings{}).
		Where("id = ?", 1).
		Update("custom_theme", json).Error
}

// ResetCustomTheme 清空自定义主题。
func (s *Service) ResetCustomTheme(ctx context.Context) error {
	return s.SetCustomTheme(ctx, "")
}

// SetLocaleChoice 'auto' | LocaleCode。
func (s *Service) SetLocaleChoice(ctx context.Context, choice string) error {
	return s.db().WithContext(ctx).
		Model(&storage.AppSettings{}).
		Where("id = ?", 1).
		Update("locale_choice", choice).Error
}
