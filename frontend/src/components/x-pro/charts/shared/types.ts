// 图表通用类型。
// 迁移到 @mantine/charts 后，尺寸测量 / Tooltip / Legend 均由底层组件负责，
// 这里只保留仍被公开 props 使用的类型。
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
