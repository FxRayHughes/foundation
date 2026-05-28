import { Window } from '@wailsio/runtime';

export interface WindowControlActions {
  minimise: () => Promise<void>;
  toggleMaximise: () => Promise<void>;
  close: () => Promise<void>;
}

export const useWindowControls = (): WindowControlActions => {
  return {
    minimise: async () => {
      await Window.Minimise();
    },
    toggleMaximise: async () => {
      const isMax = await Window.IsMaximised();
      if (isMax) {
        await Window.UnMaximise();
      } else {
        await Window.Maximise();
      }
    },
    close: async () => {
      await Window.Close();
    },
  };
};
