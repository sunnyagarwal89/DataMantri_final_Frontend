import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Palette, Code, Download, Upload, Eye, 
  Plus, Edit, Trash2, Star, ExternalLink,
  BarChart3, LineChart, PieChart, Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Theme {
  id: number;
  name: string;
  description: string;
  css_content: string;
  variables: any;
  preview_url: string;
  source_url: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

interface ChartLibrary {
  id: number;
  name: string;
  description: string;
  library_type: string;
  code_content: string;
  config_schema: any;
  preview_url: string;
  source_url: string;
  is_active: boolean;
  created_at: string;
}

const ThemeLibrary: React.FC = () => {
  const { user } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [chartLibraries, setChartLibraries] = useState<ChartLibrary[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [previewChart, setPreviewChart] = useState<ChartLibrary | null>(null);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [editingChart, setEditingChart] = useState<ChartLibrary | null>(null);

  // Theme form state
  const [themeForm, setThemeForm] = useState({
    name: '',
    description: '',
    css_content: '',
    variables: '',
    source_url: ''
  });

  // Chart library form state
  const [chartForm, setChartForm] = useState({
    name: '',
    description: '',
    library_type: 'recharts',
    code_content: '',
    config_schema: '{}',
    source_url: ''
  });

  const isAdmin = user?.is_admin || false;

  useEffect(() => {
    fetchThemes();
    fetchChartLibraries();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setThemes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    }
  };

  const fetchChartLibraries = async () => {
    try {
      const response = await fetch('/api/chart-libraries', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setChartLibraries(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch chart libraries:', error);
    }
  };

  const createQuickTheme = async (themeData: any) => {
    try {
      setLoading(true);
      console.log('Creating quick theme:', themeData);
      
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(themeData)
      });
      
      const result = await response.json();
      console.log('Theme creation response:', result);
      
      if (response.ok) {
        alert(`Theme "${themeData.name}" created successfully!`);
        await fetchThemes();
      } else {
        alert(`Failed to create theme: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create theme:', error);
      alert('Failed to create theme: Network error');
    } finally {
      setLoading(false);
    }
  };

  const createTheme = async () => {
    if (!themeForm.name.trim()) {
      alert('Please enter a theme name');
      return;
    }
    
    if (!themeForm.css_content.trim() && !themeForm.variables.trim()) {
      alert('Please enter either CSS content or color palette');
      return;
    }

    try {
      setLoading(true);
      
      const themeData = {
        name: themeForm.name.trim(),
        description: themeForm.description.trim(),
        css_content: themeForm.css_content.trim(),
        variables: themeForm.variables.trim(),
        source_url: themeForm.source_url.trim()
      };

      const url = editingTheme ? `/api/themes/${editingTheme.id}` : '/api/themes';
      const method = editingTheme ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(themeData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`Theme ${editingTheme ? 'updated' : 'created'} successfully!`);
        await fetchThemes();
        setThemeForm({
          name: '',
          description: '',
          css_content: '',
          variables: '',
          source_url: ''
        });
        setEditingTheme(null);
      } else {
        alert(`Failed to ${editingTheme ? 'update' : 'create'} theme: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Failed to save theme: Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteTheme = async (themeId: number) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    
    try {
      const response = await fetch(`/api/themes/${themeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Theme deleted successfully!');
        await fetchThemes();
      } else {
        const result = await response.json();
        alert(`Failed to delete theme: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete theme:', error);
      alert('Failed to delete theme: Network error');
    }
  };

  const deleteChartLibrary = async (chartId: number) => {
    if (!confirm('Are you sure you want to delete this chart library?')) return;
    
    try {
      const response = await fetch(`/api/chart-libraries/${chartId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Chart library deleted successfully!');
        await fetchChartLibraries();
      } else {
        const result = await response.json();
        alert(`Failed to delete chart library: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete chart library:', error);
      alert('Failed to delete chart library: Network error');
    }
  };

  const startEditTheme = (theme: Theme) => {
    setEditingTheme(theme);
    setThemeForm({
      name: theme.name,
      description: theme.description,
      css_content: theme.css_content,
      variables: typeof theme.variables === 'string' ? theme.variables : JSON.stringify(theme.variables),
      source_url: theme.source_url || ''
    });
  };

  const importFromLovable = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/import-from-lovable', {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      if (response.ok) {
        alert(`Successfully imported ${result.themes_count || 0} themes and ${result.charts_count || 0} chart libraries from Lovable.dev`);
        fetchThemes();
        fetchChartLibraries();
      } else {
        alert(`Import failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to import from Lovable:', error);
      alert('Import failed: Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Theme & Chart Libraries</h1>
          <p className="text-muted-foreground">
            Manage themes and chart libraries for your DataMantri platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={importFromLovable} variant="outline" className="gap-2" disabled={loading}>
            <ExternalLink className="h-4 w-4" />
            Import from Lovable.dev
          </Button>
        </div>
      </div>

      <Tabs defaultValue="themes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="charts">Chart Libraries</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          {isAdmin && (
            <>
              {/* Quick Theme Creator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Quick Theme Creator
                  </CardTitle>
                  <CardDescription>
                    Create themes instantly with preset color combinations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                      onClick={() => createQuickTheme({
                        name: 'Ocean Blue',
                        description: 'Professional blue theme',
                        css_content: ':root { --primary: #0ea5e9; --background: #f0f9ff; --foreground: #0c4a6e; }',
                        variables: '#0ea5e9,#f0f9ff,#0c4a6e,#64748b',
                        source_url: ''
                      })}
                      disabled={loading}
                    >
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded bg-sky-500"></div>
                        <div className="w-4 h-4 rounded bg-sky-50"></div>
                        <div className="w-4 h-4 rounded bg-sky-900"></div>
                      </div>
                      <span className="text-sm">Ocean Blue</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                      onClick={() => createQuickTheme({
                        name: 'Forest Green',
                        description: 'Nature-inspired green theme',
                        css_content: ':root { --primary: #10b981; --background: #f0fdf4; --foreground: #064e3b; }',
                        variables: '#10b981,#f0fdf4,#064e3b,#6b7280',
                        source_url: ''
                      })}
                      disabled={loading}
                    >
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded bg-emerald-500"></div>
                        <div className="w-4 h-4 rounded bg-emerald-50"></div>
                        <div className="w-4 h-4 rounded bg-emerald-900"></div>
                      </div>
                      <span className="text-sm">Forest Green</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                      onClick={() => createQuickTheme({
                        name: 'Sunset Orange',
                        description: 'Warm orange theme',
                        css_content: ':root { --primary: #f97316; --background: #fff7ed; --foreground: #9a3412; }',
                        variables: '#f97316,#fff7ed,#9a3412,#78716c',
                        source_url: ''
                      })}
                      disabled={loading}
                    >
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded bg-orange-500"></div>
                        <div className="w-4 h-4 rounded bg-orange-50"></div>
                        <div className="w-4 h-4 rounded bg-orange-800"></div>
                      </div>
                      <span className="text-sm">Sunset Orange</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Theme Creator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Custom Theme Creator
                  </CardTitle>
                  <CardDescription>
                    Create your own custom theme with specific colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme-name">Theme Name</Label>
                      <Input
                        id="theme-name"
                        value={themeForm.name}
                        onChange={(e) => setThemeForm({...themeForm, name: e.target.value})}
                        placeholder="Modern Dark Theme"
                      />
                    </div>
                    <div>
                      <Label htmlFor="source-url">Source URL (Optional)</Label>
                      <Input
                        id="source-url"
                        value={themeForm.source_url}
                        onChange={(e) => setThemeForm({...themeForm, source_url: e.target.value})}
                        placeholder="https://lovable.dev/theme/123"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="theme-description">Description</Label>
                    <Textarea
                      id="theme-description"
                      value={themeForm.description}
                      onChange={(e) => setThemeForm({...themeForm, description: e.target.value})}
                      placeholder="A modern dark theme with blue accents..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="css-content">CSS Content</Label>
                    <Textarea
                      id="css-content"
                      value={themeForm.css_content}
                      onChange={(e) => setThemeForm({...themeForm, css_content: e.target.value})}
                      placeholder=":root { --primary: #3b82f6; --background: #0f172a; --foreground: #ffffff; }"
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Example: :root {`{ --primary: #3b82f6; --background: #ffffff; }`}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="variables">Color Palette (comma-separated colors)</Label>
                    <Input
                      id="variables"
                      value={themeForm.variables}
                      onChange={(e) => setThemeForm({...themeForm, variables: e.target.value})}
                      placeholder="#3b82f6,#ffffff,#000000,#64748b"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter colors separated by commas (e.g., #3b82f6,#ffffff,#000000)
                    </p>
                  </div>

                  <Button onClick={createTheme} disabled={loading} className="w-full">
                    {loading ? 'Creating...' : 'Create Theme'}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <Card key={theme.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                    <Badge variant={theme.is_active ? "default" : "secondary"}>
                      {theme.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{theme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Theme Preview */}
                    <div className="h-32 rounded border p-4 space-y-2">
                      <div className="flex gap-2">
                        {theme.variables?.colors?.slice(0, 4).map((color: string, idx: number) => (
                          <div 
                            key={idx}
                            className="w-6 h-6 rounded border" 
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {theme.css_content?.substring(0, 50)}...
                      </div>
                    </div>

                    {/* Theme Info */}
                    <div className="text-sm text-muted-foreground">
                      <p>Created: {new Date(theme.created_at).toLocaleDateString()}</p>
                      {theme.is_default && (
                        <Badge variant="outline" className="mt-1">Default</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreviewTheme(theme)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      {theme.source_url && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={theme.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => startEditTheme(theme)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteTheme(theme.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          {/* Chart Libraries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chartLibraries.map((library) => (
              <Card key={library.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{library.name}</CardTitle>
                    <Badge variant="outline">{library.library_type}</Badge>
                  </div>
                  <CardDescription>{library.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chart Preview */}
                    <div className="h-32 rounded border bg-muted flex items-center justify-center">
                      <Code className="h-8 w-8 text-muted-foreground" />
                    </div>

                    {/* Library Info */}
                    <div className="text-sm text-muted-foreground">
                      <p>Added: {new Date(library.created_at).toLocaleDateString()}</p>
                      <Badge variant={library.is_active ? "default" : "secondary"} className="mt-1">
                        {library.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreviewChart(library)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      {library.source_url && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={library.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingChart(library)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteChartLibrary(library.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Theme Preview Dialog */}
      <Dialog open={!!previewTheme} onOpenChange={() => setPreviewTheme(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Theme Preview: {previewTheme?.name}</DialogTitle>
            <DialogDescription>{previewTheme?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Color Palette */}
            <div>
              <h4 className="font-medium mb-2">Color Palette</h4>
              <div className="flex gap-2">
                {previewTheme?.variables?.split(',').slice(0, 6).map((color: string, idx: number) => (
                  <div key={idx} className="text-center">
                    <div 
                      className="w-12 h-12 rounded border shadow-sm" 
                      style={{ backgroundColor: color.trim() }}
                    ></div>
                    <p className="text-xs mt-1 font-mono">{color.trim()}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CSS Preview */}
            <div>
              <h4 className="font-medium mb-2">CSS Variables</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {previewTheme?.css_content || 'No CSS content available'}
              </pre>
            </div>

            {/* Sample UI Components */}
            <div>
              <h4 className="font-medium mb-2">Sample Components</h4>
              <div className="space-y-2">
                <Button className="mr-2">Primary Button</Button>
                <Button variant="outline" className="mr-2">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <div className="mt-3">
                  <Card className="p-4">
                    <h5 className="font-medium">Sample Card</h5>
                    <p className="text-sm text-muted-foreground">This shows how the theme looks on cards and components.</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chart Library Preview Dialog */}
      <Dialog open={!!previewChart} onOpenChange={() => setPreviewChart(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chart Library Preview: {previewChart?.name}</DialogTitle>
            <DialogDescription>{previewChart?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Chart Type */}
            <div>
              <h4 className="font-medium mb-2">Library Type</h4>
              <Badge variant="outline">{previewChart?.library_type}</Badge>
            </div>

            {/* Sample Charts */}
            <div>
              <h4 className="font-medium mb-2">Sample Visualizations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-sm mt-2 text-center">Bar Chart Sample</p>
                </Card>
                <Card className="p-4">
                  <div className="h-32 bg-gradient-to-r from-green-500 to-blue-500 rounded flex items-center justify-center">
                    <LineChart className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-sm mt-2 text-center">Line Chart Sample</p>
                </Card>
                <Card className="p-4">
                  <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                    <PieChart className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-sm mt-2 text-center">Pie Chart Sample</p>
                </Card>
                <Card className="p-4">
                  <div className="h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                    <Database className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-sm mt-2 text-center">Data Table Sample</p>
                </Card>
              </div>
            </div>

            {/* Configuration Schema */}
            {previewChart?.config_schema && (
              <div>
                <h4 className="font-medium mb-2">Configuration Schema</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(JSON.parse(previewChart.config_schema), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemeLibrary;
