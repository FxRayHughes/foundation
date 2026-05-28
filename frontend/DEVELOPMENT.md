# Foundation 前端开发规范

本规范约束 `frontend/src/` 下所有 React 代码的组织方式，目的是：让组件可独立维护、可批量重构、可被新人快速接手。

技术栈：**React 19** · **TypeScript（strict）** · **MUI 9** · **Vite 8** · **MVVM 架构**。

---

## 1. 架构：MVVM

| 层 | 角色 | 文件命名 |
|----|------|----------|
| **View** | 纯展示组件，仅消费 ViewModel 输出，不直接调用业务/服务 | `<Name>.tsx` |
| **ViewModel** | 状态、副作用、业务编排，导出一个 `use<Name>` hook | `use<Name>.ts` |
| **Style** | 该组件的所有 sx prop 与样式常量 | `<Name>.styles.ts` |
| **Service** | 后端通信封装（`bindings/*` 包装层） | `services/<domain>/<Name>Service.ts` |
| **Shared** | 多个组件复用的工具 / 类型 / hooks | `shared/...` |

**铁律**：

- View 文件里**不出现** `useState` / `useEffect` 之外的业务逻辑——状态机、API 调用、数据转换全部下沉到 ViewModel hook。
- ViewModel hook **不返回 JSX**，只返回数据与回调。
- ViewModel **不直接 import** `@wailsio/runtime` 或 `@bindings/*`，只能通过 `services/` 调用。

---

## 2. 目录与文件结构

每个组件 / 页面 = 一个文件夹，包含其全部内容：

```
ComponentName/
├── ComponentName.tsx              # View
├── useComponentName.ts            # ViewModel（必有，即使逻辑很少）
├── ComponentName.styles.ts        # 样式
├── ComponentName.types.ts         # 复杂类型定义（可选）
├── SubComponent.tsx               # 子组件（仅本组件使用）
├── useSubComponent.ts             # 子组件 ViewModel（如有）
└── index.ts                       # 出口（仅 re-export 公共 API）
```

`index.ts` 示例：

```ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

> 子组件如果只在父组件内被使用，**不要**写进 `index.ts`，避免外部误用。

### 顶层目录约定

```
src/
├── components/         # 跨页面共享的组件
├── pages/              # 路由级页面（每页面一个文件夹）
├── services/           # 后端通信封装
├── shared/             # 跨层共享：types、hooks、工具、常量
│   ├── hooks/
│   ├── events.ts       # 事件名集中常量
│   └── platform.ts     # 平台检测
├── styles/
│   └── theme.ts        # MUI 主题（仅一处）
├── App.tsx             # 装配 ThemeProvider + Layout + Page
└── main.tsx            # createRoot 入口
```

---

## 3. 命名规范

| 对象 | 风格 | 示例 |
|------|------|------|
| 组件文件 / 文件夹 / Type | `PascalCase` | `ServerList`, `UseHomePageResult` |
| 普通函数 / 变量 / hook | `camelCase` | `useServerList`, `formatTime` |
| ViewModel hook | `use<ComponentName>` | `useTitleBar`, `useHomePage` |
| 服务对象 | `<Domain>Service` | `GreetService` |
| 事件名常量 | `UPPER_SNAKE` 容器内 | `AppEvents.Time` |
| Style 模块 | `<Name>Styles` | `TitleBarStyles` |
| Boolean 状态 | `is/has/should` 前缀 | `isMaximised`, `hasError` |

---

## 4. TypeScript 规则

- `tsconfig.json` 已开启 `strict` + `noUncheckedIndexedAccess`。
- 所有导出函数 / 组件 props **必须**显式标注类型。
- 禁止 `any`；外部输入用 `unknown` 再窄化。
- React 组件不写 `React.FC`，直接 `({ ... }: Props) => JSX.Element`。
- 公共 props 用 `interface`，联合 / 交叉用 `type`。

```ts
export interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
}

