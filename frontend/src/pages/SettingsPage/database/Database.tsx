import { Button, Text, UnstyledButton } from '@mantine/core';
import { BarChart, DonutChart } from '@mantine/charts';
import {
  IconDatabase,
  IconFolderOpen,
  IconLock,
  IconRestore,
  IconTrash,
} from '@tabler/icons-react';
import { useT } from '@/i18n';
import { NativeDialogs, type TableInfo } from '@/services';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import { useDatabase, type DatabaseStatus } from './useDatabase';
import classes from './Database.module.css';
import shared from '../SettingsPage.module.css';

// 数据库子页面：
//   1) 路径与总占用 + 切换 / 重置（原生 dialog）
//   2) 双图：环形图（占比）+ 水平条形图（精确字节）—— @mantine/charts
//   3) 表清单：行展示 行数 / 字节，clearable=true 的允许逐项清空（带原生确认）
//
// 文案 namespace：settings.database.*。
// 表名 → 标签 key 映射：i18n 路径为 settings.database.tables.<labelKey>.{label,description}。
export const Database = () => {
  const vm = useDatabase();
  const t = useT();

  const busy =
    vm.status.kind === 'changing' ||
    vm.status.kind === 'resetting' ||
    vm.status.kind === 'clearing';

  // 切换路径：原生「另存为」对话框选目标 .db。
  const handleChange = async (): Promise<void> => {
    if (busy) return;
    const next = await NativeDialogs.saveFile({
      title: t('settings.database.dialog.title'),
      message: t('settings.database.dialog.message'),
      buttonText: t('settings.database.dialog.confirm'),
      filename: defaultFileName(vm.stats?.path),
      filters: [
        { displayName: t('settings.database.dialog.filterDb'), pattern: '*.db;*.sqlite' },
      ],
      canCreateDirectories: true,
    });
    if (next) {
      void vm.changePath(next);
    }
  };

  // 重置：原生确认框，避免误点。
  const handleReset = async (): Promise<void> => {
    if (busy) return;
    const ok = await NativeDialogs.confirm({
      title: t('settings.database.confirmReset.title'),
      message: t('settings.database.confirmReset.message'),
      okLabel: t('settings.database.confirmReset.ok'),
      cancelLabel: t('settings.database.confirmReset.cancel'),
    });
    if (ok) {
      void vm.resetPath();
    }
  };

  const handleClear = async (table: TableInfo): Promise<void> => {
    if (busy || !table.clearable) return;
    const label = t(`settings.database.tables.${table.labelKey}.label`);
    const ok = await NativeDialogs.confirm({
      title: t('settings.database.confirmClear.title', { label }),
      message: t('settings.database.confirmClear.message', { label, rows: table.rowCount }),
      okLabel: t('settings.database.confirmClear.ok'),
      cancelLabel: t('settings.database.confirmClear.cancel'),
    });
    if (ok) {
      void vm.clearTable(table);
    }
  };

  return (
    <div className={shared.section}>
      <div className={shared.sectionHeader}>
        <Text className={shared.sectionTitle}>{t('settings.database.title')}</Text>
        <Text className={shared.sectionHint}>{t('settings.database.hint')}</Text>
      </div>

      {/* —— 路径与总占用 —— */}
      <div className={classes.infoCard}>
        <div className={classes.infoRow}>
          <Text className={classes.infoLabel}>{t('settings.database.currentPathLabel')}</Text>
          <Text className={classes.infoValue}>
            {vm.stats?.path ?? '…'}
            {vm.stats && (
              <span
                className={classes.badge}
                data-kind={vm.stats.isCustom ? 'custom' : 'default'}
              >
                {vm.stats.isCustom
                  ? t('settings.database.customBadge')
                  : t('settings.database.defaultBadge')}
              </span>
            )}
          </Text>
        </div>
        <div className={classes.infoRow}>
          <Text className={classes.infoLabel}>{t('settings.database.defaultPathLabel')}</Text>
          <Text className={classes.infoValue}>{vm.stats?.defaultPath ?? '…'}</Text>
        </div>
        <div className={classes.infoRow}>
          <Text className={classes.infoLabel}>{t('settings.database.sizeLabel')}</Text>
          <Text className={classes.infoValue}>
            {vm.stats ? formatBytes(vm.stats.sizeBytes) : '…'}
          </Text>
        </div>

        <div className={classes.actions}>
          <Button
            variant="filled"
            className={classes.actionPrimary}
            leftSection={<IconFolderOpen size={20} stroke={1.75} />}
            disabled={busy}
            onClick={handleChange}
          >
            {t('settings.database.actions.change')}
          </Button>
          <Button
            variant="default"
            className={classes.actionSecondary}
            leftSection={<IconRestore size={20} stroke={1.75} />}
            disabled={busy || (vm.stats !== null && !vm.stats.isCustom)}
            onClick={handleReset}
          >
            {t('settings.database.actions.reset')}
          </Button>
        </div>

        <StatusLine status={vm.status} t={t} />
      </div>

      {/* —— 双图：占比 + 字节 —— */}
      <ChartsBlock vm={vm} t={t} />

      {/* —— 表清单 —— */}
      <TableListBlock vm={vm} t={t} busy={busy} onClear={handleClear} />
    </div>
  );
};

