import { useCallback, useState } from 'react';
import { GreetService } from '@/services';
import { useTimeEvent } from '@/shared/hooks/useTimeEvent';

export interface UseHomePageResult {
  name: string;
  setName: (value: string) => void;
  // 后端返回的字符串；初始为 null（View 在 null 时显示默认占位文案，由 i18n 提供）
  result: string | null;
  time: string;
  loading: boolean;
  error: string | null;
  greet: () => Promise<void>;
}

// HomePage ViewModel：
// - 不在这里持有"显示文案"，文案是 View 的责任（避免 hook 依赖 i18n context）
// - result 用 null 表示"还没调过后端"，View 据此选用本地化的默认提示
export const useHomePage = (): UseHomePageResult => {
  const [name, setName] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const time = useTimeEvent();

  const greet = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const value = await GreetService.greet(name.trim());
      setResult(value);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [name]);

  return { name, setName, result, time, loading, error, greet };
};
