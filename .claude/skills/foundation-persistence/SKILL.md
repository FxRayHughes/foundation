---
name: foundation-persistence
description: Foundation 脚手架的持久化层使用指南（SQLite + GORM + AutoMigrate）。说明加表三步、业务 service 接入、前端调用、路径切换、表统计与清空；以及"前端禁用 localStorage / 业务 service 不许 capture *DB"的铁律。
---

# Foundation 持久化层

Foundation 内置一套**零配置、零迁移文件**的本地持久化方案：

- **驱动**：`modernc.org/sqlite`（纯 Go，跨平台无 CGO 负担）
- **ORM**：`gorm.io/gorm` + `github.com/glebarez/sqlite`（GORM 接 modernc 的适配）
- **迁移**：`AutoMigrate`，启动时自动建表 / 加列 / 加索引；零迁移文件，零 CLI
- **并发**：单一 `*gorm.DB` 连接 + WAL 模式（`MaxOpenConns=1`，写串行靠 SQLite 自身排队）
- **路径**：用户可在「设置 → 数据存储」改，独立 `storage.json` 配置（不随数据库迁移）

> 默认数据库位置：
> - Windows：`%AppData%\Foundation\foundation.db`
> - macOS：`~/Library/Application Support/Foundation/foundation.db`
> - Linux：`$XDG_DATA_HOME/Foundation/foundation.db` 或 `~/.local/share/Foundation/foundation.db`

---

## 1. 铁律

| # | 规则 | 原因 |
|---|------|------|
| 1 | **跨会话状态只能走 SQLite**，禁止前端用 `localStorage` / `sessionStorage` | 配额 / 隐私模式 / 清缓存丢数据；无法迁移、备份、加密 |
| 2 | **业务 service 持有 `*storage.Holder`**，不许 capture `*storage.DB` | 切换路径会替换整个进程的 DB 句柄；持有过期指针会用到已 Close 的连接 |
| 3 | **加新表只动 `internal/storage/models.go`** | `AllModels` 是单一注册中心；每加一行业务方就拿到 AutoMigrate + 设置页统计 |
| 4 | **`Clearable=true` 的表需明确"可重建"** | 涉及用户输入 / 凭据 / 视觉一致性的不要标 true，避免一键清空误伤 |
| 5 | **前端 service 包装层必填** | View / VM 不直接 import `@bindings/...`，所有调用走 `services/<domain>/XxxService.ts` |

---

## 2. 加新表（三步）

### Step 1：定义 GORM struct + 注册到 `AllModels`

`internal/storage/models.go`（或新建 `internal/storage/models_<domain>.go`）：

```go
// Message 演示一张业务表。
type Message struct {
    ID        uint   `gorm:"primaryKey;autoIncrement"`
    Content   string `gorm:"type:text;not null"`
    Author    string `gorm:"size:64;not null"`
    CreatedAt int64  `gorm:"autoCreateTime:milli;index"` // 加索引便于按时间查询
}
```

把对应 `ModelDescriptor` 追加到 `AllModels`：

```go
var AllModels = []ModelDescriptor{
    { Model: &Preference{},  TableName: "preferences",  LabelKey: "preferences",  Clearable: true  },
    { Model: &AppSettings{}, TableName: "app_settings", LabelKey: "appSettings", Clearable: false },
    // ↓ 新增
    { Model: &Message{},     TableName: "messages",     LabelKey: "messages",     Clearable: true  },
}
```

字段说明：

| 字段 | 含义 |
|------|------|
| `Model` | GORM 实例指针（`&Message{}`） |
| `TableName` | 实际表名（GORM 默认按结构体名复数 + snake_case，**必须显式声明，避免推断不一致**） |
| `LabelKey` | 设置页 i18n key 后缀 → `settings.database.tables.<key>.{label,description}` |
| `Clearable` | 是否允许设置页一键清空。涉及视觉、凭据、用户原创内容的表标 false |

### Step 2：补 i18n（让设置页能展示这张表）

`frontend/src/pages/SettingsPage/database/lang/zh-CN.ts` 与 `en-US.ts` 各补一段：

```ts
tables: {
  // ...
  messages: {
    label: '消息',
    description: '本地消息历史，可重建',
  },
}
```

`Database.tsx` 内的 `TABLE_NAME_TO_KEY` 也加一行（用于状态消息反查）：

