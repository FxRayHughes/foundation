import type { DataGridProProps, DataGridRow } from './types';
import { useDataGridPro } from './useDataGridPro';
import { DataGridSurface } from './DataGridSurface';

// DataGrid Pro：基于 mantine-datatable 的自实现 Pro 表格。
// 列钉住 / 行钉住 / 树形数据 / 主从明细 / 懒加载 / 表头筛选 / 剪贴板粘贴 / 列与行拖拽重排 / 排序 / 勾选 / 分页。
export function DataGridPro<T extends DataGridRow = DataGridRow>(props: DataGridProProps<T>) {
  const vm = useDataGridPro<T>(props);
  return <DataGridSurface vm={vm} props={props} />;
}
