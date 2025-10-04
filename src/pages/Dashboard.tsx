import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  LayoutDashboard, 
  Eye, 
  Database, 
  GitBranch, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Users,
  Server,
  Zap,
  CheckCircle,
  AlertCircle,
  Calendar,
  Palette,
  BarChart3,
  Boxes
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Dashboard {
  id: number;
  name: string;
  description: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: number;
  type: 'dashboard' | 'query' | 'pipeline' | 'data-source';
  action: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dashboards: 0,
    dataSources: 0,
    dataMarts: 0,
    schedulers: 0
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) return user.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Fetch real data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboards
        const dashboardsRes = await fetch('/api/get-dashboards', {
          credentials: 'include'
        });
        let dashboardsData = [];
        let dashboardsCount = 0;
        if (dashboardsRes.ok) {
          dashboardsData = await dashboardsRes.json();
          setDashboards(Array.isArray(dashboardsData) ? dashboardsData : []);
          dashboardsCount = Array.isArray(dashboardsData) ? dashboardsData.length : 0;
        }

        // Fetch data sources
        const sourcesRes = await fetch('/api/data-sources', {
          credentials: 'include'
        });
        let sourcesCount = 0;
        if (sourcesRes.ok) {
          const sources = await sourcesRes.json();
          sourcesCount = Array.isArray(sources) ? sources.length : 0;
        }

        // Fetch data marts
        const martsRes = await fetch('/api/data-marts', {
          credentials: 'include'
        });
        let martsCount = 0;
        if (martsRes.ok) {
          const marts = await martsRes.json();
          martsCount = Array.isArray(marts) ? marts.length : 0;
        }

        // Fetch schedulers
        const schedulersRes = await fetch('/api/schedulers', {
          credentials: 'include'
        });
        let schedulersCount = 0;
        if (schedulersRes.ok) {
          const schedulers = await schedulersRes.json();
          schedulersCount = Array.isArray(schedulers) ? schedulers.length : 0;
        }

        // Update stats with real data
        setStats({
          dashboards: dashboardsCount,
          dataSources: sourcesCount,
          dataMarts: martsCount,
          schedulers: schedulersCount
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-8 text-white shadow-2xl">
        {/* Animated blur decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {getGreeting()}, {getUserDisplayName()}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your data today
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/dashboard-builder')}
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/database-management')}
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                <Database className="h-4 w-4 mr-2" />
                Data Suite
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-t-4 border-t-blue-500"
          onClick={() => navigate('/all-dashboards')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
              </div>
              {!loading && stats.dashboards > 0 && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? '...' : stats.dashboards}
            </div>
            <div className="text-sm text-gray-600">Dashboards</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-t-4 border-t-green-500"
          onClick={() => navigate('/database-management')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              {!loading && stats.dataSources > 0 && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? '...' : stats.dataSources}
            </div>
            <div className="text-sm text-gray-600">Data Sources</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-t-4 border-t-purple-500"
          onClick={() => navigate('/database-management')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Boxes className="h-6 w-6 text-purple-600" />
              </div>
              {!loading && stats.dataMarts > 0 && (
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? '...' : stats.dataMarts}
            </div>
            <div className="text-sm text-gray-600">Data Marts</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-t-4 border-t-orange-500"
          onClick={() => navigate('/scheduler')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              {!loading && stats.schedulers > 0 && (
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? '...' : stats.schedulers}
            </div>
            <div className="text-sm text-gray-600">Schedulers</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your data ecosystem at a glance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <LayoutDashboard className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-blue-900">Dashboards</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.dashboards}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.dashboards === 0 ? 'Create your first dashboard' : `${stats.dashboards} active dashboard${stats.dashboards !== 1 ? 's' : ''}`}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-green-900">Data Sources</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.dataSources}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.dataSources === 0 ? 'Connect your first source' : `${stats.dataSources} connected source${stats.dataSources !== 1 ? 's' : ''}`}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Boxes className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-purple-900">Data Marts</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.dataMarts}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {stats.dataMarts === 0 ? 'Build your first data mart' : `${stats.dataMarts} data mart${stats.dataMarts !== 1 ? 's' : ''} ready`}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-orange-900">Schedulers</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{stats.schedulers}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.schedulers === 0 ? 'Schedule your first report' : `${stats.schedulers} active scheduler${stats.schedulers !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/dashboard-builder')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/database-management')}
              >
                <Database className="h-4 w-4 mr-2" />
                Data Management Suite
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/theme-library')}
              >
                <Palette className="h-4 w-4 mr-2" />
                Themes & Charts
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/scheduler')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Sources</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${stats.dataSources > 0 ? 'bg-green-500' : 'bg-gray-300'} rounded-full ${stats.dataSources > 0 ? 'animate-pulse' : ''}`}></div>
                  <span className={`text-sm font-medium ${stats.dataSources > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {stats.dataSources > 0 ? 'Active' : 'None'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Your Dashboards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Dashboards</CardTitle>
              <CardDescription>Recently accessed and created dashboards</CardDescription>
            </div>
            <Button onClick={() => navigate('/dashboard-builder')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dashboards.length === 0 ? (
            <div className="text-center py-12">
              <LayoutDashboard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No dashboards yet</p>
              <Button onClick={() => navigate('/dashboard-builder')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Dashboard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <Card 
                  key={dashboard.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
                  onClick={() => navigate(`/dashboard/${dashboard.id}/view`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                        <LayoutDashboard className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge variant="outline">{dashboard.theme}</Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {dashboard.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{dashboard.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Updated {new Date(dashboard.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
