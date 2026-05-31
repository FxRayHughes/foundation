import { useState, useEffect } from 'react';
import { getChildWindowParams, onMessage, onBroadcast } from '@/services/childwindow';
import type { WindowMessage } from '@/services/childwindow';

export const useBlankWindow = () => {
  const { id, title } = getChildWindowParams();
  const [messages, setMessages] = useState<WindowMessage[]>([]);

  useEffect(() => {
    const cancelMsg = onMessage((msg) => {
      setMessages(prev => [...prev, msg]);
    });
    const cancelBroadcast = onBroadcast((msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      cancelMsg();
      cancelBroadcast();
    };
  }, []);

  return { id, title, messages };
};
