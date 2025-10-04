import { ChartProps, ChartWrapper } from './ChartBase';

const TableChart: React.FC<ChartProps> = ({ config, data, onDrilldown, theme }) => {
  const rows = data.rows || [];
  
  if (rows.length === 0) {
    return (
      <ChartWrapper config={config} theme={theme}>
        <div className="text-center text-gray-500 py-8">No data available</div>
      </ChartWrapper>
    );
  }

  const columns = Object.keys(rows[0]);

  const handleRowClick = (row: any) => {
    if (onDrilldown && config.drilldown) {
      onDrilldown({
        ...row,
        drilldownQuery: config.drilldown.query,
        x: config.drilldown.x,
        y: config.drilldown.y
      });
    }
  };

  return (
    <ChartWrapper config={config} theme={theme}>
      {/* Outer constraint wrapper */}
      <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {/* Inner scrollable container */}
        <div 
          className="border-2 border-gray-200 rounded-lg bg-white"
          style={{ 
            overflowX: 'auto', 
            overflowY: 'auto', 
            maxHeight: '500px',
            width: '100%'
          }}
        >
          <table style={{ 
            borderCollapse: 'collapse',
            display: 'table',
            tableLayout: 'auto'
          }}>
            <thead className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      backgroundColor: theme?.headerBg,
                      minWidth: '120px'
                    }}
                    title={column}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    config.drilldown ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => config.drilldown && handleRowClick(row)}
                  style={{ backgroundColor: rowIndex % 2 === 0 ? theme?.rowEvenBg : theme?.rowOddBg }}
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                      style={{ 
                        color: theme?.textColor,
                        minWidth: '120px',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={row[column] !== null && row[column] !== undefined ? String(row[column]) : '-'}
                    >
                      {row[column] !== null && row[column] !== undefined ? String(row[column]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600 text-center flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
          📊 {rows.length} rows
        </span>
        <span className="text-gray-500">•</span>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
          ↔️ Scroll to see all columns
        </span>
      </div>
    </ChartWrapper>
  );
};

export default TableChart;

