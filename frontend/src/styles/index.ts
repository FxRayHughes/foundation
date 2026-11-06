// 全局样式入口：入口文件（main.tsx / child.tsx）import 一次即可。
// 顺序有意义：Mantine 基础 → 扩展包 → Foundation 全局覆盖。
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import 'mantine-datatable/styles.css';
import './global.css';
