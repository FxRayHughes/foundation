import { Box, Typography, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useT } from '@/i18n';
import { NativeDialogs, type TableInfo } from '@/services';
import { useDatabase, type DatabaseStatus } from './useDatabase';
import { databaseStyles } from './Database.styles';
import { settingsPageStyles } from '../SettingsPage.styles';

// 数据库子页面：
//   1) 路径与总占用 + 切换 / 重置（原生 dialog）
//   2) 双图：环形图（占比）+ 水平条形图（精确字节）
//   3) 表清单：行展示 行数 / 字节，clearable=true 的允许逐项清空（带原生确认）
//
// 文案 namespace：settings.database.*。
// 表名 → 标签 key 映射：i18n 路径为 settings.database.tables.<labelKey>.{label,description}。
export const Database = () => {
  const theme = useTheme();
  const shared = settingsPageStyles(theme);
  const styles = databaseStyles(theme);
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
    <Box sx={shared.section}>
      <Box sx={shared.sectionHeader}>
        <Typography sx={shared.sectionTitle}>{t('settings.database.title')}</Typography>
        <Typography sx={shared.sectionHint}>{t('settings.database.hint')}</Typography>
      </Box>

      {/* —— 路径与总占用 —— */}
      <Box sx={styles.infoCard}>
        <Box sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>{t('settings.database.currentPathLabel')}</Typography>
          <Typography sx={styles.infoValue}>
            {vm.stats?.path ?? '…'}
            {vm.stats && (
              <Box
                component="span"
                sx={
                  [
                    styles.badge,
                    vm.stats.isCustom ? styles.badgeCustom : styles.badgeDefault,
                  ] as SxProps<Theme>
                }
              >
                {vm.stats.isCustom
                  ? t('settings.database.customBadge')
                  : t('settings.database.defaultBadge')}
              </Box>
            )}
          </Typography>
        </Box>
        <Box sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>{t('settings.database.defaultPathLabel')}</Typography>
          <Typography sx={styles.infoValue}>{vm.stats?.defaultPath ?? '…'}</Typography>
        </Box>
        <Box sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>{t('settings.database.sizeLabel')}</Typography>
          <Typography sx={styles.infoValue}>
            {vm.stats ? formatBytes(vm.stats.sizeBytes) : '…'}
          </Typography>
        </Box>

        <Box sx={styles.actions}>
          <Box
            component="button"
            type="button"
            sx={styles.actionPrimary}
            disabled={busy}
            onClick={handleChange}
          >
            <FolderOpenRoundedIcon fontSize="small" />
            {t('settings.database.actions.change')}
          </Box>
          <Box
            component="button"
            type="button"
            sx={styles.actionSecondary}
            disabled={busy || (vm.stats !== null && !vm.stats.isCustom)}
            onClick={handleReset}
          >
            <RestartAltRoundedIcon fontSize="small" />
            {t('settings.database.actions.reset')}
          </Box>
        </Box>

        <StatusLine status={vm.status} styles={styles} t={t} />
      </Box>

      {/* —— 双图：占比 + 字节 —— */}
      <ChartsBlock vm={vm} styles={styles} t={t} />

      {/* —— 表清单 —— */}
      <TableListBlock vm={vm} styles={styles} t={t} busy={busy} onClear={handleClear} />
    </Box>
  );
};

type Vm = ReturnType<typeof useDatabase>;
type Styles = ReturnType<typeof databaseStyles>;
type T = ReturnType<typeof useT>;

interface StatusLineProps {
  status: DatabaseStatus;
  styles: Styles;
  t: T;
}

