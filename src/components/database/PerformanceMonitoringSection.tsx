import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  HardDrive,
  Cpu,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Gauge,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServerStats {
  uptime: string;
  connections: number;
  maxConnections: number;
  queries: number;
  slowQueries: number;
  threads: number;
  memoryUsage: number;
  diskUsage: number;
  cpuUsage: number;
}

interface ProcessInfo {
  id: number;
  user: string;
  host: string;
  database: string;
  command: string;
  time: number;
  state: string;
  info: string;
}

interface SlowQuery {
  query: string;
  database: string;
  executionTime: number;
  lockTime: number;
  rowsSent: number;
  rowsExamined: number;
  timestamp: string;
}

interface PerformanceMonitoringSectionProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const PerformanceMonitoringSection: React.FC<PerformanceMonitoringSectionProps> = ({ connectionStatus }) => {
  const { toast } = useToast();
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchServerStats();
      fetchProcesses();
      fetchSlowQueries();
    }
  }, [connectionStatus]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && connectionStatus === 'connected') {
      interval = setInterval(() => {
        fetchServerStats();
        fetchProcesses();
      }, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, connectionStatus]);

  const fetchServerStats = async () => {
    try {
      const resp = await fetch('/api/database/server-stats', {
        credentials: 'include',
        cache: 'no-store'
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.status === 'success') {
        const stats: ServerStats = {
          uptime: data.uptime || 'n/a',
          connections: data.connections || 0,
          maxConnections: data.maxConnections || 0,
          queries: data.queries || 0,
          slowQueries: data.slowQueries || 0,
          threads: data.threads || 0,
          memoryUsage: data.memoryUsage || 0,
          diskUsage: data.diskUsage || 0,
          cpuUsage: data.cpuUsage || 0
        };
        setServerStats(stats);
      } else {
        throw new Error(data.message || 'Failed to fetch server statistics');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch server statistics',
        variant: 'destructive'
      });
    }
  };

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/database/processes', {
        credentials: 'include',
        cache: 'no-store'
      });
      const data = await resp.json();
      if (resp.ok && data.status === 'success' && Array.isArray(data.processes)) {
        const mapped: ProcessInfo[] = data.processes.map((p: any) => ({
          id: p.id,
          user: p.user,
          host: p.host,
          database: p.database,
          command: p.command,
          time: p.time,
          state: p.state,
          info: p.info
        }));
        setProcesses(mapped);
      } else {
        setProcesses([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch process list',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSlowQueries = async () => {
    try {
      const response = await fetch('/api/database/slow-queries', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.slowQueries)) {
          setSlowQueries(data.slowQueries);
        } else {
          // If no slow queries or API doesn't support it, show empty state
          setSlowQueries([]);
        }
      } else {
        // If API endpoint doesn't exist, fall back to empty state
        if (response.status === 404) {
          setSlowQueries([]);
          console.log('Slow queries API endpoint not implemented yet');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch slow queries:', error);
      
      // Show empty state instead of error for missing API endpoint
      if (error.message?.includes('fetch') || error.message?.includes('404')) {
        setSlowQueries([]);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch slow queries',
          variant: 'destructive'
        });
        setSlowQueries([]);
      }
    }
  };

  const killProcess = async (processId: number) => {
    if (!confirm(`Are you sure you want to kill process ${processId}?`)) return;

    try {
      const response = await fetch(`/api/database/process/${processId}/kill`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Process ${processId} killed successfully`
        });
        fetchProcesses();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to kill process',
        variant: 'destructive'
      });
    }
  };

  const optimizeDatabase = async () => {
    try {
      const response = await fetch('/api/database/optimize', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Database optimization started'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start database optimization',
        variant: 'destructive'
      });
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUsageStatus = (usage: number) => {
    if (usage < 50) return 'good';
    if (usage < 80) return 'warning';
    return 'critical';
  };

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {connectionStatus === 'connecting' ? 'Connecting to database server...' : 'Not connected to database server'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Beautiful Header Section */}
      <Card className="border-2 border-pink-200 shadow-xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 p-6">
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <Gauge className="h-10 w-10 text-white" />
            </div>
            
            {/* Title & Description */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                Performance Monitoring
                <Sparkles className="h-6 w-6 text-pink-200 animate-pulse" />
              </h2>
              <p className="text-white/90 text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Real-time insights into your database performance metrics
              </p>
            </div>

            {/* Connection Status Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Monitoring</span>
            </div>
          </div>
        </div>

        {/* Control Panel Section */}
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Auto-refresh Controls */}
            <div className="flex items-center gap-4">
              <Label htmlFor="refresh-interval" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="h-5 w-5 text-pink-600" />
                Auto-refresh:
              </Label>
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                <SelectTrigger className="w-24 h-10 border-2 border-pink-200 focus:border-pink-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 sec</SelectItem>
                  <SelectItem value="10">10 sec</SelectItem>
                  <SelectItem value="30">30 sec</SelectItem>
                  <SelectItem value="60">1 min</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`h-10 px-6 ${autoRefresh 
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white' 
                  : 'border-2 border-pink-400 text-pink-600 hover:bg-pink-50'
                } shadow-lg transition-all duration-300`}
              >
                {autoRefresh ? 'Stop' : 'Start'}
              </Button>
            </div>

            {/* Manual Refresh Button */}
            <Button 
              onClick={() => { fetchServerStats(); fetchProcesses(); fetchSlowQueries(); }} 
              className="h-10 px-6 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Now
            </Button>
          </div>

          {/* Info Message */}
          {autoRefresh && (
            <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg flex items-start gap-3">
              <Activity className="h-5 w-5 text-pink-600 mt-0.5 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-pink-900">
                  Auto-refresh is <span className="font-bold">ON</span> (Every {refreshInterval} seconds)
                </p>
                <p className="text-xs text-pink-700 mt-1">
                  Performance metrics will update automatically
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Server Statistics */}
      {serverStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    CPU
                  </span>
                  <span>{serverStats.cpuUsage}%</span>
                </div>
                <Progress value={serverStats.cpuUsage} className="h-2 mt-1" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    Memory
                  </span>
                  <span>{serverStats.memoryUsage}%</span>
                </div>
                <Progress value={serverStats.memoryUsage} className="h-2 mt-1" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Disk
                  </span>
                  <span>{serverStats.diskUsage}%</span>
                </div>
                <Progress value={serverStats.diskUsage} className="h-2 mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStats.connections}</div>
              <p className="text-xs text-muted-foreground">
                of {serverStats.maxConnections} max
              </p>
              <Progress 
                value={(serverStats.connections / serverStats.maxConnections) * 100} 
                className="h-2 mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStats.queries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {serverStats.slowQueries} slow queries
              </p>
              {serverStats.slowQueries > 0 && (
                <Badge variant="outline" className="text-xs mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs attention
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{serverStats.uptime}</div>
              <p className="text-xs text-muted-foreground">
                {serverStats.threads} active threads
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for detailed monitoring */}
      <Tabs defaultValue="processes" className="w-full">
        <TabsList>
          <TabsTrigger value="processes">Active Processes</TabsTrigger>
          <TabsTrigger value="slow-queries">Slow Queries</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="processes">
          <Card>
            <CardHeader>
              <CardTitle>Active Processes</CardTitle>
              <CardDescription>Currently running database processes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">ID</th>
                        <th className="text-left p-2 font-medium">User</th>
                        <th className="text-left p-2 font-medium">Host</th>
                        <th className="text-left p-2 font-medium">Database</th>
                        <th className="text-left p-2 font-medium">Command</th>
                        <th className="text-left p-2 font-medium">Time</th>
                        <th className="text-left p-2 font-medium">State</th>
                        <th className="text-left p-2 font-medium">Query</th>
                        <th className="text-left p-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processes.map((process) => (
                        <tr key={process.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono">{process.id}</td>
                          <td className="p-2">{process.user}</td>
                          <td className="p-2 text-sm">{process.host}</td>
                          <td className="p-2">{process.database || '-'}</td>
                          <td className="p-2">
                            <Badge variant={process.command === 'Query' ? 'default' : 'secondary'}>
                              {process.command}
                            </Badge>
                          </td>
                          <td className="p-2">{process.time}s</td>
                          <td className="p-2 text-sm">{process.state || '-'}</td>
                          <td className="p-2">
                            <div className="max-w-64 truncate text-sm font-mono">
                              {process.info || '-'}
                            </div>
                          </td>
                          <td className="p-2">
                            {process.command !== 'Sleep' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => killProcess(process.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                Kill
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="slow-queries">
          <Card>
            <CardHeader>
              <CardTitle>Slow Query Log</CardTitle>
              <CardDescription>Queries that took longer than expected to execute</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {slowQueries.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">No slow queries detected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your database is performing well! Slow queries will appear here when detected.
                  </p>
                </div>
              ) : (
                slowQueries.map((query, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {query.database}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {query.timestamp}
                      </div>
                    </div>
                    
                    <div className="font-mono text-sm bg-muted p-2 rounded mb-3">
                      {query.query}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Execution Time:</span>
                        <div className="font-medium text-red-600">{query.executionTime}s</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lock Time:</span>
                        <div className="font-medium">{query.lockTime}s</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rows Sent:</span>
                        <div className="font-medium">{query.rowsSent.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rows Examined:</span>
                        <div className="font-medium">{query.rowsExamined.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="optimization">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Optimization</CardTitle>
                <CardDescription>Optimize database performance and storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={optimizeDatabase} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize All Tables
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Tables
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Repair Tables
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
                <CardDescription>Suggestions to improve database performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">High memory usage detected</p>
                    <p className="text-muted-foreground">Consider increasing innodb_buffer_pool_size</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Slow queries found</p>
                    <p className="text-muted-foreground">Add indexes to frequently queried columns</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Connection usage is optimal</p>
                    <p className="text-muted-foreground">Current connection count is within healthy limits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoringSection;
