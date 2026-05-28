export type Platform = 'windows' | 'darwin' | 'linux' | 'unknown';

const detectPlatform = (): Platform => {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();
  if (ua.includes('mac') || platform.includes('mac')) return 'darwin';
  if (ua.includes('win') || platform.includes('win')) return 'windows';
  if (ua.includes('linux') || platform.includes('linux')) return 'linux';
  return 'unknown';
};

export const platform: Platform = detectPlatform();

export const isWindows = platform === 'windows';
export const isMac = platform === 'darwin';
export const isLinux = platform === 'linux';
