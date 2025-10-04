import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Search,
  RefreshCw,
  Settings,
  Database,
  Columns,
  Key,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TableInfo {
  name: string;
  engine: string;
  rows: number;
  size: string;
  autoIncrement: number | null;
  created: string;
  updated: string;
  collation: string;
}

interface TableManagementSectionProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const TableManagementSection: React.FC<TableManagementSectionProps> = ({ connectionStatus }) => {
  const { toast } = useToast();
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [databases, setDatabases] = useState<string[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStructureDialog, setShowStructureDialog] = useState(false);
  const [showBrowseDialog, setShowBrowseDialog] = useState(false);
  const [selectedTableForAction, setSelectedTableForAction] = useState<string>('');
  const [tableStructure, setTableStructure] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  const [createForm, setCreateForm] = useState({
    name: '',
    columns: [{
      name: 'id',
      type: 'SERIAL',
      primary_key: true,
      not_null: true,
      unique: false,
      default: ''
    }]
  });

  const postgresDataTypes = [
    'SERIAL', 'BIGSERIAL', 'INTEGER', 'BIGINT', 'SMALLINT',
    'DECIMAL', 'NUMERIC', 'REAL', 'DOUBLE PRECISION',
    'VARCHAR(255)', 'TEXT', 'CHAR(10)', 'BOOLEAN',
    'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ',
    'JSON', 'JSONB', 'UUID', 'BYTEA'
  ];

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchDatabases();
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (selectedDatabase) {
      fetchTables();
    }
  }, [selectedDatabase]);

  const fetchDatabases = async () => {
    try {
      // Fetch actual data sources from the API
      const response = await fetch('/api/data-sources', { 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const dataSources = await response.json();
        const databaseNames = dataSources.map((source: any) => source.name);
        setDatabases(databaseNames);
        
        // Auto-select first database if available
        if (databaseNames.length > 0 && !selectedDatabase) {
          setSelectedDatabase(databaseNames[0]);
        }
      } else {
        throw new Error('Failed to fetch data sources');
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data sources',
        variant: 'destructive'
      });
      // Show empty state
      setDatabases([]);
    }
  };

  const fetchTables = async () => {
    if (!selectedDatabase) return;
    
    setLoading(true);
    try {
      // Find the data source ID for the selected database
      const dataSourcesResponse = await fetch('/api/data-sources', { 
        credentials: 'include' 
      });
      
      if (dataSourcesResponse.ok) {
        const dataSources = await dataSourcesResponse.json();
        const selectedSource = dataSources.find((source: any) => source.name === selectedDatabase);
        
        if (selectedSource) {
          // Fetch schema for this data source
          const schemaResponse = await fetch(`/api/data-sources/${selectedSource.id}/schema`, {
            credentials: 'include'
          });
          
          if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
            const schema = schemaData.schema || {};
            
            // Transform schema into table format
            const transformedTables: TableInfo[] = Object.entries(schema).map(([tableName, columns]: [string, any]) => ({
              name: tableName,
              engine: selectedSource.type === 'mysql' ? 'InnoDB' : selectedSource.type.toUpperCase(),
              rows: Math.floor(Math.random() * 1000) + 100, // Mock row count
              size: `${Math.floor(Math.random() * 500) + 50} KB`, // Mock size
              autoIncrement: Math.floor(Math.random() * 1000) + 1,
              created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
              updated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              collation: 'utf8mb4_unicode_ci'
            }));
            
            setTables(transformedTables);
          } else {
            throw new Error('Failed to fetch schema');
          }
        } else {
          setTables([]);
        }
      } else {
        throw new Error('Failed to fetch data sources');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tables from data source',
        variant: 'destructive'
      });
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const addColumn = () => {
    setCreateForm(prev => ({
      ...prev,
      columns: [...prev.columns, {
        name: '',
        type: 'VARCHAR(255)',
        primary_key: false,
        not_null: false,
        unique: false,
        default: ''
      }]
    }));
  };

  const removeColumn = (index: number) => {
    if (createForm.columns.length > 1) {
      setCreateForm(prev => ({
        ...prev,
        columns: prev.columns.filter((_, i) => i !== index)
      }));
    }
  };

  const updateColumn = (index: number, field: string, value: any) => {
    setCreateForm(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, [field]: value } : col
      )
    }));
  };

  const createTable = async () => {
    if (!createForm.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Table name is required',
        variant: 'destructive'
      });
      return;
    }

    // Validate columns
    for (let i = 0; i < createForm.columns.length; i++) {
      const col = createForm.columns[i];
      if (!col.name.trim()) {
        toast({
          title: 'Validation Error',
          description: `Column ${i + 1} name is required`,
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm)
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        toast({
          title: 'Success',
          description: result.message
        });
        setShowCreateDialog(false);
        setCreateForm({
          name: '',
          columns: [{
            name: 'id',
            type: 'SERIAL',
            primary_key: true,
            not_null: true,
            unique: false,
            default: ''
          }]
        });
        fetchTables();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create table',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create table',
        variant: 'destructive'
      });
    }
  };

  const deleteTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to delete table "${tableName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${tableName}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Table "${tableName}" deleted successfully`
        });
        fetchTables();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete table',
        variant: 'destructive'
      });
    }
  };

  const optimizeTable = async (tableName: string) => {
    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${tableName}/optimize`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          toast({
            title: 'Success',
            description: result.message || `Table "${tableName}" optimized successfully`
          });
          fetchTables();
        } else {
          throw new Error(result.message || 'Optimization failed');
        }
      } else {
        throw new Error('Failed to optimize table');
      }
    } catch (error) {
      console.error('Error optimizing table:', error);
      toast({
        title: 'Error',
        description: `Failed to optimize table: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const truncateTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to truncate table "${tableName}"? All data will be deleted.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${tableName}/truncate`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Table "${tableName}" truncated successfully`
        });
        fetchTables();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to truncate table',
        variant: 'destructive'
      });
    }
  };

  const viewTableStructure = async (tableName: string) => {
    setSelectedTableForAction(tableName);
    setShowStructureDialog(true);
    
    try {
      // Find the data source and get columns for the selected table
      const dataSourcesResponse = await fetch('/api/data-sources', { 
        credentials: 'include' 
      });
      
      if (dataSourcesResponse.ok) {
        const dataSources = await dataSourcesResponse.json();
        const selectedSource = dataSources.find((source: any) => source.name === selectedDatabase);
        
        if (selectedSource) {
          const schemaResponse = await fetch(`/api/data-sources/${selectedSource.id}/schema`, {
            credentials: 'include'
          });
          
          if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
            const schema = schemaData.schema || {};
            // Handle both old format (array) and new format (object with columns)
            const tableData = schema[tableName] || {};
            const columns = tableData.columns || tableData || [];
            setTableStructure(columns);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching table structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch table structure',
        variant: 'destructive'
      });
    }
  };

  const browseTableData = async (tableName: string) => {
    setSelectedTableForAction(tableName);
    setShowBrowseDialog(true);
    
    try {
      // Fetch actual table data from the API
      const response = await fetch(`/api/database/${selectedDatabase}/table/${tableName}/browse?limit=100`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setTableData(result.data || []);
        } else {
          throw new Error(result.message || 'Failed to fetch table data');
        }
      } else {
        throw new Error('Failed to fetch table data');
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch table data: ${error.message}`,
        variant: 'destructive'
      });
      // Set empty data on error
      setTableData([]);
    }
  };

  const copyTable = async (tableName: string) => {
    const newName = prompt(`Enter new name for copy of "${tableName}":`, `${tableName}_copy`);
    if (!newName) return;

    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${tableName}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newName })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Table copied as "${newName}" successfully`
        });
        fetchTables();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy table',
        variant: 'destructive'
      });
    }
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8">
        <Table className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {connectionStatus === 'connecting' ? 'Connecting to database server...' : 'Not connected to database server'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Database Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Database</CardTitle>
          <CardDescription>Choose a database to manage its tables</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a database" />
            </SelectTrigger>
            <SelectContent>
              {databases.map((db) => (
                <SelectItem key={db} value={db}>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {db}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDatabase && (
        <>
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={fetchTables} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Table</DialogTitle>
                  <DialogDescription>
                    Create a new table in {selectedDatabase}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="table-name">Table Name</Label>
                    <Input
                      id="table-name"
                      placeholder="Enter table name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    />
                  </div>
                  
                  {/* Column Definitions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Columns</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Column
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {createForm.columns.map((column, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Column {index + 1}</span>
                            {createForm.columns.length > 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeColumn(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`column-name-${index}`}>Name</Label>
                              <Input
                                id={`column-name-${index}`}
                                value={column.name}
                                onChange={(e) => updateColumn(index, 'name', e.target.value)}
                                placeholder="column_name"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`column-type-${index}`}>Data Type</Label>
                              <Select 
                                value={column.type} 
                                onValueChange={(value) => updateColumn(index, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {postgresDataTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`primary-key-${index}`}
                                  checked={column.primary_key}
                                  onChange={(e) => updateColumn(index, 'primary_key', e.target.checked)}
                                  className="rounded"
                                />
                                <Label htmlFor={`primary-key-${index}`} className="text-sm">Primary Key</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`not-null-${index}`}
                                  checked={column.not_null}
                                  onChange={(e) => updateColumn(index, 'not_null', e.target.checked)}
                                  className="rounded"
                                />
                                <Label htmlFor={`not-null-${index}`} className="text-sm">Not Null</Label>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`unique-${index}`}
                                  checked={column.unique}
                                  onChange={(e) => updateColumn(index, 'unique', e.target.checked)}
                                  className="rounded"
                                />
                                <Label htmlFor={`unique-${index}`} className="text-sm">Unique</Label>
                              </div>
                              <div>
                                <Label htmlFor={`default-${index}`} className="text-sm">Default</Label>
                                <Input
                                  id={`default-${index}`}
                                  value={column.default}
                                  onChange={(e) => updateColumn(index, 'default', e.target.value)}
                                  placeholder="default value"
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={createTable} className="w-full">
                    Create Table
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredTables.map((table) => (
                <Card key={table.name} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        <span className="truncate">{table.name}</span>
                      </div>
                      <Badge variant="outline">{table.engine}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {table.rows.toLocaleString()} rows • {table.size}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Auto Inc:</span>
                          <br />
                          <span className="font-mono">{table.autoIncrement || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Updated:</span>
                          <br />
                          <span className="text-xs">{new Date(table.updated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => viewTableStructure(table.name)}>
                          <Columns className="h-3 w-3 mr-1" />
                          Structure
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => browseTableData(table.name)}>
                          <Key className="h-3 w-3 mr-1" />
                          Browse
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => optimizeTable(table.name)}>
                          <Zap className="h-3 w-3 mr-1" />
                          Optimize
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyTable(table.name)}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => truncateTable(table.name)}
                          className="text-orange-600 hover:text-orange-600"
                        >
                          Truncate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteTable(table.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {filteredTables.length === 0 && !loading && (
            <div className="text-center py-8">
              <Table className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No tables match your search' : 'No tables found in this database'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Structure Dialog */}
      <Dialog open={showStructureDialog} onOpenChange={setShowStructureDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Table Structure: {selectedTableForAction}</DialogTitle>
            <DialogDescription>
              Column definitions and properties for the selected table
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {tableStructure.length > 0 ? (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Column</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Null</th>
                      <th className="text-left p-3 font-medium">Key</th>
                      <th className="text-left p-3 font-medium">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableStructure.map((column: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 font-mono">{column.name}</td>
                        <td className="p-3">{column.type}</td>
                        <td className="p-3">{column.nullable ? 'YES' : 'NO'}</td>
                        <td className="p-3">{column.key || ''}</td>
                        <td className="p-3 font-mono">{column.default || 'NULL'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No structure information available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Browse Data Dialog */}
      <Dialog open={showBrowseDialog} onOpenChange={setShowBrowseDialog}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Browse Data: {selectedTableForAction}</DialogTitle>
            <DialogDescription>
              Table data preview (first 100 rows)
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            {tableData.length > 0 ? (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(tableData[0]).map((column) => (
                        <th key={column} className="text-left p-3 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row: any, index: number) => (
                      <tr key={index} className="border-t hover:bg-muted/50">
                        {Object.values(row).map((value: any, cellIndex: number) => (
                          <td key={cellIndex} className="p-3 font-mono text-sm">
                            {value !== null ? String(value) : <span className="text-muted-foreground">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableManagementSection;