```ts
const TABLE_NAME_TO_KEY: Record<string, string> = {
  preferences: 'preferences',
  app_settings: 'appSettings',
  messages: 'messages', // ← 新增
};
```

### Step 3：重启 → 自动建表

```
wails3 dev
```

启动时 `storage.Open` 会跑 `AutoMigrate(AllModels...)`，新增的 `messages` 表自动出现，设置页双图与表清单也自动列出它。

---

## 3. 业务 service 接入持久化

每个业务领域一个 Wails service，统一持有 `*storage.Holder`：

### 3.1 后端：`internal/services/<domain>/<domain>.go`

```go
package messages

import (
    "context"

    "foundation/internal/storage"

    "gorm.io/gorm"
)

type Service struct {
    holder *storage.Holder // 不要 capture *storage.DB —— 切换路径会替换它
}

func New(holder *storage.Holder) *Service {
    return &Service{holder: holder}
}

func (s *Service) db() *gorm.DB {
    return s.holder.Current().GORM
}

func (s *Service) Send(ctx context.Context, author, content string) error {
    return s.db().WithContext(ctx).Create(&storage.Message{
        Author:  author,
        Content: content,
    }).Error
}

func (s *Service) ListLatest(ctx context.Context, limit int) ([]storage.Message, error) {
    if limit <= 0 || limit > 1000 { limit = 100 }
    var rows []storage.Message
    err := s.db().WithContext(ctx).
        Order("created_at DESC").
        Limit(limit).
        Find(&rows).Error
    return rows, err
}
```

### 3.2 注册：`internal/app/app.go`

```go
import "foundation/internal/services/messages"

app := application.New(application.Options{
    Services: []application.Service{
        application.NewService(greet.New()),
        application.NewService(preferences.New(holder)),
        application.NewService(appsettings.New(holder)),
        application.NewService(storagesvc.New(holder, cfgMgr)),
        application.NewService(messages.New(holder)), // ← 新增
    },
    // ...
})
```

### 3.3 生成 bindings

```
wails3 generate bindings
```

### 3.4 前端 service 包装：`frontend/src/services/messages/MessagesService.ts`

```ts
// MessagesService：业务消息读写。
// 后端字段名 PascalCase（Go convention），前端入口统一收口为 camelCase。
import { Service as Binding } from '@bindings/foundation/internal/services/messages';

export interface Message {
  id: number;
  content: string;
  author: string;
  createdAt: number;
}

export const MessagesService = {
  async send(author: string, content: string): Promise<void> {
    await Binding.Send(author, content);
  },

  async listLatest(limit = 100): Promise<Message[]> {
    const rows = await Binding.ListLatest(limit);
    return (rows ?? []).map<Message>((r) => ({
      id: Number(r.ID ?? 0),
      content: r.Content ?? '',
      author: r.Author ?? '',
      createdAt: Number(r.CreatedAt ?? 0),
    }));
  },
} as const;
```

在 `frontend/src/services/index.ts` 出口里 `export { MessagesService, type Message }`，业务方就能 `import { MessagesService } from '@/services'` 用了。

---

## 4. 已内置的两个域

### 4.1 Preferences（行为偏好 KV）

每个键独立一行（表 `preferences`），Value 用 TEXT 存 JSON 字符串。

```ts
import { PreferencesService } from '@/services';

// 写
await PreferencesService.set('showLogo', false);
await PreferencesService.set('windowSize', { w: 1280, h: 720 });

// 读（缺失返回 undefined）
const showLogo = await PreferencesService.get<boolean>('showLogo');
const ws = await PreferencesService.get<{ w: number; h: number }>('windowSize');

// 一次拉所有（启动初始化用）
const all = await PreferencesService.list();

// 删除 / 清空
await PreferencesService.delete('showLogo');
await PreferencesService.reset();
```

`<PreferencesProvider>` 已经基于这个服务封装了 React 上下文，组件层用 `usePreferences()` 即可（详见 `src/preferences/`）。**业务自定义键值优先用 PreferencesService**，避免重复造一张同形 KV 表。

### 4.2 AppSettings（应用核心设置，单行表）

固定字段：`themeChoice` / `customTheme`（JSON 字符串） / `localeChoice`。

