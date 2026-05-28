// Package httpx 是 Foundation 的 HTTP 客户端工具包。
//
// 设计目标：
//   - 单例 *http.Client，复用连接池；业务代码不要再造 client
//   - 默认 30s 超时（可覆盖），所有请求要求 context.Context（可取消）
//   - JSON helper：GetJSON / PostJSON 一行解析
//   - 缺省不重试：避免无脑放大错误风暴；需要时调 Retry()
//   - User-Agent 默认带应用名，便于服务端识别
//
// 业务约束：
//   - 不要直接用 net/http 默认 Client（无超时，会卡死 goroutine）
//   - 不要在每次调用时 new(http.Client)（连接池泄漏）
package httpx

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

// DefaultTimeout 是 Do/GetJSON/PostJSON 在调用方未给 context deadline 时
// 自动添加的总超时上限。
const DefaultTimeout = 30 * time.Second

// MaxResponseBytes 是 ReadJSON 默认读取的最大响应体，防止恶意 / 失控大响应。
// 业务方需要更大值时显式调 ReadJSONLimit。
const MaxResponseBytes int64 = 8 << 20 // 8MB

// userAgent 在 SetUserAgent 之前是空字符串；我们在 Init 阶段或第一次使用时设置。
var (
	userAgent   = "Foundation/1.0"
	uaMu        sync.RWMutex
	clientOnce  sync.Once
	sharedClient *http.Client
)

// SetUserAgent 注入应用层级的 UA。建议在 internal/app.Run 早期调用一次。
// 调用一次后，所有 NewRequest / Do 都会带上这个 UA（除非调用方手动设置）。
func SetUserAgent(s string) {
	if strings.TrimSpace(s) == "" {
		return
	}
	uaMu.Lock()
	defer uaMu.Unlock()
	userAgent = s
}

func currentUA() string {
	uaMu.RLock()
	defer uaMu.RUnlock()
	return userAgent
}

// Client 返回应用共享的 *http.Client。
//
// 设计取舍：
//   - 没有给请求级超时（要在 context 上加 deadline）
//   - Transport 用 http.DefaultTransport 的浅克隆，调大空闲连接数
//   - 不开 InsecureSkipVerify —— 任何"自签名/忽略证书"诉求请走专用 Client
func Client() *http.Client {
	clientOnce.Do(func() {
		base, ok := http.DefaultTransport.(*http.Transport)
		var tr *http.Transport
		if ok {
			tr = base.Clone()
		} else {
			tr = &http.Transport{}
		}
		tr.MaxIdleConns = 100
		tr.MaxIdleConnsPerHost = 16
		tr.IdleConnTimeout = 90 * time.Second

		sharedClient = &http.Client{
			Transport: tr,
			// 不设 Client.Timeout —— 用 context 控制，更细粒度
		}
	})
	return sharedClient
}

// NewRequest 构造带默认 UA 的请求。url 必填，method 默认 GET，body 允许 nil。
// 没有显式 deadline 的 ctx 会被自动包一层 DefaultTimeout。
//
// 调用方拿到 *http.Request 后可继续设置 Header / Trailer 再交给 Do。
func NewRequest(ctx context.Context, method, url string, body io.Reader) (*http.Request, context.CancelFunc, error) {
	if method == "" {
		method = http.MethodGet
	}
	if ctx == nil {
		ctx = context.Background()
	}
	cancel := func() {}
	if _, ok := ctx.Deadline(); !ok {
		ctx, cancel = context.WithTimeout(ctx, DefaultTimeout)
	}
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		cancel()
		return nil, nil, fmt.Errorf("httpx: build request: %w", err)
	}
	if req.Header.Get("User-Agent") == "" {
		req.Header.Set("User-Agent", currentUA())
	}
	return req, cancel, nil
}

// Do 发送请求并返回响应。调用方负责 resp.Body.Close()。
// 4xx/5xx **不算**错误（与 net/http 行为一致）—— 业务自己看 status code。
func Do(req *http.Request) (*http.Response, error) {
	resp, err := Client().Do(req)
	if err != nil {
		return nil, fmt.Errorf("httpx: do request: %w", err)
	}
	return resp, nil
}

// GetJSON 拉一份 JSON 并解到 out（指针）。
// status >= 400 时返回 *HTTPError 让上层判分。
func GetJSON[T any](ctx context.Context, url string, out *T) error {
	req, cancel, err := NewRequest(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	defer cancel()
	req.Header.Set("Accept", "application/json")
	return doJSON(req, out)
}

// PostJSON 用 in（任意可序列化对象）作为 body 发送 JSON，把响应解到 out。
// out 传 nil 表示丢弃响应体（仍会读完以便连接复用）。
func PostJSON[T any, R any](ctx context.Context, url string, in T, out *R) error {
	buf, err := json.Marshal(in)
	if err != nil {
		return fmt.Errorf("httpx: marshal body: %w", err)
	}
	req, cancel, err := NewRequest(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return err
	}
	defer cancel()
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	return doJSON(req, out)
}

// ReadJSONLimit 把 resp.Body 解到 out，限制最大读取字节。读后关闭 body。
func ReadJSONLimit[T any](resp *http.Response, max int64, out *T) error {
	defer drain(resp)
	if max <= 0 {
		max = MaxResponseBytes
	}
	r := io.LimitReader(resp.Body, max)
	return json.NewDecoder(r).Decode(out)
}

// HTTPError 用于 4xx/5xx 响应。业务方可 errors.As 取 status / body 摘要。
type HTTPError struct {
	StatusCode int
	Status     string
	URL        string
	Method     string
	BodySnip   string // 最多 1KB 截断，便于日志展示
}

func (e *HTTPError) Error() string {
	if e.BodySnip == "" {
		return fmt.Sprintf("httpx: %s %s -> %s", e.Method, e.URL, e.Status)
	}
	return fmt.Sprintf("httpx: %s %s -> %s: %s", e.Method, e.URL, e.Status, e.BodySnip)
}

// IsHTTPError 帮 caller 判断 err 是否是 status 错误。
func IsHTTPError(err error) (*HTTPError, bool) {
	var he *HTTPError
	if errors.As(err, &he) {
		return he, true
	}
	return nil, false
}

func doJSON(req *http.Request, out any) error {
	resp, err := Do(req)
	if err != nil {
		return err
	}
	defer drain(resp)

	if resp.StatusCode >= 400 {
		return &HTTPError{
			StatusCode: resp.StatusCode,
			Status:     resp.Status,
			URL:        req.URL.String(),
			Method:     req.Method,
			BodySnip:   readSnip(resp.Body, 1024),
		}
	}

	if out == nil {
		return nil
	}
	r := io.LimitReader(resp.Body, MaxResponseBytes)
	if err := json.NewDecoder(r).Decode(out); err != nil {
		return fmt.Errorf("httpx: decode response: %w", err)
	}
	return nil
}

// drain 在 defer 里读尽 + 关闭 body，让 keep-alive 连接能回到池里。
func drain(resp *http.Response) {
	if resp == nil || resp.Body == nil {
		return
	}
	_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 4<<10))
	_ = resp.Body.Close()
}

func readSnip(r io.Reader, max int) string {
	buf := make([]byte, max+1)
	n, _ := io.ReadFull(io.LimitReader(r, int64(max+1)), buf)
	if n <= 0 {
		return ""
	}
	if n > max {
		return string(buf[:max]) + "…"
	}
	return string(buf[:n])
}
