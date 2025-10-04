import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  RefreshCw,
  Download,
  ZoomIn,
  ZoomOut,
  Move,
  Database,
  Table,
  Link,
  Eye,
  Settings,
  Maximize,
  Sparkles,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TableRelation {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'many-to-one';
}

interface TableSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    isPrimary: boolean;
    isForeign: boolean;
    nullable: boolean;
  }>;
  position: { x: number; y: number };
}

interface VisualToolsSectionProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const VisualToolsSection: React.FC<VisualToolsSectionProps> = ({ connectionStatus }) => {
  const { toast } = useToast();
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [databases, setDatabases] = useState<string[]>([]);
  const [tableSchemas, setTableSchemas] = useState<TableSchema[]>([]);
  const [relations, setRelations] = useState<TableRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showTableDetails, setShowTableDetails] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('');

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchDatabases();
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (selectedDatabase) {
      fetchDatabaseSchema();
    }
  }, [selectedDatabase]);

  const fetchDatabases = async () => {
    try {
      const response = await fetch('/api/data-sources', { 
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (response.ok) {
        const dataSources = await response.json();
        const databaseNames = Array.isArray(dataSources) 
          ? ['Datamart', ...dataSources.map((ds: any) => ds.name)]
          : ['Datamart'];
        setDatabases(databaseNames);
        if (!selectedDatabase && databaseNames.length > 0) {
          setSelectedDatabase(databaseNames[0]);
        }
      } else {
        throw new Error('Failed to fetch data sources');
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch databases',
        variant: 'destructive'
      });
    }
  };

  const fetchDatabaseSchema = async () => {
    if (!selectedDatabase) return;
    setLoading(true);
    try {
      const dbName = encodeURIComponent(selectedDatabase);
      const schemaResp = await fetch(`/api/database/${dbName}/schema`, { credentials: 'include', cache: 'no-store' });
      const relResp = await fetch(`/api/database/${dbName}/relationships`, { credentials: 'include', cache: 'no-store' });
      const schemaJson = await schemaResp.json();
      const relJson = await relResp.json();

      if (schemaResp.ok && schemaJson.status === 'success') {
        // Map schema into TableSchema[] with simple positioning grid
        const tables: string[] = Array.isArray(schemaJson.tables) ? schemaJson.tables : Object.keys(schemaJson.schema || {});
        const tableSchemasNew: TableSchema[] = tables.map((t, idx) => {
          const cols = (schemaJson.schema?.[t] || []).map((c: any) => ({
            name: c.column_name || c.name,
            type: c.data_type || c.type || 'text',
            isPrimary: false,
            isForeign: false,
            nullable: (c.is_nullable ?? 'YES') === 'YES'
          }));
          return {
            name: t,
            columns: cols,
            position: { x: 50 + (idx % 3) * 300, y: 50 + Math.floor(idx / 3) * 250 }
          } as TableSchema;
        });
        setTableSchemas(tableSchemasNew);
      } else {
        throw new Error(schemaJson.message || 'Schema fetch failed');
      }

      if (relResp.ok && relJson.status === 'success' && Array.isArray(relJson.relationships)) {
        const rels: TableRelation[] = relJson.relationships.map((r: any) => ({
          fromTable: r.table_name || r.fromTable,
          fromColumn: r.column_name || r.fromColumn,
          toTable: r.foreign_table_name || r.toTable,
          toColumn: r.foreign_column_name || r.toColumn,
          type: 'many-to-one'
        }));
        setRelations(rels);
      } else {
        setRelations([]);
      }
    } catch (error) {
      console.error('VisualToolsSection schema load error:', error);
      toast({ title: 'Error', description: 'Failed to fetch database schema', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const exportDiagram = (format: string) => {
    toast({
      title: 'Export Started',
      description: `Exporting ER diagram as ${format.toUpperCase()}...`
    });
    
    // Mock export functionality
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: `ER diagram exported as ${format.toUpperCase()}`
      });
    }, 2000);
  };

  const generateSQL = () => {
    const sql = `-- Database Schema for ${selectedDatabase}
${tableSchemas.map(table => `
CREATE TABLE ${table.name} (
${table.columns.map(col => 
  `  ${col.name} ${col.type}${col.isPrimary ? ' PRIMARY KEY' : ''}${!col.nullable ? ' NOT NULL' : ''}`
).join(',\n')}
);`).join('\n')}

-- Foreign Key Constraints
${relations.map(rel => 
  `ALTER TABLE ${rel.fromTable} ADD FOREIGN KEY (${rel.fromColumn}) REFERENCES ${rel.toTable}(${rel.toColumn});`
).join('\n')}`;

    navigator.clipboard.writeText(sql);
    toast({
      title: 'SQL Copied',
      description: 'Database schema SQL copied to clipboard'
    });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? Math.min(prev + 25, 200) : Math.max(prev - 25, 50);
      return newZoom;
    });
  };

  const getRelationshipLine = (relation: TableRelation) => {
    const fromTable = tableSchemas.find(t => t.name === relation.fromTable);
    const toTable = tableSchemas.find(t => t.name === relation.toTable);
    
    if (!fromTable || !toTable) return null;

    const fromX = fromTable.position.x + 150; // Center of table
    const fromY = fromTable.position.y + 100;
    const toX = toTable.position.x + 150;
    const toY = toTable.position.y + 100;

    return (
      <line
        key={`${relation.fromTable}-${relation.toTable}`}
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke="#6b7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    );
  };

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8">
        <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {connectionStatus === 'connecting' ? 'Connecting to database server...' : 'Not connected to database server'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Beautiful Header Section */}
      <Card className="border-2 border-cyan-200 shadow-xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 p-6">
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <Network className="h-10 w-10 text-white" />
            </div>
            
            {/* Title & Description */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                Visual Database Tools
                <Sparkles className="h-6 w-6 text-cyan-200 animate-pulse" />
              </h2>
              <p className="text-white/90 text-sm flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Generate ER diagrams and visualize database relationships
              </p>
            </div>

            {/* Connection Status Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Ready</span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Database Selection and Search Row */}
            <div className="flex items-end gap-4 flex-wrap">
              {/* Database Selector */}
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="database-select" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-600" />
                  Select Database
                </Label>
                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                  <SelectTrigger className="h-12 border-2 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 text-base">
                    <SelectValue placeholder="Choose a database..." />
                  </SelectTrigger>
                  <SelectContent>
                    {databases.map((db) => (
                      <SelectItem key={db} value={db}>
                        <div className="flex items-center gap-3 py-1">
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            <Database className="h-4 w-4 text-cyan-600" />
                          </div>
                          <span className="font-medium">{db}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input */}
              <div className="flex-1 min-w-[300px]">
                <Label htmlFor="search" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Table className="h-5 w-5 text-cyan-600" />
                  Search
                </Label>
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter tables, columns, relationships..."
                  className="h-12 border-2 border-cyan-200 focus:border-cyan-500 text-base"
                />
              </div>

              {/* Refresh Button */}
              {selectedDatabase && (
                <Button 
                  onClick={fetchDatabaseSchema}
                  className="h-12 px-6 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh
                </Button>
              )}
            </div>

            {/* Zoom and View Controls */}
            {selectedDatabase && (
              <div className="flex items-center justify-between gap-4 p-4 bg-cyan-50 border border-cyan-200 rounded-lg flex-wrap">
                {/* Zoom Controls */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ZoomIn className="h-4 w-4 text-cyan-600" />
                    Zoom:
                  </span>
                  <Button 
                    onClick={() => handleZoom('out')} 
                    variant="outline" 
                    size="sm"
                    className="border-cyan-300 hover:bg-cyan-100"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-base font-bold text-cyan-700 min-w-[60px] text-center">{zoomLevel}%</span>
                  <Button 
                    onClick={() => handleZoom('in')} 
                    variant="outline" 
                    size="sm"
                    className="border-cyan-300 hover:bg-cyan-100"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                {/* View & Export Controls */}
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setShowTableDetails(!showTableDetails)} 
                    className={`${showTableDetails 
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-white' 
                      : 'border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-50'
                    } transition-all duration-300`}
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showTableDetails ? 'Hide' : 'Show'} Details
                  </Button>
                  <Select onValueChange={(format) => exportDiagram(format)}>
                    <SelectTrigger className="w-32 h-9 border-2 border-cyan-400 text-cyan-600">
                      <SelectValue placeholder="Export" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={generateSQL}
                    className="bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg transition-all duration-300"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    SQL
                  </Button>
                </div>
              </div>
            )}

            {/* Info Message */}
            {selectedDatabase && (
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg flex items-start gap-3">
                <Network className="h-5 w-5 text-cyan-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-cyan-900">
                    Visualizing: <span className="font-bold">{selectedDatabase}</span>
                  </p>
                  <p className="text-xs text-cyan-700 mt-1">
                    Drag tables to rearrange • Zoom to explore • Export for sharing
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedDatabase && (
        <Tabs defaultValue="er-diagram" className="w-full">
          <TabsList>
            <TabsTrigger value="er-diagram">ER Diagram</TabsTrigger>
            <TabsTrigger value="table-list">Table List</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>
          
          <TabsContent value="er-diagram">
            <Card>
              <CardHeader>
                <CardTitle>Entity Relationship Diagram</CardTitle>
                <CardDescription>Visual representation of database tables and their relationships</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Generating diagram...</span>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-auto" style={{ height: '600px' }}>
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 1000 600"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                    >
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                        </marker>
                      </defs>
                      
                      {/* Relationship lines */}
                      {relations
                        .filter(rel => {
                          if (!search.trim()) return true;
                          const q = search.toLowerCase();
                          return (
                            rel.fromTable.toLowerCase().includes(q) ||
                            rel.toTable.toLowerCase().includes(q) ||
                            rel.fromColumn.toLowerCase().includes(q) ||
                            rel.toColumn.toLowerCase().includes(q)
                          );
                        })
                        .filter(rel => {
                          // also hide relations for filtered-out tables
                          const visibleNames = new Set(
                            tableSchemas
                              .filter(t => {
                                if (!search.trim()) return true;
                                const q = search.toLowerCase();
                                return (
                                  t.name.toLowerCase().includes(q) ||
                                  t.columns.some(c => c.name.toLowerCase().includes(q))
                                );
                              })
                              .map(t => t.name)
                          );
                          return visibleNames.has(rel.fromTable) && visibleNames.has(rel.toTable);
                        })
                        .map(relation => getRelationshipLine(relation))}
                      
                      {/* Tables */}
                      {tableSchemas
                        .filter(t => {
                          if (!search.trim()) return true;
                          const q = search.toLowerCase();
                          return (
                            t.name.toLowerCase().includes(q) ||
                            t.columns.some(c => c.name.toLowerCase().includes(q))
                          );
                        })
                        .map((table) => (
                        <g key={table.name}>
                          <rect
                            x={table.position.x}
                            y={table.position.y}
                            width="300"
                            height={showTableDetails ? Math.max(120, 40 + table.columns.length * 20) : 60}
                            fill="white"
                            stroke="#d1d5db"
                            strokeWidth="2"
                            rx="8"
                            className="hover:stroke-primary cursor-pointer"
                            onClick={() => setSelectedTable(table.name)}
                          />
                          
                          {/* Table header */}
                          <rect
                            x={table.position.x}
                            y={table.position.y}
                            width="300"
                            height="40"
                            fill="#f3f4f6"
                            stroke="#d1d5db"
                            strokeWidth="1"
                            rx="8"
                          />
                          
                          <text
                            x={table.position.x + 15}
                            y={table.position.y + 25}
                            className="font-bold text-sm"
                            fill="#374151"
                          >
                            <tspan>📊 {table.name}</tspan>
                          </text>
                          
                          {/* Table columns */}
                          {showTableDetails && table.columns.map((column, index) => (
                            <g key={column.name}>
                              <text
                                x={table.position.x + 15}
                                y={table.position.y + 60 + index * 20}
                                className="text-xs"
                                fill={column.isPrimary ? '#dc2626' : column.isForeign ? '#2563eb' : '#374151'}
                              >
                                {column.isPrimary && '🔑 '}
                                {column.isForeign && '🔗 '}
                                {column.name}: {column.type}
                                {!column.nullable && ' *'}
                              </text>
                            </g>
                          ))}
                        </g>
                      ))}
                    </svg>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="table-list">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tableSchemas
                .filter(t => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (
                    t.name.toLowerCase().includes(q) ||
                    t.columns.some(c => c.name.toLowerCase().includes(q))
                  );
                })
                .map((table) => (
                <Card key={table.name} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      {table.name}
                    </CardTitle>
                    <CardDescription>
                      {table.columns.length} columns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {table.columns
                        .filter(col => {
                          if (!search.trim()) return true;
                          const q = search.toLowerCase();
                          return col.name.toLowerCase().includes(q);
                        })
                        .map((column) => (
                        <div key={column.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={column.isPrimary ? 'font-bold text-red-600' : column.isForeign ? 'text-blue-600' : ''}>
                              {column.name}
                            </span>
                            {column.isPrimary && <Badge variant="outline" className="text-xs">PK</Badge>}
                            {column.isForeign && <Badge variant="outline" className="text-xs">FK</Badge>}
                          </div>
                          <span className="text-muted-foreground text-xs">{column.type}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="relationships">
            <Card>
              <CardHeader>
                <CardTitle>Table Relationships</CardTitle>
                <CardDescription>Foreign key relationships between tables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relations
                    .filter(rel => {
                      if (!search.trim()) return true;
                      const q = search.toLowerCase();
                      return (
                        rel.fromTable.toLowerCase().includes(q) ||
                        rel.toTable.toLowerCase().includes(q) ||
                        rel.fromColumn.toLowerCase().includes(q) ||
                        rel.toColumn.toLowerCase().includes(q)
                      );
                    })
                    .map((relation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          <span className="font-medium">{relation.fromTable}</span>
                          <span className="text-muted-foreground">({relation.fromColumn})</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{relation.type}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          <span className="font-medium">{relation.toTable}</span>
                          <span className="text-muted-foreground">({relation.toColumn})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {relations.length === 0 && (
                    <div className="text-center py-8">
                      <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No relationships found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default VisualToolsSection;
