import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Play, RefreshCw, Database, Code2, Zap, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MultiTabSQLEditor from './MultiTabSQLEditor';

interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
  affectedRows?: number;
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

interface SQLExecutionSectionProps {
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

const SQLExecutionSection: React.FC<SQLExecutionSectionProps> = ({ connectionStatus }) => {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [databases, setDatabases] = useState<any[]>([]);
  const { toast } = useToast();
  
  // State management

  // Fetch available databases from Data Sources Builder
  const fetchDatabases = async () => {
    try {
      // Fetch data sources
      const dataSourcesResponse = await fetch('/api/data-sources', {
        credentials: 'include'
      });
      
      // Fetch data marts
      const dataMartsResponse = await fetch('/api/data-marts', {
        credentials: 'include'
      });
      
      if (dataSourcesResponse.ok && dataMartsResponse.ok) {
        const dataSources = await dataSourcesResponse.json();
        const dataMarts = await dataMartsResponse.json();
        
        // Combine data sources and data marts
        const allDatabases = [
          ...dataSources.map((ds: any) => ({
            ...ds,
            type: 'datasource',
            displayName: `📊 ${ds.name} (${ds.connection_type})`
          })),
          ...dataMarts.map((dm: any) => ({
            ...dm,
            type: 'datamart',
            displayName: `🎯 ${dm.name} (Data Mart)`
          }))
        ];
        
        setDatabases(allDatabases);
        
        // Set default database if none selected
        if (allDatabases.length > 0 && !selectedDatabase) {
          setSelectedDatabase(allDatabases[0].name);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch databases',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to databases',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    // Fetch databases on component mount
    fetchDatabases();
  }, []);

  useEffect(() => {
    // Set default database when databases are loaded
    if (databases.length > 0 && !selectedDatabase) {
      setSelectedDatabase(databases[0].name);
    }
  }, [databases, selectedDatabase]);


  const executeQueryForTab = async (query: string, tabId: string): Promise<QueryResult> => {
    if (!query.trim() || !selectedDatabase) {
      throw new Error('Please enter a SQL query and select a database');
    }

    const startTime = Date.now();

    try {
      // Find the selected database/datamart
      const selectedDb = databases.find((db: any) => db.name === selectedDatabase);
      
      if (!selectedDb) {
        throw new Error(`Database '${selectedDatabase}' not found`);
      }

      let response: Response;
      
      if (selectedDb.type === 'datamart') {
        // For data marts, we need to execute against the underlying data source
        // Get the data mart details to find its source
        const dataMartResponse = await fetch(`/api/data-marts/${selectedDb.id}`, {
          credentials: 'include'
        });
        
        if (!dataMartResponse.ok) {
          throw new Error('Failed to fetch data mart details');
        }
        
        const dataMart = await dataMartResponse.json();
        const sourceId = dataMart.definition?.dataSourceId || dataMart.data_source_id;
        
        if (!sourceId) {
          throw new Error('Data mart has no associated data source');
        }
        
        response = await fetch('/api/data-marts/execute-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            data_source_id: sourceId,
            query: query
          })
        });
      } else {
        // For data sources, execute directly
        response = await fetch('/api/data-marts/execute-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            data_source_id: selectedDb.id,
            query: query
          })
        });
      }

      const result = await response.json();
      const executionTime = (Date.now() - startTime) / 1000;
      
      if (response.ok && result.status === 'success') {
        const queryResult: QueryResult = {
          columns: result.columns || [],
          rows: result.data || result.rows || [],
          rowCount: result.row_count || (result.data || result.rows || []).length,
          executionTime: executionTime,
          status: 'success'
        };
        
        
        // Add to history
        const historyEntry: QueryHistory = {
          id: Date.now().toString(),
          query: query,
          timestamp: new Date().toISOString(),
          executionTime: executionTime,
          status: 'success',
          rowCount: queryResult.rowCount
        };
        setQueryHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
        
        return queryResult;
      } else {
        throw new Error(result.message || 'Query execution failed');
      }
    } catch (error: any) {
      const executionTime = (Date.now() - startTime) / 1000;
      
      // Add error to history
      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        query: query,
        timestamp: new Date().toISOString(),
        executionTime: executionTime,
        status: 'error',
        error: error.message
      };
      setQueryHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
      
      // Return error result instead of throwing
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: executionTime,
        status: 'error',
        error: error.message
      };
    }
  };

  const handleSaveQuery = (name: string, query: string) => {
    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      name: name,
      query: query,
      createdAt: new Date().toISOString()
    };
    
    setSavedQueries([newQuery, ...savedQueries]);
    
    toast({
      title: 'Success',
      description: 'Query saved successfully'
    });
  };

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8">
        <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {connectionStatus === 'connecting' ? 'Connecting to database server...' : 'Not connected to database server'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Beautiful Header Section */}
      <Card className="border-2 border-orange-200 shadow-xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 p-6">
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <Code2 className="h-10 w-10 text-white" />
            </div>
            
            {/* Title & Description */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                SQL Query Execution
                <Zap className="h-6 w-6 text-yellow-200 animate-pulse" />
              </h2>
              <p className="text-white/90 text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Execute powerful SQL queries across your data sources
              </p>
            </div>

            {/* Connection Status Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Connected</span>
            </div>
          </div>
        </div>

        {/* Database Selection Section */}
        <CardContent className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="database-select" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Database className="h-5 w-5 text-orange-600" />
                Select Data Source
              </Label>
              <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 text-base">
                  <SelectValue placeholder="Choose a database to query..." />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db) => (
                    <SelectItem key={db.id || db.name} value={db.name}>
                      <div className="flex items-center gap-3 py-1">
                        <div className={`p-2 rounded-lg ${db.type === 'datamart' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                          <Database className={`h-4 w-4 ${db.type === 'datamart' ? 'text-purple-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{db.displayName || db.name}</div>
                          <div className="text-xs text-gray-500">{db.type === 'datamart' ? 'Data Mart' : (db.connection_type || 'Database')}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Refresh Button */}
            <Button
              onClick={fetchDatabases}
              className="h-12 px-6 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              title="Refresh database list"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Info Message */}
          {selectedDatabase && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Connected to: <span className="font-bold">{selectedDatabase}</span>
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Write your SQL queries below and execute them with confidence
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multi-Tab SQL Editor */}
      <MultiTabSQLEditor
        selectedDatabase={selectedDatabase}
        onExecuteQuery={executeQueryForTab}
        onSaveQuery={handleSaveQuery}
        savedQueries={savedQueries}
        queryHistory={queryHistory}
      />
    </div>
  );
};

export default SQLExecutionSection;
