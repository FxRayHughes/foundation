import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wails from "@wailsio/runtime/plugins/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 应用版本唯一事实源：build/config.yml 的 info.version（Wails 构建资产同源）。
// 注入为编译期常量 __APP_VERSION__，前端展示版本时用它，不要硬编码。
const appVersion = (() => {
  try {
    const yml = readFileSync(path.resolve(__dirname, "../build/config.yml"), "utf8");
    return /^\s*version:\s*"([^"]+)"/m.exec(yml.split(/^info:/m)[1] ?? "")?.[1] ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
})();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  server: {
    host: "127.0.0.1",
    port: Number(process.env.WAILS_VITE_PORT) || 9245,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@bindings": path.resolve(__dirname, "bindings"),
    },
  },
  build: {
    // Vite 8（rolldown）：用 rolldownOptions；rollupOptions 只是兼容别名，两者同时写时后者会被忽略。
    // 分包交给 rolldown 默认策略即可。首屏 chunk 变大时优先排查"静态 import 链误把懒加载页面拉进来"：
    //  - 页面骨架（随首屏加载）不要和懒加载页面共用同一个 CSS Module（用 <Name>.skeleton.module.css）
    //  - 语言包注册从 '<sub>/lang' 导入，不要从 '<sub>'（index 会连带导出 View）
    rolldownOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        child: path.resolve(__dirname, "child.html"),
        systray: path.resolve(__dirname, "systray.html"),
      },
    },
  },
  plugins: [react(), wails("./bindings")],
});
