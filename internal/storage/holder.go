package storage

import "sync"

// Holder 把 *DB 包成可热替换的引用。
//
// 切换数据路径时（参见 storagesvc.SetCustomPath），整个进程持有的 DB 会被
// 替换为新位置打开的句柄。业务 service 持有 *Holder 而不是直接 capture
// *DB，每次访问 .Current() 拿当前活跃句柄，避免拿到已 Close 的旧实例。
type Holder struct {
	mu sync.RWMutex
	db *DB
}

func NewHolder(db *DB) *Holder {
	return &Holder{db: db}
}

// Current 返回当前活跃的 DB（未为 nil，启动时已注入）。
func (h *Holder) Current() *DB {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.db
}

// Swap 用 next 替换当前 DB，返回旧 DB 给调用方关闭。
// 仅 storagesvc 需要直接调用；普通业务 service 用 Current 即可。
func (h *Holder) Swap(next *DB) *DB {
	h.mu.Lock()
	defer h.mu.Unlock()
	prev := h.db
	h.db = next
	return prev
}
