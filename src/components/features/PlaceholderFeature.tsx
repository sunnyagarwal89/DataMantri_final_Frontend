import { FeatureProps } from './index';

// Generic placeholder for features not yet fully implemented
const PlaceholderFeature: React.FC<FeatureProps & { featureName: string }> = ({ featureName, onAction }) => {
  return (
    <button
      onClick={() => onAction?.(featureName)}
      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
      title={featureName}
    >
      {featureName}
    </button>
  );
};

export default PlaceholderFeature;

// Export named components for all placeholder features
export const ExportExcel = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Export Excel" />;
export const ExportPDF = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Export PDF" />;
export const Filter = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Filter" />;
export const Sort = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Sort" />;
export const Search = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Search" />;
export const Refresh = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Refresh" />;
export const Fullscreen = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Fullscreen" />;
export const Share = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Share" />;
export const CrossFilter = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="CrossFilter" />;
export const Tooltip = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Tooltip" />;
export const Legend = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Legend" />;
export const Zoom = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Zoom" />;
export const Pan = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Pan" />;
export const Brush = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Brush" />;
export const Selection = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Selection" />;
export const Highlight = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Highlight" />;
export const Annotation = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Annotation" />;
export const Comparison = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Comparison" />;
export const Aggregation = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Aggregation" />;
export const Grouping = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Grouping" />;
export const Pivoting = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Pivoting" />;
export const Ranking = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Ranking" />;
export const Trending = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Trending" />;
export const Forecasting = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Forecasting" />;
export const Anomaly = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Anomaly" />;
export const Correlation = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Correlation" />;
export const Distribution = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Distribution" />;
export const Statistical = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Statistical" />;
export const Pagination = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Pagination" />;
export const Virtualization = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Virtualization" />;
export const LazyLoading = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="LazyLoading" />;
export const Caching = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Caching" />;
export const Responsiveness = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Responsiveness" />;
export const Theming = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Theming" />;
export const Localization = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Localization" />;
export const Accessibility = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Accessibility" />;
export const Keyboard = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Keyboard" />;
export const Print = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Print" />;
export const Realtime = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Realtime" />;
export const Streaming = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Streaming" />;
export const Collaboration = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Collaboration" />;
export const Versioning = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Versioning" />;
export const Audit = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Audit" />;
export const Comments = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Comments" />;
export const Bookmarks = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Bookmarks" />;
export const Alerts = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Alerts" />;
export const Scheduling = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Scheduling" />;
export const Embedding = (props: FeatureProps) => <PlaceholderFeature {...props} featureName="Embedding" />;

