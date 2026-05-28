package httpx

import (
	"context"
	"errors"
	"fmt"
	"math"
	"math/rand/v2"
	"time"
)

// RetryConfig 描述重试策略。零值代表"不重试"。
//
// 推荐用法（指数退避 + 抖动）：
//
//	httpx.Retry(ctx, httpx.RetryConfig{
//	    MaxAttempts: 3,
//	    BaseDelay:   200 * time.Millisecond,
//	    MaxDelay:    3 * time.Second,
//	}, func(ctx context.Context) error {
//	    return httpx.GetJSON(ctx, url, &out)
//	})
type RetryConfig struct {
	MaxAttempts int           // 含首次：3 = 最多调 3 次（首次 + 2 次重试）
	BaseDelay   time.Duration // 第 1 次重试前等待
	MaxDelay    time.Duration // 退避上限
	// ShouldRetry 决定 err 是否可重试；nil 时使用 DefaultShouldRetry：
	//   - context 取消 / 超时 → 不重试（调用方主动停了）
	//   - HTTPError 5xx / 408 / 429 → 重试
	//   - 其他网络错误 → 重试
	ShouldRetry func(err error, attempt int) bool
}

// Retry 执行 fn，按 cfg 重试；返回最后一次错误。
//
// 取消语义：父 ctx 取消会立即终止重试循环，不会再发起新请求。
func Retry(ctx context.Context, cfg RetryConfig, fn func(context.Context) error) error {
	if cfg.MaxAttempts <= 0 {
		cfg.MaxAttempts = 1
	}
	if cfg.BaseDelay <= 0 {
		cfg.BaseDelay = 200 * time.Millisecond
	}
	if cfg.MaxDelay <= 0 {
		cfg.MaxDelay = 5 * time.Second
	}
	shouldRetry := cfg.ShouldRetry
	if shouldRetry == nil {
		shouldRetry = DefaultShouldRetry
	}

	var lastErr error
	for attempt := 1; attempt <= cfg.MaxAttempts; attempt++ {
		if err := ctx.Err(); err != nil {
			if lastErr != nil {
				return lastErr
			}
			return err
		}
		err := fn(ctx)
		if err == nil {
			return nil
		}
		lastErr = err
		if attempt == cfg.MaxAttempts || !shouldRetry(err, attempt) {
			return lastErr
		}
		// 指数退避 + ±25% 抖动
		expo := time.Duration(float64(cfg.BaseDelay) * math.Pow(2, float64(attempt-1)))
		expo = min(expo, cfg.MaxDelay)
		jitter := time.Duration(rand.Int64N(int64(expo/2))) - expo/4
		wait := max(expo+jitter, 0)
		select {
		case <-ctx.Done():
			return fmt.Errorf("httpx: retry cancelled: %w", lastErr)
		case <-time.After(wait):
		}
	}
	return lastErr
}

// DefaultShouldRetry 是 RetryConfig.ShouldRetry 为空时的策略。
func DefaultShouldRetry(err error, _ int) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return false
	}
	if he, ok := IsHTTPError(err); ok {
		switch he.StatusCode {
		case 408, 429:
			return true
		}
		return he.StatusCode >= 500 && he.StatusCode < 600
	}
	// 其他多数是 network/IO 错误，重试有意义
	return true
}
