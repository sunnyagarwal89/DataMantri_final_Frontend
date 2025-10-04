// Base interface for all chart components
export interface ChartData {
  labels?: string[];
  datasets?: any[];
  rows?: any[];
  [key: string]: any;
}

export interface ChartConfig {
  id: string;
  type: string;
  title: string;
  query: string;
  x?: string;
  y?: string | string[];
  z?: string;
  data?: ChartData;
  features?: string[];
  drilldown?: {
    query: string;
    x: string;
    y: string;
  };
  theme?: string;
  options?: any;
}

export interface ChartProps {
  config: ChartConfig;
  data: ChartData;
  onDrilldown?: (params: any) => void;
  onExport?: () => void;
  filters?: Record<string, any>;
  theme?: any;
}

// Base Chart Component
export const ChartWrapper: React.FC<{ children: React.ReactNode; config: ChartConfig; theme?: any }> = ({ 
  children, 
  config,
  theme 
}) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl transition-all"
      style={{ 
        ...theme?.chart,
        minWidth: 0,
        overflow: 'hidden',
        maxWidth: '100%'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
        <div className="flex gap-2">
          {config.features?.map((feature) => (
            <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
              {feature}
            </span>
          ))}
        </div>
      </div>
      <div className="chart-content" style={{ minWidth: 0, width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

