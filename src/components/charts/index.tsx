// Chart Registry - Maps chart type names to component implementations
import { lazy } from 'react';

export const ChartRegistry: Record<string, any> = {
  // Basic Charts (1-10)
  'bar': lazy(() => import('./BarChart')),
  'line': lazy(() => import('./LineChart')),
  'pie': lazy(() => import('./PieChart')),
  'donut': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.DonutChart }))),
  'area': lazy(() => import('./AreaChart')),
  'scatter': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ScatterChart }))),
  'bubble': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.BubbleChart }))),
  'radar': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.RadarChart }))),
  'polar': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.PolarChart }))),
  'table': lazy(() => import('./TableChart')),
  
  // Advanced Charts (11-20)
  'heatmap': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.HeatmapChart }))),
  'treemap': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.TreemapChart }))),
  'sankey': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.SankeyChart }))),
  'funnel': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.FunnelChart }))),
  'gauge': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.GaugeChart }))),
  'waterfall': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.WaterfallChart }))),
  'boxplot': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.BoxPlotChart }))),
  'violin': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ViolinChart }))),
  'candlestick': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.CandlestickChart }))),
  'ohlc': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.OHLCChart }))),
  
  // Specialized Charts (21-30)
  'gantt': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.GanttChart }))),
  'timeline': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.TimelineChart }))),
  'calendar': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.CalendarChart }))),
  'sunburst': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.SunburstChart }))),
  'chord': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ChordChart }))),
  'network': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.NetworkChart }))),
  'map': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.MapChart }))),
  'choropleth': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ChoroplethChart }))),
  'wordcloud': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.WordCloudChart }))),
  'bullet': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.BulletChart }))),
  
  // Statistical Charts (31-40)
  'histogram': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.HistogramChart }))),
  'density': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.DensityChart }))),
  'contour': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ContourChart }))),
  'qq': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.QQChart }))),
  'regression': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.RegressionChart }))),
  'correlation': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.CorrelationChart }))),
  'distribution': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.DistributionChart }))),
  'parallel': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ParallelChart }))),
  'spider': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.SpiderChart }))),
  'stream': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.StreamChart }))),
  
  // Business Charts (41-50)
  'kpi': lazy(() => import('./KPIChart')),
  'metric': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.MetricChart }))),
  'sparkline': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.SparklineChart }))),
  'progress': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ProgressChart }))),
  'comparison': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ComparisonChart }))),
  'cohort': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.CohortChart }))),
  'retention': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.RetentionChart }))),
  'conversion': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.ConversionChart }))),
  'pyramid': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.PyramidChart }))),
  'marimekko': lazy(() => import('./PlaceholderChart').then(m => ({ default: m.MarimekkoChart }))),
};

// Get list of available chart types for AI prompt
export const getAvailableChartTypes = (): string[] => {
  return Object.keys(ChartRegistry);
};

// Chart type descriptions for AI context
export const ChartTypeDescriptions: Record<string, string> = {
  bar: 'Vertical bars for comparing categories',
  line: 'Line chart for trends over time',
  pie: 'Circular chart showing proportions',
  donut: 'Pie chart with center hole',
  area: 'Filled area under line chart',
  scatter: 'Points plot for correlation',
  bubble: 'Scatter with size dimension',
  radar: 'Multi-axis comparison',
  polar: 'Circular bar chart',
  table: 'Detailed data table',
  heatmap: 'Color-coded matrix',
  treemap: 'Nested rectangles by size',
  sankey: 'Flow diagram',
  funnel: 'Conversion stages',
  gauge: 'Single value dial',
  waterfall: 'Cumulative effect',
  boxplot: 'Statistical distribution',
  violin: 'Distribution density',
  candlestick: 'Financial OHLC',
  ohlc: 'Financial open-high-low-close',
  gantt: 'Project timeline',
  timeline: 'Events over time',
  calendar: 'Daily heatmap',
  sunburst: 'Hierarchical pie',
  chord: 'Relationship circular',
  network: 'Nodes and edges',
  map: 'Geographic visualization',
  choropleth: 'Colored map regions',
  wordcloud: 'Word frequency',
  bullet: 'Goal progress',
  histogram: 'Frequency distribution',
  density: 'Probability density',
  contour: '3D surface contours',
  qq: 'Quantile-quantile plot',
  regression: 'Trend line fit',
  correlation: 'Variable relationships',
  distribution: 'Statistical spread',
  parallel: 'Multi-dimensional comparison',
  spider: 'Multi-metric radar',
  stream: 'Stacked area flow',
  kpi: 'Key performance indicator',
  metric: 'Single metric card',
  sparkline: 'Inline mini chart',
  progress: 'Progress bar/ring',
  comparison: 'Side-by-side comparison',
  cohort: 'Time-based cohorts',
  retention: 'User retention curves',
  conversion: 'Conversion funnel',
  pyramid: 'Age/population pyramid',
  marimekko: 'Proportional stacked bars',
};

export default ChartRegistry;

