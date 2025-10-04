import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, FileUp, Settings, History, Plus, Edit, Trash2, 
  Download, CheckCircle, XCircle, Clock, Database, FileText,
  AlertCircle, Sparkles, TrendingUp, Activity, Shield, Key, 
  CheckSquare, Hash, Type, Calendar, Link
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataSource {
  id: string;
  name: string;
  connection_type: string;
}

interface UploadConfiguration {
  id: string;
  name: string;
  description: string;
  file_format: string;
  file_encoding: string;
  delimiter: string;
  has_header: boolean;
  data_source_id: string;
  data_source_name?: string;
  data_source_type?: string;
  table_name: string;
  upload_mode: string;
  validation_rules: any;
  transformation_rules: any;
  conditions: any;
  sample_file_name?: string;
  sample_file_size?: number;
  status: string;
  is_active: boolean;
  total_uploads: number;
  last_upload_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UploadHistoryItem {
  id: string;
  configuration_id: string;
  configuration_name?: string;
  file_name: string;
  file_size: number;
  status: string;
  records_total: number;
  records_processed: number;
  records_success: number;
  records_failed: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

interface Stats {
  total_configurations: number;
  active_configurations: number;
  uploads_this_month: number;
  successful_uploads: number;
}

const UploadUtility = () => {
  const [configurations, setConfigurations] = useState<UploadConfiguration[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total_configurations: 0, active_configurations: 0, uploads_this_month: 0, successful_uploads: 0 });
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<UploadConfiguration | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [sampleFile, setSampleFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file_format: 'csv',
    file_encoding: 'utf-8',
    delimiter: ',',
    has_header: true,
    data_source_id: '',
    table_name: '',
    upload_mode: 'append',
    validation_rules: {
      delta_update: {
        enabled: false,
        key_columns: [] as string[],
        update_columns: [] as string[]
      },
      column_validations: [] as Array<{
        column: string;
        type: string;
        required: boolean;
        unique: boolean;
        min_value?: number;
        max_value?: number;
        pattern?: string;
        allowed_values?: string[];
      }>,
      data_quality: {
        check_duplicates: false,
        duplicate_columns: [] as string[],
        check_nulls: true,
        check_data_types: true,
        custom_sql_check: ''
      }
    },
    transformation_rules: {},
    conditions: { max_file_size_mb: 50, allowed_extensions: ['csv', 'xlsx'], skip_rows: 0 }
  });

