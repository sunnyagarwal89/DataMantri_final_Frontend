import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import { ChartProps, ChartWrapper } from './ChartBase';

// Smart number formatting utility with Indian numbering system support
const formatNumber = (value: number, columnName?: string): string => {
  const absValue = Math.abs(value);
  
  // Detect if this is a sales/revenue/amount column (use Indian numbering)
  const isIndianFormat = columnName && (
    columnName.toLowerCase().includes('sales') ||
    columnName.toLowerCase().includes('revenue') ||
    columnName.toLowerCase().includes('amount') ||
    columnName.toLowerCase().includes('margin') ||
    columnName.toLowerCase().includes('target') ||
    columnName.toLowerCase().includes('discount')
  );
  
  if (isIndianFormat) {
    // Indian numbering system
    if (absValue >= 1e7) {
      return (value / 1e7).toFixed(2) + ' Cr';  // Crore
    } else if (absValue >= 1e5) {
      return (value / 1e5).toFixed(2) + ' L';   // Lakh
    } else if (absValue >= 1e3) {
      return (value / 1e3).toFixed(2) + ' K';   // Thousand
    } else {
      return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }
  } else {
    // Western numbering system (for counts, quantities, etc.)
    if (absValue >= 1e9) {
      return (value / 1e9).toFixed(2) + 'B';    // Billion
    } else if (absValue >= 1e6) {
      return (value / 1e6).toFixed(2) + 'M';    // Million
    } else if (absValue >= 1e3) {
      return (value / 1e3).toFixed(2) + 'K';    // Thousand
    } else {
      return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
  }
};

const KPIChart: React.FC<ChartProps> = ({ config, data, theme }) => {
  const rows = data.rows || [];
  
  if (rows.length === 0) {
    return (
      <ChartWrapper config={config} theme={theme}>
        <div className="text-center text-gray-500">No data</div>
      </ChartWrapper>
    );
  }

  const kpiData = rows[0];
  const value = kpiData[config.y as string];
  const label = config.x ? kpiData[config.x] : config.title;
  const change = kpiData.change || 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  // Get column name for smart formatting
  const columnName = config.y as string || config.title || '';
  
  // Generate a unique gradient color for each KPI
  const gradients = [
    'from-blue-500 to-cyan-600',
    'from-green-500 to-emerald-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-purple-600'
  ];
  const gradientIndex = Math.abs((config.title || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <ChartWrapper config={config} theme={theme}>
      <div className={`flex flex-col items-center justify-center py-8 bg-gradient-to-br ${gradient} bg-opacity-5 rounded-xl`}>
        <div className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">{label}</div>
        <div 
          className={`text-6xl font-black mb-4 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        >
          {typeof value === 'number' ? formatNumber(value, columnName) : value}
        </div>
        {change !== 0 && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' :
            trend === 'down' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {trend === 'up' && <TrendingUp className="w-5 h-5" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5" />}
            {trend === 'neutral' && <Minus className="w-5 h-5" />}
            <span className="font-semibold">
              {Math.abs(change)}% {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'no change'}
            </span>
          </div>
        )}
      </div>
    </ChartWrapper>
  );
};

export default KPIChart;

