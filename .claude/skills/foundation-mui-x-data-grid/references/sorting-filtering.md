# 排序与筛选（Sorting & Filtering）

## Import

```tsx
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridSortModel,
  GridSortItem,
  GridFilterModel,
  GridFilterItem,
  GridFilterOperator,
  GridColDef,
} from '@mui/x-data-grid';
```

## 基础用法（Foundation 模式）

```tsx
import { DataGrid, GridColDef, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import { useT } from '@/i18n';

function SortFilterTable() {
  const t = useT();
  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [{ field: 'status', operator: 'is', value: 'active' }],
  });

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      filterModel={filterModel}
      onFilterModelChange={setFilterModel}
      localeText={{
        columnMenuSortAsc: t('dataGrid.sort.asc'),
        columnMenuSortDesc: t('dataGrid.sort.desc'),
        columnMenuFilter: t('dataGrid.filter.title'),
        filterPanelOperator: t('dataGrid.filter.operator'),
        filterPanelColumns: t('dataGrid.filter.column'),
        filterPanelInputLabel: t('dataGrid.filter.value'),
      }}
    />
  );
}
```

---

## 排序（Sorting）

### 初始化排序

```tsx
<DataGrid
  initialState={{
    sorting: {
      sortModel: [{ field: 'name', sort: 'asc' }],
    },
  }}
/>
```

### 受控排序

```tsx
const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

<DataGrid
  sortModel={sortModel}
  onSortModelChange={(model) => setSortModel(model)}
/>
```

### 禁用排序

```tsx
// 全局禁用
<DataGrid disableColumnSorting />

// 单列禁用
{ field: 'actions', sortable: false }
```

### 自定义排序比较器

```tsx
{
  field: 'priority',
  sortComparator: (v1, v2) => {
    const order = { high: 3, medium: 2, low: 1 };
    return (order[v1] ?? 0) - (order[v2] ?? 0);
  },
}
```

内置比较器（可 import 复用）：
- `gridStringOrNumberComparator` — string / singleSelect 列
- `gridNumberComparator` — number / boolean 列
- `gridDateComparator` — date / dateTime 列

### 自定义排序顺序

```tsx
// 全局：只允许 asc/desc（不允许取消排序）
<DataGrid sortingOrder={['asc', 'desc']} />

// 单列
{ field: 'name', sortingOrder: ['desc', 'asc', null] }
```

默认顺序：`['asc', 'desc', null]`

### 服务端排序

```tsx
<DataGrid
  sortingMode="server"
  sortModel={sortModel}
  onSortModelChange={(model) => {
    setSortModel(model);
    fetchData({ sort: model });
  }}
/>
```

---

## 筛选（Filtering）

### 社区版限制

社区版只支持**单条件筛选**（一个 filterItem）。多条件筛选需要 Pro 版。

### 初始化筛选

```tsx
<DataGrid
  initialState={{
    filter: {
      filterModel: {
        items: [{ field: 'status', operator: 'is', value: 'active' }],
      },
    },
  }}
/>
```

### 受控筛选

```tsx
const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
  items: [],
});

<DataGrid
  filterModel={filterModel}
  onFilterModelChange={(model) => setFilterModel(model)}
/>
```

### 禁用筛选

```tsx
// 全局禁用
<DataGrid disableColumnFilter />

// 单列禁用
{ field: 'id', filterable: false }
```

### 内置筛选操作符

| 列类型 | 可用操作符 |
|--------|-----------|
| `string` | contains, equals, startsWith, endsWith, isEmpty, isNotEmpty, isAnyOf |
| `number` | =, !=, >, >=, <, <=, isEmpty, isNotEmpty, isAnyOf |
| `date` / `dateTime` | is, not, after, onOrAfter, before, onOrBefore, isEmpty, isNotEmpty |
| `boolean` | is |
| `singleSelect` | is, not, isAnyOf |

