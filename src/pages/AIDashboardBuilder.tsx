import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Save, FolderOpen, Trash2, Eye, Database, Boxes, MessageCircle, X, ChevronUp, ChevronDown, Edit } from 'lucide-react';
import DashboardRenderer from '../components/DashboardRenderer';
import { getAvailableChartTypes, ChartTypeDescriptions } from '../components/charts';
import { getAvailableThemes, getThemeDescriptions } from '../components/themes';
import { getAvailableFeatures, FeatureDescriptions } from '../components/features';

interface Dashboard {
  id: string;
  title: string;
  description?: string;
  spec: any;
  createdAt: string;
  updatedAt: string;
}

interface DataSource {
  id: string;
  name: string;
  connection_type: string;
}

interface DataMart {
  id: string;
  name: string;
  description?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIDashboardBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [improvementPrompt, setImprovementPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [dashboardSpec, setDashboardSpec] = useState<any>(null);
  const [savedDashboards, setSavedDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);
  const [view, setView] = useState<'builder' | 'preview' | 'saved'>('builder');
  const [error, setError] = useState<string | null>(null);
  const [showImproveBox, setShowImproveBox] = useState(false);
  
  // Chat interface for improvements
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Data source selection
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState<string>('');
  
  // Data mart selection
  const [dataMarts, setDataMarts] = useState<DataMart[]>([]);
  const [selectedDataMart, setSelectedDataMart] = useState<string>('');
  
  // Data selection mode
  const [dataMode, setDataMode] = useState<'datasource' | 'datamart'>('datasource');
  
  // Collapsible panel state
  const [isSelectionCollapsed, setIsSelectionCollapsed] = useState(false);
  
  // Filter tables based on search term
  const filteredTables = tables.filter(table => 
    table.toLowerCase().includes(tableSearchTerm.toLowerCase())
  );

  // Fetch saved dashboards, data sources, and data marts on mount
  useEffect(() => {
    fetchSavedDashboards();
    fetchDataSources();
    fetchDataMarts();
  }, []);
  
  // Auto-collapse when selection is complete
  useEffect(() => {
    if ((dataMode === 'datasource' && selectedDataSource && selectedTable) ||
        (dataMode === 'datamart' && selectedDataMart)) {
      // Auto-collapse after 1 second to show the selection
      const timer = setTimeout(() => {
        setIsSelectionCollapsed(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Expand if selection is incomplete
      setIsSelectionCollapsed(false);
    }
  }, [selectedTable, selectedDataMart, selectedDataSource, dataMode]);

  // Fetch tables when data source is selected
  useEffect(() => {
    if (selectedDataSource) {
      fetchTables(selectedDataSource);
    } else {
      setTables([]);
      setSelectedTable('');
    }
  }, [selectedDataSource]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchSavedDashboards = async () => {
    try {
      const response = await fetch('/api/get-dashboards');
      if (response.ok) {
        const data = await response.json();
        setSavedDashboards(data.dashboards || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
    }
  };

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources');
      if (response.ok) {
        const data = await response.json();
        setDataSources(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
    }
  };

  const fetchDataMarts = async () => {
    try {
      const response = await fetch('/api/data-marts');
      if (response.ok) {
        const data = await response.json();
        setDataMarts(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data marts:', error);
    }
  };

  const fetchTables = async (dataSourceId: string) => {
    setLoadingTables(true);
    try {
      const response = await fetch(`/api/data-sources/${dataSourceId}/tables`);
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    // Validate data selection
    if (dataMode === 'datasource') {
      if (!selectedDataSource) {
        setError('Please select a data source');
        return;
      }
      if (!selectedTable) {
        setError('Please select a table');
        return;
      }
    } else {
      if (!selectedDataMart) {
        setError('Please select a data mart');
        return;
      }
    }

    setGenerating(true);
    setError(null);

    try {
      // Get available options for AI context
      const chartTypes = getAvailableChartTypes();
      const themes = getAvailableThemes();
      const features = getAvailableFeatures();

      // Prepare request body with selected data
      const requestBody: any = {
        prompt,
        availableCharts: chartTypes,
        chartDescriptions: ChartTypeDescriptions,
        availableThemes: themes,
        themeDescriptions: getThemeDescriptions(),
        availableFeatures: features,
        featureDescriptions: FeatureDescriptions,
        dataMode
      };

      // Add data selection details
      if (dataMode === 'datasource') {
        requestBody.dataSourceId = selectedDataSource;
        requestBody.tableName = selectedTable;
      } else {
        requestBody.dataMartId = selectedDataMart;
      }

      // Call AI generation API
      const response = await fetch('/api/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to generate dashboard');
      }

      const data = await response.json();
      setDashboardSpec(data.spec);
      setView('preview');
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate dashboard');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!currentMessage.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Get available options for AI context
      const chartTypes = getAvailableChartTypes();
      const themes = getAvailableThemes();
      const features = getAvailableFeatures();

      // Build conversation history
      const conversationHistory = chatMessages.map(msg => 
        `${msg.role === 'user' ? 'USER' : 'AI'}: ${msg.content}`
      ).join('\n');

      // Combine with current request
      const combinedPrompt = `${prompt}

CONVERSATION HISTORY:
${conversationHistory}

USER REQUEST: ${userMessage.content}

Current Dashboard: ${JSON.stringify(dashboardSpec)}`;

      // Prepare request body with selected data
      const requestBody: any = {
        prompt: combinedPrompt,
        availableCharts: chartTypes,
        chartDescriptions: ChartTypeDescriptions,
        availableThemes: themes,
        themeDescriptions: getThemeDescriptions(),
        availableFeatures: features,
        featureDescriptions: FeatureDescriptions,
        dataMode,
        isImprovement: true,
        previousDashboard: dashboardSpec,
        conversationHistory: chatMessages
      };

      // Add data selection details
      if (dataMode === 'datasource') {
        requestBody.dataSourceId = selectedDataSource;
        requestBody.tableName = selectedTable;
      } else {
        requestBody.dataMartId = selectedDataMart;
      }

      // Call AI generation API
      const response = await fetch('/api/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to improve dashboard');
      }

      const data = await response.json();
      const newSpec = data.spec;
      const oldSpec = dashboardSpec;
      
      // Detect what changed
      const changes = [];
      if (newSpec.charts.length !== oldSpec.charts.length) {
        const diff = newSpec.charts.length - oldSpec.charts.length;
        changes.push(diff > 0 ? `Added ${diff} new chart(s)` : `Removed ${Math.abs(diff)} chart(s)`);
      }
      if (newSpec.theme !== oldSpec.theme) {
        changes.push(`Changed theme to "${newSpec.theme}"`);
      }
      if (newSpec.filters.length !== oldSpec.filters.length) {
        const diff = newSpec.filters.length - oldSpec.filters.length;
        changes.push(diff > 0 ? `Added ${diff} filter(s)` : `Removed ${Math.abs(diff)} filter(s)`);
      }
      
      // Update dashboard (THIS IS CRITICAL!)
      setDashboardSpec(newSpec);

      // Build response message
      let responseText = `✨ Dashboard updated!\n\n📝 Your request: "${userMessage.content}"\n\n`;
      if (changes.length > 0) {
        responseText += `✅ Changes made:\n${changes.map(c => `• ${c}`).join('\n')}\n\n`;
      } else {
        responseText += `✅ Regenerated with your preferences\n\n`;
      }
      responseText += `💬 What else would you like to change?`;

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseText,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Failed to improve dashboard'}. Please try again!`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const openChatWindow = () => {
    setShowChatWindow(true);
    if (chatMessages.length === 0) {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'ai',
        content: `👋 Hi! I'm your AI dashboard assistant. I can help you improve this dashboard!

💬 Just tell me what you'd like:

📊 Add Charts:
• "add pie chart for products"
• "add bar chart for brands"

🎨 Change Appearance:
• "change colors to ocean theme"
• "make it more colorful"

🔢 Modify Data:
• "show top 5 instead of 10"
• "add filters for region"

✨ Don't worry about typos or being formal - I'll understand! Just chat naturally. 😊

What would you like to change?`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  };

  const handleSave = async () => {
    if (!dashboardSpec) {
      setError('No dashboard to save');
      return;
    }

    try {
      const response = await fetch('/api/save-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dashboardSpec.title,
          description: dashboardSpec.description,
          spec: dashboardSpec
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard');
      }

      const data = await response.json();
      setSavedDashboards([...savedDashboards, data.dashboard]);
      setSelectedDashboard(data.dashboard.id);
      setView('saved');
      alert('Dashboard saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save dashboard');
    }
  };

  const handleLoadDashboard = (dashboard: Dashboard) => {
    setDashboardSpec(dashboard.spec);
    setSelectedDashboard(dashboard.id);
    setView('preview');
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-dashboard/${dashboardId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete dashboard');
      }

      setSavedDashboards(savedDashboards.filter(d => d.id !== dashboardId));
      if (selectedDashboard === dashboardId) {
        setSelectedDashboard(null);
        setDashboardSpec(null);
        setView('builder');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete dashboard');
    }
  };

  // Example prompts
  const examplePrompts = [
    "Show me sales revenue by month for the last 6 months with region filter",
    "Create a dashboard with top 10 products by revenue and customer segments",
    "Build a KPI dashboard showing total revenue, active users, and conversion rate",
    "Show customer engagement metrics with time series and heatmap",
    "Create a marketing dashboard with campaign performance and ROI analysis"
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              AI Dashboard Builder
            </h1>
            <p className="text-gray-600 text-lg">Generate interactive dashboards from natural language prompts</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setView('builder')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              view === 'builder'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Builder
          </button>
          <button
            onClick={() => setView('preview')}
            disabled={!dashboardSpec}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              view === 'preview'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Eye className="w-5 h-5 inline mr-2" />
            Preview
          </button>
          <button
            onClick={() => setView('saved')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              view === 'saved'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <FolderOpen className="w-5 h-5 inline mr-2" />
            Saved ({savedDashboards.length})
          </button>
        </div>
      </div>

      {/* Builder View */}
      {view === 'builder' && (
        <div className="max-w-5xl mx-auto">
          {/* Data Selection - Collapsible */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Header - Always Visible */}
            <div 
              className={`flex items-center justify-between p-6 transition ${
                ((dataMode === 'datasource' && selectedDataSource && selectedTable) || 
                 (dataMode === 'datamart' && selectedDataMart))
                  ? 'cursor-pointer hover:bg-gray-50'
                  : 'cursor-default'
              }`}
              onClick={() => {
                // Only allow collapse if selection is complete
                if ((dataMode === 'datasource' && selectedDataSource && selectedTable) || 
                    (dataMode === 'datamart' && selectedDataMart)) {
                  setIsSelectionCollapsed(!isSelectionCollapsed);
                }
              }}
              title={
                ((dataMode === 'datasource' && selectedDataSource && selectedTable) || 
                 (dataMode === 'datamart' && selectedDataMart))
                  ? isSelectionCollapsed ? 'Click to expand selection' : 'Click to collapse selection'
                  : 'Complete your selection to collapse this section'
              }
            >
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">1. Select Your Data</h3>
                
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
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 hover:text-green-900 bg-white hover:bg-green-100 border border-green-400 hover:border-green-500 rounded-lg transition-all duration-200"
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSelectionCollapsed(!isSelectionCollapsed);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  {isSelectionCollapsed ? (
                    <>
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                      <span className="sr-only">Expand</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                      <span className="sr-only">Collapse</span>
                    </>
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
                  setSelectedDataMart('');
                }}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition ${
                  dataMode === 'datasource'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Database className="w-5 h-5 inline mr-2" />
                Data Source + Table
              </button>
              <button
                onClick={() => {
                  setDataMode('datamart');
                  setSelectedDataSource('');
                  setSelectedTable('');
                }}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition ${
                  dataMode === 'datamart'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Boxes className="w-5 h-5 inline mr-2" />
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
                    disabled={generating}
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
                        {/* Search input for tables - Modern Design */}
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                            🔍
                          </div>
                          <input
                            type="text"
                            placeholder="Search tables by name..."
                            value={tableSearchTerm}
                            onChange={(e) => setTableSearchTerm(e.target.value)}
                            className="w-full px-4 py-4 pl-12 pr-12 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-base bg-white shadow-sm transition"
                            disabled={generating}
                          />
                          {tableSearchTerm && (
                            <button
                              onClick={() => setTableSearchTerm('')}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
                              disabled={generating}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        
                        {/* Table count info - Enhanced Design */}
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
                          {tableSearchTerm && filteredTables.length > 0 && (
                            <button
                              onClick={() => setTableSearchTerm('')}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                        
                        {/* Modern Table Cards */}
                        <div className="space-y-3">
                          {/* Instruction Text */}
                          <div className="text-sm text-gray-600 font-medium px-2">
                            {filteredTables.length > 0 ? (
                              <span>Click on a table to select it:</span>
                            ) : (
                              <span className="text-amber-600">⚠️ No tables available</span>
                            )}
                          </div>
                          
                          {/* Table Cards Grid */}
                          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                            {filteredTables.length > 0 ? (
                              filteredTables.map((table) => (
                                <button
                                  key={table}
                                  onClick={() => setSelectedTable(table)}
                                  disabled={generating}
                                  className={`
                                    w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200
                                    ${selectedTable === table 
                                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-[1.02]' 
                                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                                    }
                                    ${generating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                  `}
                                >
                                  <div className="flex items-center justify-between">
                                    {/* Left: Icon + Table Name */}
                                    <div className="flex items-center gap-3">
                                      <div className={`
                                        p-2 rounded-lg transition-colors
                                        ${selectedTable === table 
                                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md' 
                                          : 'bg-gray-100'
                                        }
                                      `}>
                                        <Database className={`h-5 w-5 ${selectedTable === table ? 'text-white' : 'text-gray-600'}`} />
                                      </div>
                                      <div>
                                        <div className={`
                                          font-semibold text-base
                                          ${selectedTable === table ? 'text-blue-700' : 'text-gray-800'}
                                        `}>
                                          {table}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          Click to generate dashboard
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Right: Selected Indicator */}
                                    {selectedTable === table && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                          SELECTED
                                        </span>
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-4xl mb-3">🔍</div>
                                {tableSearchTerm ? (
                                  <>
                                    <div className="text-gray-600 font-semibold mb-2">
                                      No tables found matching "{tableSearchTerm}"
                                    </div>
                                    <button
                                      onClick={() => setTableSearchTerm('')}
                                      className="text-blue-600 hover:text-blue-800 font-semibold underline text-sm"
                                    >
                                      Clear search to see all tables
                                    </button>
                                  </>
                                ) : (
                                  <div className="text-gray-600 font-semibold">
                                    No tables available in this data source
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {selectedDataSource && selectedTable && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                      {/* Left: Selection Info */}
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                            ✓ Ready to Generate
                          </div>
                          <div className="flex items-center gap-2 text-green-800">
                            <span className="font-bold text-lg">
                              {dataSources.find(ds => ds.id === selectedDataSource)?.name}
                            </span>
                            <span className="text-green-400">→</span>
                            <span className="font-bold text-lg">
                              {selectedTable}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Dashboard will be generated from this table
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Change Button */}
                      <button
                        onClick={() => setSelectedTable('')}
                        className="px-4 py-2 text-sm font-semibold text-green-700 hover:text-green-900 bg-white hover:bg-green-100 border-2 border-green-300 hover:border-green-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Change
                      </button>
                    </div>
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
                  value={selectedDataMart}
                  onChange={(e) => setSelectedDataMart(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                  disabled={generating}
                >
                  <option value="">-- Choose a data mart --</option>
                  {dataMarts.map((dm) => (
                    <option key={dm.id} value={dm.id}>
                      {dm.name} {dm.description && `- ${dm.description}`}
                    </option>
                  ))}
                </select>

                {selectedDataMart && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                      {/* Left: Selection Info */}
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                          <Boxes className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                            ✓ Ready to Generate
                          </div>
                          <div className="flex items-center gap-2 text-green-800">
                            <span className="font-bold text-lg">
                              {dataMarts.find(dm => dm.id === selectedDataMart)?.name}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Dashboard will be generated from this data mart
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Change Button */}
                      <button
                        onClick={() => setSelectedDataMart('')}
                        className="px-4 py-2 text-sm font-semibold text-green-700 hover:text-green-900 bg-white hover:bg-green-100 border-2 border-green-300 hover:border-green-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. Describe Your Dashboard</h3>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What do you want to see in your dashboard?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Show me sales revenue by month for the last 6 months with a region filter, top 10 products by revenue, and a KPI card for total sales"
              className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-lg"
              disabled={generating}
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="mt-4 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Generate Dashboard
                </>
              )}
            </button>
          </div>

          {/* Example Prompts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Example Prompts</h3>
            <div className="space-y-3">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition border-2 border-blue-200 text-gray-700"
                >
                  <span className="font-semibold text-blue-600">Example {index + 1}:</span> {example}
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-2">✨ AI-Powered Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>50 Chart Types:</strong> Bar, Line, Pie, KPI, Heatmap, Funnel, and more</li>
              <li>• <strong>50 Themes:</strong> Professional, Dark, Corporate, Ocean, Sunset, and more</li>
              <li>• <strong>50 Features:</strong> Drilldown, Export, Filters, Real-time, and more</li>
              <li>• <strong>Smart SQL Generation:</strong> AI generates optimized queries</li>
              <li>• <strong>Global Filters:</strong> Date ranges, regions, categories, etc.</li>
              <li>• <strong>Interactive Drilldowns:</strong> Click to explore deeper</li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview View */}
      {view === 'preview' && dashboardSpec && (
        <div className="relative">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Preview</h2>
              <div className="flex gap-3">
                <button
                  onClick={openChatWindow}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat to Improve
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <Save className="w-5 h-5" />
                  Save Dashboard
                </button>
              </div>
            </div>
            
            {/* Theme Selector */}
            <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎨 Select Theme (try different themes to find the best look!)
              </label>
              <select
                value={dashboardSpec.theme || 'default'}
                onChange={(e) => {
                  setDashboardSpec({ ...dashboardSpec, theme: e.target.value });
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base font-medium"
              >
                <option value="default">Default - Classic Blue</option>
                <option value="ocean">Ocean - Blues & Cyans 🌊</option>
                <option value="dark">Dark - Dark Mode 🌙</option>
                <option value="forest">Forest - Greens 🌲</option>
                <option value="sunset">Sunset - Oranges & Reds 🌅</option>
                <option value="royal">Royal - Purples 👑</option>
                <option value="minimal">Minimal - Clean & Simple ⚪</option>
                <option value="corporate">Corporate - Professional 💼</option>
                <option value="rose">Rose - Pinks & Roses 🌹</option>
                <option value="slate">Slate - Grays & Blues 🗿</option>
                <option value="neon">Neon - Bright & Vibrant ⚡</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                💡 Change theme and see the dashboard update instantly!
              </p>
            </div>
          </div>

          {/* Chat Window - Lovable Style */}
          {showChatWindow && (
            <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-purple-200 flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">AI Assistant</h3>
                    <p className="text-xs text-white/80">Here to help improve your dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatWindow(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50 to-white">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white ml-4'
                          : 'bg-white border-2 border-purple-200 text-gray-800 mr-4'
                      } shadow-md`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-2xl bg-white border-2 border-purple-200 mr-4 shadow-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t-2 border-purple-200 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChatMessage()}
                    placeholder="Type your request... typos are ok! 😊"
                    className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={isTyping || !currentMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          )}

          <DashboardRenderer spec={dashboardSpec} editable={true} onSave={(spec) => setDashboardSpec(spec)} />
        </div>
      )}

      {/* Saved Dashboards View */}
      {view === 'saved' && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Dashboards</h2>
          
          {savedDashboards.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">No Saved Dashboards</h3>
              <p className="text-gray-500 mb-6">Create your first dashboard using AI</p>
              <button
                onClick={() => setView('builder')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg"
              >
                Go to Builder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{dashboard.title}</h3>
                  {dashboard.description && (
                    <p className="text-gray-600 text-sm mb-4">{dashboard.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span>Created: {new Date(dashboard.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadDashboard(dashboard)}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteDashboard(dashboard.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIDashboardBuilder;

