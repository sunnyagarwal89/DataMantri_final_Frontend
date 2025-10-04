// Features Registry - Maps feature names to feature components

import { lazy } from 'react';

export interface FeatureProps {
  data?: any;
  config?: any;
  onAction?: (action: string, data?: any) => void;
}

// Feature Registry (50 features)
export const FeatureRegistry: Record<string, any> = {
  // Core Features (1-10)
  drilldown: lazy(() => import('./Drilldown')),
  exportCSV: lazy(() => import('./ExportCSV')),
  exportExcel: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.ExportExcel }))),
  exportPDF: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.ExportPDF }))),
  filter: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Filter }))),
  sort: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Sort }))),
  search: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Search }))),
  refresh: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Refresh }))),
  fullscreen: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Fullscreen }))),
  share: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Share }))),
  
  // Interactive Features (11-20)
  crossFilter: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.CrossFilter }))),
  tooltip: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Tooltip }))),
  legend: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Legend }))),
  zoom: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Zoom }))),
  pan: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Pan }))),
  brush: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Brush }))),
  selection: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Selection }))),
  highlight: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Highlight }))),
  annotation: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Annotation }))),
  comparison: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Comparison }))),
  
  // Data Features (21-30)
  aggregation: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Aggregation }))),
  grouping: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Grouping }))),
  pivoting: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Pivoting }))),
  ranking: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Ranking }))),
  trending: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Trending }))),
  forecasting: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Forecasting }))),
  anomaly: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Anomaly }))),
  correlation: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Correlation }))),
  distribution: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Distribution }))),
  statistical: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Statistical }))),
  
  // UI Features (31-40)
  pagination: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Pagination }))),
  virtualization: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Virtualization }))),
  lazyLoading: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.LazyLoading }))),
  caching: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Caching }))),
  responsiveness: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Responsiveness }))),
  theming: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Theming }))),
  localization: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Localization }))),
  accessibility: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Accessibility }))),
  keyboard: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Keyboard }))),
  print: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Print }))),
  
  // Advanced Features (41-50)
  realtime: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Realtime }))),
  streaming: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Streaming }))),
  collaboration: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Collaboration }))),
  versioning: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Versioning }))),
  audit: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Audit }))),
  comments: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Comments }))),
  bookmarks: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Bookmarks }))),
  alerts: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Alerts }))),
  scheduling: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Scheduling }))),
  embedding: lazy(() => import('./PlaceholderFeature').then(m => ({ default: m.Embedding }))),
};

// Get list of available features for AI
export const getAvailableFeatures = (): string[] => {
  return Object.keys(FeatureRegistry);
};

// Feature descriptions for AI context
export const FeatureDescriptions: Record<string, string> = {
  drilldown: 'Click chart element to explore detailed data',
  exportCSV: 'Download data as CSV file',
  exportExcel: 'Download data as Excel spreadsheet',
  exportPDF: 'Export chart/dashboard as PDF',
  filter: 'Filter data by conditions',
  sort: 'Sort data by columns',
  search: 'Search within data',
  refresh: 'Reload data from source',
  fullscreen: 'View in fullscreen mode',
  share: 'Share dashboard with others',
  crossFilter: 'Filter all charts by selecting data',
  tooltip: 'Show details on hover',
  legend: 'Show/hide data series',
  zoom: 'Zoom in/out on chart',
  pan: 'Pan across chart area',
  brush: 'Select time range',
  selection: 'Select multiple data points',
  highlight: 'Highlight specific data',
  annotation: 'Add notes to chart',
  comparison: 'Compare time periods',
  aggregation: 'Aggregate data (sum, avg, etc)',
  grouping: 'Group data by dimensions',
  pivoting: 'Pivot table view',
  ranking: 'Rank data by metrics',
  trending: 'Show trends over time',
  forecasting: 'Predict future values',
  anomaly: 'Detect anomalies',
  correlation: 'Show correlations',
  distribution: 'Show data distribution',
  statistical: 'Statistical analysis',
  pagination: 'Page through large datasets',
  virtualization: 'Efficiently render large lists',
  lazyLoading: 'Load data on demand',
  caching: 'Cache data for performance',
  responsiveness: 'Adapt to screen size',
  theming: 'Customize appearance',
  localization: 'Multi-language support',
  accessibility: 'Screen reader support',
  keyboard: 'Keyboard navigation',
  print: 'Print-friendly view',
  realtime: 'Real-time data updates',
  streaming: 'Stream live data',
  collaboration: 'Multi-user editing',
  versioning: 'Track changes over time',
  audit: 'Audit trail of changes',
  comments: 'Add comments and discussions',
  bookmarks: 'Save favorite views',
  alerts: 'Set data alerts',
  scheduling: 'Schedule dashboard updates',
  embedding: 'Embed in external sites',
};

export default FeatureRegistry;

