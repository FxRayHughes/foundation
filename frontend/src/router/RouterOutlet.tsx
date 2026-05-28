import { Suspense, useRef } from 'react';
import { useRouter } from './RouterProvider';

// 渲染当前激活路由的 element，并实现：
//   1) 页面状态缓存（keepAlive）
//   2) lazy 组件的 Suspense 兜底（fallback 来自路由表，建议是骨架屏）
//
// 行为：
// - 默认（keepAlive: false）：仅渲染当前激活路由，离开即卸载，state 全部丢弃。
// - keepAlive: true：路由首次被访问后即挂载到 DOM，之后用 display:none 切换显隐，
//   组件保留 useState / useRef / scroll 位置。
//
// 实现要点：
// 1. mounted 仅记录"曾被访问过"的 keepAlive 路由 id，避免一上来就把所有缓存页都渲染。
// 2. 通过给每个缓存路由包一层 div 控制 display，避免改动路由表里的 element 本身。
//    激活时用 display: contents 让包装层在布局上"透明"，与直接渲染等价。
// 3. 非 keepAlive 路由不进入容器列表，激活时直接条件渲染，离开后卸载。
// 4. 每个被渲染的 element 都包一层 <Suspense fallback={route.fallback}> —— 即便 element
//    不是 lazy，Suspense 也是"零成本"的，未来在页面内部用 lazy 子组件时立刻生效。
export const RouterOutlet = () => {
  const { active, routes } = useRouter();
  const mounted = useRef<Set<string>>(new Set());

  if (active.keepAlive) {
    mounted.current.add(active.id);
  }

  const cachedRoutes = routes.filter((r) => r.keepAlive && mounted.current.has(r.id));
  const showActiveDirectly = !active.keepAlive;

  return (
    <>
      {cachedRoutes.map((r) => (
        <div
          key={r.id}
          style={{ display: r.id === active.id ? 'contents' : 'none' }}
        >
          <Suspense fallback={r.fallback ?? null}>{r.element}</Suspense>
        </div>
      ))}
      {showActiveDirectly && (
        <Suspense fallback={active.fallback ?? null}>{active.element}</Suspense>
      )}
    </>
  );
};
