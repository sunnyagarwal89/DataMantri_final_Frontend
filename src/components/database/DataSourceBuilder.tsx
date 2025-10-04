import React, { useState, useEffect } from 'react';
import CreateDataSourceView from '../views/CreateDataSourceView';
import EditDataSourceView from '../views/EditDataSourceView';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Pencil, Database, Table, Link, Plus, Search, RefreshCw, Edit3, Key, Zap, AlertTriangle, ChevronLeft, ChevronRight, Download, Upload, ChevronDown, Table2, Hash, ToggleLeft, Calendar, FileText, Network, GitBranch } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// Interfaces
interface DataSource {
  id: string;
  name: string;
  connection_type: string;
  description?: string;
  is_active?: boolean;
  test_status?: string;
  created_at?: string;
}

interface DataRow { [key: string]: any; }
interface ColumnInfo { name: string; type: string; nullable: boolean; key: string; default: any; }
interface IndexInfo { name: string; table: string; columns: string[]; type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FULLTEXT'; cardinality: number; size: string; }
interface ForeignKeyInfo { name: string; table: string; columns: string[]; referencedTable: string; referencedColumns: string[]; onUpdate: string; onDelete: string; }

const DataSourceBuilder: React.FC<{ connectionStatus?: string }> = () => {
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);

