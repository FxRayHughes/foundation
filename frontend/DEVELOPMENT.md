# Foundation 前端开发规范

本规范约束 `frontend/src/` 下所有 React 代码的组织方式，目的是：让组件可独立维护、可批量重构、可被新人快速接手。

技术栈：**React 19** · **TypeScript（strict）** · **Mantine 9** · **CSS Modules** · **@tabler/icons-react** · **Vite 8** · **MVVM 架构**。

---

## 1. 架构：MVVM

| 层 | 角色 | 文件命名 |
|----|------|----------|
| **View** | 纯展示组件，仅消费 ViewModel 输出，不直接调用业务/服务 | `<Name>.tsx` |
| **ViewModel** | 状态、副作用、业务编排，导出一个 `use<Name>` hook | `use<Name>.ts` |
| **Style** | 该组件的全部样式（CSS Modules，颜色只用 `var(--fd-*)`） | `<Name>.module.css` |
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
├── ComponentName.module.css       # 样式（CSS Modules）
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

### 页面文件夹（额外约定）

路由级页面在通用结构之外，还有骨架屏与语言包：

```
pages/PageName/
├── PageName.tsx                   # View
├── usePageName.ts                 # ViewModel
├── PageName.module.css            # 页面样式
├── PageName.skeleton.tsx          # 骨架屏（routes.tsx 的 fallback，版式复刻真实页面，不出文字）
├── PageName.skeleton.module.css   # 骨架屏样式（页面走 React.lazy 时必须独立）
├── lang/{zh-CN,en-US,index}.ts    # 页面语言包，index 导出 registerPageNameLocales
└── index.ts
```

分包约束（详见 `frontend/vite.config.ts` 注释与 `frontend/CLAUDE.md`「骨架屏与首屏优化」）：

- 骨架随首屏静态加载。页面若走 `React.lazy`，骨架**不要** import `PageName.module.css`，改用 `PageName.skeleton.module.css` —— 否则共用的 CSS Module 会把懒加载页面 chunk 拉进首屏预加载。同步加载的页面（如 `HomePage`）可复用页面样式。
- 语言包注册从 `@/pages/PageName/lang`（设置页子目录为 `../<sub>/lang`）导入，**不要**从页面 index 导入（index 连带导出 View）。
- `React.lazy` 从具体文件导入（`@/pages/PageName/PageName`），不走 index。
- Vite 8 的构建选项写在 `build.rolldownOptions`（`rollupOptions` 与其同时存在时会被忽略）。

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
│   ├── index.ts        # 全局样式入口（Mantine 样式 + global.css），main.tsx / child.tsx / systrayEntry.tsx 各引入一次
│   ├── global.css      # 全局基础样式（body / 滚动条）
│   └── themes/         # 注册式主题系统（Mantine theme + --fd-* CSS 变量，唯一一处）
├── App.tsx             # 装配 I18n / Theme / Preferences / Router Provider + AppLayout
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
| Style 模块（CSS Modules 默认导入） | `classes`（共享样式另起名，如 `shared`） | `import classes from './TitleBar.module.css'` |
| CSS 类名 | `camelCase` | `.macSpacer`, `.itemWrap` |
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

## 5. 样式规范（Mantine + CSS Modules）

- **组件库只用 Mantine**（`@mantine/core` / `@mantine/hooks`）；图表 `@mantine/charts`（高级图表 `components/x-pro/charts`），表格 `components/x-pro/data-grid`（`mantine-datatable`）。**禁止** `@mui/*` / `@emotion/*`、`sx` / `styled` / CSS-in-JS。
- **样式集中在 `<Name>.module.css`**（CSS Modules），View 里 `import classes from './<Name>.module.css'`，通过 `className` / `classNames={{ root: classes.x }}` 挂到元素或 Mantine 组件上。多类名组合用 `clsx`。不写全局 CSS（全局样式只有 `src/styles/global.css` 与主题层的 `styles/themes/mantineComponents.module.css`）。
- **颜色**只用 `var(--fd-*)`（由 `FoundationThemeProvider` 注入，切主题零重渲染），不要硬编码十六进制，也不要给 Mantine 组件传内置色名（`color="blue"`）—— 不传 `color` 即走主色 `foundation`（= accent）。JS 侧需要引用颜色（图表 `color`、内联 `style`）用 `FOUNDATION_CSS_VARS.*`；必须拿真实色值（canvas 等）才用 `useFoundationPalette()`。主题系统详见 `.claude/skills/foundation-theme/SKILL.md`。
- **内联 `style`** 只用于动态尺寸 / 位置（如进度宽度、拖拽偏移），不写静态样式和颜色字面量。
- 覆盖 Mantine 组件默认样式时需要提高权重，用重复类名（`.item.item { ... }`）或 `classNames` 指向内部节点，不要 `!important`。
- 圆角规则（**方形圆角设计**，theme `radius`：xs 2 / sm 4 / md 8 / lg 12 / xl 16，`defaultRadius: 'sm'`）：
  - 按钮 / ActionIcon：Mantine 默认 `radius="sm"`（4px）；自绘按钮 / 列表项 `border-radius: 6px`
  - 输入框 / Paper / 卡片 / 容器：`8px`（`radius="md"`）
  - 不使用圆形按钮（`border-radius: 999px`）
- 所有 hover / active 必须有 transition（默认 `120ms ease`）。
- 拖拽区域用 `style={{ '--wails-draggable': 'drag' }}`（或在 module.css 里写 `--wails-draggable: drag;`），按钮区用 `'no-drag'` 阻止穿透。

```css
/* TitleBar.module.css */
.root {
  height: 36px;
  padding-inline: 12px;
  background-color: var(--fd-bg-base);
  border-bottom: 1px solid var(--fd-divider);
  display: flex;
  align-items: center;
}

.macSpacer {
  width: 72px;
  flex-shrink: 0;
}
```

```tsx
// TitleBar.tsx
import classes from './TitleBar.module.css';

export const TitleBar = () => (
  <div className={classes.root}>
    {isMac && <div className={classes.macSpacer} />}
    {/* ... */}
  </div>
);
```

### Icon

- 只用 `@tabler/icons-react`：`<IconSettings size={20} stroke={1.75} />`；颜色跟随 `currentColor`，语义色在 module.css 里写 `var(--fd-*)`。
- **禁止** emoji、Unicode 符号、内联 `<svg>` 字面量、其它 icon 包。详见 `frontend/CLAUDE.md` 的「Icon 规范」。

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

- [ ] 组件有独立文件夹，View / ViewModel / Style（`<Name>.module.css`）三件齐全。
- [ ] View 不写业务，ViewModel 不返回 JSX。
- [ ] 没有硬编码颜色：样式只用 `var(--fd-*)`，JS 侧用 `FOUNDATION_CSS_VARS` / `useFoundationPalette()`。
- [ ] 没有引入 `@mui/*` / `@emotion/*` / `sx`；图标只来自 `@tabler/icons-react`。
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