### 自定义筛选操作符

```tsx
const ratingAboveOperator: GridFilterOperator = {
  label: t('filter.ratingAbove'),
  value: 'ratingAbove',
  getApplyFilterFn: (filterItem) => {
    if (!filterItem.value) return null;
    const threshold = Number(filterItem.value);
    return (value) => {
      return Number(value) >= threshold;
    };
  },
  InputComponent: (props) => (
    <TextField
      type="number"
      value={props.item.value ?? ''}
      onChange={(e) => props.applyValue({ ...props.item, value: e.target.value })}
      size="small"
      placeholder={t('filter.enterValue')}
    />
  ),
};

// 在列定义中使用
{
  field: 'rating',
  type: 'number',
  filterOperators: [ratingAboveOperator, ...getGridNumericOperators()],
}
```

### 快速筛选（Quick Filter）

通过工具栏搜索框进行全列文本搜索：

```tsx
<DataGrid
  showToolbar
  initialState={{
    filter: {
      filterModel: {
        items: [],
        quickFilterValues: ['search term'],
      },
    },
  }}
  slotProps={{
    toolbar: {
      showQuickFilter: true,
    },
  }}
/>
```

### 忽略变音符号

```tsx
<DataGrid
  ignoreDiacritics  // "café" 匹配 "cafe"
/>
```

### 服务端筛选

```tsx
<DataGrid
  filterMode="server"
  filterModel={filterModel}
  onFilterModelChange={(model) => {
    setFilterModel(model);
    fetchData({ filter: model });
  }}
  rowCount={totalRows}
/>
```

---

## Props/Options 参考表

### 排序相关

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sortModel` | `GridSortModel` | — | 受控排序模型 |
| `onSortModelChange` | `(model: GridSortModel) => void` | — | 排序变更回调 |
| `sortingOrder` | `GridSortDirection[]` | `['asc','desc',null]` | 排序循环顺序 |
| `sortingMode` | `'client' \| 'server'` | `'client'` | 排序模式 |
| `disableColumnSorting` | `boolean` | `false` | 全局禁用排序 |

### 筛选相关

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `filterModel` | `GridFilterModel` | — | 受控筛选模型 |
| `onFilterModelChange` | `(model: GridFilterModel) => void` | — | 筛选变更回调 |
| `filterMode` | `'client' \| 'server'` | `'client'` | 筛选模式 |
| `disableColumnFilter` | `boolean` | `false` | 全局禁用筛选 |
| `ignoreDiacritics` | `boolean` | `false` | 忽略变音符号 |

---

## TypeScript 类型

```tsx
// 排序模型
type GridSortModel = GridSortItem[];

interface GridSortItem {
  field: string;
  sort: GridSortDirection;
}

type GridSortDirection = 'asc' | 'desc' | null | undefined;

// 筛选模型
interface GridFilterModel {
  items: GridFilterItem[];
  logicOperator?: GridLogicOperator; // Pro only
  quickFilterValues?: string[];
  quickFilterLogicOperator?: GridLogicOperator;
}

interface GridFilterItem {
  field: string;
  operator: string;
  value?: any;
  id?: number | string; // Pro only (多条件时必填)
}

// 自定义筛选操作符
interface GridFilterOperator {
  label: string;
  value: string;
  getApplyFilterFn: (filterItem: GridFilterItem) =>
    ((value: any) => boolean) | null;
  InputComponent?: React.ComponentType<GridFilterInputValueProps>;
  requiresFilterValue?: boolean;
}
```

---

## Foundation 约束

1. **筛选面板文案走 `localeText`** —— 操作符名称、列名、输入提示全部 `t()`
2. **自定义 InputComponent 样式取 palette** —— 不硬编码色值
3. **社区版只能单条件筛选** —— 不要尝试传多个 filterItem（会被忽略）
4. **服务端模式必须配合 `rowCount`** —— 否则分页器无法正确显示总数
