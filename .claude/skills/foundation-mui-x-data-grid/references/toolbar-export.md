# 工具栏与导出（Toolbar & Export）

## Import

```tsx
import {
  DataGrid,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import type { GridCsvExportOptions, GridPrintExportOptions } from '@mui/x-data-grid';
```

## 基础用法（Foundation 模式）

### 默认工具栏

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  showToolbar  // 启用默认工具栏
  slotProps={{
    toolbar: {
      showQuickFilter: true,
      csvOptions: { utf8WithBom: true },
      printOptions: { hideFooter: true },
    },
  }}
/>
```

### 自定义工具栏

```tsx
import {
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { useT } from '@/i18n';

function CustomToolbar() {
  const t = useT();

  return (
    <Toolbar>
      <ToolbarButton aria-label={t('dataGrid.toolbar.filters')}>
        <FilterListRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton aria-label={t('dataGrid.toolbar.columns')}>
        <ViewColumnRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton aria-label={t('dataGrid.toolbar.export')}>
        <FileDownloadRoundedIcon fontSize="small" />
      </ToolbarButton>
    </Toolbar>
  );
}

// 使用
<DataGrid
  rows={rows}
  columns={columns}
  slots={{ toolbar: CustomToolbar }}
  showToolbar
/>
```

## 详细配置

### showToolbar

最简方式启用默认工具栏（含筛选、列可见性、密度、导出）：

```tsx
<DataGrid showToolbar />
```

### 自定义 Toolbar 组件

通过 `slots.toolbar` 传入自定义组件：

```tsx
<DataGrid
  slots={{ toolbar: MyCustomToolbar }}
  slotProps={{ toolbar: { customProp: 'value' } }}
  showToolbar
/>
```

### 密度切换（Density）

默认工具栏包含密度切换。三种密度：

| 密度 | 行高 | 说明 |
|------|------|------|
| `compact` | 36px | 紧凑 |
| `standard` | 52px | 标准（默认） |
| `comfortable` | 72px | 宽松 |

受控密度：

```tsx
<DataGrid
  density="compact"
  onDensityChange={(density) => setDensity(density)}
/>
```

### 列可见性面板

通过工具栏的 Columns 按钮打开。受控方式：

```tsx
const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({
  id: false,        // 隐藏 id 列
  internal: false,  // 隐藏 internal 列
});

<DataGrid
  columnVisibilityModel={columnVisibilityModel}
  onColumnVisibilityModelChange={setColumnVisibilityModel}
/>
```

禁止用户隐藏某列：

```tsx
{ field: 'name', hideable: false }  // 列可见性面板中不可切换
```

---

## 导出（Export）

### CSV 导出

```tsx
<DataGrid
  showToolbar
  slotProps={{
    toolbar: {
      csvOptions: {
        fileName: 'my-data-export',
        delimiter: ',',
        utf8WithBom: true,       // 中文 Excel 兼容
        includeHeaders: true,
        includeColumnGroupsHeaders: false,
        allColumns: false,       // true = 包含隐藏列
        fields: undefined,       // 指定导出列：['name', 'email']
      },
    },
  }}
/>
```

### 排除列不导出

```tsx
{ field: 'actions', disableExport: true }
```

### 自定义导出内容

```tsx
<DataGrid
  slotProps={{
    toolbar: {
      csvOptions: {
        // 只导出可见列
        allColumns: false,
        // 或指定列
        fields: ['name', 'email', 'role'],
        // 自定义导出行
        getRowsToExport: ({ apiRef }) => {
          // 只导出选中行
          const selectedIds = apiRef.current.getSelectedRows();
          return [...selectedIds.keys()];
        },
      },
    },
  }}
/>
```

### 打印导出

```tsx
<DataGrid
  showToolbar
  slotProps={{
    toolbar: {
      printOptions: {
        hideFooter: true,
        hideToolbar: true,
        pageStyle: '.MuiDataGrid-root { color: #000; }',
      },
    },
  }}
/>
```

### 禁用某个导出选项

```tsx
<DataGrid
  showToolbar
  slotProps={{
    toolbar: {
      csvOptions: { disableToolbarButton: false },
      printOptions: { disableToolbarButton: true },  // 隐藏打印按钮
    },
  }}
/>
```

### 编程式导出

```tsx
const apiRef = useGridApiRef();

// CSV 导出
apiRef.current.exportDataAsCsv({
  fileName: 'export',
  utf8WithBom: true,
});

// 打印
apiRef.current.exportDataAsPrint({
  hideFooter: true,
});
```

---

## Props/Options 参考表

### DataGrid 工具栏相关

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showToolbar` | `boolean` | `false` | 显示默认工具栏 |
| `slots.toolbar` | `React.ComponentType` | — | 自定义工具栏组件 |
| `density` | `'compact'\|'standard'\|'comfortable'` | `'standard'` | 密度 |
| `onDensityChange` | `(density) => void` | — | 密度变更回调 |
| `columnVisibilityModel` | `Record<string, boolean>` | — | 列可见性 |
| `onColumnVisibilityModelChange` | `(model) => void` | — | 列可见性变更 |
| `disableColumnSelector` | `boolean` | `false` | 禁用列选择面板 |
| `disableDensitySelector` | `boolean` | `false` | 禁用密度选择 |

### CSV 导出选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fileName` | `string` | `'document'` | 文件名 |
| `delimiter` | `string` | `','` | 分隔符 |
| `utf8WithBom` | `boolean` | `false` | UTF-8 BOM（中文必开） |
| `includeHeaders` | `boolean` | `true` | 包含列头 |
| `allColumns` | `boolean` | `false` | 包含隐藏列 |
| `fields` | `string[]` | — | 指定导出列 |
| `getRowsToExport` | `(params) => GridRowId[]` | — | 自定义导出行 |
| `disableToolbarButton` | `boolean` | `false` | 隐藏按钮 |

### 打印导出选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hideFooter` | `boolean` | `false` | 隐藏页脚 |
| `hideToolbar` | `boolean` | `false` | 隐藏工具栏 |
| `pageStyle` | `string` | — | 打印页 CSS |
| `disableToolbarButton` | `boolean` | `false` | 隐藏按钮 |

---

## TypeScript 类型

```tsx
interface GridCsvExportOptions {
  fileName?: string;
  delimiter?: string;
  utf8WithBom?: boolean;
  includeHeaders?: boolean;
  includeColumnGroupsHeaders?: boolean;
  allColumns?: boolean;
  fields?: string[];
  getRowsToExport?: (params: { apiRef: GridApiRef }) => GridRowId[];
  disableToolbarButton?: boolean;
}

interface GridPrintExportOptions {
  hideFooter?: boolean;
  hideToolbar?: boolean;
  pageStyle?: string | (() => string);
  disableToolbarButton?: boolean;
}
```

---

## Foundation 约束

1. **工具栏按钮图标用 `*Rounded`** —— FilterListRounded / ViewColumnRounded / FileDownloadRounded
2. **工具栏按钮 `aria-label` 走 `t()`** —— 无障碍标签国际化
3. **CSV 导出必须 `utf8WithBom: true`** —— 中文 Excel 打开不乱码
4. **密度/列可见性文案走 `localeText`** —— 面板内所有文字国际化
5. **`disableExport: true` 用于 actions 列** —— 操作列不应出现在导出中
