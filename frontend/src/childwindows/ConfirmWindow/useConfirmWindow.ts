import { useCallback, useMemo } from 'react';
import { Window } from '@wailsio/runtime';
import { getChildWindowParams, emitResult } from '@/services/childwindow';

export interface ConfirmWindowParams {
  id: string;
  type: string;
  title: string;
  message: string;
}

export interface UseConfirmWindowResult {
  params: ConfirmWindowParams;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmWindow = (): UseConfirmWindowResult => {
  const params = useMemo(() => getChildWindowParams(), []);

  const handleConfirm = useCallback(() => {
    emitResult('confirm');
    Window.Close();
  }, []);

  const handleCancel = useCallback(() => {
    emitResult('cancel');
    Window.Close();
  }, []);

  return { params, handleConfirm, handleCancel };
};
