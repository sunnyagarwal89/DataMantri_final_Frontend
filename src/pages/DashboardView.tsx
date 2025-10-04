import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Edit,
  Download,
  FileText,
  FileDown,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Dashboard {
  id: string;
  title: string;
  description: string;
  spec: {
    name: string;
    theme: string;
    header: {
      title: string;
      subtitle: string;
      showLogo: boolean;
    };
    charts: Array<{
      id: string;
      type: string;
      title: string;
      query: string;
      position: { x: number; y: number; w: number; h: number };
    }>;
    filters: Array<{
      id: string;
      name: string;
      label: string;
      type: string;
      options?: string[];
    }>;
    dataSourceId?: string;
  };
  created_at: string;
  updated_at: string;
}

const DashboardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [chartData, setChartData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const themes = [
    { id: 'default', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] },
    { id: 'dark', colors: ['#1e293b', '#334155', '#475569', '#64748b'] },
    { id: 'corporate', colors: ['#1e40af', '#1e3a8a', '#1e2845', '#111827'] },
    { id: 'ocean', colors: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9'] },
    { id: 'sunset', colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa'] },
    { id: 'forest', colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'] }
  ];

  useEffect(() => {
    if (id) {
      fetchDashboard();
    }
  }, [id]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/get-dashboards`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const foundDashboard = data.dashboards?.find((d: Dashboard) => d.id === id);
        
        if (foundDashboard) {
          setDashboard(foundDashboard);
          // Execute all queries
          if (foundDashboard.spec?.charts) {
            foundDashboard.spec.charts.forEach((chart: any) => {
              // Check for dataSourceId in multiple locations
              const dataSourceId = chart.dataSourceId || foundDashboard.spec.dataSourceId;
              if (chart.query && dataSourceId) {
                executeQuery(chart, dataSourceId);
              }
            });
          }
        } else {
          toast({
            title: '❌ Error',
            description: 'Dashboard not found',
            variant: 'destructive'
          });
          navigate('/all-dashboards');
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async (chart: any, dataSourceId: string) => {
    try {
      const response = await fetch('/api/run-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: chart.query,
          dataSourceId: dataSourceId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(prev => ({ ...prev, [chart.id]: data }));
      }
    } catch (error) {
      console.error('Failed to execute query:', error);
    }
  };

  const handleDownload = async (format: 'pdf' | 'csv' | 'excel') => {
    toast({
      title: '📥 Downloading',
      description: `Preparing ${format.toUpperCase()} export...`
    });

    // Mock download
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: '✅ Download Complete',
      description: `Dashboard exported as ${format.toUpperCase()}`
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
    toast({
      title: '✅ Refreshed',
      description: 'Dashboard data updated'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const theme = themes.find(t => t.id === dashboard.spec?.theme) || themes[0];
  const themeColors = theme.colors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/all-dashboards')}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Dashboards
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <div className="relative group">
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 rounded-t-xl transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  className="w-full px-4 py-3 text-left hover:bg-green-50 text-green-600 transition flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Download CSV
                </button>
                <button
                  onClick={() => handleDownload('excel')}
                  className="w-full px-4 py-3 text-left hover:bg-emerald-50 text-emerald-600 rounded-b-xl transition flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Excel
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate(`/dashboard-builder?edit=${id}`)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Dashboard Header */}
          <div
            className="p-8 text-white"
            style={{ background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` }}
          >
            <h1 className="text-4xl font-bold mb-2">
              {dashboard.spec?.header?.title || dashboard.title}
            </h1>
            <p className="text-lg opacity-90">
              {dashboard.spec?.header?.subtitle || dashboard.description}
            </p>
          </div>

          {/* Dashboard Metadata */}
          <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold">Created by:</span>
                <span className="text-gray-700">{dashboard.user_id || 'demo'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Created:</span>
                <span className="text-gray-700">
                  {dashboard.createdAt ? new Date(dashboard.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Last modified:</span>
                <span className="text-gray-700">
                  {dashboard.updatedAt ? new Date(dashboard.updatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Filters */}
          {dashboard.spec?.filters && dashboard.spec.filters.length > 0 && (
            <div className="p-6 bg-gray-50 border-b">
              <div className="grid grid-cols-3 gap-4">
                {dashboard.spec.filters.map(filter => (
                  <div key={filter.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {filter.label}
                    </label>
                    {filter.type === 'dropdown' ? (
                      <select className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg">
                        <option>Select {filter.label}</option>
                        {filter.options?.map((opt, optIdx) => (
                          <option key={`${filter.id}-opt-${optIdx}`}>{opt}</option>
                        ))}
                      </select>
                    ) : filter.type === 'date' ? (
                      <input type="date" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg" />
                    ) : (
                      <input
                        type={filter.type}
                        placeholder={filter.label}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="p-6">
            {dashboard.spec?.charts && dashboard.spec.charts.length > 0 ? (
              <div className="grid grid-cols-12 gap-6">
                {dashboard.spec.charts.map((chart, idx) => {
                  const data = chartData[chart.id];
                  // Handle charts without position data (older dashboards)
                  const colSpan = chart.position?.w || 6;
                  const heightClass = chart.position?.h === 1 ? 'h-48' : chart.position?.h === 2 ? 'h-64' : chart.position?.h === 3 ? 'h-80' : 'h-96';

                  return (
                    <div
                      key={chart.id}
                      className="p-6 bg-white border-2 rounded-xl shadow-md"
                      style={{
                        borderColor: themeColors[idx % themeColors.length],
                        gridColumn: `span ${colSpan}`
                      }}
                    >
                      <h3
                        className="text-lg font-bold mb-4"
                        style={{ color: themeColors[idx % themeColors.length] }}
                      >
                        {chart.title}
                      </h3>

                      <div className={`${heightClass} flex items-center justify-center bg-gray-50 rounded-lg overflow-auto`}>
                        {data ? (
                          chart.type === 'kpi' ? (
                            (() => {
                              const rows = data.rows || data.data || [];
                              const firstRow = rows[0] || {};
                              const firstKey = Object.keys(firstRow)[0];
                              const value = firstRow[firstKey];

                              return (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <div
                                    className="text-5xl font-bold"
                                    style={{ color: themeColors[idx % themeColors.length] }}
                                  >
                                    {typeof value === 'number' ? value.toLocaleString() : (value || 'N/A')}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-2">{chart.title}</p>
                                </div>
                              );
                            })()
                          ) : chart.type === 'table' ? (
                            (() => {
                              const rows = data.rows || data.data || [];
                              const columns = data.columns || (rows[0] ? Object.keys(rows[0]) : []);

                              return (
                                <div className="w-full h-full overflow-auto p-4">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                      <tr>
                                        {columns.map((col: string) => (
                                          <th key={col} className="px-4 py-2 text-left font-semibold">{col}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rows.slice(0, 10).map((row: any, i: number) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                          {columns.map((col: string) => (
                                            <td key={col} className="px-4 py-2">{row[col]}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()
                          ) : (
                            (() => {
                              const rows = data.rows || data.data || [];
                              if (rows.length === 0) {
                                return (
                                  <div className="text-center">
                                    <div className="text-4xl mb-2">📊</div>
                                    <p className="text-sm text-gray-500">{chart.type.toUpperCase()} Chart</p>
                                    <p className="text-xs text-yellow-600 mt-2">No data available</p>
                                  </div>
                                );
                              }
                              
                              // Get first few rows for visualization
                              const displayRows = rows.slice(0, 8);
                              const keys = Object.keys(displayRows[0] || {});
                              const labelKey = keys[0] || '';
                              const valueKey = keys[1] || keys[0] || '';
                              
                              // Calculate max value for scaling
                              const values = displayRows.map((row: any) => parseFloat(row[valueKey]) || 0);
                              const maxValue = Math.max(...values, 1);
                              
                              return (
                                <div className="w-full h-full flex flex-col">
                                  {/* Chart Title */}
                                  <div className="text-center mb-4">
                                    <p className="text-sm font-semibold text-gray-700">{chart.type.toUpperCase()} Chart</p>
                                    <p className="text-xs text-green-600">{rows.length} rows</p>
                                  </div>
                                  
                  {/* Bar Chart Visualization */}
                  {chart.type === 'bar' && (
                    <div className="flex-1 flex flex-col justify-end">
                      {/* Chart area with fixed height for better bar scaling */}
                      <div className="relative h-64 flex items-end justify-around gap-2 px-4">
                        {displayRows.map((row: any, i: number) => {
                          const value = parseFloat(row[valueKey]) || 0;
                          // Scale bars: map to 60px-240px range (full height)
                          const minValue = Math.min(...values);
                          const range = maxValue - minValue;
                          const normalizedValue = range > 0 ? ((value - minValue) / range) : 0;
                          const barHeight = 60 + (normalizedValue * 180); // 60px to 240px
                          const color = themeColors[i % themeColors.length];
                          
                          return (
                            <div key={i} className="flex flex-col items-center gap-2" style={{ width: `${100 / displayRows.length}%`, maxWidth: '100px' }}>
                              <div className="text-xs font-semibold" style={{ color }}>{value.toLocaleString()}</div>
                              <div 
                                className="w-full rounded-t transition-all"
                                style={{ 
                                  height: `${barHeight}px`,
                                  backgroundColor: color,
                                  opacity: 0.9
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {/* X-axis labels */}
                      <div className="flex justify-around gap-2 px-4 mt-2">
                        {displayRows.map((row: any, i: number) => (
                          <div key={i} className="text-xs text-gray-600 truncate text-center" style={{ width: `${100 / displayRows.length}%`, maxWidth: '100px' }} title={String(row[labelKey])}>
                            {String(row[labelKey]).substring(0, 10)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                                  
                                  {/* Line Chart Visualization */}
                                  {chart.type === 'line' && (
                                    <div className="flex-1 flex flex-col px-4 pb-8">
                                      {/* Line chart container */}
                                      <div className="relative flex-1">
                                        {/* Y-axis labels */}
                                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                                          <span>{maxValue.toLocaleString()}</span>
                                          <span>{Math.floor(maxValue / 2).toLocaleString()}</span>
                                          <span>0</span>
                                        </div>
                                        
                                        {/* Line chart */}
                                        <svg className="w-full h-full ml-8" viewBox={`0 0 ${displayRows.length * 100} 100`} preserveAspectRatio="none">
                                          {/* Grid lines */}
                                          <line x1="0" y1="0" x2={displayRows.length * 100} y2="0" stroke="#e5e7eb" strokeWidth="0.5" />
                                          <line x1="0" y1="50" x2={displayRows.length * 100} y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
                                          <line x1="0" y1="100" x2={displayRows.length * 100} y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
                                          
                                          {/* Line path */}
                                          <polyline
                                            points={displayRows.map((row: any, i: number) => {
                                              const value = parseFloat(row[valueKey]) || 0;
                                              const x = i * 100 + 50;
                                              const y = 100 - ((value / maxValue) * 95);
                                              return `${x},${y}`;
                                            }).join(' ')}
                                            fill="none"
                                            stroke={themeColors[0]}
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                          
                                          {/* Data points and labels */}
                                          {displayRows.map((row: any, i: number) => {
                                            const value = parseFloat(row[valueKey]) || 0;
                                            const x = i * 100 + 50;
                                            const y = 100 - ((value / maxValue) * 95);
                                            return (
                                              <g key={i}>
                                                {/* Data point circle */}
                                                <circle
                                                  cx={x}
                                                  cy={y}
                                                  r="4"
                                                  fill={themeColors[0]}
                                                  stroke="white"
                                                  strokeWidth="2"
                                                />
                                                {/* Value label above the point */}
                                                <text
                                                  x={x}
                                                  y={y - 8}
                                                  textAnchor="middle"
                                                  fontSize="10"
                                                  fontWeight="600"
                                                  fill={themeColors[0]}
                                                  style={{ userSelect: 'none' }}
                                                >
                                                  {value.toLocaleString()}
                                                </text>
                                              </g>
                                            );
                                          })}
                                        </svg>
                                      </div>
                                      
                                      {/* X-axis labels */}
                                      <div className="flex justify-around mt-4 ml-8">
                                        {displayRows.map((row: any, i: number) => (
                                          <div key={i} className="text-xs text-gray-600 text-center" style={{ width: `${100 / displayRows.length}%` }}>
                                            <div className="font-semibold" style={{ color: themeColors[0] }}>
                                              {parseFloat(row[valueKey]).toLocaleString()}
                                            </div>
                                            <div className="truncate" title={String(row[labelKey])}>
                                              {String(row[labelKey]).substring(0, 8)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Pie Chart */}
                                  {chart.type === 'pie' && (
                                    <div className="flex-1 flex items-center justify-center">
                                      <div className="relative w-48 h-48">
                                        <div className="absolute inset-0 rounded-full" style={{
                                          background: `conic-gradient(${displayRows.map((row: any, i: number) => {
                                            const value = parseFloat(row[valueKey]) || 0;
                                            const total = values.reduce((sum, v) => sum + v, 0);
                                            const color = themeColors[i % themeColors.length];
                                            const startPercent = i === 0 ? 0 : displayRows.slice(0, i).reduce((sum, r, j) => sum + ((parseFloat(r[valueKey]) || 0) / total) * 100, 0);
                                            const endPercent = displayRows.slice(0, i + 1).reduce((sum, r, j) => sum + ((parseFloat(r[valueKey]) || 0) / total) * 100, 0);
                                            return `${color} ${startPercent}%, ${color} ${endPercent}%`;
                                          }).join(', ')})`
                                        }} />
                                        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                                          <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-700">{rows.length}</div>
                                            <div className="text-xs text-gray-500">items</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Area Chart */}
                                  {chart.type === 'area' && (
                                    <div className="flex-1 flex items-end justify-around gap-2 px-4 pb-8">
                                      {displayRows.map((row: any, i: number) => {
                                        const value = parseFloat(row[valueKey]) || 0;
                                        const height = Math.max((value / maxValue) * 90, 5);
                                        const color = themeColors[0];
                                        
                                        return (
                                          <div key={i} className="flex flex-col items-center gap-1" style={{ width: `${100 / displayRows.length}%`, maxWidth: '80px' }}>
                                            <div className="text-xs font-semibold" style={{ color }}>{value.toLocaleString()}</div>
                                            <div 
                                              className="w-full rounded-t transition-all"
                                              style={{ 
                                                height: `${height}%`,
                                                minHeight: '30px',
                                                background: `linear-gradient(to top, ${color}, ${color}40)`,
                                              }}
                                            />
                                            <div className="text-xs text-gray-600 truncate w-full text-center" title={String(row[labelKey])}>
                                              {String(row[labelKey]).substring(0, 8)}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          )
                        ) : (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Loading data...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p>No charts configured</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

