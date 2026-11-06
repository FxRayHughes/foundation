import { Paper, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useT } from '@/i18n';
import { useFoundationPalette } from '@/styles/themes';
import { DataGridPremium, DataGridPro } from '@/components/x-pro/data-grid';
import type { DataGridColumn } from '@/components/x-pro/data-grid';
import {
  HeatmapChart,
  FunnelChart,
  RadarChart,
  CandlestickChart,
  SankeyChart,
  GanttChart,
  TreemapChart,
} from '@/components/x-pro/charts';
import classes from './XProDemoPage.module.css';

type DemoRow = { id: number; name: string; department: string; salary: number; age: number };

const demoRows: DemoRow[] = [
  { id: 1, name: 'Alice', department: 'Engineering', salary: 95000, age: 28 },
  { id: 2, name: 'Bob', department: 'Engineering', salary: 105000, age: 32 },
  { id: 3, name: 'Carol', department: 'Design', salary: 88000, age: 26 },
  { id: 4, name: 'Dave', department: 'Design', salary: 92000, age: 30 },
  { id: 5, name: 'Eve', department: 'Marketing', salary: 78000, age: 25 },
  { id: 6, name: 'Frank', department: 'Marketing', salary: 82000, age: 35 },
  { id: 7, name: 'Grace', department: 'Engineering', salary: 115000, age: 40 },
  { id: 8, name: 'Hank', department: 'Design', salary: 97000, age: 33 },
];

// Premium 演示：置顶 / 置底行内容较长会换行，sticky 偏移按实测行高累加
const premiumPinnedRows = {
  top: [
    {
      id: 100,
      name: 'Zoe (Team lead, Platform Infrastructure & Developer Experience)',
      department: 'Engineering',
      salary: 150000,
      age: 45,
    },
  ],
  bottom: [{ id: 101, name: 'Yuri', department: 'Operations', salary: 70000, age: 29 }],
};
const premiumRows: DemoRow[] = [...demoRows, ...premiumPinnedRows.top, ...premiumPinnedRows.bottom];

const heatmapData = [
  [3, 7, 1, 5, 9],
  [6, 2, 8, 4, 7],
  [1, 9, 3, 6, 2],
  [8, 4, 7, 1, 5],
];

const candlestickData = [
  { date: '01/01', open: 100, high: 115, low: 95, close: 110 },
  { date: '01/02', open: 110, high: 120, low: 105, close: 108 },
  { date: '01/03', open: 108, high: 112, low: 98, close: 102 },
  { date: '01/04', open: 102, high: 118, low: 100, close: 116 },
  { date: '01/05', open: 116, high: 125, low: 112, close: 122 },
];

const sankeyLinks = [
  { source: 'budget', target: 'eng', value: 500 },
  { source: 'budget', target: 'design', value: 200 },
  { source: 'budget', target: 'marketing', value: 150 },
  { source: 'eng', target: 'product', value: 400 },
  { source: 'design', target: 'product', value: 180 },
];

type Translate = ReturnType<typeof useT>;

// 图表演示数据：类目名为人类可见文案，按当前语言构建（随语言切换重算）
const buildChartData = (t: Translate) => {
  const k = (key: string) => t(`xpro.charts.data.${key}`);
  return {
    heatmapX: ['mon', 'tue', 'wed', 'thu', 'fri'].map((d) => k(`weekdays.${d}`)),
    heatmapY: ['q1', 'q2', 'q3', 'q4'].map((q) => k(`quarters.${q}`)),
    funnel: [
      { label: k('funnel.visits'), value: 10000 },
      { label: k('funnel.signups'), value: 5200 },
      { label: k('funnel.trials'), value: 2800 },
      { label: k('funnel.purchases'), value: 1400 },
      { label: k('funnel.renewals'), value: 900 },
    ],
    radarAxes: ['speed', 'power', 'defense', 'range', 'hp'].map((a) => k(`radar.axes.${a}`)),
    radarSeries: [
      { label: k('radar.series.playerA'), data: [80, 90, 70, 60, 85] },
      { label: k('radar.series.playerB'), data: [65, 75, 95, 80, 70] },
    ],
    sankeyNodes: [
      { id: 'budget', label: k('sankey.budget') },
      { id: 'eng', label: k('sankey.engineering') },
      { id: 'design', label: k('sankey.design') },
      { id: 'marketing', label: k('sankey.marketing') },
      { id: 'product', label: k('sankey.product') },
    ],
    ganttTasks: [
      { id: '1', label: k('gantt.research'), start: '2024-01-01', end: '2024-01-14' },
      { id: '2', label: k('gantt.design'), start: '2024-01-10', end: '2024-01-25', dependencies: ['1'] },
      { id: '3', label: k('gantt.development'), start: '2024-01-20', end: '2024-02-15', dependencies: ['2'] },
      { id: '4', label: k('gantt.testing'), start: '2024-02-10', end: '2024-02-28', dependencies: ['3'] },
    ],
    treemap: {
      label: k('treemap.portfolio'),
      children: [
        { label: k('treemap.tech'), value: 450, children: [
          { label: k('treemap.frontend'), value: 200 },
          { label: k('treemap.backend'), value: 250 },
        ]},
        { label: k('treemap.design'), value: 200 },
        { label: k('treemap.marketing'), value: 150 },
        { label: k('treemap.operations'), value: 100 },
      ],
    },
  };
};