type Vm = ReturnType<typeof useDatabase>;
type T = ReturnType<typeof useT>;

interface StatusLineProps {
  status: DatabaseStatus;
  t: T;
}

// 把每种 status.kind 显式列出，TS 才能在 'failed' 分支收敛到 message 字段。
const StatusLine = ({ status, t }: StatusLineProps) => {
  switch (status.kind) {
    case 'idle':
      return null;
    case 'changing':
      return <Text className={classes.status}>{t('settings.database.feedback.changing')}</Text>;
    case 'resetting':
      return <Text className={classes.status}>{t('settings.database.feedback.resetting')}</Text>;
    case 'clearing':
      return (
        <Text className={classes.status}>
          {t('settings.database.feedback.clearing', {
            label: t(`settings.database.tables.${tableKeyOf(status.tableName)}.label`),
          })}
        </Text>
      );
    case 'changed':
      return <Text className={classes.status}>{t('settings.database.feedback.changed')}</Text>;
    case 'reset':
      return <Text className={classes.status}>{t('settings.database.feedback.reset')}</Text>;
    case 'cleared':
      return (
        <Text className={classes.status}>
          {t('settings.database.feedback.cleared', {
            label: t(`settings.database.tables.${tableKeyOf(status.tableName)}.label`),
          })}
        </Text>
      );
    case 'failed':
      return (
        <Text className={classes.statusError}>
          {t('settings.database.feedback.failed', { message: status.message })}
        </Text>
      );
  }
};

// 状态消息里只有 tableName（SQLite 表名），没有 labelKey；做一次反查。
// 静态 map：与 internal/storage/models.go 的 ModelDescriptor 对齐，加表时同步。
const TABLE_NAME_TO_KEY: Record<string, string> = {
  preferences: 'preferences',
  app_settings: 'appSettings',
};
const tableKeyOf = (name: string): string => TABLE_NAME_TO_KEY[name] ?? name;

// 同一组颜色喂两张图，让占比与条形图视觉对齐。取调色板中常用的辅助色。
// 用 CSS 变量引用（而非取值），主题切换时图表零重渲染即可跟随。
const CHART_COLORS: readonly string[] = [
  FOUNDATION_CSS_VARS.accent,
  FOUNDATION_CSS_VARS.status.success,
  FOUNDATION_CSS_VARS.status.warning,
  FOUNDATION_CSS_VARS.status.danger,
  FOUNDATION_CSS_VARS.text.muted,
];
const colorOf = (idx: number): string =>
  CHART_COLORS[idx % CHART_COLORS.length] ?? FOUNDATION_CSS_VARS.accent;

// 条形图数据行字段名（BarChart 的 dataKey / series.name）
const BAR_LABEL_KEY = 'label';
const BAR_VALUE_KEY = 'sizeBytes';

interface ChartsBlockProps {
  vm: Vm;
  t: T;
}

const ChartsBlock = ({ vm, t }: ChartsBlockProps) => {
  const tables = vm.tableStats?.tables ?? [];
  const hasData = tables.some((tb) => tb.sizeBytes > 0);

  const labelOf = (tb: TableInfo): string =>
    t(`settings.database.tables.${tb.labelKey}.label`);

  // 任一表是 estimated → 整图加注释
  const anyEstimated = tables.some((tb) => tb.estimated);

  // 环形：每段一张表
  const donutData = tables.map((tb, idx) => ({
    name: labelOf(tb),
    value: tb.sizeBytes,
    color: colorOf(idx),
  }));

  // 条形：每行一张表；行内 color 字段让每根柱子单独着色（BarChart 支持 per-entry color）
  const barData = tables.map((tb, idx) => ({
    [BAR_LABEL_KEY]: labelOf(tb),
    [BAR_VALUE_KEY]: tb.sizeBytes,
    color: colorOf(idx),
  }));

  return (
    <div className={classes.chartsRow}>
      {/* 环形：占比 */}
      <div className={classes.chartCard}>
        <Text className={classes.chartTitle}>{t('settings.database.charts.share.title')}</Text>
        <Text className={classes.chartHint}>
          {anyEstimated
            ? t('settings.database.charts.estimatedNote')
            : t('settings.database.charts.share.hint')}
        </Text>
        {hasData ? (
          <div className={`${classes.chartHost} ${classes.chartHostCentered}`}>
            <DonutChart
              data={donutData}
              size={200}
              thickness={52}
              paddingAngle={1}
              strokeWidth={0}
              pieProps={{ cornerRadius: 2 }}
              // tooltip 只展示悬停的那一段，用字节大小精确展示
              withTooltip
              tooltipDataSource="segment"
              valueFormatter={formatBytes}
            />
          </div>
        ) : (
          <div className={classes.emptyChart}>{t('settings.database.charts.empty')}</div>
        )}
      </div>

      {/* 条形：字节 */}
      <div className={classes.chartCard}>
        <Text className={classes.chartTitle}>{t('settings.database.charts.bytes.title')}</Text>
        <Text className={classes.chartHint}>
          {anyEstimated
            ? t('settings.database.charts.estimatedNote')
            : t('settings.database.charts.bytes.hint')}
        </Text>
        {hasData ? (
          <div className={classes.chartHost}>
            <BarChart
              h={220}
              data={barData}
              dataKey={BAR_LABEL_KEY}
              // vertical = 类目在 Y 轴、数值在 X 轴（即水平条形）
              orientation="vertical"
              series={[
                {
                  name: BAR_VALUE_KEY,
                  label: t('settings.database.charts.bytes.title'),
                  color: FOUNDATION_CSS_VARS.accent,
                },
              ]}
              // 横轴刻度 + tooltip：字节数，自动单位
              valueFormatter={formatBytes}
              yAxisProps={{ width: 96 }}
              gridAxis="x"
              gridColor={FOUNDATION_CSS_VARS.divider}
              textColor={FOUNDATION_CSS_VARS.text.muted}
              cursorFill={FOUNDATION_CSS_VARS.bg.hover}
              maxBarWidth={28}
            />
          </div>
        ) : (
          <div className={classes.emptyChart}>{t('settings.database.charts.empty')}</div>
        )}
      </div>
    </div>
  );
};