export const UserCard = ({ user, onSelect }: UserCardProps) => {
  return <button onClick={() => onSelect(user.id)}>{user.name}</button>;
};
```

---

## 5. 样式规范（MUI 优先）

- **不写 CSS 文件**。所有样式集中在 `<Name>.styles.ts`。优先导出 `(theme: Theme) => Record<string, SxProps<Theme>>` 工厂；无需主题色时也可直接导出 `Record<string, SxProps<Theme>>`。
- 颜色 / 圆角 / 间距统一从 `theme.palette.foundation.*` + `theme.spacing` 取，不要硬编码十六进制色值。主题系统详见 `.claude/skills/foundation-theme/SKILL.md`。
- 圆角规则（**方形圆角设计**）：
  - 按钮 / IconButton：`borderRadius: 6`
  - 输入框 / Paper / 容器：`borderRadius: 8`
  - 不再使用圆形按钮（`borderRadius: 999`）
- 所有 hover / active 必须有 transition（默认 `120ms ease`）。
- 拖拽区域用 `style={{ '--wails-draggable': 'drag' }}`，按钮区用 `'no-drag'` 阻止穿透。

```ts
// TitleBar.styles.ts
export const titleBarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      height: 36,
      px: 1.5,
      backgroundColor: fp.bg.base,
      borderBottom: `1px solid ${fp.divider}`,
      display: 'flex',
      alignItems: 'center',
    },
    // ...
  };
};
```

---

## 6. 服务层规范

`services/<domain>/<Name>Service.ts` 只做两件事：
1. **import bindings**（`@bindings/<module>/...`）；
2. 暴露**调用方友好**的 Promise 方法签名。

```ts
import { Service as GreetServiceBinding } from '@bindings/foundation/internal/services/greet';

export const GreetService = {
  greet(name: string): Promise<string> {
    return GreetServiceBinding.Greet(name);
  },
} as const;
```

业务变更（如换 module 名、换字段）**只改 Service**，不改 ViewModel。

---

## 7. 事件订阅规范

- 事件名集中在 `shared/events.ts`（`AppEvents.Time` 等），不要在组件内手写字符串。
- 跨组件复用的事件订阅 → `shared/hooks/use<EventName>Event.ts`。
- 单页面专用的订阅 → 直接写在该页面的 `use<Page>.ts` 里。
- 订阅必须在 useEffect cleanup 取消。

```ts
useEffect(() => {
  const cancel = Events.On(AppEvents.Time, (e) => setTime(e.data));
  return () => { if (typeof cancel === 'function') cancel(); };
}, []);
```

---

## 8. 平台分支

`shared/platform.ts` 提供 `isWindows / isMac / isLinux`。

- macOS 保留系统红绿灯：标题栏左侧留出 72px spacer，不画自定义按钮。
- Windows / Linux 自绘三联按钮（最小化 / 最大化 / 关闭）。
- 后端窗口配置已按平台分文件（`window_<os>.go`），前端只关心 UI 差异即可。

---

## 9. 路径别名

- `@/*` → `src/*`
- `@bindings/*` → `bindings/*`

正确：

```ts
import { GreetService } from '@/services';
import { useTimeEvent } from '@/shared/hooks/useTimeEvent';
```

错误（产生易碎相对路径）：

```ts
import { GreetService } from '../../../services/greet/GreetService';
```

---

## 10. 检查清单

提交前自查：

- [ ] 组件有独立文件夹，View / ViewModel / Style 三件齐全。
- [ ] View 不写业务，ViewModel 不返回 JSX。
- [ ] 没有硬编码颜色 / 像素，都通过 theme + spacing 取。
- [ ] 公共组件有 props interface 与 index.ts 出口。
- [ ] `pnpm typecheck` 全绿。
- [ ] `pnpm build` 通过。
- [ ] 没有 `console.log`、没有死代码。

---

## 11. 反例对照

❌ View 里直接调 bindings：

```tsx
// HomePage.tsx
import { Service } from '@bindings/foundation/...';
const onClick = () => Service.Greet(name).then(setResult);
```

✅ 经过 ViewModel + Service：

```tsx
// useHomePage.ts
import { GreetService } from '@/services';
const greet = useCallback(async () => {
  setResult(await GreetService.greet(name));
}, [name]);

// HomePage.tsx
const { result, greet } = useHomePage();
```

---

## 12. 何时打破规范

规范是默认值，不是教条。出现以下情况可绕行（在 PR 描述里说明原因）：

- 整个组件只有 5 行（如纯 Icon wrapper）—— ViewModel 可省略，仍保留独立文件夹。
- 第三方库强制注入 hook 形态（如 `react-router` 的 `useNavigate`）—— ViewModel 直接调用即可。
- 实验性 spike —— 在 `src/experimental/` 下放宽要求，但不允许进 `pages/` 或 `components/`。
