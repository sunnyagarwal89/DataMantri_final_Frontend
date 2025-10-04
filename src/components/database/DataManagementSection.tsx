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
  Edit3, 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  Download,
  Upload,
  Filter,
  ChevronLeft,
  ChevronRight,
  Database,
  Table
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataRow {
  [key: string]: any;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: any;
}

interface DataManagementSectionProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const DataManagementSection: React.FC<DataManagementSectionProps> = ({ connectionStatus }) => {
  const { toast } = useToast();
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [databases, setDatabases] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [rowsPerPage] = useState(25);
  const [showInsertDialog, setShowInsertDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRow, setEditingRow] = useState<DataRow | null>(null);
  const [insertForm, setInsertForm] = useState<DataRow>({});

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

  useEffect(() => {
    if (selectedTable) {
      fetchColumns();
      fetchData();
    }
  }, [selectedTable, currentPage, searchTerm]);

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
      setDatabases([]);
    }
  };

  const fetchTables = async () => {
    if (!selectedDatabase) return;
    
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
            const tableNames = Object.keys(schema);
            setTables(tableNames);
            
            // Auto-select first table if available
            if (tableNames.length > 0 && !selectedTable) {
              setSelectedTable(tableNames[0]);
            }
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
    }
  };

  const fetchColumns = async () => {
    if (!selectedTable || !selectedDatabase) return;
    
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
            const tableColumns = schema[selectedTable] || [];
            
            // Transform schema columns to ColumnInfo format
            const columnInfo: ColumnInfo[] = tableColumns.map((col: any) => ({
              name: col.name,
              type: col.type,
              nullable: col.nullable,
              key: col.key || '',
              default: col.default
            }));
            
            setColumns(columnInfo);
            
            // Initialize insert form with default values
            const formDefaults: DataRow = {};
            columnInfo.forEach(col => {
              if (col.default !== null) {
                formDefaults[col.name] = col.default;
              } else {
                formDefaults[col.name] = '';
              }
            });
            setInsertForm(formDefaults);
          } else {
            throw new Error('Failed to fetch schema');
          }
        }
      } else {
        throw new Error('Failed to fetch data sources');
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch columns',
        variant: 'destructive'
      });
    }
  };

  const fetchData = async () => {
    if (!selectedTable || !selectedDatabase) return;
    
    setLoading(true);
    try {
      const offset = (currentPage - 1) * rowsPerPage;
      let url = `/api/database/${selectedDatabase}/table/${selectedTable}/browse?limit=${rowsPerPage}&offset=${offset}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setData(result.data || []);
          setTotalRows(result.total || 0);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch data: ${error.message}`,
        variant: 'destructive'
      });
      // Set empty data on error
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const insertRow = async () => {
    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${selectedTable}/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(insertForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Row inserted successfully'
        });
        setShowInsertDialog(false);
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to insert row',
        variant: 'destructive'
      });
    }
  };

  const updateRow = async () => {
    if (!editingRow) return;
    
    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${selectedTable}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingRow)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Row updated successfully'
        });
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update row',
        variant: 'destructive'
      });
    }
  };

  const deleteRow = async (rowId: any) => {
    if (!confirm('Are you sure you want to delete this row?')) return;
    
    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${selectedTable}/delete/${rowId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Row deleted successfully'
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete row',
        variant: 'destructive'
      });
    }
  };

  const exportData = async (format: string) => {
    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${selectedTable}/export?format=${format}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTable}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Success',
          description: `Data exported as ${format.toUpperCase()}`
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive'
      });
    }
  };

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8">
        <Edit3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {connectionStatus === 'connecting' ? 'Connecting to database server...' : 'Not connected to database server'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Database and Table Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
              <SelectTrigger>
                <SelectValue placeholder="Select database" />
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

        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTable} onValueChange={setSelectedTable} disabled={!selectedDatabase}>
              <SelectTrigger>
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table} value={table}>
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      {table}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedTable && (
        <>
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select onValueChange={(format) => exportData(format)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showInsertDialog} onOpenChange={setShowInsertDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Insert Row
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Insert New Row</DialogTitle>
                    <DialogDescription>
                      Add a new row to {selectedTable}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {columns.map((col) => (
                      <div key={col.name}>
                        <Label htmlFor={col.name}>
                          {col.name}
                          {col.key === 'PRI' && <Badge variant="outline" className="ml-2">Primary</Badge>}
                          {col.key === 'UNI' && <Badge variant="outline" className="ml-2">Unique</Badge>}
                          {!col.nullable && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                          id={col.name}
                          placeholder={col.type}
                          value={insertForm[col.name] || ''}
                          onChange={(e) => setInsertForm({...insertForm, [col.name]: e.target.value})}
                          disabled={col.key === 'PRI' && col.name === 'id'}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {col.type} {col.default && `• Default: ${col.default}`}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={insertRow} className="w-full">
                    Insert Row
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data ({totalRows} rows)</CardTitle>
              <CardDescription>
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} rows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        {columns.map((col) => (
                          <th key={col.name} className="text-left p-2 font-medium">
                            <div className="flex items-center gap-1">
                              {col.name}
                              {col.key === 'PRI' && <Badge variant="outline" className="text-xs">PK</Badge>}
                              {col.key === 'UNI' && <Badge variant="outline" className="text-xs">UK</Badge>}
                            </div>
                          </th>
                        ))}
                        <th className="text-left p-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          {columns.map((col) => (
                            <td key={col.name} className="p-2">
                              <div className="max-w-32 truncate">
                                {row[col.name]?.toString() || <span className="text-muted-foreground">NULL</span>}
                              </div>
                            </td>
                          ))}
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingRow(row);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteRow(row.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Row</DialogTitle>
                <DialogDescription>
                  Modify the selected row in {selectedTable}
                </DialogDescription>
              </DialogHeader>
              {editingRow && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {columns.map((col) => (
                    <div key={col.name}>
                      <Label htmlFor={`edit-${col.name}`}>
                        {col.name}
                        {col.key === 'PRI' && <Badge variant="outline" className="ml-2">Primary</Badge>}
                        {col.key === 'UNI' && <Badge variant="outline" className="ml-2">Unique</Badge>}
                        {!col.nullable && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={`edit-${col.name}`}
                        placeholder={col.type}
                        value={editingRow[col.name]?.toString() || ''}
                        onChange={(e) => setEditingRow({...editingRow, [col.name]: e.target.value})}
                        disabled={col.key === 'PRI'}
                      />
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={updateRow} className="w-full">
                Update Row
              </Button>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default DataManagementSection;
