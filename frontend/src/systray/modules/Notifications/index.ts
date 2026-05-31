import { systrayRegistry } from '@/systray/registry';
import { Notifications } from './Notifications';

systrayRegistry.register({ id: 'notifications', order: 30, component: Notifications });
