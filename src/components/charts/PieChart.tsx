import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, ChartWrapper } from './ChartBase';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const PieChart: React.FC<ChartProps> = ({ config, data, onDrilldown, theme }) => {
  const chartData = data.rows || [];

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
        <RechartsPie>
          <Pie
            data={chartData}
            dataKey={config.y as string}
            nameKey={config.x}
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => `${entry[config.x!]}: ${entry[config.y!]}`}
            onClick={handleClick}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={theme?.colors?.[index] || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme?.tooltipBg || '#fff',
              border: `1px solid ${theme?.tooltipBorder || '#ccc'}`,
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default PieChart;

