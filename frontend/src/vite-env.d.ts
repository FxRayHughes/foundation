/// <reference types="vite/client" />

// 编译期注入（vite.config.ts define）：build/config.yml 的 info.version
declare const __APP_VERSION__: string;
