import { Box, Typography, Paper, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { xProDemoStyles } from './XProDemoPage.styles';
import { DataGridPro } from '@/components/x-pro/data-grid';
import {
  HeatmapChart,
  FunnelChart,
  RadarChart,
  CandlestickChart,
  SankeyChart,
  GanttChart,
  TreemapChart,
} from '@/components/x-pro/charts';
import type { GridColDef } from '@mui/x-data-grid';

const demoRows = [
  { id: 1, name: 'Alice', department: 'Engineering', salary: 95000, age: 28 },
  { id: 2, name: 'Bob', department: 'Engineering', salary: 105000, age: 32 },
  { id: 3, name: 'Carol', department: 'Design', salary: 88000, age: 26 },
  { id: 4, name: 'Dave', department: 'Design', salary: 92000, age: 30 },
  { id: 5, name: 'Eve', department: 'Marketing', salary: 78000, age: 25 },
  { id: 6, name: 'Frank', department: 'Marketing', salary: 82000, age: 35 },
  { id: 7, name: 'Grace', department: 'Engineering', salary: 115000, age: 40 },
  { id: 8, name: 'Hank', department: 'Design', salary: 97000, age: 33 },
];

const heatmapData = [
  [3, 7, 1, 5, 9],
  [6, 2, 8, 4, 7],
  [1, 9, 3, 6, 2],
  [8, 4, 7, 1, 5],
];

const funnelData = [
  { label: 'Visits', value: 10000 },
  { label: 'Signups', value: 5200 },
  { label: 'Trials', value: 2800 },
  { label: 'Purchases', value: 1400 },
  { label: 'Renewals', value: 900 },
];

const radarAxes = ['Speed', 'Power', 'Defense', 'Range', 'HP'];
const radarSeries = [
  { label: 'Player A', data: [80, 90, 70, 60, 85] },
  { label: 'Player B', data: [65, 75, 95, 80, 70] },
];

const candlestickData = [
  { date: '01/01', open: 100, high: 115, low: 95, close: 110 },
  { date: '01/02', open: 110, high: 120, low: 105, close: 108 },
  { date: '01/03', open: 108, high: 112, low: 98, close: 102 },
  { date: '01/04', open: 102, high: 118, low: 100, close: 116 },
  { date: '01/05', open: 116, high: 125, low: 112, close: 122 },
];

const sankeyNodes = [
  { id: 'budget', label: 'Budget' },
  { id: 'eng', label: 'Engineering' },
  { id: 'design', label: 'Design' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'product', label: 'Product' },
];
const sankeyLinks = [
  { source: 'budget', target: 'eng', value: 500 },
  { source: 'budget', target: 'design', value: 200 },
  { source: 'budget', target: 'marketing', value: 150 },
  { source: 'eng', target: 'product', value: 400 },
  { source: 'design', target: 'product', value: 180 },
];

const ganttTasks = [
  { id: '1', label: 'Research', start: '2024-01-01', end: '2024-01-14' },
  { id: '2', label: 'Design', start: '2024-01-10', end: '2024-01-25', dependencies: ['1'] },
  { id: '3', label: 'Development', start: '2024-01-20', end: '2024-02-15', dependencies: ['2'] },
  { id: '4', label: 'Testing', start: '2024-02-10', end: '2024-02-28', dependencies: ['3'] },
];

const treemapData = {
  label: 'Portfolio',
  children: [
    { label: 'Tech', value: 450, children: [
      { label: 'Frontend', value: 200 },
      { label: 'Backend', value: 250 },
    ]},
    { label: 'Design', value: 200 },
    { label: 'Marketing', value: 150 },
    { label: 'Operations', value: 100 },
  ],
};

export const XProDemoPage = () => {
  const theme = useTheme();
  const styles = xProDemoStyles(theme);
  const t = useT();
  const fp = theme.palette.foundation;

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('xpro.col.name'), width: 140 },
    { field: 'department', headerName: t('xpro.col.department'), width: 140 },
    { field: 'salary', headerName: t('xpro.col.salary'), type: 'number', width: 120 },
    { field: 'age', headerName: t('xpro.col.age'), type: 'number', width: 80 },
  ];

  return (
    <Box sx={styles.root}>
      <Box sx={styles.body}>
        <Typography component="h1" sx={styles.sectionTitle}>
          {t('xpro.title')}
        </Typography>

        {/* DataGrid Pro */}
        <Box sx={styles.section}>
          <Typography sx={styles.sectionTitle}>{t('xpro.datagrid.title')}</Typography>
          <Paper sx={styles.card}>
            <Box sx={styles.gridContainer}>
              <DataGridPro
                rows={demoRows}
                columns={columns}
                pinnedColumns={{ left: ['name'] }}
                rowReordering
              />
            </Box>
          </Paper>
        </Box>

        {/* Charts Row 1: Heatmap + Funnel + Radar */}
        <Box sx={styles.section}>
          <Typography sx={styles.sectionTitle}>{t('xpro.charts.title')}</Typography>
          <Box sx={styles.chartRow}>
            <Paper sx={styles.card}>
              <Typography variant="subtitle2">{t('xpro.charts.heatmap')}</Typography>
              <HeatmapChart
                data={heatmapData}
                xLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
                yLabels={['Q1', 'Q2', 'Q3', 'Q4']}
                colorMap={{ min: fp.bg.surface, max: fp.accent }}
                width={320}
                height={200}
              />
            </Paper>
            <Paper sx={styles.card}>
              <Typography variant="subtitle2">{t('xpro.charts.funnel')}</Typography>
              <FunnelChart data={funnelData} width={320} height={200} />
            </Paper>
            <Paper sx={styles.card}>
              <Typography variant="subtitle2">{t('xpro.charts.radar')}</Typography>
              <RadarChart axes={radarAxes} series={radarSeries} width={320} height={250} />
            </Paper>
          </Box>
        </Box>

        {/* Charts Row 2: Candlestick + Sankey */}
        <Box sx={styles.chartRow}>
          <Paper sx={styles.card}>
            <Typography variant="subtitle2">{t('xpro.charts.candlestick')}</Typography>
            <CandlestickChart data={candlestickData} width={350} height={220} />
          </Paper>
          <Paper sx={styles.card}>
            <Typography variant="subtitle2">{t('xpro.charts.sankey')}</Typography>
            <SankeyChart nodes={sankeyNodes} links={sankeyLinks} width={400} height={250} />
          </Paper>
        </Box>

        {/* Charts Row 3: Gantt + Treemap */}
        <Box sx={styles.chartRow}>
          <Paper sx={styles.card}>
            <Typography variant="subtitle2">{t('xpro.charts.gantt')}</Typography>
            <GanttChart tasks={ganttTasks} width={500} height={200} />
          </Paper>
          <Paper sx={styles.card}>
            <Typography variant="subtitle2">{t('xpro.charts.treemap')}</Typography>
            <TreemapChart data={treemapData} width={400} height={250} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
