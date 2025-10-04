import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  X, 
  Play, 
  Save, 
  Copy,
  FileText,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  History,
  BookOpen,
  CheckCircle,
  XCircle,
  Download,
  Database,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SQLEditor from './SQLEditor';

interface QueryTab {
  id: string;
  name: string;
  query: string;
  isModified: boolean;
  result?: QueryResult;
  isExecuting?: boolean;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
  status: 'success' | 'error';
  error?: string;
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  createdAt: string;
}

interface QueryHistory {
  id: string;
  query: string;
  timestamp: string;
  executionTime: number;
  status: 'success' | 'error';
  rowCount?: number;
  error?: string;
}

interface MultiTabSQLEditorProps {
  selectedDatabase: string;
  onExecuteQuery: (query: string, tabId: string) => Promise<QueryResult>;
  onSaveQuery?: (name: string, query: string) => void;
  savedQueries?: SavedQuery[];
  queryHistory?: QueryHistory[];
}

const MultiTabSQLEditor: React.FC<MultiTabSQLEditorProps> = ({
  selectedDatabase,
  onExecuteQuery,
  onSaveQuery,
  savedQueries = [],
  queryHistory = []
}) => {
  const { toast } = useToast();
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: '1',
      name: 'Query 1',
      query: '',
      isModified: false
    }
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const tabCounter = useRef(1);

  const createNewTab = useCallback(() => {
    tabCounter.current += 1;
    const newTab: QueryTab = {
      id: tabCounter.current.toString(),
      name: `Query ${tabCounter.current}`,
      query: '',
      isModified: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    if (tabs.length === 1) {
      toast({
        title: 'Cannot close tab',
        description: 'At least one tab must remain open',
        variant: 'destructive'
      });
      return;
    }

    const tabToClose = tabs.find(t => t.id === tabId);
    if (tabToClose?.isModified) {
      if (!confirm(`Tab "${tabToClose.name}" has unsaved changes. Close anyway?`)) {
        return;
      }
    }

    setTabs(prev => prev.filter(t => t.id !== tabId));
    
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter(t => t.id !== tabId);
      setActiveTab(remainingTabs[0]?.id || '');
    }
  }, [tabs, activeTab, toast]);

  const updateTabQuery = useCallback((tabId: string, query: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, query, isModified: query !== '' }
        : tab
    ));
  }, []);

  const renameTab = useCallback((tabId: string, newName: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, name: newName }
        : tab
    ));
  }, []);

  const executeQuery = useCallback(async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.query.trim()) {
      toast({
        title: 'No query to execute',
        description: 'Please enter a SQL query',
        variant: 'destructive'
      });
      return;
    }

    setTabs(prev => prev.map(t => 
      t.id === tabId 
        ? { ...t, isExecuting: true }
        : t
    ));

    try {
      const result = await onExecuteQuery(tab.query, tabId);
      setTabs(prev => prev.map(t => 
        t.id === tabId 
          ? { ...t, result, isExecuting: false, isModified: false }
          : t
      ));
      
      if (result.status === 'success') {
        toast({
          title: 'Query Executed',
          description: `Returned ${result.rowCount} rows in ${result.executionTime}s`
        });
      } else {
        toast({
          title: 'Query Error',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setTabs(prev => prev.map(t => 
        t.id === tabId 
          ? { ...t, isExecuting: false }
          : t
      ));
      toast({
        title: 'Execution Failed',
        description: error.message || 'Failed to execute query',
        variant: 'destructive'
      });
    }
  }, [tabs, onExecuteQuery, toast]);

  const duplicateTab = useCallback((tabId: string) => {
    const tabToDuplicate = tabs.find(t => t.id === tabId);
    if (!tabToDuplicate) return;

    tabCounter.current += 1;
    const newTab: QueryTab = {
      id: tabCounter.current.toString(),
      name: `${tabToDuplicate.name} (Copy)`,
      query: tabToDuplicate.query,
      isModified: tabToDuplicate.isModified
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  }, [tabs]);

  const loadSavedQuery = useCallback((query: SavedQuery) => {
    tabCounter.current += 1;
    const newTab: QueryTab = {
      id: tabCounter.current.toString(),
      name: query.name,
      query: query.query,
      isModified: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    
    toast({
      title: 'Query Loaded',
      description: `Loaded "${query.name}" into a new tab`
    });
  }, [toast]);

  const loadHistoryQuery = useCallback((historyItem: QueryHistory) => {
    tabCounter.current += 1;
    const newTab: QueryTab = {
      id: tabCounter.current.toString(),
      name: `History ${tabCounter.current}`,
      query: historyItem.query,
      isModified: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    
    toast({
      title: 'Query Loaded',
      description: 'Loaded query from history into a new tab'
    });
  }, [toast]);

  const exportResults = useCallback((tabId: string, format: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.result || tab.result.status !== 'success') {
      toast({
        title: 'Export Error',
        description: 'No successful query results to export',
        variant: 'destructive'
      });
      return;
    }

    const { columns, rows } = tab.result;
    
    if (format === 'csv') {
      const csvContent = [
        columns.join(','),
        ...rows.map(row => 
          Array.isArray(row) 
            ? row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
            : columns.map(col => `"${String((row as any)[col] || '').replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tab.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonData = rows.map(row => {
        if (Array.isArray(row)) {
          const obj: any = {};
          columns.forEach((col, index) => {
            obj[col] = row[index];
          });
          return obj;
        }
        return row;
      });
      
      const jsonContent = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tab.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    toast({
      title: 'Export Complete',
      description: `Results exported as ${format.toUpperCase()}`
    });
  }, [tabs, toast]);

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className={isFullscreen ? 'h-full rounded-none border-0' : ''}>
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Query Editor</CardTitle>
                <p className="text-sm text-gray-600">Multi-tab SQL execution</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-9 border-blue-300 hover:bg-blue-50"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {sidebarCollapsed ? 'Show Panel' : 'Hide Panel'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-9 border-blue-300 hover:bg-blue-50"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`${isFullscreen ? 'h-[calc(100vh-100px)] overflow-hidden' : ''}`}>
          <div className={`grid ${sidebarCollapsed ? 'grid-cols-1' : 'grid-cols-4'} gap-4 h-full`}>
            {/* Main Content Area */}
            <div className={`${sidebarCollapsed ? 'col-span-1' : 'col-span-3'} space-y-4`}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 backdrop-blur-sm rounded-t-lg border-b">
              <TabsList className="h-auto p-1 flex-1 justify-start overflow-x-auto bg-transparent">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative group px-3 py-2 flex items-center gap-2 min-w-0 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <FileText className="h-4 w-4" />
                    <span 
                      className="truncate max-w-32"
                      onDoubleClick={() => {
                        const newName = prompt('Enter new tab name:', tab.name);
                        if (newName && newName.trim()) {
                          renameTab(tab.id, newName.trim());
                        }
                      }}
                    >
                      {tab.name}
                    </span>
                    {tab.isModified && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes" />
                    )}
                    {tab.isExecuting && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Executing..." />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                onClick={createNewTab}
                className="ml-2 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Tab
              </Button>
            </div>

            {tabs.map((tab) => (
              <TabsContent 
                key={tab.id} 
                value={tab.id} 
                className="flex-1 mt-4 space-y-4 overflow-hidden"
              >
                <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 backdrop-blur-sm rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                        <Database className="h-3 w-3 mr-1" />
                        {selectedDatabase || 'None'}
                      </Badge>
                      {tab.result && (
                        <Badge className={`${
                          tab.result.status === 'success' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                        } border-0`}>
                          {tab.result.status === 'success' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {tab.result.rowCount} rows • {tab.result.executionTime}s
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Error
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateTab(tab.id)}
                        className="h-9 border-gray-300 hover:bg-gray-100"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSaveQuery?.(tab.name, tab.query)}
                        disabled={!tab.query.trim()}
                        className="h-9 border-amber-300 hover:bg-amber-50 text-amber-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      {tab.result && tab.result.status === 'success' && tab.result.rows && tab.result.rows.length > 0 && (
                        <Select onValueChange={(format) => exportResults(tab.id, format)}>
                          <SelectTrigger className="w-32 h-9 border-green-300 hover:bg-green-50">
                            <SelectValue placeholder="Export" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">
                              <div className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                CSV
                              </div>
                            </SelectItem>
                            <SelectItem value="json">
                              <div className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                JSON
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        onClick={() => executeQuery(tab.id)}
                        disabled={tab.isExecuting || !selectedDatabase || !tab.query.trim()}
                        className="h-9 bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 hover:from-emerald-600 hover:to-green-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        {tab.isExecuting ? 'Executing...' : 'Execute'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className={`grid ${tab.result ? 'grid-rows-2' : 'grid-rows-1'} gap-4 ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'}`}>
                  <div className="overflow-hidden">
                    <SQLEditor
                      value={tab.query}
                      onChange={(query) => updateTabQuery(tab.id, query)}
                      database={selectedDatabase}
                      height={isFullscreen ? '40vh' : '200px'}
                    />
                  </div>

                  {tab.result && (
                    <div className="overflow-hidden">
                      <Card className="h-full border-2">
                        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                tab.result.status === 'success' 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                  : 'bg-gradient-to-br from-red-500 to-rose-600'
                              }`}>
                                {tab.result.status === 'success' ? (
                                  <CheckCircle className="h-5 w-5 text-white" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div>
                                <CardTitle className="text-base font-bold">
                                  {tab.result.status === 'success' ? 'Query Results' : 'Query Error'}
                                </CardTitle>
                                {tab.result.status === 'success' && (
                                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                    <span className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                      {tab.result.rowCount} rows
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                      {tab.result.columns.length} columns
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                      {tab.result.executionTime}s
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-80px)] overflow-auto p-0">
                          {tab.result.status === 'error' ? (
                            <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-500 rounded-full">
                                  <XCircle className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-red-900">Query Execution Failed</p>
                                  <div className="mt-2 p-3 bg-white border-2 border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800 font-mono">{tab.result.error}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                              <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', width: '100%' }}>
                                <table style={{ 
                                  borderCollapse: 'collapse',
                                  display: 'table',
                                  tableLayout: 'auto'
                                }} className="text-sm">
                                  <thead className="sticky top-0 bg-gradient-to-r from-blue-100 to-indigo-100 z-10">
                                    <tr>
                                      {tab.result.columns.map((col) => (
                                        <th 
                                          key={col} 
                                          className="text-left p-3 font-bold text-gray-800 border-b-2 border-blue-300 whitespace-nowrap"
                                          style={{ minWidth: '120px' }}
                                          title={col}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Database className="h-4 w-4 text-blue-600" />
                                            {col}
                                          </div>
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tab.result.rows.slice(0, 100).map((row, index) => (
                                      <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                        {Array.isArray(row) ? (
                                          row.map((cell, cellIndex) => (
                                            <td 
                                              key={cellIndex} 
                                              className="p-3 font-medium whitespace-nowrap"
                                              style={{ 
                                                minWidth: '120px',
                                                maxWidth: '300px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                              }}
                                              title={cell === null || cell === undefined ? 'NULL' : cell.toString()}
                                            >
                                              {cell === null || cell === undefined ? (
                                                <span className="text-gray-400 italic">NULL</span>
                                              ) : (
                                                cell.toString()
                                              )}
                                            </td>
                                          ))
                                        ) : (
                                          tab.result!.columns.map((col, cellIndex) => (
                                            <td 
                                              key={cellIndex} 
                                              className="p-3 font-medium whitespace-nowrap"
                                              style={{ 
                                                minWidth: '120px',
                                                maxWidth: '300px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                              }}
                                              title={(row as any)[col] === null || (row as any)[col] === undefined ? 'NULL' : (row as any)[col].toString()}
                                            >
                                              {(row as any)[col] === null || (row as any)[col] === undefined ? (
                                                <span className="text-gray-400 italic">NULL</span>
                                              ) : (
                                                (row as any)[col].toString()
                                              )}
                                            </td>
                                          ))
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          {tab.result && tab.result.status !== 'error' && tab.result.rowCount > 100 && (
                            <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t-2 border-amber-200">
                              <p className="text-sm font-semibold text-amber-800">
                                Showing first 100 of {tab.result.rowCount} rows • Scroll horizontally to see all columns
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
            </div>

            {/* Collapsible Sidebar */}
            {!sidebarCollapsed && (
              <div className="col-span-1 space-y-4">
                <Tabs defaultValue="saved" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="saved">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Saved
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <History className="h-4 w-4 mr-2" />
                      History
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="saved" className="mt-4">
                    <Card className="border-2 border-amber-200">
                      <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                            <Save className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-sm font-bold">Saved Queries</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-96 overflow-y-auto pt-3">
                        {savedQueries.length === 0 ? (
                          <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-amber-300 mx-auto mb-2" />
                            <p className="text-sm text-amber-600 font-medium">No saved queries yet</p>
                            <p className="text-xs text-amber-500 mt-1">Save queries to access them later</p>
                          </div>
                        ) : (
                          savedQueries.map((query) => (
                            <div 
                              key={query.id} 
                              className="p-3 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-all"
                              onClick={() => loadSavedQuery(query)}
                            >
                              <div className="flex items-center gap-2 font-medium text-sm text-amber-900">
                                <Save className="h-4 w-4 text-amber-600" />
                                <span className="truncate">{query.name}</span>
                              </div>
                              <div className="text-xs text-gray-600 truncate mt-2 p-2 bg-amber-50 rounded font-mono border border-amber-200">
                                {query.query}
                              </div>
                              <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                {new Date(query.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-4">
                    <Card className="border-2 border-purple-200">
                      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-200">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                            <History className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-sm font-bold">Query History</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-96 overflow-y-auto pt-3">
                        {queryHistory.length === 0 ? (
                          <div className="text-center py-8">
                            <History className="h-12 w-12 text-purple-300 mx-auto mb-2" />
                            <p className="text-sm text-purple-600 font-medium">No query history yet</p>
                            <p className="text-xs text-purple-500 mt-1">Execute queries to see history</p>
                          </div>
                        ) : (
                          queryHistory.slice(0, 20).map((item) => (
                            <div 
                              key={item.id} 
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                item.status === 'success' 
                                  ? 'border-green-200 hover:border-green-400 hover:bg-green-50' 
                                  : 'border-red-200 hover:border-red-400 hover:bg-red-50'
                              }`}
                              onClick={() => loadHistoryQuery(item)}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1 rounded-full ${
                                  item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                }`}>
                                  {item.status === 'success' ? (
                                    <CheckCircle className="h-3 w-3 text-white" />
                                  ) : (
                                    <XCircle className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-gray-700">
                                  {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="text-xs text-gray-600">
                                  • {item.executionTime}s
                                </span>
                              </div>
                              <div className="text-xs font-mono text-gray-700 truncate p-2 bg-gray-100 rounded border">
                                {item.query}
                              </div>
                              {item.status === 'success' && item.rowCount !== undefined && (
                                <div className="text-xs text-green-700 mt-2 flex items-center gap-1 font-medium">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                  {item.rowCount} rows returned
                                </div>
                              )}
                              {item.status === 'error' && item.error && (
                                <div className="text-xs text-red-700 mt-2 flex items-center gap-1 font-medium">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                  {item.error}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiTabSQLEditor;