```ts
import { AppSettingsService } from '@/services';

const snap = await AppSettingsService.get();
await AppSettingsService.setThemeChoice('foundation-dark');
await AppSettingsService.setCustomTheme({ mode: 'dark', palette: { /* ... */ } });
await AppSettingsService.resetCustomTheme();
await AppSettingsService.setLocaleChoice('zh-CN');
```

`<FoundationThemeProvider>` 与 `<I18nProvider>` 已经异步对接到这里，业务**通常不需要**直接调用。

---

## 5. Provider 异步化模式

`PreferencesProvider` / `FoundationThemeProvider` / `I18nProvider` 都遵循同一模式 —— 业务方写新 Provider 时照搬：

```tsx
export const MyProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MyState>(DEFAULT_STATE); // 1) 用默认值立即渲染
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    MyService.get()
      .then((data) => {
        if (cancelled || !aliveRef.current) return;
        setState(mergeWithDefaults(data));                     // 2) 异步覆盖
      })
      .catch(() => { /* 后端未就绪 → 保持默认值，UI 不阻塞 */ });
    return () => { cancelled = true; };
  }, []);

  const update = useCallback((patch: Partial<MyState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    void MyService.set(patch).catch(() => {/* 写失败：UI 不回滚，可加 toast */}); // 3) 同步写回后端
  }, []);

  return <MyContext.Provider value={{ state, update }}>{children}</MyContext.Provider>;
};
```

**要点**：
- 首屏永远拿默认值渲染，**不用 loading 阻塞 UI**（业务方真要等数据可在页面级用骨架屏）
- 拉取期间用 `aliveRef` 防止已卸载后 setState
- 写失败默认不回滚 UI（避免视觉抖动），可在 catch 里加业务级 toast / log

---

## 6. PRAGMA 与并发

启动时 `internal/storage/pragma.go` 注入：

| PRAGMA | 值 | 作用 |
|--------|-----|------|
| `journal_mode` | `WAL` | 读不阻塞写 |
| `synchronous` | `NORMAL` | WAL 下安全、性能优 |
| `busy_timeout` | `5000` | 写冲突等 5s 而非立即报错 |
| `cache_size` | `-64000` | 64MB 页缓存 |
| `mmap_size` | `268435456` | 256MB mmap |
| `temp_store` | `MEMORY` | 临时表内存化 |
| `foreign_keys` | `ON` | 外键约束生效 |
| `wal_autocheckpoint` | `1000` | 每 1000 帧自动 checkpoint |

连接池 `MaxOpenConns=1`：桌面单用户场景，写串行更稳，避免 `SQLITE_BUSY`。读也走同一连接，配合 WAL 表现完全够用。

---

## 7. 路径切换（用户视角）

设置 → 数据存储 → 「更改位置…」会调原生「另存为」对话框（`NativeDialogs.saveFile`），用户选目标文件后，后端 `storagesvc.SetCustomPath` 执行：

```
1. 校验目标目录可写
2. wal_checkpoint(TRUNCATE) —— 把 WAL 数据回写主库
3. 关闭当前 DB
4. 复制 .db / .db-wal / .db-shm 到新位置
5. 在新位置打开 + IntegrityCheck
6. 通过 → 删旧文件 + 写 storage.json + Holder.Swap(newDB)
7. 任意步骤失败 → 删除新位置已写文件 + 重开旧 DB + 报错
```

期间 `holder.Current()` 的指针被原子替换，所有业务 service 自动切到新 DB。**业务方完全不用感知这个过程**——只要永远从 `s.holder.Current()` 取 DB，就拿到当前活跃句柄。

---

## 8. 表统计与清空

设置 → 数据存储页双图：

- **环形图**：各表占比
- **横向条形图**：各表精确字节数（含索引页）

数据来源：`storagesvc.GetTableStats()`。优先走 SQLite 的 `dbstat` 虚表（modernc/sqlite 默认编译开启）取精确 `pgsize`；不可用时按 `行数 / 总行数 × 文件大小` 估算（UI 标注"估算"徽章）。

每张 `Clearable=true` 的表行末有「清空」按钮，调 `storagesvc.ClearTable(name)`。后端做白名单校验：

```go
desc := storage.FindDescriptor(tableName)
if desc == nil || !desc.Clearable {
    return error // 直接拒绝
}
```

`Clearable=false` 的表（如 `app_settings`）展示「受保护」标，引导用户走对应的"重置"动作（如设置页"删除自定义主题"）而非一键清。

---