  useEffect(() => {
    if (view === 'list') {
      fetch('/api/data-sources', { credentials: 'include', cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => setDataSources(Array.isArray(data) ? data : []))
        .catch((error) => console.error('Error fetching data sources:', error));
    }
  }, [view]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/data-sources/${id}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        setDataSources(dataSources.filter((source) => source.id !== id));
        toast({ title: 'Success', description: 'Data source deleted successfully.' });
      } else {
        const errorData = await response.json();
        toast({ title: 'Error', description: `Failed to delete data source: ${errorData.message}`, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  if (view === 'create') {
    return <CreateDataSourceView onCancel={() => setView('list')} />;
  }

  if (view === 'edit' && editingId) {
    return <EditDataSourceView dataSourceId={editingId} onCancel={() => setView('list')} onSaved={() => setView('list')} />;
  }

  if (selectedDataSource) {
    return <DataSourceDetailView dataSource={selectedDataSource} onBack={() => setSelectedDataSource(null)} />
  }

  const getTypeIcon = (type: string) => {
    const typeMap: {[key: string]: string} = {
      'postgresql': '🐘',
      'mysql': '🐬',
      'mongodb': '🍃',
      'sqlite': '💾',
      'mssql': '🗂️',
      'oracle': '🏛️'
    };
    return typeMap[type.toLowerCase()] || '📊';
  };

  const getTypeColor = (type: string) => {
    const colorMap: {[key: string]: string} = {
      'postgresql': 'from-blue-500 to-blue-600',
      'mysql': 'from-orange-500 to-orange-600',
      'mongodb': 'from-green-500 to-green-600',
      'sqlite': 'from-gray-500 to-gray-600',
      'mssql': 'from-red-500 to-red-600',
      'oracle': 'from-purple-500 to-purple-600'
    };
    return colorMap[type.toLowerCase()] || 'from-indigo-500 to-indigo-600';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
          <p className="text-gray-600 mt-1">Connect and manage your database connections</p>
        </div>
        <Button 
          onClick={() => setView('create')} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Data Source
        </Button>
      </div>

      {/* Stats Cards */}
      {dataSources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Sources</p>
                  <p className="text-2xl font-bold text-blue-700">{dataSources.length}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <Database className="h-8 w-8 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active</p>
                  <p className="text-2xl font-bold text-green-700">{dataSources.filter(s => s.is_active).length}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-xl">
                  <Zap className="h-8 w-8 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Types</p>
                  <p className="text-2xl font-bold text-purple-700">{new Set(dataSources.map(s => s.connection_type)).size}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <Table className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Recent</p>
                  <p className="text-2xl font-bold text-orange-700">{dataSources.filter(s => new Date(s.created_at || 0).getTime() > Date.now() - 7*24*60*60*1000).length}</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-xl">
                  <Calendar className="h-8 w-8 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataSources.map((source) => (
          <Card 
            key={source.id} 
            className="overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all"
          >
            <CardHeader className={`bg-gradient-to-r ${getTypeColor(source.connection_type)} text-white p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypeIcon(source.connection_type)}</span>
                  <div>
                    <CardTitle className="text-lg font-bold">{source.name}</CardTitle>
                    <p className="text-sm opacity-90">{source.connection_type}</p>
                  </div>
                </div>
                {source.is_active && (
                  <Badge className="bg-green-500 text-white border-0">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="mb-4">{source.description || 'No description'}</CardDescription>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDataSource(source)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Database className="mr-1 h-3 w-3" />
                  Manage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(source.id);
                    setView('edit');
                  }}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                      </Button>
                    </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                        Are you sure you want to delete "{source.name}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(source.id)}
                        >
                          Delete
                        </Button>
                      </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dataSources.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Database className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Sources Yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first data source connection</p>
            <Button 
              onClick={() => setView('create')} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Data Source
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const DataSourceDetailView = ({ dataSource, onBack }: { dataSource: DataSource, onBack: () => void }) => {
  return (
    <div className="p-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Data Sources
        </Button>
        <h1 className="text-2xl font-bold mb-4">{dataSource.name} ({dataSource.connection_type})</h1>
        <Tabs defaultValue="schema">
            <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="schema">
                  <Table className="h-4 w-4 mr-2" />
                  Schema
                </TabsTrigger>
                <TabsTrigger value="data-browser">
                  <Database className="h-4 w-4 mr-2" />
                  Data Browser
                </TabsTrigger>
                <TabsTrigger value="indexes">
                  <Key className="h-4 w-4 mr-2" />
                  Indexes & Relations
                </TabsTrigger>
                <TabsTrigger value="er-diagram">
                  <Network className="h-4 w-4 mr-2" />
                  ER Diagram
                </TabsTrigger>
            </TabsList>
            <TabsContent value="schema"><SchemaView dataSource={dataSource} /></TabsContent>
            <TabsContent value="data-browser"><DataBrowser dataSource={dataSource} /></TabsContent>
            <TabsContent value="indexes"><IndexesView dataSource={dataSource} /></TabsContent>
            <TabsContent value="er-diagram"><ERDiagramView dataSource={dataSource} /></TabsContent>
        </Tabs>
    </div>
  )
}

const SchemaView = ({ dataSource }: { dataSource: DataSource }) => {
    const [schema, setSchema] = useState<any>(null);
    const [isLoadingSchema, setIsLoadingSchema] = useState(false);
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchSchema = async () => {
        setIsLoadingSchema(true);
        try {
            const response = await fetch(`/api/data-sources/${dataSource.id}/schema`, {
                credentials: 'include',
                cache: 'no-store'
            });
            if (response.ok) {
                const data = await response.json();
                setSchema(data.schema);
                toast({ title: 'Success', description: 'Schema loaded successfully' });
            } else {
                throw new Error('Failed to fetch schema');
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to load schema', variant: 'destructive' });
        } finally {
            setIsLoadingSchema(false);
        }
    };

    useEffect(() => {
        fetchSchema();
    }, [dataSource.id]);

    const toggleTable = (tableName: string) => {
        setExpandedTables((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(tableName)) {
                newSet.delete(tableName);
            } else {
                newSet.add(tableName);
            }
            return newSet;
        });
    };

    const filteredSchema = schema 
        ? Object.entries(schema).filter(([tableName]) => 
            tableName.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <div className="space-y-6 mt-6">
            {/* Header Section */}
            <Card className="border-2 border-blue-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                                <Table2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-gray-800">Database Schema</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">
                                    {schema ? `${Object.keys(schema).length} tables` : 'Loading...'}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-white px-4 py-2 text-base">
                            {dataSource.name}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search tables..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-2 border-blue-200 focus:border-blue-400"
                            />
                        </div>
                        <Button 
                            onClick={fetchSchema} 
                            variant="outline"
                            className="border-2 border-blue-200 hover:bg-blue-50"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Schema Content */}
            {isLoadingSchema ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="bg-gray-100 h-16"></CardHeader>
                            <CardContent className="h-32 bg-gray-50"></CardContent>
                        </Card>
                    ))}
                </div>
            ) : schema && filteredSchema.length > 0 ? (
                <div className="space-y-4">
                    {schema && (
                        filteredSchema.map(([tableName, tableData]: [string, any]) => {
                            const columns = tableData.columns || tableData || [];
                            const metadata = tableData.metadata || null;
                            const isExpanded = expandedTables.has(tableName);

                            return (
                                <Card key={tableName} className="border-2 border-blue-100 hover:border-blue-300 transition-all shadow-md hover:shadow-lg">
                                    <CardHeader 
                                        className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                                        onClick={() => toggleTable(tableName)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                                    <Table2 className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-bold text-gray-800">{tableName}</CardTitle>
                                                    <p className="text-sm text-gray-600">{columns.length} columns</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {metadata && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {metadata.row_count?.toLocaleString()} rows
                                                    </Badge>
                                                )}
                                                {isExpanded ? <ChevronDown className="h-5 w-5 text-blue-600" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {isExpanded && (
                                        <CardContent className="pt-4">
                                            <div className="rounded-lg overflow-hidden border-2 border-blue-200">
                                                <div className="grid grid-cols-5 gap-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-4 py-3 text-sm">
                                                    <div>Column Name</div>
                                                    <div>Data Type</div>
                                                    <div>Nullable</div>
                                                    <div>Key</div>
                                                    <div>Default Value</div>
                                                </div>
                                                <div className="divide-y divide-gray-200 bg-white">
                                                    {columns.map((col: any, idx: number) => (
                                                        <div key={col.name} className={`px-4 py-3 grid grid-cols-5 gap-4 items-center hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                            <div className="flex items-center gap-2 font-medium text-gray-800">
                                                                {col.key === 'PRI' && <Key className="h-4 w-4 text-yellow-600" />}
                                                                {col.key === 'UNI' && <Hash className="h-4 w-4 text-blue-600" />}
                                                                {col.name}
                                                            </div>
                                                            <div className="text-gray-700">
                                                                <Badge variant="outline" className="font-mono text-xs">{col.type}</Badge>
                                                            </div>
                                                            <div>
                                                                {col.nullable ? (
                                                                    <Badge className="bg-green-100 text-green-700 border-0">YES</Badge>
                                                                ) : (
                                                                    <Badge className="bg-red-100 text-red-700 border-0">NO</Badge>
                                                                )}
                                                            </div>
                                                            <div>
                                                                {col.key && (
                                                                    <Badge className="bg-yellow-100 text-yellow-700 border-0">{col.key}</Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-gray-600 text-sm font-mono truncate" title={col.default || 'None'}>
                                                                {col.default || '-'}
                                                            </div>
                    </div>
                    ))}
                </div>
                                            </div>
            </CardContent>
                                    )}
        </Card>
                            );
                        })
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">No schema data available</p>
                        <Button onClick={fetchSchema} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Schema
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const DataBrowser = ({ dataSource }: { dataSource: DataSource }) => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [data, setData] = useState<DataRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('');
  const { toast } = useToast();

  const fetchTables = async () => {
    try {
      const schemaResponse = await fetch(`/api/data-sources/${dataSource.id}/schema`, { credentials: 'include' });
      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json();
        const tableNames = Object.keys(schemaData.schema || {});
        setTables(tableNames);
        if (tableNames.length > 0) {
          setSelectedTable(tableNames[0]);
        }
      } else {
        throw new Error('Failed to fetch schema');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch tables.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchTables();
  }, [dataSource.id]);

  const fetchData = async (table: string) => {
    if (!table) return;
    setLoading(true);
    try {
      const schemaResponse = await fetch(`/api/data-sources/${dataSource.id}/schema`, { credentials: 'include' });
      const schemaData = await schemaResponse.json();
      const tableData = schemaData.schema[selectedTable] || {};
      const tableColumns = tableData.columns || tableData || [];
      const columnInfo: ColumnInfo[] = tableColumns.map((col: any) => ({ name: col.name, type: col.type, nullable: col.nullable, key: col.key || '', default: col.default }));
      setColumns(columnInfo);
      await fetchData(selectedTable);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch data.', variant: 'destructive' });
    }
  };

  const handleTableChange = async (table: string) => {
    setSelectedTable(table);
    setPage(1);
    setSearchTerm('');
    setSearchColumn('');
    await loadTableData(table, 1);
  };

  const loadTableData = async (table: string, pageNum: number) => {
    if (!table) return;
    setLoading(true);
    try {
      const schemaResponse = await fetch(`/api/data-sources/${dataSource.id}/schema`, { credentials: 'include' });
      const schemaData = await schemaResponse.json();
      const tableData = schemaData.schema[table] || {};
      const tableColumns = tableData.columns || tableData || [];
      setColumns(tableColumns.map((col: any) => ({ 
        name: col.name, 
        type: col.type, 
        nullable: col.nullable, 
        key: col.key || '', 
        default: col.default 
      })));

      const response = await fetch(`/api/data-sources/${dataSource.id}/table/${table}/browse?page=${pageNum}&limit=${limit}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch data', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable, page);
    }
  }, [selectedTable, page]);

  const handleSearch = () => {
    if (!searchColumn || !searchTerm) {
      loadTableData(selectedTable, 1);
      return;
    }
    
    const filteredData = data.filter(row => {
      const value = row[searchColumn];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
    setData(filteredData);
  };

  const filteredTables = tables.filter(t => t.toLowerCase().includes(tableSearchTerm.toLowerCase()));

  return (
    <div className="space-y-6 mt-6">
      {/* Header with Table Selection */}
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Data Browser</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Browse and search table data
                </p>
              </div>
            </div>
            {selectedTable && (
              <Badge variant="outline" className="bg-white px-4 py-2 text-base">
                {dataSource.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Table Selection */}
          <div className="mb-4">
            <Label className="text-sm font-semibold mb-2 block">Select Table</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tables..."
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {filteredTables.length > 0 && tableSearchTerm && (
              <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto bg-white shadow-lg">
                {filteredTables.map((table) => (
                  <div
                    key={table}
                    onClick={() => {
                      handleTableChange(table);
                      setTableSearchTerm('');
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-green-50 border-b last:border-b-0 ${
                      selectedTable === table ? 'bg-green-100 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table2 className="h-4 w-4 text-green-600" />
                      {table}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Controls */}
          {selectedTable && columns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={searchColumn} onValueChange={setSearchColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column to search..." />
                </SelectTrigger>
            <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.name} value={col.name}>
                      {col.name} ({col.type})
                    </SelectItem>
              ))}
            </SelectContent>
          </Select>
              <Input
                placeholder="Search value..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!searchColumn}
              />
              <Button onClick={handleSearch} disabled={!searchColumn || !searchTerm} className="bg-green-600 hover:bg-green-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-3 text-gray-600">Loading data...</span>
            </div>
          </CardContent>
        </Card>
      ) : selectedTable && data.length > 0 ? (
        <>
          <Card className="border-2 border-green-100">
            <CardContent className="p-0">
              <div style={{ maxHeight: '600px', overflow: 'auto', position: 'relative' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  {/* Table Header */}
                  <thead className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-gray-300 sticky top-0 z-10">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.name} className="px-4 py-3 text-left font-bold text-sm text-gray-700 whitespace-nowrap bg-gradient-to-r from-green-100 to-emerald-100" style={{ minWidth: '150px' }}>
                          <div className="flex items-center gap-2 mb-1">
                            {col.key === 'PRI' && <Key className="h-3 w-3 text-yellow-600" />}
                            {col.key === 'UNI' && <Hash className="h-3 w-3 text-blue-600" />}
                            {col.name}
            </div>
                          <div className="text-xs font-normal text-gray-600">
                            {col.type}
                            {!col.nullable && <span className="ml-1 text-red-600">*</span>}
          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        {columns.map((col) => (
                          <td key={col.name} className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap" style={{ minWidth: '150px' }} title={row[col.name]?.toString()}>
                            <div className="max-w-xs truncate">
                              {row[col.name] !== null && row[col.name] !== undefined ? row[col.name].toString() : <span className="text-gray-400 italic">NULL</span>}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} • Showing {data.length} rows
                  </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button 
                onClick={() => setPage(p => p + 1)} 
                disabled={data.length < limit}
                variant="outline"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
                </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Select a table to browse data</p>
            </CardContent>
          </Card>
      )}
    </div>
  );
};

const IndexesView = ({ dataSource }: { dataSource: DataSource }) => {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [indexes, setIndexes] = useState<IndexInfo[]>([]);
  const [foreignKeys, setForeignKeys] = useState<ForeignKeyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateIndexDialog, setShowCreateIndexDialog] = useState(false);
  const [showCreateFKDialog, setShowCreateFKDialog] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState('');

  const fetchTables = async () => {
    try {
      const schemaResponse = await fetch(`/api/data-sources/${dataSource.id}/schema`, { credentials: 'include' });
      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json();
        const tableNames = Object.keys(schemaData.schema || {});
        setTables(tableNames);
        if (tableNames.length > 0) {
          setSelectedTable(tableNames[0]);
        }
      } else {
        throw new Error('Failed to fetch schema');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch tables.', variant: 'destructive' });
    }
  };

  const fetchIndexes = async (table: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/data-sources/${dataSource.id}/table/${table}/indexes`, { credentials: 'include' });
      if(response.ok) {
        const data = await response.json();
        setIndexes(data.indexes || []);
      } else {
        throw new Error('Failed to fetch indexes');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const fetchForeignKeys = async (table: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/data-sources/${dataSource.id}/table/${table}/foreign-keys`, { credentials: 'include' });
      if(response.ok) {
        const data = await response.json();
        setForeignKeys(data.foreignKeys || []);
      } else {
        throw new Error('Failed to fetch foreign keys');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const fetchTableColumns = async (table: string) => {
    try {
        const schemaResponse = await fetch(`/api/data-sources/${dataSource.id}/schema`, { credentials: 'include' });
        if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
        const tableData = schemaData.schema[table] || {};
        const tableColumns = tableData.columns || tableData || [];
        setColumns(tableColumns.map((c: any) => ({ 
          name: c.name, 
          type: c.type, 
          nullable: c.nullable, 
          key: c.key || '', 
          default: c.default 
        })));
      }
    } catch (error) {
      console.error('Failed to fetch columns:', error);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [dataSource.id]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableColumns(selectedTable);
        fetchIndexes(selectedTable);
      fetchForeignKeys(selectedTable);
      }
  }, [selectedTable]);

  const deleteIndex = async (indexName: string) => {
    try {
      const response = await fetch(`/api/data-sources/${dataSource.id}/table/${selectedTable}/indexes/${indexName}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: 'Index deleted successfully' });
        fetchIndexes(selectedTable);
      } else {
        throw new Error('Failed to delete index');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteForeignKey = async (fkName: string) => {
    try {
      const response = await fetch(`/api/data-sources/${dataSource.id}/table/${selectedTable}/foreign-keys/${fkName}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: 'Foreign key deleted successfully' });
        fetchForeignKeys(selectedTable);
      } else {
        throw new Error('Failed to delete foreign key');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredTables = tables.filter(t => t.toLowerCase().includes(tableSearchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header with Table Selection */}
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Indexes & Relations</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {tables.length} tables • {indexes.length + foreignKeys.length} constraints
                </p>
              </div>
            </div>
            {selectedTable && (
              <Badge variant="outline" className="bg-white px-4 py-2 text-base">
                {dataSource.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Table Search */}
          <div className="mb-4">
            <Label className="text-sm font-semibold mb-2 block">Select Table</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tables..."
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {filteredTables.length > 0 && tableSearchTerm && (
              <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto bg-white shadow-lg">
                {filteredTables.map((table) => (
                  <div
                    key={table}
                    onClick={() => {
                      setSelectedTable(table);
                      setTableSearchTerm('');
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-purple-50 border-b last:border-b-0 ${
                      selectedTable === table ? 'bg-purple-100 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table2 className="h-4 w-4 text-purple-600" />
                      {table}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTable && (
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowCreateIndexDialog(true)}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Index
              </Button>
              <Button 
                onClick={() => setShowCreateFKDialog(true)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Foreign Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">Loading constraints...</span>
            </div>
          </CardContent>
        </Card>
      ) : selectedTable ? (
        <>
          {/* Indexes Section */}
          <Card className="border-2 border-yellow-200">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-yellow-600" />
                Indexes
                <Badge className="ml-auto">{indexes.length}</Badge>
              </CardTitle>
              <CardDescription>Performance optimization indexes for {selectedTable}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {indexes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                       {indexes.map((index) => (
                         <Card key={index.name} className="border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all">
                           <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <Key className="h-4 w-4 text-yellow-600" />
                                 <span className="font-bold text-sm break-all">{index.name}</span>
                               </div>
                               <Badge variant="outline" className="text-xs">
                                 {index.type}
                               </Badge>
                             </div>
                             <div className="mt-3 flex flex-wrap gap-1">
                               {(index.columns || []).map((col) => (
                                 <Badge key={col} variant="outline" className="border-yellow-300 text-yellow-700 text-xs">
                                   {col}
                                 </Badge>
                               ))}
                             </div>
                             <div className="mt-2 flex gap-2 text-xs text-gray-600">
                               <span>Cardinality: {index.cardinality?.toLocaleString() || 'N/A'}</span>
                               <span>•</span>
                               <span>Size: {index.size || 'N/A'}</span>
                             </div>
                           </CardHeader>
                           <CardContent className="pt-4">
                             <Button 
                               size="sm" 
                               variant="outline" 
                               className="w-full border-red-200 text-red-700 hover:bg-red-50" 
                               onClick={() => {
                                 if (confirm(`Delete index "${index.name}"?`)) {
                                   deleteIndex(index.name);
                                 }
                               }}
                             >
                               <Trash2 className="h-3 w-3 mr-2" />Delete Index
                             </Button>
                           </CardContent>
                         </Card>
                       ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Key className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No indexes found for this table</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Foreign Keys Section */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-blue-600" />
                Foreign Keys
                <Badge className="ml-auto">{foreignKeys.length}</Badge>
              </CardTitle>
              <CardDescription>Relational constraints for {selectedTable}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {foreignKeys.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                       {foreignKeys.map((fk) => (
                         <Card key={fk.name} className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
                           <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                             <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                 <Link className="h-4 w-4 text-blue-600" />
                                 <span className="font-bold text-sm break-all">{fk.name}</span>
                               </div>
                             </div>
                             <div className="flex items-center gap-2 text-sm text-gray-700 flex-wrap">
                               <div className="flex flex-wrap gap-1">
                                 {(fk.columns || []).map((col) => (
                                   <Badge key={col} className="bg-blue-100 text-blue-700 border-0 text-xs">
                                     {col}
                                   </Badge>
                                 ))}
                               </div>
                               <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                               <span className="font-semibold text-blue-700 break-all">{fk.referencedTable || 'N/A'}</span>
                               <div className="flex flex-wrap gap-1">
                                 {(fk.referencedColumns || []).map((col) => (
                                   <Badge key={col} className="bg-cyan-100 text-cyan-700 border-0 text-xs">
                                     {col}
                                   </Badge>
                                 ))}
                               </div>
                             </div>
                             {(fk.onDelete || fk.onUpdate) && (
                               <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                 {fk.onDelete && (
                                   <Badge variant="outline" className="border-red-200 text-red-700">
                                     ON DELETE: {fk.onDelete}
                                   </Badge>
                                 )}
                                 {fk.onUpdate && (
                                   <Badge variant="outline" className="border-green-200 text-green-700">
                                     ON UPDATE: {fk.onUpdate}
                                   </Badge>
                                 )}
                               </div>
                             )}
                           </CardHeader>
                           <CardContent className="pt-4">
                             <Button 
                               size="sm" 
                               variant="outline" 
                               className="w-full border-red-200 text-red-700 hover:bg-red-50" 
                               onClick={() => deleteForeignKey(fk.name)}
                             >
                               <Trash2 className="h-3 w-3 mr-2" />Delete Foreign Key
                             </Button>
                           </CardContent>
                         </Card>
                       ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Link className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No foreign keys found for this table</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Select a table to view indexes and foreign keys</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ER Diagram View Component
const ERDiagramView = ({ dataSource }: { dataSource: DataSource }) => {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);
  const [tableSchema, setTableSchema] = useState<ColumnInfo[]>([]);
  const [foreignKeys, setForeignKeys] = useState<ForeignKeyInfo[]>([]);
  const [relatedTables, setRelatedTables] = useState<{[key: string]: ColumnInfo[]}>({});
  const [loading, setLoading] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState('');

  const fetchTables = async () => {
    try {
      const schemaResponse = await fetch(`/api/data-sources/${dataSource.id}/schema`, { credentials: 'include' });
      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json();
        const tableNames = Object.keys(schemaData.schema || {});
        setTables(tableNames);
        if (tableNames.length > 0) {
          setSelectedTable(tableNames[0]);
        }
      } else {
        throw new Error('Failed to fetch schema');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch tables.', variant: 'destructive' });
    }
  };

  const fetchTableData = async (table: string) => {
    if (!table) return;
    setLoading(true);
    try {
      // Fetch table schema ONCE - reuse for all related tables
      const schemaResponse = await fetch(`/api/data-sources/${dataSource.id}/schema`, { credentials: 'include' });
      let allSchema: any = {};
      
      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json();
        allSchema = schemaData.schema || {};
        setTableSchema(allSchema[table] || []);
      }

      // Fetch foreign keys
      const fkResponse = await fetch(`/api/data-sources/${dataSource.id}/table/${table}/foreign-keys`, { credentials: 'include' });
      if (fkResponse.ok) {
        const fkData = await fkResponse.json();
        setForeignKeys(fkData.foreignKeys || []);
        
        // Extract schemas for related tables from already-fetched schema
        const related: {[key: string]: ColumnInfo[]} = {};
        const uniqueRelatedTables = new Set(fkData.foreignKeys?.map((fk: ForeignKeyInfo) => fk.referencedTable) || []);
        
        for (const relatedTable of Array.from(uniqueRelatedTables)) {
          // Use already-fetched schema instead of making new API call
          related[relatedTable as string] = allSchema[relatedTable as string] || [];
        }
        setRelatedTables(related);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch table data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [dataSource.id]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const filteredTables = tables.filter(t => t.toLowerCase().includes(tableSearchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header with Table Selection */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">ER Diagram</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Entity-Relationship diagram for {selectedTable || 'selected table'}
                </p>
              </div>
            </div>
            {selectedTable && (
              <Badge variant="outline" className="bg-white px-4 py-2 text-base">
                {dataSource.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Table Search */}
          <div className="mb-4">
            <Label className="text-sm font-semibold mb-2 block">Select Table</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tables..."
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {filteredTables.length > 0 && tableSearchTerm && (
              <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto bg-white shadow-lg">
                {filteredTables.map((table) => (
                  <div
                    key={table}
                    onClick={() => {
                      setSelectedTable(table);
                      setTableSearchTerm('');
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 ${
                      selectedTable === table ? 'bg-blue-100 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table2 className="h-4 w-4 text-blue-600" />
                      {table}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ER Diagram */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Loading ER diagram...</p>
          </CardContent>
        </Card>
      ) : selectedTable ? (
        <Card className="border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-8">
              {/* Main Table (Center) */}
              <Card className="w-full max-w-xl border-4 border-blue-500 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Table2 className="h-5 w-5" />
                    {selectedTable}
                    <Badge className="ml-auto bg-white text-blue-700">Main Table</Badge>
                        </CardTitle>
                      </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-1">
                    {Array.isArray(tableSchema) && tableSchema.length > 0 ? (
                      tableSchema.map((col) => (
                        <div
                          key={col.name}
                          className={`flex items-center justify-between px-3 py-2 rounded ${
                            col.key === 'PRI' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                            col.key === 'UNI' ? 'bg-blue-50 border-l-4 border-blue-500' :
                            'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {col.key === 'PRI' && <Key className="h-3 w-3 text-yellow-600" />}
                            {col.key === 'UNI' && <Hash className="h-3 w-3 text-blue-600" />}
                            <span className="font-mono text-sm font-semibold">{col.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{col.type}</Badge>
                            {!col.nullable && <Badge className="text-xs bg-red-100 text-red-700">NOT NULL</Badge>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No columns found for this table
                      </div>
                    )}
                  </div>
                      </CardContent>
                    </Card>

              {/* Foreign Key Relationships */}
              {foreignKeys.length > 0 && (
                <div className="w-full space-y-6">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <span className="text-sm font-semibold">REFERENCES</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foreignKeys.map((fk) => (
                      <Card key={fk.name} className="border-2 border-green-300 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Link className="h-4 w-4 text-green-600" />
                            {fk.referencedTable}
                            <Badge variant="outline" className="ml-auto text-xs">Referenced</Badge>
                          </CardTitle>
                      </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Foreign Key</p>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(fk.columns) && fk.columns.map((col) => (
                                  <Badge key={col} className="bg-blue-100 text-blue-700 text-xs">
                                    {col}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <GitBranch className="h-4 w-4 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">References</p>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(fk.referencedColumns) && fk.referencedColumns.map((col) => (
                                  <Badge key={col} className="bg-green-100 text-green-700 text-xs">
                                    {col}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {relatedTables[fk.referencedTable] && Array.isArray(relatedTables[fk.referencedTable]) && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-gray-500 mb-2">Columns in {fk.referencedTable}</p>
                                <div className="space-y-1">
                                  {relatedTables[fk.referencedTable].slice(0, 5).map((col) => (
                                    <div key={col.name} className="text-xs px-2 py-1 bg-gray-50 rounded flex items-center justify-between">
                                      <span className="font-mono">{col.name}</span>
                                      <span className="text-gray-500">{col.type}</span>
                                    </div>
                                  ))}
                                  {relatedTables[fk.referencedTable].length > 5 && (
                                    <p className="text-xs text-gray-400 px-2">
                                      +{relatedTables[fk.referencedTable].length - 5} more columns
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </div>
              )}

              {foreignKeys.length === 0 && (
                <Card className="w-full border-2 border-dashed border-gray-300">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold">No foreign key relationships found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This table has no relationships with other tables
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Select a table to view its ER diagram</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataSourceBuilder;
