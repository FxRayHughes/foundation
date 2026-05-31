import { systrayRegistry } from '@/systray/registry';
import { ExitButton } from './ExitButton';

systrayRegistry.register({ id: 'exit-button', order: 100, component: ExitButton });
