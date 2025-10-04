import { useState, useEffect, Suspense, lazy } from 'react';
import { RefreshCw, Calendar, Filter as FilterIcon, Save, Code, X, Play } from 'lucide-react';
import { ChartRegistry } from './charts';
import ThemeRegistry from './themes';
import { FeatureRegistry } from './features';
import { ChartConfig } from './charts/ChartBase';

interface DashboardSpec {
  id?: string;
  title: string;
  description?: string;
  lastRefreshed?: string;
  theme?: string;
  filters?: FilterConfig[];
  charts: ChartConfig[];
}

interface FilterConfig {
  name: string;
  type: 'dropdown' | 'dateRange' | 'text' | 'number';
  options?: string[];
  default?: any;
  label?: string;
}

interface DashboardRendererProps {
  spec: DashboardSpec;
  onSave?: (spec: DashboardSpec) => void;
  editable?: boolean;
}

const DashboardRenderer: React.FC<DashboardRendererProps> = ({ spec, onSave, editable = false }) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [chartData, setChartData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [lastRefreshed, setLastRefreshed] = useState(spec.lastRefreshed || new Date().toISOString());
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  
  // Query editing states
  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [editedQuery, setEditedQuery] = useState<string>('');
  const [queryError, setQueryError] = useState<string | null>(null);

  // Get theme
  const theme = spec.theme && ThemeRegistry[spec.theme] ? ThemeRegistry[spec.theme] : ThemeRegistry.default;

  // Initialize filters with defaults
  useEffect(() => {
    const initialFilters: Record<string, any> = {};
    spec.filters?.forEach(filter => {
      initialFilters[filter.name] = filter.default || '';
    });
    setFilters(initialFilters);
  }, [spec.filters]);

  // Fetch data for a chart
  const fetchChartData = async (chart: ChartConfig) => {
    setLoading(prev => ({ ...prev, [chart.id]: true }));
    
    try {
      // Replace filter placeholders in query
      let query = chart.query;
      Object.entries(filters).forEach(([key, value]) => {
        query = query.replace(new RegExp(`@${key}`, 'g'), String(value));
      });

      // Call run-query API
      const dataSourceId = (chart as any).dataSourceId || 'default';
      console.log(`[DashboardRenderer] Fetching data for chart ${chart.id} (${chart.title}) with dataSourceId: ${dataSourceId}`);
      
      // Add chart title to URL for easier debugging in network tab
      const chartTitleParam = encodeURIComponent(chart.title);
      const url = `/api/run-query?chart=${chartTitleParam}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Chart-ID': chart.id
          // Note: Removed X-Chart-Title header because emojis in chart titles cause
          // "non ISO-8859-1 code point" error. Chart title is still in URL and body.
        },
        body: JSON.stringify({ 
          query, 
          dataSourceId,
          chartId: chart.id,
          chartTitle: chart.title
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data = await response.json();
      setChartData(prev => ({ ...prev, [chart.id]: { rows: data.rows || [] } }));
    } catch (error) {
      console.error(`Error fetching data for chart ${chart.id}:`, error);
      setChartData(prev => ({ ...prev, [chart.id]: { rows: [], error: String(error) } }));
    } finally {
      setLoading(prev => ({ ...prev, [chart.id]: false }));
    }
  };

  // Fetch all charts
  const fetchAllCharts = () => {
    spec.charts.forEach(chart => {
      fetchChartData(chart);
    });
    setLastRefreshed(new Date().toISOString());
  };

  // Initial fetch when dashboard loads
  useEffect(() => {
    if (spec.charts && spec.charts.length > 0 && !initialFetchDone) {
      console.log('[DashboardRenderer] Initial load - fetching all charts');
      console.log('[DashboardRenderer] Total charts to fetch:', spec.charts.length);
      // Wait a bit for filters to be initialized
      setTimeout(() => {
        fetchAllCharts();
        setInitialFetchDone(true);
      }, 200);
    }
  }, [spec.charts.length, filters]); // Run when spec or filters are ready

  // Fetch charts when filters change (after initial fetch)
  useEffect(() => {
    if (initialFetchDone && Object.keys(filters).length > 0) {
      console.log('[DashboardRenderer] Filters changed - re-fetching charts');
      fetchAllCharts();
    }
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Handle chart drilldown
  const handleDrilldown = async (chartId: string, params: any) => {
    const chart = spec.charts.find(c => c.id === chartId);
    if (!chart || !chart.drilldown) return null;

    let query = chart.drilldown.query;
    Object.entries(params).forEach(([key, value]) => {
      query = query.replace(new RegExp(`@${key}`, 'g'), String(value));
    });

    const response = await fetch('/api/run-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query, 
        dataSourceId: (chart.drilldown as any).dataSourceId || (chart as any).dataSourceId || 'default'
      })
    });

    const data = await response.json();
    return { rows: data.rows || [], query };
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave({ ...spec, lastRefreshed });
    }
  };

  // Handle edit query
  const handleEditQuery = (chartId: string) => {
    const chart = spec.charts.find(c => c.id === chartId);
    if (chart) {
      setEditingChartId(chartId);
      setEditedQuery(chart.query);
      setQueryError(null);
    }
  };

  // Handle save edited query
  const handleSaveQuery = async () => {
    if (!editingChartId || !editedQuery.trim()) {
      setQueryError('Query cannot be empty');
      return;
    }

    try {
      // Test the query first
      const chart = spec.charts.find(c => c.id === editingChartId);
      if (!chart) return;

      const dataSourceId = (chart as any).dataSourceId || 'default';
      
      const response = await fetch('/api/run-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: editedQuery, 
          dataSourceId 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        setQueryError(error.error || 'Query failed');
        return;
      }

      // Update the chart query
      spec.charts = spec.charts.map(c => 
        c.id === editingChartId ? { ...c, query: editedQuery } : c
      );

      // Refetch data for this chart
      fetchChartData(spec.charts.find(c => c.id === editingChartId)!);

      // Close editor
      setEditingChartId(null);
      setEditedQuery('');
      setQueryError(null);
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : 'Failed to save query');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingChartId(null);
    setEditedQuery('');
    setQueryError(null);
  };

  // Render chart component
  const renderChart = (chart: ChartConfig) => {
    const ChartComponent = ChartRegistry[chart.type];
    
    if (!ChartComponent) {
      return (
        <div className="bg-white rounded-xl p-6 border-2 border-red-200">
          <p className="text-red-600">Unknown chart type: {chart.type}</p>
        </div>
      );
    }

    const data = chartData[chart.id] || { rows: [] };
    const isLoading = loading[chart.id];

    return (
      <Suspense fallback={
        <div className="bg-white rounded-xl p-6 flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        {isLoading ? (
          <div className="bg-white rounded-xl p-6 flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ChartComponent
            config={chart}
            data={data}
            theme={theme}
            filters={filters}
            onDrilldown={chart.drilldown ? (params: any) => handleDrilldown(chart.id, params) : undefined}
          />
        )}
      </Suspense>
    );
  };

  return (
    <div 
      className="w-full min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"
      style={{ 
        color: theme.dashboard.text,
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Dashboard Header with Colorful Gradient */}
      <div 
        className="relative rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden border border-gray-200/50"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        {/* Animated background blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-black mb-3 text-white drop-shadow-lg">{spec.title}</h1>
              {spec.description && (
                <p className="text-xl text-white/90 font-medium">{spec.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAllCharts}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition shadow-lg hover:shadow-xl text-white font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              {editable && onSave && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition shadow-lg hover:shadow-xl text-white font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
            <Calendar className="w-4 h-4" />
            Last refreshed: {new Date(lastRefreshed).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters with Gradient */}
      {spec.filters && spec.filters.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-200/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <FilterIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {spec.filters.map(filter => (
              <div key={filter.name}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {filter.label || filter.name}
                </label>
                {filter.type === 'dropdown' ? (
                  <select
                    value={filters[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gradient-to-r from-white to-blue-50 font-medium transition shadow-sm hover:shadow-md"
                  >
                    <option value="">All</option>
                    {filter.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : filter.type === 'dateRange' ? (
                  <input
                    type="date"
                    value={filters[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gradient-to-r from-white to-blue-50 font-medium transition shadow-sm hover:shadow-md"
                  />
                ) : (
                  <input
                    type={filter.type === 'number' ? 'number' : 'text'}
                    value={filters[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gradient-to-r from-white to-blue-50 font-medium transition shadow-sm hover:shadow-md"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid - Lovable Style */}
      <div className="space-y-6" style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
        {/* KPI Cards Row - 3 or 4 columns */}
        {spec.charts.filter(c => c.type === 'kpi').length > 0 && (
          <div className={`grid gap-6 ${
            spec.charts.filter(c => c.type === 'kpi').length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
            spec.charts.filter(c => c.type === 'kpi').length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {spec.charts.filter(c => c.type === 'kpi').map(chart => (
              <div key={chart.id} className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                {editable && (
                  <button
                    onClick={() => handleEditQuery(chart.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 border border-gray-200"
                    title="Edit SQL Query"
                  >
                    <Code className="w-4 h-4" />
                    Edit Query
                  </button>
                )}
                {renderChart(chart)}
              </div>
            ))}
          </div>
        )}

        {/* Line Charts (Trends) - Full width or 2 columns */}
        {spec.charts.filter(c => c.type === 'line').length > 0 && (
          <div className={`grid gap-6 ${
            spec.charts.filter(c => c.type === 'line').length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {spec.charts.filter(c => c.type === 'line').map(chart => (
              <div key={chart.id} className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                {editable && (
                  <button
                    onClick={() => handleEditQuery(chart.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 border border-gray-200"
                    title="Edit SQL Query"
                  >
                    <Code className="w-4 h-4" />
                    Edit Query
                  </button>
                )}
                {renderChart(chart)}
              </div>
            ))}
          </div>
        )}

        {/* Bar and Pie Charts - 2 columns */}
        {spec.charts.filter(c => c.type === 'bar' || c.type === 'pie').length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {spec.charts.filter(c => c.type === 'bar' || c.type === 'pie').map(chart => (
              <div key={chart.id} className="relative bg-white rounded-xl shadow-lg overflow-hidden min-w-0">
                {editable && (
                  <button
                    onClick={() => handleEditQuery(chart.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 border border-gray-200"
                    title="Edit SQL Query"
                  >
                    <Code className="w-4 h-4" />
                    Edit Query
                  </button>
                )}
                {renderChart(chart)}
              </div>
            ))}
          </div>
        )}

        {/* Tables - Full width */}
        {spec.charts.filter(c => c.type === 'table').map(chart => (
          <div key={chart.id} className="relative bg-white rounded-xl shadow-lg overflow-hidden min-w-0 w-full">
            {editable && (
              <button
                onClick={() => handleEditQuery(chart.id)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 border border-gray-200"
                title="Edit SQL Query"
              >
                <Code className="w-4 h-4" />
                Edit Query
              </button>
            )}
            {renderChart(chart)}
          </div>
        ))}

        {/* Other chart types - 2 columns */}
        {spec.charts.filter(c => !['kpi', 'line', 'bar', 'pie', 'table'].includes(c.type)).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {spec.charts.filter(c => !['kpi', 'line', 'bar', 'pie', 'table'].includes(c.type)).map(chart => (
              <div key={chart.id} className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                {editable && (
                  <button
                    onClick={() => handleEditQuery(chart.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 border border-gray-200"
                    title="Edit SQL Query"
                  >
                    <Code className="w-4 h-4" />
                    Edit Query
                  </button>
                )}
                {renderChart(chart)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Query Editor Modal */}
      {editingChartId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Edit SQL Query</h3>
                  <p className="text-sm text-white/80">
                    {spec.charts.find(c => c.id === editingChartId)?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SQL Query:
                </label>
                <textarea
                  value={editedQuery}
                  onChange={(e) => setEditedQuery(e.target.value)}
                  className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-sm resize-none"
                  placeholder="SELECT column FROM table WHERE condition"
                  spellCheck={false}
                />
              </div>

              {/* Query Tips */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use <code className="bg-blue-100 px-1 rounded">@filter_name</code> for dynamic filters</li>
                  <li>• Test your query before saving to avoid errors</li>
                  <li>• Include appropriate column aliases for chart display</li>
                </ul>
              </div>

              {/* Error Message */}
              {queryError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 mb-4">
                  <strong>Error:</strong> {queryError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuery}
                disabled={!editedQuery.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Test & Save Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardRenderer;

