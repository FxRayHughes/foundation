import { ActionIcon, Button, Checkbox, Group, Menu, Modal, ScrollArea, Stack } from '@mantine/core';
import {
  IconArrowBarToLeft,
  IconArrowBarToRight,
  IconArrowsSort,
  IconColumns3,
  IconDotsVertical,
  IconEyeOff,
  IconPinnedOff,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { useT } from '@/i18n';
import classes from './DataGrid.module.css';

// 表头列菜单 + 列管理面板（View 层；状态全部来自 ViewModel，只存在内存中）。

const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

export interface ColumnMenuModel {
  /** 纯文本列名（aria-label 插值） */
  text: string;
  sort: { direction: 'asc' | 'desc' | null; onSort: (direction: 'asc' | 'desc' | null) => void } | null;
  pin: { side: 'left' | 'right' | null; onPin: (side: 'left' | 'right' | null) => void } | null;
  onHide: (() => void) | null;
  onManageColumns: () => void;
}

export const ColumnMenu = ({ text, sort, pin, onHide, onManageColumns }: ColumnMenuModel) => {
  const t = useT();
  return (
    <Menu position="bottom-end" withinPortal shadow="md" width={200}>
      {/* span 截住冒泡：否则点击 / 回车会落到 th 上触发排序 */}
      <span className={classes.headerMenu} onClick={stop} onKeyDown={stop} onMouseDown={stop} onPointerDown={stop}>
        <Menu.Target>
          <ActionIcon size="sm" variant="subtle" aria-label={t('dataGrid.columnMenu.ariaLabel', { column: text })}>
            <IconDotsVertical size={14} stroke={1.75} />
          </ActionIcon>
        </Menu.Target>
      </span>
      <Menu.Dropdown>
        {sort && (
          <>
            <Menu.Item
              leftSection={<IconSortAscending size={16} stroke={1.75} />}
              disabled={sort.direction === 'asc'}
              onClick={() => sort.onSort('asc')}
            >
              {t('dataGrid.columnMenu.sortAsc')}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSortDescending size={16} stroke={1.75} />}
              disabled={sort.direction === 'desc'}
              onClick={() => sort.onSort('desc')}
            >
              {t('dataGrid.columnMenu.sortDesc')}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconArrowsSort size={16} stroke={1.75} />}
              disabled={sort.direction === null}
              onClick={() => sort.onSort(null)}
            >
              {t('dataGrid.columnMenu.sortClear')}
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        {pin && (
          <>
            <Menu.Item
              leftSection={<IconArrowBarToLeft size={16} stroke={1.75} />}
              disabled={pin.side === 'left'}
              onClick={() => pin.onPin('left')}
            >
              {t('dataGrid.columnMenu.pinLeft')}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconArrowBarToRight size={16} stroke={1.75} />}
              disabled={pin.side === 'right'}
              onClick={() => pin.onPin('right')}
            >
              {t('dataGrid.columnMenu.pinRight')}
            </Menu.Item>
            {pin.side !== null && (
              <Menu.Item leftSection={<IconPinnedOff size={16} stroke={1.75} />} onClick={() => pin.onPin(null)}>
                {t('dataGrid.columnMenu.unpin')}
              </Menu.Item>
            )}
            <Menu.Divider />
          </>
        )}
        <Menu.Item leftSection={<IconEyeOff size={16} stroke={1.75} />} disabled={!onHide} onClick={() => onHide?.()}>
          {t('dataGrid.columnMenu.hide')}
        </Menu.Item>
        <Menu.Item leftSection={<IconColumns3 size={16} stroke={1.75} />} onClick={onManageColumns}>
          {t('dataGrid.columnMenu.manageColumns')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

// ---------- 列管理面板 ----------

export interface ColumnsPanelItem {
  field: string;
  label: string;
  visible: boolean;
  /** false 时复选框禁用（不可隐藏列 / 最后一列可见列） */
  canToggle: boolean;
}

interface ColumnsPanelProps {
  opened: boolean;
  onClose: () => void;
  items: ColumnsPanelItem[];
  onToggle: (field: string, visible: boolean) => void;
  onSetAll: (visible: boolean) => void;
}

export const ColumnsPanel = ({ opened, onClose, items, onToggle, onSetAll }: ColumnsPanelProps) => {
  const t = useT();
  return (
    <Modal opened={opened} onClose={onClose} title={t('dataGrid.columnMenu.manageColumns')} size="sm">
      <Stack gap="sm">
        <ScrollArea.Autosize mah={360}>
          <Stack gap={8}>
            {items.map((item) => (
              <Checkbox
                key={item.field}
                label={item.label}
                checked={item.visible}
                disabled={!item.canToggle}
                onChange={(e) => onToggle(item.field, e.currentTarget.checked)}
              />
            ))}
          </Stack>
        </ScrollArea.Autosize>
        <Group justify="space-between">
          <Button size="xs" variant="subtle" onClick={() => onSetAll(false)}>
            {t('dataGrid.columnMenu.hideAll')}
          </Button>
          <Button size="xs" variant="subtle" onClick={() => onSetAll(true)}>
            {t('dataGrid.columnMenu.showAll')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
