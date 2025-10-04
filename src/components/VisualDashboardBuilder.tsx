import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Database,
  Search,
  Trash2,
  Edit,
  Save,
  Play,
  Filter,
  Palette,
  Layout,
  Table2,
  Target,
  TrendingUp,
  Activity,
  Eye,
  Settings,
  Code,
  ChevronDown,
  ChevronUp,
  GripVertical,
  X,
  Copy,
  Boxes,
  Sparkles,
  FolderOpen,
  Zap,
  Layers,
  Grid3x3,
  MousePointer2,
  Maximize2,
  Type,
  SlidersHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interfaces
interface DataSource {
  id: string;
  name: string;
  connection_type: string;
}

interface DataMart {
  id: number;
  name: string;
  query: string;
}

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'table' | 'kpi' | 'area';
  title: string;
  query: string;
  xAxis?: string;
  yAxis?: string;
  position: { x: number; y: number; w: number; h: number }; // Grid position
}

interface FilterConfig {
  id: string;
  name: string;
  type: 'dropdown' | 'date' | 'text' | 'number';
  label: string;
  options?: string[];
  defaultValue?: any;
  position: { x: number; y: number; w: number }; // Grid position for filters
}

interface HeaderConfig {
  title: string;
  subtitle: string;
  showLogo: boolean;
}

interface DashboardConfig {
  name: string;
  description: string;
  theme: string;
  header: HeaderConfig;
  filters: FilterConfig[];
  charts: ChartConfig[];
  dataSourceId?: string;
  dataMartId?: number;
}

interface VisualDashboardBuilderProps {
  editingDashboard?: {
    id: string;
    title: string;
    description: string;
    spec: any;
  } | null;
}