## 9. AutoMigrate 能力边界

GORM `AutoMigrate` **会自动**：建表、加列、加索引、加外键、改列类型（SQLite 用临时表 + 重建实现）。

**不会**自动：删列、删表、重命名列 / 表。

| 场景 | 处理 |
|------|------|
| 加字段 | 直接改 struct + 重启 → 自动加列 |
| 加表 | 改 `AllModels` + 重启 → 自动建表 |
| 加索引 | 改 struct 上的 `gorm:"index"` tag + 重启 |
| 删字段 | struct 删字段后**旧列仍在**（不会丢数据，但 schema 长胖）；如要彻底清理写一次性钩子 |
| 重命名字段 | 视为"删旧 + 加新"，**会丢数据**！必须手写一次性数据迁移钩子，例：`db.Migrator().RenameColumn(&Model{}, "old", "new")` |
| 重命名表 | 同上，写 `db.Migrator().RenameTable("old", "new")` |

> 业务方加新字段 / 加表用 AutoMigrate 即可，**仅当涉及重命名 / 删字段**时才需要手写迁移钩子，加在 `internal/storage/db.go` 的 `Open` 流程里 `autoMigrate(gdb)` 之前或之后（按是否依赖新 schema 决定）。

---

## 10. 反例（PR 中出现这些会被打回）

❌ 前端持久化用 `localStorage`：

```ts
window.localStorage.setItem('foundation:my-flag', '1');
```

✅ 走 PreferencesService：

```ts
await PreferencesService.set('myFlag', true);
```

---

❌ 业务 service 在构造时 capture `*storage.DB`：

```go
type BadService struct {
    db *gorm.DB // ← 切换路径后这是已 Close 的连接！
}
func NewBad(db *storage.DB) *BadService { return &BadService{db: db.GORM} }
```

✅ 持有 Holder：

```go
type Service struct { holder *storage.Holder }
func (s *Service) db() *gorm.DB { return s.holder.Current().GORM }
```

---

❌ 直接拼字符串塞 SQL（哪怕是表名）：

```go
db.Raw("DELETE FROM " + userInputTable) // SQL 注入
```

✅ 走白名单：

```go
desc := storage.FindDescriptor(tableName)
if desc == nil { return errors.New("unknown table") }
db.Where("1=1").Delete(desc.Model)
```

---

❌ 让 ViewModel 直接 import `@bindings/...`：

```ts
import { Service } from '@bindings/foundation/internal/services/messages'; // 在 useXxx.ts 里
```

✅ 总是走 service 包装：

```ts
import { MessagesService } from '@/services';
```

---

## 11. 调试 / 排查

- **看真实数据**：用 [DB Browser for SQLite](https://sqlitebrowser.org/) 打开当前 db 路径（应用关闭后打开，避免 WAL 锁冲突）
- **当前路径**：「设置 → 数据存储」直接显示，或 `storagesvc.GetStats()`
- **完整性自检**：启动时已自动跑 `PRAGMA integrity_check`；运行时手动可用 `storage.IntegrityCheck(db.GORM)`
- **强制 checkpoint**：路径切换前 `storage.WALCheckpoint(db.GORM)` 保证 .db 文件含最新数据
- **清掉所有数据重来**：删掉 db 文件 + storage.json，重启会用默认配置 + 空库

---

## 12. 相关文件

```
internal/storage/
├── paths.go        # 平台默认路径
├── config.go       # storage.json 读写
├── pragma.go       # PRAGMA 注入
├── db.go           # Open / MustOpen / Close
├── models.go       # AllModels + ModelDescriptor + AutoMigrate
├── usage.go        # CollectTableUsage（dbstat / 估算）
├── health.go       # IntegrityCheck / WALCheckpoint / FileSize
└── holder.go       # Holder（热替换 *DB）

internal/services/
├── preferences/    # KV
├── appsettings/    # 单行表
└── storagesvc/     # 路径管理 + 表统计 + 清空

frontend/src/services/
├── preferences/PreferencesService.ts
├── appsettings/AppSettingsService.ts
├── storage/StorageService.ts
└── dialogs/NativeDialogs.ts

frontend/src/preferences/PreferencesProvider.tsx
frontend/src/styles/themes/ThemeProvider.tsx
frontend/src/i18n/I18nProvider.tsx
frontend/src/pages/SettingsPage/database/  # 数据存储设置页
```
