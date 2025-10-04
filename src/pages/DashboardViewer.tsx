import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Share, 
  Download, 
  RefreshCw,
  Calendar,
  User,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  id: number;
  name: string;
  description: string;
  theme: string;
  created_at: string;
  updated_at: string;
  components: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    data?: any;
    config?: any;
  }>;
  owner?: {
    name: string;
    email: string;
  };
}

const DashboardViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDashboard();
    }
  }, [id]);

  const fetchDashboard = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/dashboards/${id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
      } else if (response.status === 404) {
        toast({
          title: 'Dashboard Not Found',
          description: 'The requested dashboard could not be found.',
          variant: 'destructive'
        });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to fetch dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
    toast({
      title: 'Dashboard Refreshed',
      description: 'Dashboard data has been updated.'
    });
  };

  const shareDashboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Dashboard link copied to clipboard.'
    });
  };

  const exportDashboard = (format: string) => {
    toast({
      title: 'Export Started',
      description: `Exporting dashboard as ${format.toUpperCase()}...`
    });
    // Mock export functionality
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: `Dashboard exported as ${format.toUpperCase()}`
      });
    }, 2000);
  };

  const getChartIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bar':
        return <BarChart3 className="h-8 w-8" />;
      case 'line':
        return <LineChart className="h-8 w-8" />;
      case 'pie':
        return <PieChart className="h-8 w-8" />;
      default:
        return <TrendingUp className="h-8 w-8" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <h2 className="text-2xl font-bold">Dashboard Not Found</h2>
        <p className="text-muted-foreground">The requested dashboard could not be found.</p>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboards
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{dashboard.name}</h1>
            <p className="text-muted-foreground">{dashboard.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refreshDashboard}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={shareDashboard}
            className="gap-2"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={() => exportDashboard('pdf')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => navigate(`/dashboard-builder?edit=${dashboard.id}`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Dashboard Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(dashboard.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Updated {new Date(dashboard.updated_at).toLocaleDateString()}</span>
              </div>
              {dashboard.owner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {dashboard.owner.name}</span>
                </div>
              )}
            </div>
            <Badge variant="outline">
              Theme: {dashboard.theme || 'Default'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Components */}
      {dashboard.components && dashboard.components.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboard.components.map((component) => (
            <Card key={component.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="text-primary">
                    {getChartIcon(component.type)}
                  </div>
                  <div>
                    <div className="text-lg">{component.title}</div>
                    <Badge variant="secondary" className="text-xs">
                      {component.type.charAt(0).toUpperCase() + component.type.slice(1)} Chart
                    </Badge>
                  </div>
                </CardTitle>
                {component.description && (
                  <CardDescription>{component.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-2">{getChartIcon(component.type)}</div>
                    <p className="text-sm">Chart Preview</p>
                    <p className="text-xs">Data visualization would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Components</h3>
            <p className="text-muted-foreground text-center mb-4">
              This dashboard doesn't have any components yet.
            </p>
            <Button
              onClick={() => navigate(`/dashboard-builder?edit=${dashboard.id}`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Add Components
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardViewer;
