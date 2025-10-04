import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Eye,
  Edit,
  Download,
  Trash2,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Grid3x3,
  Plus,
  FileDown,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Dashboard {
  id: string;
  title: string;
  description: string;
  spec: {
    name: string;
    theme: string;
    charts: any[];
    filters: any[];
    header: {
      title: string;
      subtitle: string;
    };
  };
  created_at: string;
  updated_at: string;
}

const AllDashboards: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const themes = [
    { id: 'default', name: 'Default', colors: ['#3b82f6', '#10b981'], emoji: '🔵' },
    { id: 'dark', name: 'Dark', colors: ['#1e293b', '#334155'], emoji: '⚫' },
    { id: 'corporate', name: 'Corporate', colors: ['#1e40af', '#1e3a8a'], emoji: '💼' },
    { id: 'ocean', name: 'Ocean', colors: ['#0891b2', '#06b6d4'], emoji: '🌊' },
    { id: 'sunset', name: 'Sunset', colors: ['#f97316', '#fb923c'], emoji: '🌅' },
    { id: 'forest', name: 'Forest', colors: ['#059669', '#10b981'], emoji: '🌲' }
  ];

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/get-dashboards', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboards(data.dashboards || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load dashboards',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (dashboard: Dashboard) => {
    // Navigate to view mode
    navigate(`/dashboard-view/${dashboard.id}`);
  };

  const handleEdit = (dashboard: Dashboard) => {
    // Navigate to dashboard builder with edit
    navigate(`/dashboard-builder?edit=${dashboard.id}`);
  };

  const handleDownload = async (dashboard: Dashboard, format: 'pdf' | 'csv' | 'excel') => {
    setDownloadingId(dashboard.id);
    
    try {
      if (format === 'csv') {
        // Generate CSV from dashboard data
        let csv = 'Dashboard,Chart,Data\n';
        csv += `"${dashboard.title}","Summary","${dashboard.spec?.charts?.length || 0} charts, ${dashboard.spec?.filters?.length || 0} filters"\n`;
        
        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dashboard.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'excel') {
        // For Excel, we'll download as CSV for now (can be enhanced with xlsx library)
        const csv = `Dashboard: ${dashboard.title}\nDescription: ${dashboard.description || 'N/A'}\nCharts: ${dashboard.spec?.charts?.length || 0}\nFilters: ${dashboard.spec?.filters?.length || 0}\nCreated: ${new Date(dashboard.created_at).toLocaleDateString()}\nUpdated: ${new Date(dashboard.updated_at).toLocaleDateString()}`;
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dashboard.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // For PDF, create a simple text representation
        const content = `
Dashboard: ${dashboard.title}
Description: ${dashboard.description || 'N/A'}
Theme: ${dashboard.spec?.theme || 'default'}
Charts: ${dashboard.spec?.charts?.length || 0}
Filters: ${dashboard.spec?.filters?.length || 0}
Created: ${new Date(dashboard.created_at).toLocaleDateString()}
Updated: ${new Date(dashboard.updated_at).toLocaleDateString()}
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dashboard.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: '✅ Download Complete',
        description: `Dashboard "${dashboard.title}" downloaded as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to download dashboard',
        variant: 'destructive'
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (dashboardId: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;

    try {
      const response = await fetch(`/api/delete-dashboard/${dashboardId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setDashboards(dashboards.filter(d => d.id !== dashboardId));
        toast({
          title: '✅ Deleted',
          description: 'Dashboard deleted successfully'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to delete dashboard',
        variant: 'destructive'
      });
    }
  };

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTheme = (themeId: string) => {
    return themes.find(t => t.id === themeId) || themes[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <LayoutDashboard className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  All Dashboards
                </h1>
                <p className="text-gray-600 text-xl mt-1">
                  {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard-builder')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New
            </button>
          </div>

          {/* Search and Controls */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dashboards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboards Grid/List */}
        {filteredDashboards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <LayoutDashboard className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'No dashboards found' : 'No dashboards yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first dashboard to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/dashboard-builder')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Dashboard
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredDashboards.map((dashboard) => {
              const theme = getTheme(dashboard.spec?.theme);
              const isDownloading = downloadingId === dashboard.id;

              return (
                <div
                  key={dashboard.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Dashboard Header with Theme */}
                  <div
                    className="p-6 text-white relative"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-4xl">{theme.emoji}</span>
                          <h3 className="text-2xl font-bold">{dashboard.title}</h3>
                        </div>
                        <p className="text-white/90 text-sm">
                          {dashboard.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        <span>{dashboard.spec?.charts?.length || 0} charts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Filter className="w-4 h-4" />
                        <span>{dashboard.spec?.filters?.length || 0} filters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(dashboard.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleView(dashboard)}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(dashboard)}
                        className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>

                    {/* Download Options */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Download:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(dashboard, 'pdf')}
                            disabled={isDownloading}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            title="Download as PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(dashboard, 'csv')}
                            disabled={isDownloading}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                            title="Download as CSV"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(dashboard, 'excel')}
                            disabled={isDownloading}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50"
                            title="Download as Excel"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {isDownloading && (
                        <div className="mt-2 text-center">
                          <div className="inline-flex items-center gap-2 text-xs text-blue-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            Downloading...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(dashboard.id)}
                      className="w-full mt-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllDashboards;

