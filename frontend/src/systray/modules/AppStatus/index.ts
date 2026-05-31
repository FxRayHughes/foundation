import { systrayRegistry } from '@/systray/registry';
import { AppStatus } from './AppStatus';

systrayRegistry.register({ id: 'app-status', order: 10, component: AppStatus });