// 把每种 status.kind 显式列出，TS 才能在 'failed' 分支收敛到 message 字段。
const StatusLine = ({ status, styles, t }: StatusLineProps) => {
  switch (status.kind) {
    case 'idle':
      return null;
    case 'changing':
      return <Typography sx={styles.status}>{t('settings.database.feedback.changing')}</Typography>;
    case 'resetting':
      return <Typography sx={styles.status}>{t('settings.database.feedback.resetting')}</Typography>;
    case 'clearing':
      return (
        <Typography sx={styles.status}>
          {t('settings.database.feedback.clearing', {
            label: t(`settings.database.tables.${tableKeyOf(status.tableName)}.label`),
          })}
        </Typography>
      );
    case 'changed':
      return <Typography sx={styles.status}>{t('settings.database.feedback.changed')}</Typography>;
    case 'reset':
      return <Typography sx={styles.status}>{t('settings.database.feedback.reset')}</Typography>;
    case 'cleared':
      return (
        <Typography sx={styles.status}>
          {t('settings.database.feedback.cleared', {
            label: t(`settings.database.tables.${tableKeyOf(status.tableName)}.label`),
          })}
        </Typography>
      );
    case 'failed':
      return (
        <Typography sx={styles.statusError}>
          {t('settings.database.feedback.failed', { message: status.message })}
        </Typography>
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

interface ChartsBlockProps {
  vm: Vm;
  styles: Styles;
  t: T;
}

const ChartsBlock = ({ vm, styles, t }: ChartsBlockProps) => {
  const theme = useTheme();
  const tables = vm.tableStats?.tables ?? [];
  const hasData = tables.some((tb) => tb.sizeBytes > 0);

  // 同一组颜色喂两张图，让占比与条形图视觉对齐。取调色板中常用的辅助色。
  const palette: string[] = [
    theme.palette.foundation.accent,
    theme.palette.foundation.status.success,
    theme.palette.foundation.status.warning,
    theme.palette.foundation.status.danger,
    theme.palette.foundation.text.muted,
  ];
  const colorOf = (idx: number): string => palette[idx % palette.length] ?? palette[0]!;

  const labelOf = (tb: TableInfo): string =>
    t(`settings.database.tables.${tb.labelKey}.label`);

  // 任一表是 estimated → 整图加注释
  const anyEstimated = tables.some((tb) => tb.estimated);

  return (
    <Box sx={styles.chartsRow}>
      {/* 环形：占比 */}
      <Box sx={styles.chartCard}>
        <Typography sx={styles.chartTitle}>
          {t('settings.database.charts.share.title')}
        </Typography>
        <Typography sx={styles.chartHint}>
          {anyEstimated
            ? t('settings.database.charts.estimatedNote')
            : t('settings.database.charts.share.hint')}
        </Typography>
        {hasData ? (
          <Box sx={styles.chartHost}>
            <PieChart
              series={[
                {
                  data: tables.map((tb, idx) => ({
                    id: tb.name,
                    value: tb.sizeBytes,
                    label: labelOf(tb),
                    color: colorOf(idx),
                  })),
                  innerRadius: 48,
                  paddingAngle: 1,
                  cornerRadius: 2,
                  // tooltip 用字节大小精确展示
                  valueFormatter: (item) => formatBytes(item.value),
                },
              ]}
              height={220}
              hideLegend
            />
          </Box>
        ) : (
          <Box sx={styles.emptyChart}>{t('settings.database.charts.empty')}</Box>
        )}
      </Box>

      {/* 条形：字节 */}
      <Box sx={styles.chartCard}>
        <Typography sx={styles.chartTitle}>
          {t('settings.database.charts.bytes.title')}
        </Typography>
        <Typography sx={styles.chartHint}>
          {anyEstimated
            ? t('settings.database.charts.estimatedNote')
            : t('settings.database.charts.bytes.hint')}
        </Typography>
        {hasData ? (
          <Box sx={styles.chartHost}>
            <BarChart
              layout="horizontal"
              yAxis={[
                {
                  scaleType: 'band',
                  data: tables.map(labelOf),
                },
              ]}
              xAxis={[
                {
                  // 横轴：字节数，自动单位
                  valueFormatter: (v: number | null) =>
                    formatBytes(typeof v === 'number' ? v : 0),
                },
              ]}
              series={[
                {
                  data: tables.map((tb) => tb.sizeBytes),
                  valueFormatter: (v: number | null) => formatBytes(v ?? 0),
                },
              ]}
              colors={tables.map((_, idx) => colorOf(idx))}
              height={220}
              hideLegend
            />
          </Box>
        ) : (
          <Box sx={styles.emptyChart}>{t('settings.database.charts.empty')}</Box>
        )}
      </Box>
    </Box>
  );
};

interface TableListBlockProps {
  vm: Vm;
  styles: Styles;
  t: T;
  busy: boolean;
  onClear: (table: TableInfo) => void;
}

const TableListBlock = ({ vm, styles, t, busy, onClear }: TableListBlockProps) => {
  const tables = vm.tableStats?.tables ?? [];
  return (
    <Box sx={styles.tableList}>
      <Typography sx={styles.chartTitle}>{t('settings.database.tables.title')}</Typography>
      {tables.length === 0 ? (
        <Typography sx={styles.chartHint}>{t('settings.database.tables.empty')}</Typography>
      ) : (
        tables.map((tb) => (
          <TableRow key={tb.name} table={tb} styles={styles} t={t} busy={busy} onClear={onClear} />
        ))
      )}
    </Box>
  );
};

interface TableRowProps {
  table: TableInfo;
  styles: Styles;
  t: T;
  busy: boolean;
  onClear: (table: TableInfo) => void;
}

const TableRow = ({ table, styles, t, busy, onClear }: TableRowProps) => {
  const label = t(`settings.database.tables.${table.labelKey}.label`);
  const descRaw = t(`settings.database.tables.${table.labelKey}.description`);
  // i18n 缺失时返回 key 本身——退化为不展示描述，避免 UI 显示长 key
  const description = descRaw === `settings.database.tables.${table.labelKey}.description`
    ? null
    : descRaw;

  return (
    <Box sx={styles.tableRow}>
      <StorageRoundedIcon fontSize="small" />
      <Box sx={styles.tableRowMain}>
        <Box sx={styles.tableRowLabel}>
          {label}
          {table.estimated && (
            <Box component="span" sx={[styles.badge, styles.badgeEstimated] as SxProps<Theme>}>
              {t('settings.database.tables.estimatedTag')}
            </Box>
          )}
        </Box>
        {description && <Typography sx={styles.chartHint}>{description}</Typography>}
        <Typography sx={styles.tableRowMeta}>
          {t('settings.database.tables.meta', {
            rows: table.rowCount,
            size: formatBytes(table.sizeBytes),
          })}
        </Typography>
      </Box>
      {table.clearable ? (
        <Box
          component="button"
          type="button"
          sx={styles.tableRowAction}
          disabled={busy}
          onClick={() => onClear(table)}
          aria-label={t('settings.database.tables.clearAria', { label })}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
          {t('settings.database.tables.clear')}
        </Box>
      ) : (
        <Box
          component="span"
          sx={styles.tableRowActionDisabled}
          aria-label={t('settings.database.tables.protectedAria', { label })}
        >
          <LockRoundedIcon fontSize="small" />
          {t('settings.database.tables.protected')}
        </Box>
      )}
    </Box>
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
