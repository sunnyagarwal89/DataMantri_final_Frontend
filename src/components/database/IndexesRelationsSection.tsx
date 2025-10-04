import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  Database,
  Table,
  Link,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IndexInfo {
  name: string;
  table: string;
  columns: string[];
  type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FULLTEXT';
  cardinality: number;
  size: string;
}

interface ForeignKeyInfo {
  name: string;
  table: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onUpdate: string;
  onDelete: string;
}

interface IndexesRelationsSectionProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const IndexesRelationsSection: React.FC<IndexesRelationsSectionProps> = ({ connectionStatus }) => {
  const { toast } = useToast();
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [databases, setDatabases] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [indexes, setIndexes] = useState<IndexInfo[]>([]);
  const [foreignKeys, setForeignKeys] = useState<ForeignKeyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateIndexDialog, setShowCreateIndexDialog] = useState(false);
  const [showCreateFKDialog, setShowCreateFKDialog] = useState(false);

  const [createIndexForm, setCreateIndexForm] = useState({
    name: '',
    type: 'INDEX' as 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FULLTEXT',
    columns: [] as string[]
  });

  const [createFKForm, setCreateFKForm] = useState({
    name: '',
    columns: [] as string[],
    referencedTable: '',
    referencedColumns: [] as string[],
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT'
  });

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
      fetchTableColumns();
      fetchIndexes();
      fetchForeignKeys();
    }
  }, [selectedTable]);

  const fetchDatabases = async () => {
    try {
      // Fetch actual data sources from the API
      const response = await fetch('/api/data-sources', { 
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (response.ok) {
        const dataSources = await response.json();
        // Normalize names: trim, dedupe, sort
        const rawNames: string[] = ((dataSources || []) as any[])
          .map((source: any) => String(source?.name ?? '').trim())
          .filter((s: string) => s.length > 0);
        const databaseNames: string[] = Array.from(new Set<string>(rawNames)).sort(
          (a: string, b: string) => a.localeCompare(b)
        );
        console.log('IndexesRelations: Loaded data sources (normalized):', databaseNames);

        setDatabases(databaseNames);

        // Preserve selection if still present; otherwise auto-select first
        if (databaseNames.length > 0) {
          if (!selectedDatabase || !databaseNames.includes(selectedDatabase)) {
            setSelectedDatabase(databaseNames[0] as string);
          }
        } else {
          setSelectedDatabase('');
        }
      } else {
        console.error('IndexesRelations: Failed to fetch data sources. Status:', response.status);
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
      setSelectedDatabase('');
    }
  };

  const fetchTables = async () => {
    if (!selectedDatabase) return;
    
    try {
      console.log('IndexesRelations: Fetching tables for database:', selectedDatabase);
      
      if (selectedDatabase === 'DataMantri Primary Database') {
        // Use primary database schema API
        const schemaResponse = await fetch('/api/database/primary/schema', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (schemaResponse.ok) {
          const schemaData = await schemaResponse.json();
          console.log('IndexesRelations: Primary schema data:', schemaData);
          
          if (schemaData.status === 'success' && schemaData.tables) {
            const tableNames = schemaData.tables.map((table: any) => table.name);
            setTables(tableNames);
            
            // Auto-select first table if available
            if (tableNames.length > 0 && !selectedTable) {
              setSelectedTable(tableNames[0]);
            }
          } else {
            throw new Error('Invalid primary schema response');
          }
        } else {
          throw new Error('Failed to fetch primary schema');
        }
      } else {
        // Find the data source ID for external databases
        const dataSourcesResponse = await fetch('/api/data-sources', { 
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (dataSourcesResponse.ok) {
          const dataSources = await dataSourcesResponse.json();
          const selectedSource = dataSources.find((source: any) => source.name === selectedDatabase);
          
          if (selectedSource) {
            // Fetch schema for this data source
            const schemaResponse = await fetch(`/api/data-sources/${selectedSource.id}/schema`, {
              credentials: 'include',
              cache: 'no-store'
            });
            
            if (schemaResponse.ok) {
              const schemaData = await schemaResponse.json();
              console.log('IndexesRelations: External schema data:', schemaData);
              
              if (schemaData.status === 'success' && schemaData.schema) {
                const tableNames = Object.keys(schemaData.schema);
                setTables(tableNames);
                
                // Auto-select first table if available
                if (tableNames.length > 0 && !selectedTable) {
                  setSelectedTable(tableNames[0]);
                }
              } else {
                throw new Error('Invalid external schema response');
              }
            } else {
              throw new Error('Failed to fetch external schema');
            }
          } else {
            console.error('IndexesRelations: Database not found in data sources');
            setTables([]);
          }
        } else {
          throw new Error('Failed to fetch data sources');
        }
      }
    } catch (error) {
      console.error('IndexesRelations: Error fetching tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tables from data source',
        variant: 'destructive'
      });
      setTables([]);
    }
  };

  const fetchTableColumns = async () => {
    if (!selectedDatabase || !selectedTable) return;
    
    try {
      console.log('IndexesRelations: Fetching columns for table:', selectedTable, 'in database:', selectedDatabase);
      
      if (selectedDatabase === 'DataMantri Primary Database') {
        // Use primary database schema API
        const schemaResponse = await fetch('/api/database/primary/schema', {
          credentials: 'include'
        });
        
        if (schemaResponse.ok) {
          const schemaData = await schemaResponse.json();
          
          if (schemaData.status === 'success' && schemaData.tables) {
            const table = schemaData.tables.find((t: any) => t.name === selectedTable);
            if (table && table.columns) {
              const columnNames = table.columns.map((col: any) => col.name);
              setTableColumns(columnNames);
            } else {
              setTableColumns([]);
            }
          }
        }
      } else {
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
              
              if (schemaData.status === 'success' && schemaData.schema) {
                const columns = schemaData.schema[selectedTable] || [];
                const columnNames = columns.map((col: any) => col.column_name || col.name);
                setTableColumns(columnNames);
                console.log('IndexesRelations: Columns loaded:', columnNames);
              } else {
                setTableColumns([]);
              }
            }
          } else {
            setTableColumns([]);
          }
        }
      }
    } catch (error) {
      console.error('IndexesRelations: Error fetching table columns:', error);
      setTableColumns([]);
    }
  };

  const fetchIndexes = async () => {
    // Mock indexes data for now
    const mockIndexes: IndexInfo[] = [
      {
        name: 'PRIMARY',
        table: selectedTable,
        columns: ['id'],
        type: 'PRIMARY',
        cardinality: 1000,
        size: '16 KB'
      }
    ];
    setIndexes(mockIndexes);
  };

  const fetchForeignKeys = async () => {
    // Mock foreign keys data for now
    setForeignKeys([]);
  };


  const createIndex = async () => {
    if (!createIndexForm.name.trim() || createIndexForm.columns.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter index name and select columns',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/database/index/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          database: selectedDatabase,
          table: selectedTable,
          ...createIndexForm
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Index "${createIndexForm.name}" created successfully`
        });
        setShowCreateIndexDialog(false);
        setCreateIndexForm({ name: '', type: 'INDEX', columns: [] });
        fetchIndexes();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create index',
        variant: 'destructive'
      });
    }
  };

  const createForeignKey = async () => {
    if (!createFKForm.name.trim() || createFKForm.columns.length === 0 || !createFKForm.referencedTable) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/database/foreign-key/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          database: selectedDatabase,
          table: selectedTable,
          ...createFKForm
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Foreign key "${createFKForm.name}" created successfully`
        });
        setShowCreateFKDialog(false);
        setCreateFKForm({
          name: '',
          columns: [],
          referencedTable: '',
          referencedColumns: [],
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
        });
        fetchForeignKeys();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create foreign key',
        variant: 'destructive'
      });
    }
  };

  const deleteIndex = async (indexName: string) => {
    if (indexName === 'PRIMARY') {
      toast({
        title: 'Error',
        description: 'Cannot delete primary key index',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete index "${indexName}"?`)) return;

    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${selectedTable}/index/${indexName}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Index "${indexName}" deleted successfully`
        });
        fetchIndexes();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete index',
        variant: 'destructive'
      });
    }
  };

  const deleteForeignKey = async (fkName: string) => {
    if (!confirm(`Are you sure you want to delete foreign key "${fkName}"?`)) return;

    try {
      const response = await fetch(`/api/database/${selectedDatabase}/table/${selectedTable}/foreign-key/${fkName}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Foreign key "${fkName}" deleted successfully`
        });
        fetchForeignKeys();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete foreign key',
        variant: 'destructive'
      });
    }
  };

  const handleColumnToggle = (column: string, isIndex: boolean = true) => {
    if (isIndex) {
      const newColumns = createIndexForm.columns.includes(column)
        ? createIndexForm.columns.filter(c => c !== column)
        : [...createIndexForm.columns, column];
      setCreateIndexForm({ ...createIndexForm, columns: newColumns });
    } else {
      const newColumns = createFKForm.columns.includes(column)
        ? createFKForm.columns.filter(c => c !== column)
        : [...createFKForm.columns, column];
      setCreateFKForm({ ...createFKForm, columns: newColumns });
    }
  };

  const filteredIndexes = indexes.filter(index =>
    index.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredForeignKeys = foreignKeys.filter(fk =>
    fk.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8">
        <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
            <div className="flex items-center gap-2">
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
              <Button variant="outline" size="sm" onClick={fetchDatabases} title="Refresh databases">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
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
                  placeholder="Search indexes and relations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={() => { fetchIndexes(); fetchForeignKeys(); }} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={showCreateFKDialog} onOpenChange={setShowCreateFKDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Link className="h-4 w-4 mr-2" />
                    Add Foreign Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Foreign Key</DialogTitle>
                    <DialogDescription>
                      Create a foreign key constraint for {selectedTable}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fk-name">Foreign Key Name</Label>
                      <Input
                        id="fk-name"
                        placeholder="Enter foreign key name"
                        value={createFKForm.name}
                        onChange={(e) => setCreateFKForm({...createFKForm, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Columns</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {tableColumns.map((column) => (
                          <div key={column} className="flex items-center space-x-2">
                            <Checkbox
                              id={`fk-col-${column}`}
                              checked={createFKForm.columns.includes(column)}
                              onCheckedChange={() => handleColumnToggle(column, false)}
                            />
                            <Label htmlFor={`fk-col-${column}`} className="text-sm">{column}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ref-table">Referenced Table</Label>
                      <Select value={createFKForm.referencedTable} onValueChange={(value) => setCreateFKForm({...createFKForm, referencedTable: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select referenced table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((table) => (
                            <SelectItem key={table} value={table}>{table}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="on-update">On Update</Label>
                        <Select value={createFKForm.onUpdate} onValueChange={(value) => setCreateFKForm({...createFKForm, onUpdate: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RESTRICT">RESTRICT</SelectItem>
                            <SelectItem value="CASCADE">CASCADE</SelectItem>
                            <SelectItem value="SET NULL">SET NULL</SelectItem>
                            <SelectItem value="NO ACTION">NO ACTION</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="on-delete">On Delete</Label>
                        <Select value={createFKForm.onDelete} onValueChange={(value) => setCreateFKForm({...createFKForm, onDelete: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RESTRICT">RESTRICT</SelectItem>
                            <SelectItem value="CASCADE">CASCADE</SelectItem>
                            <SelectItem value="SET NULL">SET NULL</SelectItem>
                            <SelectItem value="NO ACTION">NO ACTION</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={createForeignKey} className="w-full">
                      Create Foreign Key
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateIndexDialog} onOpenChange={setShowCreateIndexDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Index
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Index</DialogTitle>
                    <DialogDescription>
                      Create a new index for {selectedTable}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="index-name">Index Name</Label>
                      <Input
                        id="index-name"
                        placeholder="Enter index name"
                        value={createIndexForm.name}
                        onChange={(e) => setCreateIndexForm({...createIndexForm, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="index-type">Index Type</Label>
                      <Select value={createIndexForm.type} onValueChange={(value: any) => setCreateIndexForm({...createIndexForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INDEX">INDEX</SelectItem>
                          <SelectItem value="UNIQUE">UNIQUE</SelectItem>
                          <SelectItem value="FULLTEXT">FULLTEXT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Columns</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {tableColumns.map((column) => (
                          <div key={column} className="flex items-center space-x-2">
                            <Checkbox
                              id={`idx-col-${column}`}
                              checked={createIndexForm.columns.includes(column)}
                              onCheckedChange={() => handleColumnToggle(column, true)}
                            />
                            <Label htmlFor={`idx-col-${column}`} className="text-sm">{column}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button onClick={createIndex} className="w-full">
                      Create Index
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs for Indexes and Foreign Keys */}
          <Tabs defaultValue="indexes" className="w-full">
            <TabsList>
              <TabsTrigger value="indexes">Indexes</TabsTrigger>
              <TabsTrigger value="foreign-keys">Foreign Keys</TabsTrigger>
            </TabsList>
            
            <TabsContent value="indexes">
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
                  filteredIndexes.map((index) => (
                    <Card key={index.name} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            <span className="truncate">{index.name}</span>
                          </div>
                          <Badge variant={index.type === 'PRIMARY' ? 'default' : 'outline'}>
                            {index.type}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {index.columns.join(', ')} • {index.size}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Cardinality:</span>
                            <br />
                            <span className="font-mono">{index.cardinality.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline">
                              <Zap className="h-3 w-3 mr-1" />
                              Analyze
                            </Button>
                            {index.type !== 'PRIMARY' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => deleteIndex(index.name)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {filteredIndexes.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No indexes match your search' : 'No indexes found'}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="foreign-keys">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredForeignKeys.map((fk) => (
                  <Card key={fk.name} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          <span className="truncate">{fk.name}</span>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {fk.columns.join(', ')} → {fk.referencedTable}.{fk.referencedColumns.join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">On Update:</span>
                            <br />
                            <Badge variant="outline">{fk.onUpdate}</Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">On Delete:</span>
                            <br />
                            <Badge variant="outline">{fk.onDelete}</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteForeignKey(fk.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredForeignKeys.length === 0 && (
                <div className="text-center py-8">
                  <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No foreign keys match your search' : 'No foreign keys found'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default IndexesRelationsSection;
