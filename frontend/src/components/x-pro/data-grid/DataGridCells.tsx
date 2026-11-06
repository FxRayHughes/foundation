import { ActionIcon, TextInput } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconGripVertical } from '@tabler/icons-react';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import { useT } from '@/i18n';
import type { AggregationFunction, CustomAggregationFn } from './premium-types';
import type { ColumnDragProps } from './features/useColumnReordering';
import type { RowHandleProps } from './features/useRowReordering';
import type { ResizeHandleProps } from './features/useColumnResizing';
import { ColumnMenu, type ColumnMenuModel } from './DataGridColumnMenu';
import { formatValue } from './utils';
import classes from './DataGrid.module.css';

// DataGrid 内部单元格 / 表头小组件（View 层）。
// 每个组件自取 useT()，保证 aria-label / 占位符都走 i18n。

// ---------- 表头 ----------

interface HeaderTitleProps {
  label: ReactNode;
  /** 纯文本列名（aria-label 插值用） */
  text: string;
  dragProps: ColumnDragProps | null;
  isDragging: boolean;
  isDropTarget: boolean;
  filter: { value: string; onChange: (value: string) => void } | null;
  /** 列菜单；null 不显示 */
  menu: Omit<ColumnMenuModel, 'text'> | null;
  /** 列宽拖拽手柄；null 不显示 */
  resizeProps: ResizeHandleProps | null;
  isResizing: boolean;
}

const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

// 列菜单的下拉层渲染在 portal 里，但 React 事件仍沿组件树冒泡到 th（会触发排序 / 拖拽）。
// 在这里截住"DOM 上不在本表头内"的事件（Mantine 自己的处理器此时已经执行完）。
const stopPortalEvent = (e: SyntheticEvent) => {
  if (!e.currentTarget.contains(e.target as Node)) e.stopPropagation();
};

export const HeaderTitle = ({
  label,
  text,
  dragProps,
  isDragging,
  isDropTarget,
  filter,
  menu,
  resizeProps,
  isResizing,
}: HeaderTitleProps) => {
  const t = useT();
  return (
    <div
      className={classes.headerTitle}
      onClick={stopPortalEvent}
      onKeyDown={stopPortalEvent}
      onMouseDown={stopPortalEvent}
      onPointerDown={stopPortalEvent}
      onDragStart={stopPortalEvent}
    >
      <div className={classes.headerRow}>
        <div
          className={classes.headerLabel}
          data-draggable={dragProps ? true : undefined}
          data-dragging={isDragging || undefined}
          data-drop-target={isDropTarget || undefined}
          aria-label={dragProps ? t('dataGrid.dragColumnAriaLabel', { column: text }) : undefined}
          {...dragProps}
        >
          {dragProps && <IconGripVertical size={14} stroke={1.75} className={classes.headerGrip} aria-hidden />}
          <span className={classes.headerText}>{label}</span>
        </div>
        {menu && <ColumnMenu text={text} {...menu} />}
      </div>
      {resizeProps && (
        <span
          className={classes.resizeHandle}
          data-resizing={isResizing || undefined}
          role="separator"
          aria-orientation="vertical"
          aria-label={t('dataGrid.resizeColumnAriaLabel', { column: text })}
          onClick={stop}
          onMouseDown={stop}
          draggable={false}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          {...resizeProps}
        />
      )}
      {filter && (
        <TextInput
          size="xs"
          className={classes.headerFilterInput}
          value={filter.value}
          placeholder={t('dataGrid.filterPlaceholder')}
          aria-label={t('dataGrid.filterAriaLabel', { column: text })}
          onChange={(e) => filter.onChange(e.currentTarget.value)}
          // 阻止冒泡到 th：否则点击 / 回车会触发排序，拖拽会触发列重排
          onClick={stop}
          onKeyDown={stop}
          onMouseDown={stop}
          draggable={false}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
    </div>
  );
};

// ---------- 工具列 ----------

export const RowDragHandle = ({ handleProps }: { handleProps: RowHandleProps }) => {
  const t = useT();
  return (
    <span
      className={classes.dragHandle}
      role="button"
      aria-label={t('dataGrid.dragRowAriaLabel')}
      data-dg-row-handle
      {...handleProps}
    >
      <IconGripVertical size={16} stroke={1.75} />
    </span>
  );
};

export const DetailToggle = ({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) => {
  const t = useT();
  return (
    <ActionIcon
      size="sm"
      aria-label={t(expanded ? 'dataGrid.collapseRow' : 'dataGrid.expandRow')}
      aria-expanded={expanded}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {expanded ? <IconChevronDown size={16} stroke={1.75} /> : <IconChevronRight size={16} stroke={1.75} />}
    </ActionIcon>
  );
};

interface TreeCellProps {
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

// 树形 / 分组列：缩进 + 展开按钮 + 标签
export const TreeCell = ({ depth, hasChildren, expanded, onToggle, children }: TreeCellProps) => {
  const t = useT();
  return (
    <div className={classes.treeCell} style={{ '--dg-depth': depth } as CSSProperties}>
      {hasChildren ? (
        <ActionIcon
          size="sm"
          aria-label={t(expanded ? 'dataGrid.collapse' : 'dataGrid.expand')}
          aria-expanded={expanded}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {expanded ? <IconChevronDown size={16} stroke={1.75} /> : <IconChevronRight size={16} stroke={1.75} />}
        </ActionIcon>
      ) : (
        <span className={classes.treeSpacer} aria-hidden />
      )}
      <span className={classes.treeLabel}>{children}</span>
    </div>
  );
};

export const GroupLabel = ({ value, count }: { value: ReactNode; count: number }) => (
  <>
    {value} <span className={classes.groupCount}>({count})</span>
  </>
);

// ---------- 聚合 ----------

interface AggregateValueProps {
  fn: AggregationFunction | CustomAggregationFn;
  value: unknown;
  /** 分组行里只显示数值，不显示函数名 */
  showLabel?: boolean;
}

export const AggregateValue = ({ fn, value, showLabel = true }: AggregateValueProps) => {
  const t = useT();
  const labelKey = typeof fn === 'function' ? 'dataGrid.aggregation.custom' : `dataGrid.aggregation.${fn}`;
  return (
    <span className={classes.aggregate}>
      {showLabel && <span className={classes.aggregateLabel}>{t(labelKey)}</span>}
      <span>{formatValue(value)}</span>
    </span>
  );
};