  const [validationColumns, setValidationColumns] = useState<string[]>([]);
  const [newColumnValidation, setNewColumnValidation] = useState({
    column: '',
    type: 'string',
    required: false,
    unique: false,
    min_value: undefined,
    max_value: undefined,
    pattern: '',
    allowed_values: []
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchConfigurations();
    fetchDataSources();
    fetchHistory();
    fetchStats();
  }, []);

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDataSources(Array.isArray(data) ? data : data.data_sources || []);
      }
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
    }
  };

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/upload-configurations', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setConfigurations(data.configurations || []);
      }
    } catch (error) {
      console.error('Failed to fetch configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/upload-history', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/upload-configurations/stats', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      file_format: 'csv',
      file_encoding: 'utf-8',
      delimiter: ',',
      has_header: true,
      data_source_id: '',
      table_name: '',
      upload_mode: 'append',
      validation_rules: {
        delta_update: {
          enabled: false,
          key_columns: [],
          update_columns: []
        },
        column_validations: [],
        data_quality: {
          check_duplicates: false,
          duplicate_columns: [],
          check_nulls: true,
          check_data_types: true,
          custom_sql_check: ''
        }
      },
      transformation_rules: {},
      conditions: { max_file_size_mb: 50, allowed_extensions: ['csv', 'xlsx'], skip_rows: 0 }
    });
    setEditingConfig(null);
    setSampleFile(null);
    setValidationColumns([]);
    setNewColumnValidation({
      column: '',
      type: 'string',
      required: false,
      unique: false,
      min_value: undefined,
      max_value: undefined,
      pattern: '',
      allowed_values: []
    });
  };

  const addColumnValidation = () => {
    if (!newColumnValidation.column) {
      toast({
        title: '⚠️ Missing Column Name',
        description: 'Please enter a column name for validation',
        variant: 'destructive'
      });
      return;
    }

    setFormData({
      ...formData,
      validation_rules: {
        ...formData.validation_rules,
        column_validations: [
          ...formData.validation_rules.column_validations,
          { ...newColumnValidation }
        ]
      }
    });

    setNewColumnValidation({
      column: '',
      type: 'string',
      required: false,
      unique: false,
      min_value: undefined,
      max_value: undefined,
      pattern: '',
      allowed_values: []
    });
  };

  const removeColumnValidation = (index: number) => {
    const updated = [...formData.validation_rules.column_validations];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      validation_rules: {
        ...formData.validation_rules,
        column_validations: updated
      }
    });
  };

  const handleCreateConfiguration = async () => {
    if (!formData.name || !formData.data_source_id || !formData.table_name) {
      toast({
        title: '⚠️ Missing Information',
        description: 'Please fill in name, data source, and table name.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const url = editingConfig ? `/api/upload-configurations/${editingConfig.id}` : '/api/upload-configurations';
      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Upload sample file if provided
        if (sampleFile && result.configuration) {
          const formData = new FormData();
          formData.append('file', sampleFile);
          
          await fetch(`/api/upload-configurations/${result.configuration.id}/sample`, {
            method: 'POST',
            credentials: 'include',
            body: formData
          });
        }

        toast({
          title: '✅ Success',
          description: `Configuration ${editingConfig ? 'updated' : 'created'} successfully.`,
        });
        setIsDialogOpen(false);
        resetForm();
        fetchConfigurations();
        fetchStats();
      } else {
        const error = await response.json();
        toast({
          title: '❌ Error',
          description: error.error || 'Failed to save configuration',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditConfiguration = (config: UploadConfiguration) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      description: config.description || '',
      file_format: config.file_format,
      file_encoding: config.file_encoding || 'utf-8',
      delimiter: config.delimiter || ',',
      has_header: config.has_header,
      data_source_id: config.data_source_id,
      table_name: config.table_name,
      upload_mode: config.upload_mode,
      validation_rules: config.validation_rules || {},
      transformation_rules: config.transformation_rules || {},
      conditions: config.conditions || { max_file_size_mb: 50, allowed_extensions: ['csv', 'xlsx'], skip_rows: 0 }
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfiguration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      const response = await fetch(`/api/upload-configurations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: '✅ Success',
          description: 'Configuration deleted successfully.',
        });
        fetchConfigurations();
        fetchStats();
      } else {
        toast({
          title: '❌ Error',
          description: 'Failed to delete configuration',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to delete configuration',
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedConfig || !uploadFile) {
      toast({
        title: '⚠️ Missing Information',
        description: 'Please select a configuration and file.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch(`/api/upload-configurations/${selectedConfig}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        toast({
          title: '✅ Success',
          description: 'File uploaded successfully!',
        });
        setUploadFile(null);
        setSelectedConfig('');
        fetchHistory();
        fetchStats();
        fetchConfigurations();
      } else {
        const error = await response.json();
        toast({
          title: '❌ Error',
          description: error.error || 'Failed to upload file',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = async (configId: string) => {
    try {
      const response = await fetch(`/api/upload-configurations/${configId}/sample`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample.csv';
        a.click();
      }
    } catch (error) {
      console.error('Error downloading sample:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <FileUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Upload Utility
              </h1>
            </div>
            <p className="text-gray-600 text-lg ml-1">
              Upload and manage data files with custom configurations
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Configurations</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.total_configurations}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active_configurations}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uploads This Month</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.uploads_this_month}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Successful Uploads</p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">{stats.successful_uploads}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Card className="border-2 bg-white/80 backdrop-blur">
          <Tabs defaultValue="configurations" className="w-full">
            <CardHeader className="border-b">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="configurations" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Configurations
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Files
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
        </TabsList>
              </CardHeader>

            <CardContent className="p-6">
              {/* Configurations Tab */}
              <TabsContent value="configurations" className="space-y-6 mt-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Upload Configurations</h3>
                    <p className="text-sm text-gray-600">Create and manage upload templates</p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        <Plus className="h-4 w-4" />
                        Create Configuration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                          <Sparkles className="h-6 w-6 text-green-600" />
                          {editingConfig ? 'Edit Configuration' : 'Create New Configuration'}
                        </DialogTitle>
                        <DialogDescription>
                          Set up file upload rules and destination
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="name" className="text-base font-semibold">Configuration Name *</Label>
                    <Input
                      id="name"
                              placeholder="e.g., Sales Data Upload"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>

                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Describe this upload configuration..."
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              rows={2}
                    />
                  </div>
                        </div>

                        {/* File Settings */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            File Settings
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>File Format *</Label>
                              <Select value={formData.file_format} onValueChange={(value) => setFormData({ ...formData, file_format: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                            {formData.file_format === 'csv' && (
                              <>
                                <div className="space-y-2">
                                  <Label>Delimiter</Label>
                                  <Input
                                    value={formData.delimiter}
                                    onChange={(e) => setFormData({ ...formData, delimiter: e.target.value })}
                                    placeholder=","
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Encoding</Label>
                                  <Input
                                    value={formData.file_encoding}
                                    onChange={(e) => setFormData({ ...formData, file_encoding: e.target.value })}
                                    placeholder="utf-8"
                                  />
                                </div>
                              </>
                            )}
                </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has_header"
                              checked={formData.has_header}
                              onCheckedChange={(checked) => setFormData({ ...formData, has_header: checked as boolean })}
                            />
                            <Label htmlFor="has_header" className="cursor-pointer">File has header row</Label>
                          </div>
                </div>

                        {/* Destination */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Destination
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Data Source *</Label>
                              <Select value={formData.data_source_id} onValueChange={(value) => setFormData({ ...formData, data_source_id: value })}>
                      <SelectTrigger>
                                  <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                                  {dataSources.map((ds) => (
                                    <SelectItem key={ds.id} value={ds.id}>
                                      {ds.name} ({ds.connection_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                            <div className="space-y-2">
                              <Label>Table Name *</Label>
                    <Input
                                value={formData.table_name}
                                onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
                                placeholder="target_table"
                              />
                </div>

                            <div className="space-y-2">
                              <Label>Upload Mode</Label>
                              <Select value={formData.upload_mode} onValueChange={(value) => setFormData({ ...formData, upload_mode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                                  <SelectItem value="append">Append (Add to existing)</SelectItem>
                                  <SelectItem value="replace">Replace (Truncate & Load)</SelectItem>
                                  <SelectItem value="upsert">Upsert (Update or Insert)</SelectItem>
                    </SelectContent>
                  </Select>
                            </div>
                          </div>
                </div>

                        {/* Sample File */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2">
                          <h4 className="font-semibold">Sample File (Optional)</h4>
                          <div className="space-y-2">
                            <Label>Upload a sample file as reference</Label>
                            <Input
                              type="file"
                              onChange={(e) => setSampleFile(e.target.files?.[0] || null)}
                              accept=".csv,.xlsx,.xls,.json"
                            />
                            {sampleFile && (
                              <p className="text-sm text-gray-600">
                                Selected: {sampleFile.name} ({formatFileSize(sampleFile.size)})
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Conditions */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2">
                          <h4 className="font-semibold">Upload Conditions</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Max File Size (MB)</Label>
                              <Input
                                type="number"
                                value={formData.conditions.max_file_size_mb || 50}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  conditions: { ...formData.conditions, max_file_size_mb: parseInt(e.target.value) }
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Skip Rows</Label>
                              <Input
                                type="number"
                                value={formData.conditions.skip_rows || 0}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  conditions: { ...formData.conditions, skip_rows: parseInt(e.target.value) }
                                })}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Data Quality & Validation Rules */}
                        <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Data Quality & Validation Rules
                          </h4>

                          {/* Delta Update / Upsert Configuration */}
                          <div className="space-y-3 p-3 bg-white rounded border-2 border-blue-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-blue-600" />
                                <Label className="font-semibold">Delta Update (Upsert)</Label>
                              </div>
                              <Checkbox
                                checked={formData.validation_rules.delta_update.enabled}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData,
                                  validation_rules: {
                                    ...formData.validation_rules,
                                    delta_update: {
                                      ...formData.validation_rules.delta_update,
                                      enabled: checked as boolean
                                    }
                                  }
                                })}
                              />
                            </div>
                            
                            {formData.validation_rules.delta_update.enabled && (
                              <div className="space-y-3 pl-6">
                                <div className="space-y-2">
                                  <Label className="text-sm">Key Columns (for matching records) *</Label>
                                  <Input
                                    placeholder="e.g., id, user_id (comma-separated)"
                                    value={formData.validation_rules.delta_update.key_columns.join(', ')}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      validation_rules: {
                                        ...formData.validation_rules,
                                        delta_update: {
                                          ...formData.validation_rules.delta_update,
                                          key_columns: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                                        }
                                      }
                                    })}
                                  />
                                  <p className="text-xs text-gray-600">
                                    🔍 Check these columns - if found, update; else insert new record
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm">Update Columns (optional)</Label>
                                  <Input
                                    placeholder="e.g., status, updated_at (comma-separated)"
                                    value={formData.validation_rules.delta_update.update_columns.join(', ')}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      validation_rules: {
                                        ...formData.validation_rules,
                                        delta_update: {
                                          ...formData.validation_rules.delta_update,
                                          update_columns: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                                        }
                                      }
                                    })}
                                  />
                                  <p className="text-xs text-gray-600">
                                    Leave empty to update all columns
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Column-Level Validations */}
                          <div className="space-y-3 p-3 bg-white rounded border-2 border-blue-100">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                              <Label className="font-semibold">Column-Level Validations</Label>
                            </div>
                            
                            {formData.validation_rules.column_validations.length > 0 && (
                              <div className="space-y-2">
                                {formData.validation_rules.column_validations.map((validation, index) => (
                                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{validation.column}</p>
                                      <p className="text-xs text-gray-600">
                                        Type: {validation.type}
                                        {validation.required && ' • Required'}
                                        {validation.unique && ' • Unique'}
                                        {validation.min_value && ` • Min: ${validation.min_value}`}
                                        {validation.max_value && ` • Max: ${validation.max_value}`}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeColumnValidation(index)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="space-y-3 p-3 bg-gray-50 rounded">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Column Name *</Label>
                                  <Input
                                    placeholder="column_name"
                                    value={newColumnValidation.column}
                                    onChange={(e) => setNewColumnValidation({ ...newColumnValidation, column: e.target.value })}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                
                                <div className="space-y-1">
                                  <Label className="text-xs">Data Type</Label>
                                  <Select
                                    value={newColumnValidation.type}
                                    onValueChange={(value) => setNewColumnValidation({ ...newColumnValidation, type: value })}
                                  >
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="string">String</SelectItem>
                                      <SelectItem value="integer">Integer</SelectItem>
                                      <SelectItem value="float">Float</SelectItem>
                                      <SelectItem value="boolean">Boolean</SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                      <SelectItem value="phone">Phone</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {(newColumnValidation.type === 'integer' || newColumnValidation.type === 'float') && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Min Value</Label>
                                      <Input
                                        type="number"
                                        placeholder="Minimum"
                                        value={newColumnValidation.min_value || ''}
                                        onChange={(e) => setNewColumnValidation({ ...newColumnValidation, min_value: parseFloat(e.target.value) })}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Max Value</Label>
                                      <Input
                                        type="number"
                                        placeholder="Maximum"
                                        value={newColumnValidation.max_value || ''}
                                        onChange={(e) => setNewColumnValidation({ ...newColumnValidation, max_value: parseFloat(e.target.value) })}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </>
                                )}

                                {newColumnValidation.type === 'string' && (
                                  <div className="col-span-2 space-y-1">
                                    <Label className="text-xs">Pattern (Regex)</Label>
                                    <Input
                                      placeholder="^[A-Za-z]+$ (optional)"
                                      value={newColumnValidation.pattern}
                                      onChange={(e) => setNewColumnValidation({ ...newColumnValidation, pattern: e.target.value })}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`required-${newColumnValidation.column}`}
                                    checked={newColumnValidation.required}
                                    onCheckedChange={(checked) => setNewColumnValidation({ ...newColumnValidation, required: checked as boolean })}
                                  />
                                  <Label htmlFor={`required-${newColumnValidation.column}`} className="text-xs cursor-pointer">Required</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`unique-${newColumnValidation.column}`}
                                    checked={newColumnValidation.unique}
                                    onCheckedChange={(checked) => setNewColumnValidation({ ...newColumnValidation, unique: checked as boolean })}
                                  />
                                  <Label htmlFor={`unique-${newColumnValidation.column}`} className="text-xs cursor-pointer">Unique</Label>
                                </div>
                              </div>

                              <Button
                                type="button"
                                onClick={addColumnValidation}
                                size="sm"
                                variant="outline"
                                className="w-full"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Column Validation
                              </Button>
                            </div>
                          </div>

                          {/* Data Quality Checks */}
                          <div className="space-y-3 p-3 bg-white rounded border-2 border-blue-100">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-blue-600" />
                              <Label className="font-semibold">Data Quality Checks</Label>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm">Check for Duplicates</Label>
                                <Checkbox
                                  checked={formData.validation_rules.data_quality.check_duplicates}
                                  onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    validation_rules: {
                                      ...formData.validation_rules,
                                      data_quality: {
                                        ...formData.validation_rules.data_quality,
                                        check_duplicates: checked as boolean
                                      }
                                    }
                                  })}
                                />
                              </div>

                              {formData.validation_rules.data_quality.check_duplicates && (
                                <div className="pl-6">
                                  <Label className="text-xs">Duplicate Check Columns</Label>
                                  <Input
                                    placeholder="e.g., email, phone (comma-separated)"
                                    value={formData.validation_rules.data_quality.duplicate_columns.join(', ')}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      validation_rules: {
                                        ...formData.validation_rules,
                                        data_quality: {
                                          ...formData.validation_rules.data_quality,
                                          duplicate_columns: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                                        }
                                      }
                                    })}
                                    className="h-8 text-sm mt-1"
                                  />
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <Label className="text-sm">Check for Null Values</Label>
                                <Checkbox
                                  checked={formData.validation_rules.data_quality.check_nulls}
                                  onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    validation_rules: {
                                      ...formData.validation_rules,
                                      data_quality: {
                                        ...formData.validation_rules.data_quality,
                                        check_nulls: checked as boolean
                                      }
                                    }
                                  })}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <Label className="text-sm">Validate Data Types</Label>
                                <Checkbox
                                  checked={formData.validation_rules.data_quality.check_data_types}
                                  onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    validation_rules: {
                                      ...formData.validation_rules,
                                      data_quality: {
                                        ...formData.validation_rules.data_quality,
                                        check_data_types: checked as boolean
                                      }
                                    }
                                  })}
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Custom SQL Check (Advanced)</Label>
                                <Textarea
                                  placeholder="SELECT COUNT(*) FROM uploaded_data WHERE condition..."
                                  value={formData.validation_rules.data_quality.custom_sql_check}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    validation_rules: {
                                      ...formData.validation_rules,
                                      data_quality: {
                                        ...formData.validation_rules.data_quality,
                                        custom_sql_check: e.target.value
                                      }
                                    }
                                  })}
                                  rows={2}
                                  className="text-sm font-mono"
                                />
                                <p className="text-xs text-gray-600">
                                  Optional: Custom SQL to validate data quality
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateConfiguration}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          {loading ? 'Saving...' : editingConfig ? 'Update Configuration' : 'Create Configuration'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {loading && configurations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading configurations...</p>
                  </div>
                ) : configurations.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No configurations created yet</p>
                    <p className="text-gray-400 text-sm">Click "Create Configuration" to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {configurations.map((config) => (
                      <Card key={config.id} className="border-2 hover:shadow-lg transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {config.name}
                                <Badge variant={config.is_active ? 'default' : 'secondary'} className={config.is_active ? 'bg-green-500' : ''}>
                                  {config.status}
                                </Badge>
                              </CardTitle>
                              <CardDescription className="mt-1">{config.description || 'No description'}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Format</p>
                              <p className="font-medium">{config.file_format.toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Mode</p>
                              <p className="font-medium capitalize">{config.upload_mode}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Data Source</p>
                              <p className="font-medium truncate" title={config.data_source_name}>
                                {config.data_source_name || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Table</p>
                              <p className="font-medium">{config.table_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Uploads</p>
                              <p className="font-medium">{config.total_uploads}</p>
                      </div>
                            <div>
                              <p className="text-gray-500">Last Upload</p>
                              <p className="font-medium text-xs">{formatDate(config.last_upload_at)}</p>
                      </div>
                    </div>

                          {config.sample_file_name && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="flex-1 truncate">{config.sample_file_name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadSample(config.id)}
                                className="h-7"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditConfiguration(config)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDeleteConfiguration(config.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
                )}
          </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-xl font-semibold">Upload Data File</h3>
                  <p className="text-sm text-gray-600">Select a configuration and upload your file</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="space-y-4 p-6 border-2 border-dashed rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Select Configuration *</Label>
                      <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose an upload configuration" />
                    </SelectTrigger>
                    <SelectContent>
                          {configurations.filter(c => c.is_active).map((config) => (
                            <SelectItem key={config.id} value={config.id}>
                              {config.name} - {config.data_source_name} / {config.table_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Select File *</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                        <Input
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="upload-file"
                          accept=".csv,.xlsx,.xls,.json"
                        />
                        <label htmlFor="upload-file" className="cursor-pointer">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-medium">Click to browse or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">CSV, Excel, or JSON files</p>
                        </label>
                      </div>
                      {uploadFile && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{uploadFile.name}</p>
                            <p className="text-xs text-gray-600">{formatFileSize(uploadFile.size)}</p>
                          </div>
                      <Button 
                            variant="ghost"
                        size="sm" 
                            onClick={() => setUploadFile(null)}
                      >
                            <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                )}
                    </div>

                    <Button 
                      onClick={handleFileUpload}
                      disabled={loading || !selectedConfig || !uploadFile}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      size="lg"
                    >
                      {loading ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </div>
                </div>
        </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-xl font-semibold">Upload History</h3>
                  <p className="text-sm text-gray-600">View all upload attempts and their status</p>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No upload history yet</p>
                    <p className="text-gray-400 text-sm">Upload some files to see history here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                {history.map((item) => (
                      <Card key={item.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="p-2 bg-gray-100 rounded">
                      {getStatusIcon(item.status)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{item.file_name}</p>
                                  <Badge variant={item.status === 'success' ? 'default' : item.status === 'failed' ? 'destructive' : 'secondary'}>
                                    {item.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {item.configuration_name} • {formatFileSize(item.file_size)} • {formatDate(item.started_at)}
                        </p>
                      </div>
                    </div>
                            <div className="text-right text-sm">
                              <p className="text-gray-600">
                                {item.records_processed > 0 ? `${item.records_success} / ${item.records_processed} records` : 'Processing...'}
                              </p>
                              {item.error_message && (
                                <p className="text-red-600 text-xs mt-1">{item.error_message}</p>
                      )}
                    </div>
                  </div>
                        </CardContent>
                      </Card>
                ))}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
          </Card>
      </div>
    </div>
  );
};

export default UploadUtility;