export const XProDemoPage = () => {
  const t = useT();
  // 热力图需要真实色值做插值，因此取具体颜色而非 CSS 变量
  const fp = useFoundationPalette();
  const d = useMemo(() => buildChartData(t), [t]);

  const columns: DataGridColumn<DemoRow>[] = [
    { accessor: 'name', headerName: t('xpro.col.name'), width: 140 },
    { accessor: 'department', headerName: t('xpro.col.department'), width: 140 },
    { accessor: 'salary', headerName: t('xpro.col.salary'), type: 'number', width: 120 },
    { accessor: 'age', headerName: t('xpro.col.age'), type: 'number', width: 80 },
  ];

  return (
    <div className={classes.root}>
      <div className={classes.body}>
        <h1 className={classes.sectionTitle}>{t('xpro.title')}</h1>

        {/* DataGrid Pro */}
        <section className={classes.section}>
          <Text className={classes.sectionTitle}>{t('xpro.datagrid.title')}</Text>
          <Paper className={classes.card}>
            <div className={classes.gridContainer}>
              <DataGridPro<DemoRow>
                rows={demoRows}
                columns={columns}
                pinnedColumns={{ left: ['name'] }}
                rowReordering
              />
            </div>
          </Paper>
        </section>

        {/* DataGrid Premium：工具栏导出（原生另存为）+ 列菜单 + 列宽拖拽 + 钉住行 + 聚合 */}
        <section className={classes.section}>
          <Text className={classes.sectionTitle}>{t('xpro.datagridPremium.title')}</Text>
          <Text className={classes.sectionHint}>{t('xpro.datagridPremium.hint')}</Text>
          <Paper className={classes.card}>
            <div className={classes.gridContainer}>
              <DataGridPremium<DemoRow>
                rows={premiumRows}
                columns={columns}
                pinnedColumns={{ left: ['name'] }}
                pinnedRows={premiumPinnedRows}
                aggregationModel={{ salary: 'sum', age: 'avg' }}
                headerFilters={{ enabled: true }}
                cellSelection
                showToolbar
                excelExportOptions={{ filename: 'employees', sheetName: 'Employees' }}
              />
            </div>
          </Paper>
        </section>

        {/* Charts Row 1: Heatmap + Funnel + Radar */}
        <section className={classes.section}>
          <Text className={classes.sectionTitle}>{t('xpro.charts.title')}</Text>
          <div className={classes.chartRow}>
            <Paper className={classes.card}>
              <Text className={classes.cardTitle}>{t('xpro.charts.heatmap')}</Text>
              <HeatmapChart
                data={heatmapData}
                xLabels={d.heatmapX}
                yLabels={d.heatmapY}
                colorMap={{ min: fp.bg.surface, max: fp.accent }}
                height={200}
              />
            </Paper>
            <Paper className={classes.card}>
              <Text className={classes.cardTitle}>{t('xpro.charts.funnel')}</Text>
              <FunnelChart data={d.funnel} height={200} />
            </Paper>
            <Paper className={classes.card}>
              <Text className={classes.cardTitle}>{t('xpro.charts.funnelHorizontal')}</Text>
              <FunnelChart data={d.funnel} orientation="horizontal" withLabels height={200} />
            </Paper>
            <Paper className={classes.card}>
              <Text className={classes.cardTitle}>{t('xpro.charts.radar')}</Text>
              <RadarChart axes={d.radarAxes} series={d.radarSeries} height={250} />
            </Paper>
          </div>
        </section>

        {/* Charts Row 2: Candlestick + Sankey */}
        <div className={classes.chartRow}>
          <Paper className={classes.card}>
            <Text className={classes.cardTitle}>{t('xpro.charts.candlestick')}</Text>
            <CandlestickChart data={candlestickData} height={220} />
          </Paper>
          <Paper className={classes.card}>
            <Text className={classes.cardTitle}>{t('xpro.charts.sankey')}</Text>
            <SankeyChart nodes={d.sankeyNodes} links={sankeyLinks} height={250} />
          </Paper>
        </div>

        {/* Charts Row 3: Gantt + Treemap */}
        <div className={classes.chartRow}>
          <Paper className={classes.card}>
            <Text className={classes.cardTitle}>{t('xpro.charts.gantt')}</Text>
            <GanttChart tasks={d.ganttTasks} height={200} />
          </Paper>
          <Paper className={classes.card}>
            <Text className={classes.cardTitle}>{t('xpro.charts.treemap')}</Text>
            <TreemapChart data={d.treemap} height={250} />
          </Paper>
        </div>
      </div>
    </div>
  );
};
