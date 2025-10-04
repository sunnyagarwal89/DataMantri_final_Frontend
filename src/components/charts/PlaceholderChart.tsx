import { ChartProps, ChartWrapper } from './ChartBase';

// Generic placeholder for charts not yet fully implemented
const PlaceholderChart: React.FC<ChartProps & { chartType: string }> = ({ config, data, chartType, theme }) => {
  const rows = data.rows || [];
  
  return (
    <ChartWrapper config={config} theme={theme}>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2 capitalize">{chartType} Chart</h4>
        <p className="text-gray-600 mb-4">Data loaded: {rows.length} rows</p>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 max-w-md">
          <p className="text-sm text-gray-700">
            This chart type is available and will be rendered once the full implementation is complete.
            Data is ready and can be visualized.
          </p>
        </div>
      </div>
    </ChartWrapper>
  );
};

export default PlaceholderChart;

// Export named components for all placeholder charts
export const DonutChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="donut" />;
export const ScatterChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="scatter" />;
export const BubbleChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="bubble" />;
export const RadarChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="radar" />;
export const PolarChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="polar" />;
export const HeatmapChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="heatmap" />;
export const TreemapChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="treemap" />;
export const SankeyChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="sankey" />;
export const FunnelChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="funnel" />;
export const GaugeChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="gauge" />;
export const WaterfallChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="waterfall" />;
export const BoxPlotChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="boxplot" />;
export const ViolinChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="violin" />;
export const CandlestickChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="candlestick" />;
export const OHLCChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="ohlc" />;
export const GanttChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="gantt" />;
export const TimelineChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="timeline" />;
export const CalendarChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="calendar" />;
export const SunburstChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="sunburst" />;
export const ChordChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="chord" />;
export const NetworkChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="network" />;
export const MapChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="map" />;
export const ChoroplethChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="choropleth" />;
export const WordCloudChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="wordcloud" />;
export const BulletChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="bullet" />;
export const HistogramChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="histogram" />;
export const DensityChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="density" />;
export const ContourChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="contour" />;
export const QQChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="qq" />;
export const RegressionChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="regression" />;
export const CorrelationChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="correlation" />;
export const DistributionChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="distribution" />;
export const ParallelChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="parallel" />;
export const SpiderChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="spider" />;
export const StreamChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="stream" />;
export const MetricChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="metric" />;
export const SparklineChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="sparkline" />;
export const ProgressChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="progress" />;
export const ComparisonChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="comparison" />;
export const CohortChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="cohort" />;
export const RetentionChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="retention" />;
export const ConversionChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="conversion" />;
export const PyramidChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="pyramid" />;
export const MarimekkoChart = (props: ChartProps) => <PlaceholderChart {...props} chartType="marimekko" />;

