import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RouteDefinition, RouteParams, RouterContextValue } from './types';

const EMPTY_PARAMS: RouteParams = Object.freeze({});

const RouterContext = createContext<RouterContextValue | null>(null);

export interface RouterProviderProps {
  routes: RouteDefinition[];
  initialId?: string;
  children: ReactNode;
}

// 轻量 key-based 路由：
// - 没有 URL（桌面应用不需要），只通过 routes[id] 切换
// - 路由表是唯一事实源；Sidebar 从这里取 primary/footer 自动生成导航
// - 提供 children slot，让上层可以套布局（TitleBar + AppLayout）后再放 <RouterOutlet/>
export const RouterProvider = ({ routes, initialId, children }: RouterProviderProps) => {
  if (routes.length === 0) {
    throw new Error('RouterProvider requires at least one route');
  }

  const fallback = routes[0]!;
  const initial = initialId ? routes.find((r) => r.id === initialId) ?? fallback : fallback;
  const [activeId, setActiveId] = useState<string>(initial.id);
  const [params, setParams] = useState<RouteParams>(EMPTY_PARAMS);

  const navigate = useCallback(
    (id: string, nextParams?: RouteParams): void => {
      const next = routes.find((r) => r.id === id);
      if (!next) {
        throw new Error(`Route "${id}" is not registered`);
      }
      setActiveId(id);
      setParams(nextParams ?? EMPTY_PARAMS);
    },
    [routes],
  );

  const value = useMemo<RouterContextValue>(() => {
    const active = routes.find((r) => r.id === activeId) ?? fallback;
    return {
      routes,
      active,
      navigate,
      params,
      primary: routes.filter((r) => (r.slot ?? 'primary') === 'primary'),
      footer: routes.filter((r) => r.slot === 'footer'),
    };
  }, [routes, activeId, params, navigate, fallback]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouter = (): RouterContextValue => {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used inside <RouterProvider>');
  }
  return ctx;
};