const VisualDashboardBuilder: React.FC<VisualDashboardBuilderProps> = ({ editingDashboard }) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [config, setConfig] = useState<DashboardConfig>({
    name: '',
    description: '',
    theme: 'default',
    header: { title: '', subtitle: '', showLogo: true },
    filters: [],
    charts: []
  });

  // Data selection
  const [dataMode, setDataMode] = useState<'datasource' | 'datamart'>('datasource');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataMarts, setDataMarts] = useState<DataMart[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [selectedDataMart, setSelectedDataMart] = useState<number | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [loadingTables, setLoadingTables] = useState(false);

  // UI State
  const [isSelectionCollapsed, setIsSelectionCollapsed] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartConfig | null>(null);
  const [showQueryEditor, setShowQueryEditor] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showHeaderDialog, setShowHeaderDialog] = useState(false);
  const [showSavedDashboards, setShowSavedDashboards] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [savedDashboards, setSavedDashboards] = useState<any[]>([]);
  const [loadingDashboards, setLoadingDashboards] = useState(false);

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, color: 'from-blue-500 to-blue-600', emoji: '📊' },
    { id: 'line', name: 'Line Chart', icon: LineChartIcon, color: 'from-green-500 to-green-600', emoji: '📈' },
    { id: 'pie', name: 'Pie Chart', icon: PieChartIcon, color: 'from-purple-500 to-purple-600', emoji: '🥧' },
    { id: 'area', name: 'Area Chart', icon: Activity, color: 'from-orange-500 to-orange-600', emoji: '📉' },
    { id: 'kpi', name: 'KPI Card', icon: Target, color: 'from-red-500 to-red-600', emoji: '🎯' },
    { id: 'table', name: 'Data Table', icon: Table2, color: 'from-gray-500 to-gray-600', emoji: '📋' }
  ];

  const themes = [
    { id: 'default', name: 'Default', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'], emoji: '🔵' },
    { id: 'dark', name: 'Dark', colors: ['#1e293b', '#334155', '#475569', '#64748b'], emoji: '⚫' },
    { id: 'corporate', name: 'Corporate', colors: ['#1e40af', '#1e3a8a', '#1e2845', '#111827'], emoji: '💼' },
    { id: 'ocean', name: 'Ocean', colors: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9'], emoji: '🌊' },
    { id: 'sunset', name: 'Sunset', colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa'], emoji: '🌅' },
    { id: 'forest', name: 'Forest', colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'], emoji: '🌲' }
  ];

  // Fetch data sources and data marts
  useEffect(() => {
    fetch('/api/data-sources', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setDataSources(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch('/api/data-marts', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setDataMarts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Load dashboard config when editing
  useEffect(() => {
    if (editingDashboard && editingDashboard.spec) {
      const spec = editingDashboard.spec;
      
      // Ensure all charts have position data (for backwards compatibility)
      const chartsWithPosition = (spec.charts || []).map((chart: any) => ({
        ...chart,
        position: chart.position || { x: 0, y: 0, w: 6, h: 2 }
      }));
      
      setConfig({
        name: editingDashboard.title,
        description: editingDashboard.description || '',
        theme: spec.theme || 'default',
        header: spec.header || { title: '', subtitle: '', showLogo: true },
        filters: spec.filters || [],
        charts: chartsWithPosition,
        dataSourceId: spec.dataSourceId,
        dataMartId: spec.dataMartId
      });
      
      // Set data mode and selection based on spec
      if (spec.dataMartId) {
        setDataMode('datamart');
        setSelectedDataMart(spec.dataMartId);
      } else if (spec.dataSourceId || (spec.charts && spec.charts[0]?.dataSourceId)) {
        setDataMode('datasource');
        const sourceId = spec.dataSourceId || spec.charts[0]?.dataSourceId;
        setSelectedDataSource(sourceId);
        
        // Try to extract table name from first chart's query
        if (spec.charts && spec.charts[0]?.query) {
          const query = spec.charts[0].query.toLowerCase();
          // Extract table name from "FROM tablename" pattern
          const fromMatch = query.match(/from\s+([a-z0-9_]+)/i);
          if (fromMatch && fromMatch[1]) {
            setSelectedTable(fromMatch[1]);
          }
        }
      }
      
      // Collapse selection panel since data is already selected
      setIsSelectionCollapsed(true);

      toast({
        title: '✅ Dashboard Loaded',
        description: 'Editing existing dashboard'
      });
    }
  }, [editingDashboard]);

  // Fetch tables when data source is selected
  useEffect(() => {
    if (selectedDataSource && dataMode === 'datasource') {
      setLoadingTables(true);
      fetch(`/api/data-sources/${selectedDataSource}/schema`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          const tableNames = Object.keys(data.schema || {});
          setTables(tableNames);
        })
        .catch(console.error)
        .finally(() => setLoadingTables(false));
    }
  }, [selectedDataSource, dataMode]);

  // Auto-collapse when selection is complete
  useEffect(() => {
    if ((dataMode === 'datasource' && selectedDataSource && selectedTable) ||
        (dataMode === 'datamart' && selectedDataMart)) {
      const timer = setTimeout(() => {
        setIsSelectionCollapsed(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsSelectionCollapsed(false);
    }
  }, [selectedTable, selectedDataMart, selectedDataSource, dataMode]);

  const filteredTables = tables.filter(t => t.toLowerCase().includes(tableSearchTerm.toLowerCase()));

  // Find next available grid position
  const getNextPosition = (items: any[], itemWidth: number = 6, itemHeight: number = 4) => {
    const gridCols = 12;
    const occupied = new Set<string>();
    
    items.forEach(item => {
      for (let x = item.position.x; x < item.position.x + item.position.w; x++) {
        for (let y = item.position.y; y < item.position.y + item.position.h; y++) {
          occupied.add(`${x},${y}`);
        }
      }
    });

    // Find first available position
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= gridCols - itemWidth; x++) {
        let fits = true;
        for (let dx = 0; dx < itemWidth; dx++) {
          for (let dy = 0; dy < itemHeight; dy++) {
            if (occupied.has(`${x + dx},${y + dy}`)) {
              fits = false;
              break;
            }
          }
          if (!fits) break;
        }
        if (fits) {
          return { x, y, w: itemWidth, h: itemHeight };
        }
      }
    }
    return { x: 0, y: 0, w: itemWidth, h: itemHeight };
  };

  const handleAddChart = (type: string) => {
    const position = getNextPosition(config.charts);
    
    // Pre-fill query with selected table info
    let defaultQuery = '';
    if (dataMode === 'datasource' && selectedTable) {
      defaultQuery = `-- Query for ${selectedTable}\nSELECT * FROM ${selectedTable} LIMIT 100`;
    } else if (dataMode === 'datamart' && selectedDataMart) {
      const dataMart = dataMarts.find(dm => dm.id === selectedDataMart);
      defaultQuery = `-- Query for Data Mart: ${dataMart?.name}\nSELECT * FROM ${dataMart?.name} LIMIT 100`;
    }
    
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: type as any,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      query: defaultQuery,
      position
    };
    setConfig({ ...config, charts: [...config.charts, newChart] });
    
    // Automatically open query editor for new chart
    setSelectedChart(newChart);
    setShowQueryEditor(true);
    toast({ title: '✨ Chart Added', description: `Configure your query` });
  };

  const handleAddFilter = (filter: FilterConfig) => {
    const position = getNextPosition(config.filters, 3, 1);
    const newFilter = { ...filter, position };
    setConfig({ ...config, filters: [...config.filters, newFilter] });
    setShowFilterDialog(false);
    toast({ title: '✨ Filter Added', description: 'Filter added to dashboard' });
  };

  const handleUpdateChart = (updatedChart: ChartConfig) => {
    setConfig({
      ...config,
      charts: config.charts.map(c => c.id === updatedChart.id ? updatedChart : c)
    });
    setSelectedChart(null);
    setShowQueryEditor(false);
    toast({ title: '✅ Chart Updated', description: 'Chart configuration saved' });
  };

  const handleDeleteChart = (chartId: string) => {
    setConfig({
      ...config,
      charts: config.charts.filter(c => c.id !== chartId)
    });
    toast({ title: '🗑️ Chart Deleted', description: 'Chart removed from canvas' });
  };

  const handleDeleteFilter = (filterId: string) => {
    setConfig({
      ...config,
      filters: config.filters.filter(f => f.id !== filterId)
    });
    toast({ title: '🗑️ Filter Deleted', description: 'Filter removed' });
  };

  const handleDragStart = (e: React.DragEvent, item: any, type: 'chart' | 'filter') => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: any, targetType: 'chart' | 'filter') => {
    e.preventDefault();
    if (!draggedItem) return;

    // Swap positions
    if (draggedItem.type === 'chart' && targetType === 'chart') {
      const newCharts = config.charts.map(c => {
        if (c.id === draggedItem.item.id) return { ...c, position: targetItem.position };
        if (c.id === targetItem.id) return { ...c, position: draggedItem.item.position };
        return c;
      });
      setConfig({ ...config, charts: newCharts });
    } else if (draggedItem.type === 'filter' && targetType === 'filter') {
      const newFilters = config.filters.map(f => {
        if (f.id === draggedItem.item.id) return { ...f, position: targetItem.position };
        if (f.id === targetItem.id) return { ...f, position: draggedItem.item.position };
        return f;
      });
      setConfig({ ...config, filters: newFilters });
    }

    setDraggedItem(null);
    toast({ title: '✅ Repositioned', description: 'Item moved successfully' });
  };

  const fetchSavedDashboards = async () => {
    setLoadingDashboards(true);
    try {
      const response = await fetch('/api/get-dashboards', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedDashboards(data.dashboards || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
      toast({ title: '❌ Error', description: 'Failed to load dashboards', variant: 'destructive' });
    } finally {
      setLoadingDashboards(false);
    }
  };

  const loadDashboard = (dashboard: any) => {
    try {
      const spec = dashboard.spec;
      setConfig({
        name: spec.name || dashboard.title,
        description: spec.description || dashboard.description,
        theme: spec.theme || 'default',
        header: spec.header || { title: '', subtitle: '', showLogo: true },
        charts: spec.charts || [],
        filters: spec.filters || []
      });
      
      // Restore data source selection
      if (spec.dataSourceId) {
        setDataMode('datasource');
        setSelectedDataSource(spec.dataSourceId);
      } else if (spec.dataMartId) {
        setDataMode('datamart');
        setSelectedDataMart(spec.dataMartId);
      }
      
      setShowSavedDashboards(false);
      toast({ title: '✅ Loaded!', description: `Dashboard "${dashboard.title}" loaded successfully` });
    } catch (error) {
      toast({ title: '❌ Error', description: 'Failed to load dashboard', variant: 'destructive' });
    }
  };

  const handleSaveDashboard = async () => {
    if (!config.name) {
      toast({ title: '⚠️ Missing Name', description: 'Please enter a dashboard name', variant: 'destructive' });
      return;
    }

    if (config.charts.length === 0) {
      toast({ title: '⚠️ No Charts', description: 'Add at least one chart to save', variant: 'destructive' });
      return;
    }

    try {
      // Format payload to match backend expectations
      const spec = {
        ...config,
        dataSourceId: dataMode === 'datasource' ? selectedDataSource : undefined,
        dataMartId: dataMode === 'datamart' ? selectedDataMart : undefined
      };

      const payload = {
        title: config.name,  // Backend expects 'title'
        description: config.description,
        spec: spec,  // Backend expects all config in 'spec'
        dashboardId: editingDashboard?.id  // Include ID if editing
      };

      const response = await fetch('/api/save-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        toast({ 
          title: '🎉 Success!', 
          description: editingDashboard 
            ? `Dashboard "${config.name}" updated successfully!`
            : `Dashboard "${config.name}" saved successfully!`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }
    } catch (error: any) {
      toast({ 
        title: '❌ Error', 
        description: error.message || 'Failed to save dashboard', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">
                Visual Dashboard Builder
              </h1>
              <p className="text-gray-600 text-lg">Drag, drop, and configure your custom dashboard</p>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Mode Toggle */}
            <div className="flex bg-white rounded-xl shadow-md p-1">
              <button
                onClick={() => setMode('edit')}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  mode === 'edit'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  mode === 'preview'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
            
            <button
              onClick={() => setShowHeaderDialog(true)}
              className="px-6 py-3 bg-white rounded-xl font-semibold text-gray-700 hover:shadow-lg transition flex items-center gap-2"
            >
              <Type className="w-5 h-5" />
              Header
            </button>
            <button
              onClick={() => setShowThemeDialog(!showThemeDialog)}
              className="px-6 py-3 bg-white rounded-xl font-semibold text-gray-700 hover:shadow-lg transition flex items-center gap-2"
            >
              <Palette className="w-5 h-5" />
              Theme
            </button>
            <button
              onClick={() => {
                setShowSavedDashboards(true);
                fetchSavedDashboards();
              }}
              className="px-6 py-3 bg-white rounded-xl font-semibold text-gray-700 hover:shadow-lg transition flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              Load
            </button>
            <button
              onClick={handleSaveDashboard}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto max-h-[calc(100vh-200px)] overflow-y-auto pb-8 pr-4" style={{ scrollbarWidth: 'thin' }}>
        {mode === 'edit' ? (
          <>
            {/* 1. Data Selection - Collapsible */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              {/* Header */}
              <div 
                className={`flex items-center justify-between p-6 transition ${
                  ((dataMode === 'datasource' && selectedDataSource && selectedTable) || 
                   (dataMode === 'datamart' && selectedDataMart))
                    ? 'cursor-pointer hover:bg-gray-50'
                    : 'cursor-default'
                }`}
                onClick={() => {
                  if ((dataMode === 'datasource' && selectedDataSource && selectedTable) || 
                      (dataMode === 'datamart' && selectedDataMart)) {
                    setIsSelectionCollapsed(!isSelectionCollapsed);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white flex items-center justify-center text-sm">1</span>
                    Select Your Data
                  </h3>
                  
                  {/* Selected Data Badge (when collapsed) */}
                  {isSelectionCollapsed && (
                    <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 rounded-xl shadow-md">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          {dataMode === 'datasource' ? (
                            <Database className="w-4 h-4 text-white" />
                          ) : (
                            <Boxes className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-green-600 font-semibold uppercase">Selected</div>
                          <span className="font-bold text-green-900 text-sm">
                            {dataMode === 'datasource' 
                              ? `${dataSources.find(ds => ds.id === selectedDataSource)?.name} → ${selectedTable}`
                              : dataMarts.find(dm => dm.id === selectedDataMart)?.name
                            }
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSelectionCollapsed(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 hover:text-green-900 bg-white hover:bg-green-100 border border-green-400 hover:border-green-500 rounded-lg transition"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Collapse/Expand Button */}
                {((dataMode === 'datasource' && selectedDataSource && selectedTable) || 
                  (dataMode === 'datamart' && selectedDataMart)) && (
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                    {isSelectionCollapsed ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                )}
              </div>
              
              {/* Collapsible Content */}
              <div className={`transition-all duration-300 ease-in-out ${isSelectionCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
                <div className="px-8 pb-8 pt-2">
              
              {/* Data Mode Toggle */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => {
                    setDataMode('datasource');
                    setSelectedDataMart(null);
                  }}
                  className={`flex-1 px-6 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    dataMode === 'datasource'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Database className="w-5 h-5" />
                  Data Source + Table
                </button>
                <button
                  onClick={() => {
                    setDataMode('datamart');
                    setSelectedDataSource('');
                    setSelectedTable('');
                  }}
                  className={`flex-1 px-6 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    dataMode === 'datamart'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Boxes className="w-5 h-5" />
                  Data Mart
                </button>
              </div>

              {/* Data Source Selection */}
              {dataMode === 'datasource' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Data Source *
                    </label>
                    <select
                      value={selectedDataSource}
                      onChange={(e) => setSelectedDataSource(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                    >
                      <option value="">-- Choose a data source --</option>
                      {dataSources.map((ds) => (
                        <option key={ds.id} value={ds.id}>
                          {ds.name} ({ds.connection_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDataSource && (
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Select Table *
                      </label>
                      {loadingTables ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-3 text-gray-600">Loading tables...</span>
                        </div>
                      ) : (
                        <>
                          {/* Search Input */}
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                              🔍
                            </div>
                            <input
                              type="text"
                              placeholder="Search tables by name..."
                              value={tableSearchTerm}
                              onChange={(e) => setTableSearchTerm(e.target.value)}
                              className="w-full px-4 py-4 pl-12 pr-12 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-base bg-white shadow-sm transition"
                            />
                            {tableSearchTerm && (
                              <button
                                onClick={() => setTableSearchTerm('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          
                          {/* Table Count */}
                          <div className="flex items-center justify-between px-2">
                            <div className="text-sm font-semibold text-gray-700">
                              {filteredTables.length === tables.length ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  {tables.length} tables available
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                  Showing {filteredTables.length} of {tables.length} tables
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Table List */}
                          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                            {filteredTables.length > 0 ? (
                              filteredTables.map((table) => (
                                <button
                                  key={table}
                                  onClick={() => setSelectedTable(table)}
                                  className={`
                                    w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200
                                    ${selectedTable === table 
                                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-[1.02]' 
                                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                                    }
                                  `}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg transition-colors ${selectedTable === table ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md' : 'bg-gray-100'}`}>
                                        <Database className={`w-5 h-5 ${selectedTable === table ? 'text-white' : 'text-gray-500'}`} />
                                      </div>
                                      <span className={`font-semibold text-base ${selectedTable === table ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {table}
                                      </span>
                                    </div>
                                    {selectedTable === table && (
                                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                                        ✓ SELECTED
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No tables found</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Data Mart Selection */}
              {dataMode === 'datamart' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Data Mart *
                  </label>
                  <select
                    value={selectedDataMart?.toString() || ''}
                    onChange={(e) => setSelectedDataMart(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                  >
                    <option value="">-- Choose a data mart --</option>
                    {dataMarts.map((dm) => (
                      <option key={dm.id} value={dm.id}>
                        {dm.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              </div>
              </div>
            </div>

            {/* 2. Dashboard Configuration */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white flex items-center justify-center text-sm">2</span>
                Configure Dashboard
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dashboard Name *</label>
                  <input
                    type="text"
                    placeholder="My Custom Dashboard"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="Dashboard description..."
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Add Charts & Filters */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white flex items-center justify-center text-sm">3</span>
                Add Components
              </h3>
              
              {/* Chart Library */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <MousePointer2 className="w-5 h-5 text-blue-600" />
                    Chart Library - Click to Add
                  </label>
                  <span className="text-sm text-gray-500">{config.charts.length} charts added</span>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  {chartTypes.map(chart => (
                    <button
                      key={chart.id}
                      onClick={() => handleAddChart(chart.id)}
                      className="flex flex-col items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition group"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${chart.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition`}>
                        <span className="text-2xl">{chart.emoji}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center">{chart.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                    Filters
                  </label>
                  <button
                    onClick={() => setShowFilterDialog(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Filter
                  </button>
                </div>
                {config.filters.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Filter className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No filters added yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {config.filters.map(filter => (
                      <div key={filter.id} className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
                        <div className="flex items-center gap-3">
                          <Filter className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{filter.label}</p>
                            <p className="text-xs text-gray-600">@{filter.name} • {filter.type}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteFilter(filter.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Canvas - Drag & Drop Layout */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg text-white flex items-center justify-center text-sm">4</span>
                Dashboard Layout - Drag to Reposition
              </h3>
              {config.charts.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Empty Canvas</h4>
                  <p className="text-gray-500 mb-4">Add charts from the library above to start building</p>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-6">
                  {config.charts.map(chart => {
                    const chartType = chartTypes.find(t => t.id === chart.type);
                    // Handle charts without position data (older dashboards)
                    const colSpan = chart.position?.w || 6;
                    const heightClass = chart.position?.h === 1 ? 'h-48' : chart.position?.h === 2 ? 'h-64' : chart.position?.h === 3 ? 'h-80' : 'h-96';
                    
                    return (
                      <div
                        key={chart.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, chart, 'chart')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, chart, 'chart')}
                        className={`relative group bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition overflow-hidden`}
                        style={{ gridColumn: `span ${colSpan}` }}
                      >
                        {/* Chart Header */}
                        <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 flex items-center justify-between">
                          <div className="flex items-center gap-3 cursor-move">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                            <span className="text-2xl">{chartType?.emoji}</span>
                            <span className="font-bold text-gray-800">{chart.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                              {colSpan === 3 ? 'Small' : colSpan === 4 ? 'SM' : colSpan === 6 ? 'Medium' : colSpan === 8 ? 'Large' : 'Full'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSelectedChart(chart);
                                setShowQueryEditor(true);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              draggable={false}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeleteChart(chart.id);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              draggable={false}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Chart Content */}
                        <div className={`p-6 ${heightClass} flex items-center justify-center`}>
                          {chart.query ? (
                            <div className="text-center">
                              <Code className="w-12 h-12 mx-auto mb-2 text-green-500" />
                              <p className="text-sm font-semibold text-gray-700">Query Configured ✓</p>
                              <code className="text-xs text-gray-500 mt-2 block truncate max-w-xs">
                                {chart.query.substring(0, 60)}...
                              </code>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Code className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm text-gray-500">Click edit to add query</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* PREVIEW MODE */
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-4" style={{ scrollbarWidth: 'thin' }}>
            <DashboardPreview 
              config={config} 
              theme={themes.find(t => t.id === config.theme)}
              onEditChart={(chart) => {
                setSelectedChart(chart);
                setShowQueryEditor(true);
                setMode('edit'); // Switch back to edit mode
              }}
              dataSourceId={dataMode === 'datasource' ? selectedDataSource : undefined}
            />
          </div>
        )}
      </div>

      {/* Query Editor Modal */}
      {showQueryEditor && selectedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Configure Chart
              </h2>
              
              {/* Data Source Info Banner */}
              {(selectedDataSource || selectedDataMart) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-blue-900">
                      {dataMode === 'datasource' 
                        ? `Data Source: ${dataSources.find(ds => ds.id === selectedDataSource)?.name || 'Unknown'}`
                        : `Data Mart: ${dataMarts.find(dm => dm.id === selectedDataMart)?.name || 'Unknown'}`
                      }
                    </span>
                  </div>
                  {selectedTable && (
                    <div className="flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-semibold">Table: {selectedTable}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chart Title</label>
                  <input
                    type="text"
                    value={selectedChart.title}
                    onChange={(e) => setSelectedChart({ ...selectedChart, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chart Type</label>
                  <select
                    value={selectedChart.type}
                    onChange={(e) => setSelectedChart({ ...selectedChart, type: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    {chartTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">SQL Query</label>
                    {selectedTable && (
                      <button
                        onClick={() => {
                          const template = `-- Query for ${selectedTable}\nSELECT * FROM ${selectedTable} LIMIT 100`;
                          setSelectedChart({ ...selectedChart, query: template });
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold"
                      >
                        Reset to Template
                      </button>
                    )}
                  </div>
                  <textarea
                    placeholder="SELECT * FROM table WHERE ..."
                    rows={10}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-sm"
                    value={selectedChart.query}
                    onChange={(e) => setSelectedChart({ ...selectedChart, query: e.target.value })}
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      💡 <strong>Tips:</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      • Use @filterName for filter placeholders (e.g., WHERE date = @dateFilter)
                    </p>
                    {selectedTable && (
                      <p className="text-xs text-gray-500">
                        • Your selected table: <code className="bg-gray-100 px-1 py-0.5 rounded">{selectedTable}</code>
                      </p>
                    )}
                  </div>
                </div>
                {selectedChart.type !== 'kpi' && selectedChart.type !== 'table' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">X-Axis Column</label>
                      <input
                        type="text"
                        placeholder="column_name"
                        value={selectedChart.xAxis || ''}
                        onChange={(e) => setSelectedChart({ ...selectedChart, xAxis: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Y-Axis Column</label>
                      <input
                        type="text"
                        placeholder="column_name"
                        value={selectedChart.yAxis || ''}
                        onChange={(e) => setSelectedChart({ ...selectedChart, yAxis: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Chart Size Configuration */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Maximize2 className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-indigo-900">Chart Size</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Width
                        <span className="text-xs text-gray-500 ml-2">(1-12 columns)</span>
                      </label>
                      <select
                        value={selectedChart.position.w}
                        onChange={(e) => setSelectedChart({ 
                          ...selectedChart, 
                          position: { ...selectedChart.position, w: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white"
                      >
                        <option value="3">Small (25%)</option>
                        <option value="4">Small-Medium (33%)</option>
                        <option value="6">Medium (50%)</option>
                        <option value="8">Large (66%)</option>
                        <option value="12">Full Width (100%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Height
                        <span className="text-xs text-gray-500 ml-2">(rows)</span>
                      </label>
                      <select
                        value={selectedChart.position.h}
                        onChange={(e) => setSelectedChart({ 
                          ...selectedChart, 
                          position: { ...selectedChart.position, h: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white"
                      >
                        <option value="1">Short</option>
                        <option value="2">Medium</option>
                        <option value="3">Tall</option>
                        <option value="4">Extra Tall</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-600 mt-3">
                    💡 <strong>Recommended:</strong> KPIs work best at Small width, Tables at Full Width
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowQueryEditor(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateChart(selectedChart)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Save Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Dialog */}
      {showFilterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Filter className="w-6 h-6 text-blue-600" />
                Add Filter
              </h2>
              <AddFilterForm 
                onAdd={handleAddFilter} 
                onCancel={() => setShowFilterDialog(false)}
                dataSourceId={dataMode === 'datasource' ? selectedDataSource : undefined}
                selectedTable={selectedTable}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header Dialog */}
      {showHeaderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Type className="w-6 h-6 text-purple-600" />
                Dashboard Header
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Header Title</label>
                  <input
                    type="text"
                    value={config.header.title}
                    onChange={(e) => setConfig({ ...config, header: { ...config.header, title: e.target.value } })}
                    placeholder="Dashboard Title"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={config.header.subtitle}
                    onChange={(e) => setConfig({ ...config, header: { ...config.header, subtitle: e.target.value } })}
                    placeholder="Description or subtitle"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowHeaderDialog(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Dialog */}
      {showThemeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Palette className="w-6 h-6 text-purple-600" />
                Select Theme
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setConfig({ ...config, theme: theme.id });
                      toast({ title: '🎨 Theme Changed', description: `Applied ${theme.name} theme` });
                    }}
                    className={`p-4 rounded-xl border-2 transition ${
                      config.theme === theme.id 
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl mb-2">{theme.emoji}</div>
                    <p className="font-semibold text-sm mb-3">{theme.name}</p>
                    <div className="flex gap-1">
                      {theme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-8 w-full rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowThemeDialog(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Dashboards Dialog */}
      {showSavedDashboards && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                  Saved Dashboards
                </h2>
                <button
                  onClick={() => setShowSavedDashboards(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingDashboards ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading dashboards...</p>
                </div>
              ) : savedDashboards.length === 0 ? (
                <div className="text-center py-12">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No saved dashboards yet</p>
                  <p className="text-sm text-gray-400 mt-2">Create and save your first dashboard to see it here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {savedDashboards.map((dashboard) => (
                    <div
                      key={dashboard.id}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition cursor-pointer group"
                      onClick={() => loadDashboard(dashboard)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition">
                            {dashboard.title}
                          </h3>
                          {dashboard.description && (
                            <p className="text-sm text-gray-500 mt-1">{dashboard.description}</p>
                          )}
                        </div>
                        <div className="ml-3 text-2xl">
                          {themes.find(t => t.id === dashboard.spec?.theme)?.emoji || '📊'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-4">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {dashboard.spec?.charts?.length || 0} charts
                        </span>
                        <span className="flex items-center gap-1">
                          <Filter className="w-3 h-3" />
                          {dashboard.spec?.filters?.length || 0} filters
                        </span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400">
                          Updated: {new Date(dashboard.updated_at || dashboard.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition">
                        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition">
                          Load Dashboard
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Preview Component
const DashboardPreview: React.FC<{ 
  config: DashboardConfig; 
  theme: any;
  onEditChart: (chart: ChartConfig) => void;
  dataSourceId?: string;
}> = ({ config, theme, onEditChart, dataSourceId }) => {
  const [chartData, setChartData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const themeColors = theme?.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // Execute query for a chart
  const executeChartQuery = async (chart: ChartConfig) => {
    // Check for dataSourceId in chart (AI Dashboard) or config (Visual Dashboard)
    const chartDataSourceId = (chart as any).dataSourceId || dataSourceId || config.dataSourceId;
    
    if (!chart.query || !chartDataSourceId) {
      console.warn('Missing query or dataSourceId for chart:', chart.id);
      return;
    }

    setLoading(prev => ({ ...prev, [chart.id]: true }));
    try {
      const response = await fetch('/api/run-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: chart.query,
          dataSourceId: chartDataSourceId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(prev => ({ ...prev, [chart.id]: data }));
      }
    } catch (error) {
      console.error('Failed to execute query:', error);
    } finally {
      setLoading(prev => ({ ...prev, [chart.id]: false }));
    }
  };

  // Execute all queries on mount
  useEffect(() => {
    config.charts.forEach(chart => {
      if (chart.query) {
        executeChartQuery(chart);
      }
    });
  }, [config.charts, dataSourceId]);
  
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Preview Header */}
      <div 
        className="p-8 text-white"
        style={{ background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` }}
      >
        <h1 className="text-4xl font-bold mb-2">{config.header.title || 'Dashboard Preview'}</h1>
        <p className="text-lg opacity-90">{config.header.subtitle || 'Live preview of your dashboard'}</p>
      </div>

      {/* Filters */}
      {config.filters.length > 0 && (
        <div className="p-6 bg-gray-50 border-b max-h-40 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {config.filters.map(filter => (
              <div key={filter.id}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{filter.label}</label>
                {filter.type === 'dropdown' ? (
                  <select className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm">
                    <option>Select {filter.label}</option>
                    {filter.options?.map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input type="date" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm" />
                ) : (
                  <input 
                    type={filter.type} 
                    placeholder={filter.label}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm" 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="p-6">
        {config.charts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No charts configured</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {config.charts.map((chart, idx) => {
              const data = chartData[chart.id];
              const isLoading = loading[chart.id];
              // Handle charts without position data (older dashboards)
              const colSpan = chart.position?.w || 6;
              const heightClass = chart.position?.h === 1 ? 'h-48' : chart.position?.h === 2 ? 'h-64' : chart.position?.h === 3 ? 'h-80' : 'h-96';
              
              return (
                <div 
                  key={chart.id} 
                  className="p-6 bg-white border-2 rounded-xl shadow-md relative group"
                  style={{ 
                    borderColor: themeColors[idx % themeColors.length],
                    gridColumn: `span ${colSpan}`
                  }}
                >
                  {/* Edit Button */}
                  <button
                    onClick={() => onEditChart(chart)}
                    className="absolute top-4 right-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition opacity-0 group-hover:opacity-100 z-10"
                    title="Edit Query"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <h3 className="text-lg font-bold mb-4 pr-12" style={{ color: themeColors[idx % themeColors.length] }}>
                    {chart.title}
                  </h3>
                  
                  <div className={`${heightClass} flex items-center justify-center bg-gray-50 rounded-lg overflow-auto`}>
                    {isLoading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Loading data...</p>
                      </div>
                    ) : data ? (
                      <div className="w-full h-full p-4 overflow-auto">
                        {chart.type === 'kpi' ? (
                          // KPI Display
                          (() => {
                            const rows = data.rows || data.data || [];
                            const firstRow = rows[0] || {};
                            const firstKey = Object.keys(firstRow)[0];
                            const value = firstRow[firstKey];
                            
                            return (
                              <div className="flex flex-col items-center justify-center h-full">
                                <div className="text-5xl font-bold" style={{ color: themeColors[idx % themeColors.length] }}>
                                  {typeof value === 'number' ? value.toLocaleString() : (value || 'N/A')}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{chart.title}</p>
                              </div>
                            );
                          })()
                        ) : chart.type === 'table' ? (
                          // Table Display
                          (() => {
                            const rows = data.rows || data.data || [];
                            const columns = data.columns || (rows[0] ? Object.keys(rows[0]) : []);
                            
                            return (
                              <div className="w-full overflow-auto">
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
                          // Chart visualization
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
                            const values = displayRows.map(row => parseFloat(row[valueKey]) || 0);
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
                                      {displayRows.map((row, i) => {
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
                                      {displayRows.map((row, i) => (
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
                                          points={displayRows.map((row, i) => {
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
                                        {displayRows.map((row, i) => {
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
                                      {displayRows.map((row, i) => (
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
                                
                                {/* Pie Chart Placeholder */}
                                {chart.type === 'pie' && (
                                  <div className="flex-1 flex items-center justify-center">
                                    <div className="relative w-48 h-48">
                                      <div className="absolute inset-0 rounded-full" style={{
                                        background: `conic-gradient(${displayRows.map((row, i) => {
                                          const value = parseFloat(row[valueKey]) || 0;
                                          const total = values.reduce((sum, v) => sum + v, 0);
                                          const percentage = (value / total) * 100;
                                          const color = themeColors[i % themeColors.length];
                                          return `${color} ${i === 0 ? 0 : displayRows.slice(0, i).reduce((sum, r, j) => sum + ((parseFloat(r[valueKey]) || 0) / total) * 100, 0)}%, ${color} ${displayRows.slice(0, i + 1).reduce((sum, r, j) => sum + ((parseFloat(r[valueKey]) || 0) / total) * 100, 0)}%`;
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
                                
                                {/* Area Chart - Similar to Line */}
                                {chart.type === 'area' && (
                                  <div className="flex-1 flex items-end justify-around gap-2 px-4 pb-8">
                                    {displayRows.map((row, i) => {
                                      const value = parseFloat(row[valueKey]) || 0;
                                      const height = (value / maxValue) * 100;
                                      const color = themeColors[0];
                                      
                                      return (
                                        <div key={i} className="flex flex-col items-center gap-1" style={{ width: `${100 / displayRows.length}%` }}>
                                          <div className="text-xs font-semibold" style={{ color }}>{value.toLocaleString()}</div>
                                          <div 
                                            className="w-full rounded-t transition-all"
                                            style={{ 
                                              height: `${height}%`,
                                              minHeight: '20px',
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
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-sm text-gray-500">{chart.type.toUpperCase()} Chart</p>
                        {chart.query ? (
                          <p className="text-xs text-yellow-600 mt-2">No data</p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-2">No query configured</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Add Filter Form Component
const AddFilterForm: React.FC<{ 
  onAdd: (filter: FilterConfig) => void; 
  onCancel: () => void;
  dataSourceId?: string;
  selectedTable?: string;
}> = ({ onAdd, onCancel, dataSourceId, selectedTable }) => {
  const [filterName, setFilterName] = useState('');
  const [filterLabel, setFilterLabel] = useState('');
  const [filterType, setFilterType] = useState<'dropdown' | 'date' | 'text' | 'number'>('dropdown');
  const [options, setOptions] = useState('');
  const [columnName, setColumnName] = useState('');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [useColumnValues, setUseColumnValues] = useState(false);

  // Fetch available columns from selected table
  useEffect(() => {
    if (dataSourceId && selectedTable) {
      fetchColumns();
    }
  }, [dataSourceId, selectedTable]);

  const fetchColumns = async () => {
    setLoadingColumns(true);
    try {
      const response = await fetch(`/api/data-sources/${dataSourceId}/tables/${selectedTable}/columns`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableColumns(data.columns || []);
      }
    } catch (error) {
      console.error('Failed to fetch columns:', error);
    } finally {
      setLoadingColumns(false);
    }
  };

  // Fetch distinct column values for dropdown options
  const fetchColumnValues = async (column: string) => {
    if (!dataSourceId || !selectedTable || !column) return;
    
    try {
      const response = await fetch('/api/run-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: `SELECT DISTINCT ${column} FROM ${selectedTable} WHERE ${column} IS NOT NULL ORDER BY ${column} LIMIT 100`,
          dataSourceId: dataSourceId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const values = data.data?.map((row: any) => row[column]) || [];
        setOptions(values.join(', '));
      }
    } catch (error) {
      console.error('Failed to fetch column values:', error);
    }
  };

  const handleSubmit = () => {
    if (!filterName || !filterLabel) return;

    const filter: FilterConfig = {
      id: `filter-${Date.now()}`,
      name: filterName,
      label: filterLabel,
      type: filterType,
      options: filterType === 'dropdown' ? options.split(',').map(o => o.trim()).filter(Boolean) : undefined,
      position: { x: 0, y: 0, w: 3 }
    };

    onAdd(filter);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Name (Variable) *</label>
        <input
          type="text"
          placeholder="e.g., regionFilter"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-2">Use this in queries as @{filterName || 'filterName'}</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Label *</label>
        <input
          type="text"
          placeholder="e.g., Select Region"
          value={filterLabel}
          onChange={(e) => setFilterLabel(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Type</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
        >
          <option value="dropdown">Dropdown</option>
          <option value="date">Date Picker</option>
          <option value="text">Text Input</option>
          <option value="number">Number Input</option>
        </select>
      </div>
      {filterType === 'dropdown' && (
        <>
          {/* Column Selector for Dynamic Values */}
          {availableColumns.length > 0 && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Load Values from Table Column</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {availableColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <button
                  onClick={() => columnName && fetchColumnValues(columnName)}
                  disabled={!columnName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Load Values
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 This will fetch distinct values from the selected column
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Options (comma-separated) {options && `(${options.split(',').length} values)`}
            </label>
            <textarea
              rows={3}
              placeholder="Option 1, Option 2, Option 3"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Or use the "Load Values" feature above to automatically fetch options from your table
            </p>
          </div>
        </>
      )}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!filterName || !filterLabel}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Filter
        </button>
      </div>
    </div>
  );
};

export default VisualDashboardBuilder;
