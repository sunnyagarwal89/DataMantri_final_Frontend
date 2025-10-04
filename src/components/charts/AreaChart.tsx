import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, ChartWrapper } from './ChartBase';

const AreaChart: React.FC<ChartProps> = ({ config, data, theme }) => {
  const chartData = data.rows || [];

  return (
    <ChartWrapper config={config} theme={theme}>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsArea data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme?.primaryColor || '#3b82f6'} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme?.primaryColor || '#3b82f6'} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme?.gridColor || '#e0e0e0'} />
          <XAxis 
            dataKey={config.x} 
            stroke={theme?.axisColor || '#666'}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke={theme?.axisColor || '#666'}
            style={{ fontSize: '12px' }}
          />
          <Tooltip />
          <Legend />
          {Array.isArray(config.y) ? (
            config.y.map((yKey, index) => (
              <Area 
                key={yKey}
                type="monotone"
                dataKey={yKey}
                stroke={theme?.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`}
                fill={`url(#colorValue)`}
              />
            ))
          ) : (
            <Area 
              type="monotone"
              dataKey={config.y}
              stroke={theme?.primaryColor || '#3b82f6'}
              fill="url(#colorValue)"
            />
          )}
        </RechartsArea>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default AreaChart;

