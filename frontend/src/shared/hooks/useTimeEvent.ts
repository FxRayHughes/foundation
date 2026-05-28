import { useEffect, useState } from 'react';
import { Events } from '@wailsio/runtime';
import { AppEvents } from '@/shared/events';

interface WailsEventPayload<T> {
  data: T;
  name: string;
  sender?: string;
}

export const useTimeEvent = (initial = 'Listening for time event...'): string => {
  const [time, setTime] = useState<string>(initial);

  useEffect(() => {
    const cancel = Events.On(AppEvents.Time, (event: WailsEventPayload<string>) => {
      setTime(event.data);
    });
    return () => {
      if (typeof cancel === 'function') cancel();
    };
  }, []);

  return time;
};
