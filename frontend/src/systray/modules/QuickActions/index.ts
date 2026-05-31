import { systrayRegistry } from '@/systray/registry';
import { QuickActions } from './QuickActions';

systrayRegistry.register({ id: 'quick-actions', order: 20, component: QuickActions });
