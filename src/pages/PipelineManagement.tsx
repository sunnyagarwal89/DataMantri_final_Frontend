import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Play, Trash2, Clock, Database, ArrowRight, RefreshCw, 
  GitBranch, Search, TableIcon, TrendingUp, Zap, Calendar
} from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  description: string;
  source_id: number;
  source_table: string;
  destination_id: number;
  destination_table: string;
  transformation_sql?: string;
  mode: string;
  schedule: string | null;
  status: string;
  created_at: string;
  last_run_at: string | null;
}

interface DataSource {
  id: number;
  name: string;
  type: string;
}

const SCHEDULE_PRESETS = [
  { label: 'Every Hour', value: '0 * * * *' },
  { label: 'Daily at 2 AM', value: '0 2 * * *' },
  { label: 'Daily at 6 AM', value: '0 6 * * *' },
  { label: 'Every Monday', value: '0 8 * * 1' },
  { label: 'Custom', value: 'custom' }
];

const PipelineManagement: React.FC = () => {
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sourceTables, setSourceTables] = useState<string[]>([]);
  const [destinationTables, setDestinationTables] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [schedulePreset, setSchedulePreset] = useState('0 2 * * *');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source_id: '',
    source_table: '',
    destination_id: '',
    destination_table: '',
    transformation_sql: '',
    mode: 'batch',
    schedule: '0 2 * * *'
  });

  useEffect(() => {
    fetchPipelines();
    fetchDataSources();
  }, []);

  useEffect(() => {
    if (formData.source_id) {
      fetchTables(formData.source_id, 'source');
    }
  }, [formData.source_id]);

  useEffect(() => {
    if (formData.destination_id) {
      fetchTables(formData.destination_id, 'destination');
    }
  }, [formData.destination_id]);

  const fetchPipelines = async () => {
    try {
      const response = await fetch('/api/pipelines', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPipelines(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDataSources(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTables = async (sourceId: string, type: 'source' | 'destination') => {
    try {
      const response = await fetch(`/api/data-sources/${sourceId}/tables`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (type === 'source') {
          setSourceTables(data.tables || []);
        } else {
          setDestinationTables(data.tables || []);
        }
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.source_id || !formData.source_table || !formData.destination_id || !formData.destination_table) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          source_id: parseInt(formData.source_id),
          destination_id: parseInt(formData.destination_id)
        })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Pipeline created!' });
        setIsCreateOpen(false);
        setFormData({
          name: '', description: '', source_id: '', source_table: '',
          destination_id: '', destination_table: '', transformation_sql: '',
          mode: 'batch', schedule: '0 2 * * *'
        });
        fetchPipelines();
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error || 'Failed', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create', variant: 'destructive' });
    }
  };

  const handleTrigger = async (id: string) => {
    try {
      const response = await fetch(`/api/pipelines/${id}/trigger`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Pipeline triggered!' });
        fetchPipelines();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to trigger', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pipeline?')) return;
    try {
      const response = await fetch(`/api/pipelines/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Pipeline deleted' });
        fetchPipelines();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const getDataSourceName = (id: number) => {
    return dataSources.find(ds => ds.id === id)?.name || `Data Source ${id}`;
  };

  const filteredPipelines = pipelines.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Data Pipelines
            </h1>
            <p className="text-gray-600">Orchestrate data movement like Airflow</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Pipeline
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Pipeline</DialogTitle>
                <DialogDescription>
                  Configure a data pipeline to transfer data between sources
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="space-y-4 p-4 border-2 border-blue-100 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                  <h3 className="font-semibold text-blue-900">Pipeline Information</h3>
                  <div>
                    <Label>Name *</Label>
                    <Input
                      placeholder="e.g., Sales Data Sync"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="What does this pipeline do..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Source */}
                <div className="space-y-4 p-4 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Source
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data Source *</Label>
                      <Select value={formData.source_id} onValueChange={(v) => setFormData({ ...formData, source_id: v, source_table: '' })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((ds) => (
                            <SelectItem key={ds.id} value={ds.id.toString()}>
                              {ds.name} ({ds.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Table *</Label>
                      <Select value={formData.source_table} onValueChange={(v) => setFormData({ ...formData, source_table: v })} disabled={!formData.source_id}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          {sourceTables.map((table) => (
                            <SelectItem key={table} value={table}>{table}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="h-8 w-8 text-indigo-600" />
                </div>

                {/* Destination */}
                <div className="space-y-4 p-4 border-2 border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100">
                  <h3 className="font-semibold text-green-900 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Destination
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data Source *</Label>
                      <Select value={formData.destination_id} onValueChange={(v) => setFormData({ ...formData, destination_id: v, destination_table: '' })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((ds) => (
                            <SelectItem key={ds.id} value={ds.id.toString()}>
                              {ds.name} ({ds.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Table *</Label>
                      <Select value={formData.destination_table} onValueChange={(v) => setFormData({ ...formData, destination_table: v })} disabled={!formData.destination_id}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinationTables.map((table) => (
                            <SelectItem key={table} value={table}>{table}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Transformation */}
                <div className="space-y-4 p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                  <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    SQL Transformation (Optional)
                  </h3>
                  <Textarea
                    placeholder="SELECT * FROM {{source_table}} WHERE ..."
                    value={formData.transformation_sql}
                    onChange={(e) => setFormData({ ...formData, transformation_sql: e.target.value })}
                    className="font-mono text-sm"
                    rows={3}
                  />
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mode</Label>
                    <Select value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="batch">Batch (Full Load)</SelectItem>
                        <SelectItem value="incremental">Incremental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Schedule</Label>
                    <Select value={schedulePreset} onValueChange={(v) => {
                      setSchedulePreset(v);
                      if (v !== 'custom') setFormData({ ...formData, schedule: v });
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHEDULE_PRESETS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {schedulePreset === 'custom' && (
                  <Input
                    placeholder="0 2 * * * (Cron expression)"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  />
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Create Pipeline
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{pipelines.length}</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {pipelines.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {pipelines.filter(p => p.status === 'running').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {pipelines.filter(p => p.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipelines List */}
      {filteredPipelines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <GitBranch className="h-20 w-20 text-gray-400 mb-4" />
            <p className="text-xl font-semibold mb-2">No pipelines yet</p>
            <p className="text-gray-600 mb-6">Create your first pipeline</p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPipelines.map((pipeline) => (
            <Card key={pipeline.id} className="border-2 hover:border-blue-300 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pipeline.name}</CardTitle>
                    <CardDescription>{pipeline.description || 'No description'}</CardDescription>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {pipeline.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 via-white to-green-50 rounded-xl border mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{getDataSourceName(pipeline.source_id)}</p>
                      <p className="text-xs text-gray-600">{pipeline.source_table}</p>
                    </div>
                  </div>
                  
                  <ArrowRight className="h-6 w-6 text-indigo-600 mx-4" />
                  
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{getDataSourceName(pipeline.destination_id)}</p>
                      <p className="text-xs text-gray-600">{pipeline.destination_table}</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {pipeline.schedule || 'Manual'}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {pipeline.mode}
                    </div>
                    {pipeline.last_run_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(pipeline.last_run_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTrigger(pipeline.id)}
                      disabled={pipeline.status === 'running'}
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(pipeline.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PipelineManagement;
