import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Database, 
  Table, 
  Code, 
  Activity, 
  CheckCircle,
  Zap,
  Boxes,
  Upload
} from 'lucide-react';

// Import all database management section components
import DataSourceBuilder from '@/components/database/DataSourceBuilder';
import DataMartBuilder from '@/components/database/DataMartBuilder';
import UploadUtility from '@/pages/UploadUtility';
import PipelineManagement from '@/pages/PipelineManagement';
import SQLExecutionSection from '@/components/database/SQLExecutionSection';
import ComprehensivePerformance from '@/components/database/ComprehensivePerformance';
import { useAuth } from '@/contexts/AuthContext';

const DatabaseManagement: React.FC = () => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [activeTab, setActiveTab] = useState('databases');
  const [serverInfo, setServerInfo] = useState({
    host: 'localhost',
    port: 5000,
    version: 'DataMantri v1.0',
    uptime: '15 days, 8 hours',
    connections: 47,
    databases: 3
  });

  const tabs = [
    {
      id: 'databases',
      label: 'Data Sources',
      icon: Database,
      description: 'Connect and manage data sources',
      component: DataSourceBuilder,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'datamart',
      label: 'Data Marts',
      icon: Boxes,
      description: 'Create and manage data marts',
      component: DataMartBuilder,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'upload',
      label: 'Upload Utility',
      icon: Upload,
      description: 'Upload and configure data files',
      component: UploadUtility,
      color: 'from-cyan-500 to-teal-600'
    },
    {
      id: 'tables',
      label: 'Data Pipelines',
      icon: Table,
      description: 'Manage data pipelines',
      component: PipelineManagement,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'sql',
      label: 'SQL Editor',
      icon: Code,
      description: 'Execute SQL queries',
      component: SQLExecutionSection,
      color: 'from-orange-500 to-amber-600'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: Activity,
      description: 'Monitor performance',
      component: ComprehensivePerformance,
      color: 'from-pink-500 to-rose-600'
    }
  ];

  useEffect(() => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 1500);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6 p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 text-white shadow-lg">
        {/* Animated blur decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Server className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Data Management Suite
                </h1>
              </div>
            </div>
            
            {/* Connection Status Card */}
            <Card className="border-0 bg-white/10 backdrop-blur-md shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
                  <span className="font-semibold text-white text-base">{getStatusText()}</span>
                </div>
                {serverInfo && connectionStatus === 'connected' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-blue-100">
                      <span className="flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5" />
                        Data Sources
                      </span>
                      <Badge className="bg-white/20 text-white border-0 text-xs h-5">
                        {serverInfo.databases}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-blue-100">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        Connections
                      </span>
                      <Badge className="bg-white/20 text-white border-0 text-xs h-5">
                        {serverInfo.connections}
                      </Badge>
                    </div>
                    <div className="text-xs text-blue-200 mt-2 pt-2 border-t border-white/20">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3" />
                        <span>System Operational • Uptime: {serverInfo.uptime}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tab Navigation */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-transparent h-auto p-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`
                      flex flex-col items-center gap-3 p-5 h-auto rounded-xl border-2 transition-all duration-300
                      ${isActive 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl scale-105 text-white' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-gray-700'
                      }
                    `}
                  >
                    <div className={`
                      p-3 rounded-xl transition-all
                      ${isActive ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'}
                    `}>
                      <tab.icon className={`h-7 w-7 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-center">
                      <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}>
                        {tab.label}
                      </div>
                      {isActive && (
                        <div className="mt-1 w-8 h-1 bg-white rounded-full mx-auto"></div>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <Component connectionStatus={connectionStatus} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default DatabaseManagement;