interface TableListBlockProps {
  vm: Vm;
  t: T;
  busy: boolean;
  onClear: (table: TableInfo) => void;
}

const TableListBlock = ({ vm, t, busy, onClear }: TableListBlockProps) => {
  const tables = vm.tableStats?.tables ?? [];
  return (
    <div className={classes.tableList}>
      <Text className={classes.chartTitle}>{t('settings.database.tables.title')}</Text>
      {tables.length === 0 ? (
        <Text className={classes.chartHint}>{t('settings.database.tables.empty')}</Text>
      ) : (
        tables.map((tb) => (
          <TableRow key={tb.name} table={tb} t={t} busy={busy} onClear={onClear} />
        ))
      )}
    </div>
  );
};

interface TableRowProps {
  table: TableInfo;
  t: T;
  busy: boolean;
  onClear: (table: TableInfo) => void;
}

const TableRow = ({ table, t, busy, onClear }: TableRowProps) => {
  const label = t(`settings.database.tables.${table.labelKey}.label`);
  const descRaw = t(`settings.database.tables.${table.labelKey}.description`);
  // i18n 缺失时返回 key 本身——退化为不展示描述，避免 UI 显示长 key
  const description = descRaw === `settings.database.tables.${table.labelKey}.description`
    ? null
    : descRaw;

  return (
    <div className={classes.tableRow}>
      <IconDatabase size={20} stroke={1.75} className={classes.tableRowIcon} />
      <div className={classes.tableRowMain}>
        <div className={classes.tableRowLabel}>
          {label}
          {table.estimated && (
            <span className={classes.badge} data-kind="estimated">
              {t('settings.database.tables.estimatedTag')}
            </span>
          )}
        </div>
        {description && <Text className={classes.chartHint}>{description}</Text>}
        <Text className={classes.tableRowMeta}>
          {t('settings.database.tables.meta', {
            rows: table.rowCount,
            size: formatBytes(table.sizeBytes),
          })}
        </Text>
      </div>
      {table.clearable ? (
        <UnstyledButton
          className={classes.tableRowAction}
          disabled={busy}
          onClick={() => onClear(table)}
          aria-label={t('settings.database.tables.clearAria', { label })}
        >
          <IconTrash size={20} stroke={1.75} />
          {t('settings.database.tables.clear')}
        </UnstyledButton>
      ) : (
        <span
          className={classes.tableRowActionDisabled}
          aria-label={t('settings.database.tables.protectedAria', { label })}
        >
          <IconLock size={20} stroke={1.75} />
          {t('settings.database.tables.protected')}
        </span>
      )}
    </div>
  );
};

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

// 简单字节格式化：脚手架够用，业务方可换成 i18n 化的精细方案。
const formatBytes = (n: number): string => {
  if (n < KB) return `${n} B`;
  if (n < MB) return `${(n / KB).toFixed(1)} KB`;
  if (n < GB) return `${(n / MB).toFixed(1)} MB`;
  return `${(n / GB).toFixed(2)} GB`;
};

// 从当前路径派生默认保存文件名。后端默认是 foundation.db；保留同名可避免改名。
const defaultFileName = (currentPath?: string): string => {
  if (!currentPath) return 'foundation.db';
  const seg = currentPath.split(/[\\/]/).pop();
  return seg && seg.length > 0 ? seg : 'foundation.db';
};
