import React, { useState, useEffect } from 'react';
import CreateDataSourceView from './CreateDataSourceView';
import EditDataSourceView from './EditDataSourceView';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Trash2, Pencil, Database } from 'lucide-react';

interface DataSource {
  id: number;
  name: string;
  type: string;
}

const DataSources: React.FC = () => {
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [viewingSchema, setViewingSchema] = useState<DataSource | null>(null);
  const [schema, setSchema] = useState<any>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  useEffect(() => {
    if (view === 'list') {
      fetch('/api/data-sources', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setDataSources(data))
        .catch((error) => console.error('Error fetching data sources:', error));
    }
  }, [view]);

  const handleDelete = async (id: number) => {
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

  const handleViewSchema = async (source: DataSource) => {
    setViewingSchema(source);
    setIsLoadingSchema(true);
    try {
      const response = await fetch(`/api/data-sources/${source.id}/schema`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        setSchema(data.schema);
      } else {
        throw new Error(data.message || 'Failed to fetch schema');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setSchema(null);
    } finally {
      setIsLoadingSchema(false);
    }
  };

  if (view === 'create') {
    return <CreateDataSourceView onCancel={() => setView('list')} />;
  }

  if (view === 'edit' && editingId) {
    return <EditDataSourceView dataSourceId={editingId} onCancel={() => setView('list')} onSaved={() => setView('list')} />;
  }

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Sources</h1>
          <button
            onClick={() => setView('create')}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Data Source
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          {dataSources.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {dataSources.map((source) => (
                <li key={source.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold">{source.name}</p>
                    <p className="text-sm text-gray-500">{source.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewSchema(source)}>
                      <Database className="h-4 w-4 mr-2" />
                      View Schema
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingId(source.id); setView('edit'); }}>
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete the "{source.name}" data source.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button variant="destructive" onClick={() => handleDelete(source.id)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No data sources found. Click 'Create New Data Source' to get started.</p>
          )}
        </div>
      </div>
      <SchemaDialog 
        source={viewingSchema}
        schema={schema}
        isLoading={isLoadingSchema}
        onClose={() => setViewingSchema(null)}
      />
    </>
  );
};

const SchemaDialog = ({ source, schema, isLoading, onClose }: any) => (
  <Dialog open={!!source} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Schema for: {source?.name}</DialogTitle>
        <DialogDescription>Tables and columns for the selected data source.</DialogDescription>
      </DialogHeader>
      <div className="max-h-[60vh] overflow-y-auto p-4">
        {isLoading ? (
          <p>Loading schema...</p>
        ) : schema ? (
          <div className="space-y-4">
            {Object.entries(schema).map(([tableName, columns]: [string, any]) => (
              <div key={tableName}>
                <h3 className="font-semibold text-lg mb-2">{tableName}</h3>
                <ul className="divide-y divide-gray-200 border rounded-md">
                  {columns.map((col: any) => (
                    <li key={col.name} className="px-4 py-2 flex justify-between">
                      <span>{col.name}</span>
                      <span className="text-gray-500 text-sm">{col.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>Could not load schema.</p>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default DataSources;
