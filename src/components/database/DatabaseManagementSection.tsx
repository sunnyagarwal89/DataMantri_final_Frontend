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
  Database, 
  Plus, 
  Copy, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Search,
  RefreshCw,
  Settings,
  HardDrive,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DatabaseInfo {
  name: string;
  size: string;
  tables: number;
  engine: string;
  charset: string;
  collation: string;
  created: string;
}

interface DatabaseManagementSectionProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const DatabaseManagementSection: React.FC<DatabaseManagementSectionProps> = ({ connectionStatus }) => {
  const { toast } = useToast();
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  });

  const [importForm, setImportForm] = useState({
    database: '',
    format: 'sql',
    file: null as File | null
  });

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchDatabases();
    }
  }, [connectionStatus]);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      // Fetch actual data sources from the API
      const response = await fetch('/api/data-sources', { 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const dataSources = await response.json();
        
        // Transform data sources into database format
        const transformedDatabases: DatabaseInfo[] = dataSources.map((source: any) => ({
          name: source.name,
          size: 'Unknown', // Size would need to be calculated
          tables: 0, // Would need to be fetched from schema
          engine: source.type === 'mysql' ? 'InnoDB' : source.type.toUpperCase(),
          charset: 'utf8mb4',
          collation: 'utf8mb4_unicode_ci',
          created: source.created_at ? new Date(source.created_at).toLocaleDateString() : 'Unknown'
        }));
        
        // Add schema information for each data source
        const databasesWithSchema = await Promise.all(
          transformedDatabases.map(async (db) => {
            try {
              const sourceId = dataSources.find((s: any) => s.name === db.name)?.id;
              if (sourceId) {
                const schemaResponse = await fetch(`/api/data-sources/${sourceId}/schema`, {
                  credentials: 'include'
                });
                if (schemaResponse.ok) {
                  const schemaData = await schemaResponse.json();
                  const tableCount = Object.keys(schemaData.schema || {}).length;
                  return { ...db, tables: tableCount };
                }
              }
            } catch (error) {
              console.error(`Failed to fetch schema for ${db.name}:`, error);
            }
            return db;
          })
        );
        
        setDatabases(databasesWithSchema);
      } else {
        throw new Error('Failed to fetch data sources');
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data sources. Showing sample data.',
        variant: 'destructive'
      });
      
      // Fallback to mock data if API fails
      const fallbackDatabases: DatabaseInfo[] = [
        {
          name: 'No Data Sources Found',
          size: '0 MB',
          tables: 0,
          engine: 'N/A',
          charset: 'utf8mb4',
          collation: 'utf8mb4_unicode_ci',
          created: new Date().toLocaleDateString()
        }
      ];
      setDatabases(fallbackDatabases);
    } finally {
      setLoading(false);
    }
  };

  const createDatabase = async () => {
    if (!createForm.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Database name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Mock API call
      const response = await fetch('/api/database/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Database "${createForm.name}" created successfully`
        });
        setShowCreateDialog(false);
        setCreateForm({ name: '', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' });
        fetchDatabases();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create database',
        variant: 'destructive'
      });
    }
  };

  const deleteDatabase = async (dbName: string) => {
    if (!confirm(`Are you sure you want to delete database "${dbName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/database/${dbName}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Database "${dbName}" deleted successfully`
        });
        fetchDatabases();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete database',
        variant: 'destructive'
      });
    }
  };

  const exportDatabase = async (dbName: string, format: string) => {
    try {
      const response = await fetch(`/api/database/${dbName}/export?format=${format}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dbName}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Success',
          description: `Database exported as ${format.toUpperCase()}`
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export database',
        variant: 'destructive'
      });
    }
  };

  const filteredDatabases = databases.filter(db =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {connectionStatus === 'connecting' ? 'Connecting to database server...' : 'Not connected to database server'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search databases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button onClick={fetchDatabases} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Database</DialogTitle>
                <DialogDescription>
                  Import database from SQL, CSV, Excel, JSON, XML, or YAML file
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-format">Format</Label>
                  <Select value={importForm.format} onValueChange={(value) => setImportForm({...importForm, format: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="import-file">File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    onChange={(e) => setImportForm({...importForm, file: e.target.files?.[0] || null})}
                  />
                </div>
                <Button className="w-full">Import Database</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Database
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Database</DialogTitle>
                <DialogDescription>
                  Create a new database with specified charset and collation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="db-name">Database Name</Label>
                  <Input
                    id="db-name"
                    placeholder="Enter database name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="charset">Character Set</Label>
                    <Select value={createForm.charset} onValueChange={(value) => setCreateForm({...createForm, charset: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utf8mb4">utf8mb4</SelectItem>
                        <SelectItem value="utf8">utf8</SelectItem>
                        <SelectItem value="latin1">latin1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="collation">Collation</Label>
                    <Select value={createForm.collation} onValueChange={(value) => setCreateForm({...createForm, collation: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utf8mb4_unicode_ci">utf8mb4_unicode_ci</SelectItem>
                        <SelectItem value="utf8mb4_general_ci">utf8mb4_general_ci</SelectItem>
                        <SelectItem value="utf8_general_ci">utf8_general_ci</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={createDatabase} className="w-full">
                  Create Database
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Database Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          filteredDatabases.map((db) => (
            <Card key={db.name} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="truncate">{db.name}</span>
                  </div>
                  <Badge variant="outline">{db.engine}</Badge>
                </CardTitle>
                <CardDescription>
                  {db.tables} tables • {db.size}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Charset:</span>
                      <br />
                      <span className="font-mono">{db.charset}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <br />
                      <span>{db.created}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => setSelectedDatabase(db.name)}>
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportDatabase(db.name, 'sql')}>
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteDatabase(db.name)}
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

      {filteredDatabases.length === 0 && !loading && (
        <div className="text-center py-8">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {searchTerm ? 'No databases match your search' : 'No data sources found'}
            </p>
            {!searchTerm && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Create data sources first to see them here for database management.
                </p>
                <Button
                  onClick={() => window.location.href = '/data-sources'}
                  variant="outline"
                  className="mt-4"
                >
                  Go to Data Sources
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManagementSection;
