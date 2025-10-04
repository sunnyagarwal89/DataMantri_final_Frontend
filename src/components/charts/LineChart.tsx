import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, ChartWrapper } from './ChartBase';

// Smart number formatting utility with Indian numbering system
const formatYAxis = (value: number, columnName?: string): string => {
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
    if (absValue >= 1e7) return (value / 1e7).toFixed(1) + ' Cr';
    else if (absValue >= 1e5) return (value / 1e5).toFixed(1) + ' L';
    else if (absValue >= 1e3) return (value / 1e3).toFixed(1) + ' K';
    else return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  } else {
    // Western numbering system
    if (absValue >= 1e9) return (value / 1e9).toFixed(1) + 'B';
    else if (absValue >= 1e6) return (value / 1e6).toFixed(1) + 'M';
    else if (absValue >= 1e3) return (value / 1e3).toFixed(1) + 'K';
    else return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
};

const LineChart: React.FC<ChartProps> = ({ config, data, onDrilldown, theme }) => {
  const chartData = data.rows || [];
  const yColumn = Array.isArray(config.y) ? config.y[0] : config.y;

  const handleClick = (item: any) => {
    if (onDrilldown && config.drilldown) {
      onDrilldown({
        ...item,
        drilldownQuery: config.drilldown.query,
        x: config.drilldown.x,
        y: config.drilldown.y
      });
    }
  };

  return (
    <ChartWrapper config={config} theme={theme}>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsLine data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme?.gridColor || '#e0e0e0'} />
          <XAxis 
            dataKey={config.x} 
            stroke={theme?.axisColor || '#666'}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke={theme?.axisColor || '#666'}
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatYAxis(value, yColumn as string)}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme?.tooltipBg || '#fff',
              border: `1px solid ${theme?.tooltipBorder || '#ccc'}`,
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return formatYAxis(value, yColumn as string);
              }
              return value;
            }}
          />
          <Legend />
          {Array.isArray(config.y) ? (
            config.y.map((yKey, index) => (
              <Line 
                key={yKey}
                type="monotone"
                dataKey={yKey}
                stroke={theme?.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={2}
                dot={{ fill: theme?.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`, r: 4 }}
                onClick={handleClick}
                cursor="pointer"
              />
            ))
          ) : (
            <Line 
              type="monotone"
              dataKey={config.y}
              stroke={theme?.primaryColor || '#3b82f6'}
              strokeWidth={2}
              dot={{ fill: theme?.primaryColor || '#3b82f6', r: 4 }}
              onClick={handleClick}
              cursor="pointer"
            />
          )}
        </RechartsLine>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default LineChart;

