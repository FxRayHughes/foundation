// Package preferences 提供"行为偏好"键值存储。
//
// 每个键独立一行（preferences 表），便于增量加键不改 schema。
// Value 用 JSON 字符串存任意类型，前端直接 JSON.parse。
package preferences

import (
	"context"
	"errors"
	"strings"

	"foundation/internal/storage"

	"gorm.io/gorm"
)

// Service 是 Wails 服务，方法会自动暴露给前端。
//
// 持有 *storage.Holder 而不是固定 *storage.DB，因为切换数据路径
// 会替换整个进程的 DB 句柄；每次访问通过 holder.Current() 取当前活跃句柄。
type Service struct {
	holder *storage.Holder
}

func New(holder *storage.Holder) *Service {
	return &Service{holder: holder}
}

func (s *Service) db() *gorm.DB {
	return s.holder.Current().GORM
}

// Entry 是 Map 序列化形态：前端用 List() 一次拉所有键值。
type Entry struct {
	Key   string `json:"key"`
	Value string `json:"value"` // 序列化后的 JSON 字符串
}

// Get 读取单个键；缺失返回空字符串（不 error），前端用默认值兜底。
func (s *Service) Get(ctx context.Context, key string) (string, error) {
	if strings.TrimSpace(key) == "" {
		return "", errors.New("key required")
	}
	var p storage.Preference
	err := s.db().WithContext(ctx).First(&p, "key = ?", key).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		return "", err
	}
	return p.Value, nil
}

// Set 写入单个键；upsert 语义。
func (s *Service) Set(ctx context.Context, key, value string) error {
	if strings.TrimSpace(key) == "" {
		return errors.New("key required")
	}
	return s.db().WithContext(ctx).Save(&storage.Preference{
		Key:   key,
		Value: value,
	}).Error
}

// List 一次拉所有键值。前端启动时调用初始化整个 Preferences 对象。
func (s *Service) List(ctx context.Context) ([]Entry, error) {
	var rows []storage.Preference
	if err := s.db().WithContext(ctx).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]Entry, 0, len(rows))
	for _, r := range rows {
		out = append(out, Entry{Key: r.Key, Value: r.Value})
	}
	return out, nil
}

// Delete 删除单个键。
func (s *Service) Delete(ctx context.Context, key string) error {
	return s.db().WithContext(ctx).
		Where("key = ?", key).
		Delete(&storage.Preference{}).Error
}

// Reset 清空所有偏好。前端"恢复默认"按钮调用。
func (s *Service) Reset(ctx context.Context) error {
	return s.db().WithContext(ctx).
		Where("1 = 1").Delete(&storage.Preference{}).Error
}
