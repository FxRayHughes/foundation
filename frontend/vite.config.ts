import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wails from "@wailsio/runtime/plugins/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
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
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        child: path.resolve(__dirname, "child.html"),
        // TODO(systray): 托盘功能暂时移除，后端 bindings 不存在；恢复时取消下面入口注释。
        // systray: path.resolve(__dirname, "systray.html"),
      },
    },
  },
  plugins: [react(), wails("./bindings")],
});
