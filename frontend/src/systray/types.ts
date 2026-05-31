import type { ComponentType } from 'react';

export interface SystrayModule {
  id: string;
  order: number;
  component: ComponentType;
}
