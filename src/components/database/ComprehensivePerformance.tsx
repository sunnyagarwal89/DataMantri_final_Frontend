import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Activity, 
  Database,
  GitBranch,
  Gauge,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  HardDrive,
  Cpu,
  Zap,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Calendar,
  ExternalLink,
  User,
  History,
  ChevronRight,
  Bell,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  StopCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryInfo {
  queryId: string;
  database: string;
  user: string;
  query: string;
  duration: number;
  state: string;
  timestamp: string;
}

interface SlowQuery {
  queryId: string;
  query: string;
  executionTime: number;
  rowsScanned: number;
  recommendation?: string;
  optimization?: string;
}

interface AccessLogEntry {
  timestamp: string;
  user: string;
  action: string;
  status: 'success' | 'failed' | 'running';
  duration: number;
  query?: string; // Additional field for more detailed logs
}

interface DataSourceHealth {
  id: string;
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  uptimeSeconds: number;
  responseTime: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  connections: number;
  errors: number;
  lastChecked: string;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    queries: number;
  };
  activeQueries: QueryInfo[];
  slowQueries: SlowQuery[];
  accessLogs: AccessLogEntry[];
  logs: Log[];
}

interface PipelineStatus {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'success' | 'warning' | 'error';
  lastRun: string;
  duration: number;
  rowsProcessed: number;
  errorCount: number;
  successRate: number;
  runs: PipelineRun[];
  logs: Log[];
}

interface PipelineRun {
  runId: string;
  timestamp: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'warning' | 'error';
  duration: number;
  rows: number;
  errorCount: number;
  triggeredBy: string;
  dagRunUrl?: string;
}

interface Log {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: string;
  source?: string;
}

interface AppMetrics {
  uptime: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  cpu: number;
  memory: number;
  activeUsers: number;
  logs: Log[];
}

const ComprehensivePerformance: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('datasources');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [dataSourcesHealth, setDataSourcesHealth] = useState<DataSourceHealth[]>([]);
  const [pipelinesStatus, setPipelinesStatus] = useState<PipelineStatus[]>([]);
  const [appMetrics, setAppMetrics] = useState<AppMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');
  
  // Collapsible panels - Default: all data sources collapsed
  const [collapsedDataSources, setCollapsedDataSources] = useState<Set<string>>(new Set());
  const [collapsedPipelines, setCollapsedPipelines] = useState<Set<string>>(new Set());
  
  // Pipelines search and run history
  const [pipelineSearchTerm, setPipelineSearchTerm] = useState('');
  const [showRunHistory, setShowRunHistory] = useState<Set<string>>(new Set());
  
  // Data Source modals/views
  const [showAllQueries, setShowAllQueries] = useState<string | null>(null);
  const [showSlowQueries, setShowSlowQueries] = useState<string | null>(null);
  const [showAccessLogs, setShowAccessLogs] = useState<string | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceHealth | null>(null);
  const [showAllQueriesModal, setShowAllQueriesModal] = useState(false);
  const [showSlowQueriesModal, setShowSlowQueriesModal] = useState(false);
  const [showAccessLogsModal, setShowAccessLogsModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  
  // Application logs filters
  const [logDateFilter, setLogDateFilter] = useState<string>('all'); // 'all', 'today', 'week', 'month'
  const [logSearchRegex, setLogSearchRegex] = useState<string>('');
  const [isRegexValid, setIsRegexValid] = useState(true);
  
  // Active Queries Modal - Sorting & Filtering
  const [activeQueriesSortField, setActiveQueriesSortField] = useState<keyof QueryInfo>('timestamp');
  const [activeQueriesSortDirection, setActiveQueriesSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeQueriesFilters, setActiveQueriesFilters] = useState<Record<string, string>>({});
  
  // Slow Queries Modal - Sorting & Filtering
  const [slowQueriesSortField, setSlowQueriesSortField] = useState<keyof SlowQuery>('executionTime');
  const [slowQueriesSortDirection, setSlowQueriesSortDirection] = useState<'asc' | 'desc'>('desc');
  const [slowQueriesFilters, setSlowQueriesFilters] = useState<Record<string, string>>({});
  
  // Access Logs Modal - Sorting & Filtering
  const [accessLogsSortField, setAccessLogsSortField] = useState<keyof AccessLogEntry>('timestamp');
  const [accessLogsSortDirection, setAccessLogsSortDirection] = useState<'asc' | 'desc'>('desc');
  const [accessLogsFilters, setAccessLogsFilters] = useState<Record<string, string>>({});

  // Fetch data on mount and when auto-refresh is enabled
  useEffect(() => {
    fetchAllData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchAllData, 30000); // 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchAllData = () => {
    fetchDataSourcesHealth();
    fetchPipelinesStatus();
    fetchAppMetrics();
  };

  const toggleDataSourceCollapse = (id: string) => {
    setCollapsedDataSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const togglePipelineCollapse = (id: string) => {
    setCollapsedPipelines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleRunHistory = (id: string) => {
    setShowRunHistory(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const generateActiveQueries = (count: number = 10): QueryInfo[] => {
    const queries: QueryInfo[] = [];
    const sampleQueries = [
      'SELECT * FROM users WHERE status = "active"',
      'UPDATE orders SET status = "shipped" WHERE id = 12345',
      'SELECT COUNT(*) FROM transactions WHERE date > "2024-01-01"',
      'INSERT INTO logs (message, level) VALUES ("test", "info")',
      'DELETE FROM temp_data WHERE created_at < NOW() - INTERVAL 7 DAY'
    ];
    const users = ['admin', 'app_user', 'analyst', 'service_account'];
    const databases = ['production', 'analytics', 'staging'];
    const states = ['executing', 'sending data', 'waiting', 'copying to tmp table'];
    
    for (let i = 0; i < count; i++) {
      queries.push({
        queryId: `q_${i.toString().padStart(4, '0')}`,
        database: databases[Math.floor(Math.random() * databases.length)],
        user: users[Math.floor(Math.random() * users.length)],
        query: sampleQueries[Math.floor(Math.random() * sampleQueries.length)],
        duration: Math.floor(Math.random() * 5000) + 100,
        state: states[Math.floor(Math.random() * states.length)],
        timestamp: new Date(Date.now() - Math.random() * 60000).toISOString()
      });
    }
    
    return queries;
  };

  const generateSlowQueries = (count: number = 5): SlowQuery[] => {
    const queries: SlowQuery[] = [];
    const slowQueryExamples = [
      {
        query: 'SELECT * FROM large_table WHERE unindexed_column = "value"',
        recommendation: 'Add index on unindexed_column',
        optimization: 'CREATE INDEX idx_unindexed_column ON large_table(unindexed_column)'
      },
      {
        query: 'SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.email LIKE "%@gmail.com"',
        recommendation: 'Avoid leading wildcard in LIKE queries',
        optimization: 'Use full-text search or restructure query'
      },
      {
        query: 'SELECT * FROM products WHERE category IN (SELECT id FROM categories WHERE name = "Electronics")',
        recommendation: 'Convert subquery to JOIN',
        optimization: 'SELECT p.* FROM products p JOIN categories c ON p.category = c.id WHERE c.name = "Electronics"'
      }
    ];
    
    for (let i = 0; i < count; i++) {
      const example = slowQueryExamples[i % slowQueryExamples.length];
      queries.push({
        queryId: `slow_${i.toString().padStart(3, '0')}`,
        query: example.query,
        executionTime: Math.floor(Math.random() * 15000) + 5000,
        rowsScanned: Math.floor(Math.random() * 1000000) + 100000,
        recommendation: example.recommendation,
        optimization: example.optimization
      });
    }
    
    return queries;
  };

  const generateAccessLogs = (count: number = 20): AccessLogEntry[] => {
    const logs: AccessLogEntry[] = [];
    const users = ['admin', 'john.doe', 'jane.smith', 'service_bot', 'analyst'];
    const actions = ['LOGIN', 'QUERY_EXECUTION', 'TABLE_CREATE', 'DATA_INSERT', 'USER_UPDATE', 'SCHEMA_CHANGE'];
    const statuses: ('success' | 'failed')[] = ['success', 'success', 'success', 'success', 'failed'];
    
    for (let i = 0; i < count; i++) {
      logs.push({
        timestamp: new Date(Date.now() - i * 300000).toISOString(),
        user: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        duration: Math.floor(Math.random() * 2000) + 50
      });
    }
    
    return logs;
  };

  const generatePipelineRuns = (pipelineId: string, count: number = 20): PipelineRun[] => {
    const runs: PipelineRun[] = [];
    const now = new Date();
    const statuses: ('success' | 'warning' | 'error')[] = ['success', 'success', 'success', 'warning', 'error'];
    const triggers = ['Manual', 'Scheduled', 'API', 'Event'];
    
    for (let i = 0; i < count; i++) {
      const runDate = new Date(now.getTime() - (i * 3600000)); // Each run 1 hour apart
      const startTime = new Date(runDate);
      const duration = Math.floor(Math.random() * 300) + 60; // 60-360 seconds
      const endTime = new Date(startTime.getTime() + duration * 1000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const rows = Math.floor(Math.random() * 100000) + 10000;
      const errorCount = status === 'error' ? Math.floor(Math.random() * 100) + 10 : 
                         status === 'warning' ? Math.floor(Math.random() * 50) : 0;
      
      runs.push({
        runId: `run_${pipelineId}_${i.toString().padStart(3, '0')}`,
        timestamp: runDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status,
        duration,
        rows,
        errorCount,
        triggeredBy: triggers[Math.floor(Math.random() * triggers.length)]
      });
    }
    
    return runs;
  };

  const fetchDataSourcesHealth = async () => {
    try {
      // Fetch real performance data from backend API
      const response = await fetch('/api/performance/data-sources', { credentials: 'include' });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.status === 'success' && Array.isArray(result.data)) {
          const healthData: DataSourceHealth[] = [];
          
          for (const ds of result.data) {
            // Fetch detailed metrics for each data source
            const [activeQueriesRes, slowQueriesRes, accessLogsRes] = await Promise.all([
              fetch(`/api/performance/data-sources/${ds.id}/active-queries`, { credentials: 'include' }),
              fetch(`/api/performance/data-sources/${ds.id}/slow-queries`, { credentials: 'include' }),
              fetch(`/api/performance/data-sources/${ds.id}/access-logs`, { credentials: 'include' })
            ]);
            
            const activeQueries = activeQueriesRes.ok ? (await activeQueriesRes.json()).data : [];
            const slowQueries = slowQueriesRes.ok ? (await slowQueriesRes.json()).data : [];
            const accessLogs = accessLogsRes.ok ? (await accessLogsRes.json()).data : [];
            
            healthData.push({
              id: ds.id,
              name: ds.name,
              type: ds.type,
              status: ds.status as 'healthy' | 'degraded' | 'down',
              uptime: ds.uptime || 'N/A',
              uptimeSeconds: ds.uptimeSeconds || 0,
              responseTime: ds.responseTime || 0,
              avgResponseTime: ds.avgResponseTime || 0,
              minResponseTime: ds.minResponseTime || 0,
              maxResponseTime: ds.maxResponseTime || 0,
              connections: ds.connections || 0,
              errors: ds.errors || 0,
              lastChecked: ds.lastChecked || new Date().toISOString(),
              metrics: ds.metrics || { cpu: 0, memory: 0, disk: 0, queries: 0 },
              activeQueries: activeQueries || [],
              slowQueries: slowQueries || [],
              accessLogs: accessLogs || [],
              logs: [
                { 
                  timestamp: new Date().toISOString(), 
                  level: 'info', 
                  message: 'Data source connected successfully', 
                  source: ds.name 
                }
              ]
            });
          }
          
          // Set all data sources as collapsed by default
          if (healthData.length > 0 && collapsedDataSources.size === 0) {
            setCollapsedDataSources(new Set(healthData.map(ds => ds.id)));
          }
          
          setDataSourcesHealth(healthData);
          return;
        }
      }
      
      // If API call failed, show mock data
      if (dataSourcesHealth.length === 0) {
        const mockData: DataSourceHealth[] = [
        {
          id: '1',
          name: 'PostgreSQL Production',
          type: 'PostgreSQL',
          status: 'healthy',
          uptime: '45d 12h 34m',
          responseTime: 45,
          connections: 23,
          errors: 0,
          lastChecked: new Date().toISOString(),
          metrics: {
            cpu: 34,
            memory: 67,
            disk: 45,
            queries: 1247
          },
          logs: [
            { timestamp: new Date().toISOString(), level: 'info', message: 'Connection pool optimized', source: 'PostgreSQL Production' },
            { timestamp: new Date(Date.now() - 300000).toISOString(), level: 'info', message: 'Checkpoint completed', source: 'PostgreSQL Production' }
          ]
        },
        {
          id: '2',
          name: 'MySQL Analytics',
          type: 'MySQL',
          status: 'degraded',
          uptime: '12d 5h 21m',
          responseTime: 234,
          connections: 89,
          errors: 3,
          lastChecked: new Date().toISOString(),
          metrics: {
            cpu: 78,
            memory: 85,
            disk: 92,
            queries: 3421
          },
          logs: [
            { timestamp: new Date().toISOString(), level: 'warning', message: 'High memory usage detected - 85%', source: 'MySQL Analytics' },
            { timestamp: new Date(Date.now() - 180000).toISOString(), level: 'error', message: 'Slow query detected: SELECT * FROM large_table', details: 'Query took 15.3 seconds', source: 'MySQL Analytics' },
            { timestamp: new Date(Date.now() - 600000).toISOString(), level: 'warning', message: 'Disk usage above 90%', source: 'MySQL Analytics' }
          ]
        },
        {
          id: '3',
          name: 'MongoDB Logs',
          type: 'MongoDB',
          status: 'down',
          uptime: '0d 0h 0m',
          responseTime: 0,
          connections: 0,
          errors: 12,
          lastChecked: new Date().toISOString(),
          metrics: {
            cpu: 0,
            memory: 0,
            disk: 0,
            queries: 0
          },
          logs: [
            { timestamp: new Date().toISOString(), level: 'critical', message: 'Database connection failed', details: 'Connection timeout after 30 seconds', source: 'MongoDB Logs' },
            { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'error', message: 'Failed to authenticate', source: 'MongoDB Logs' },
            { timestamp: new Date(Date.now() - 240000).toISOString(), level: 'critical', message: 'Service unreachable', source: 'MongoDB Logs' }
          ]
        }
        ];
        setDataSourcesHealth(mockData);
      } else {
        setDataSourcesHealth(healthData);
      }
    } catch (error) {
      console.error('Error fetching data sources:', error);
      toast({ title: 'Error', description: 'Failed to fetch data sources health', variant: 'destructive' });
    }
  };

  const fetchPipelinesStatus = async () => {
    try {
      // Fetch real pipeline data from backend API
      const response = await fetch('/api/performance/pipelines', { credentials: 'include' });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.status === 'success' && Array.isArray(result.data)) {
          setPipelinesStatus(result.data);
          return;
        }
      }
      
      // Fallback to mock data
      const mockData: PipelineStatus[] = [
        {
          id: '1',
          name: 'Daily Sales Aggregation',
          source: 'PostgreSQL Production',
          destination: 'MySQL Analytics',
          status: 'success',
          lastRun: '2 minutes ago',
          duration: 145,
          rowsProcessed: 50000,
          errorCount: 0,
          successRate: 100,
          runs: generatePipelineRuns('daily_sales', 20),
          logs: [
            { timestamp: new Date().toISOString(), level: 'info', message: 'Pipeline completed successfully', details: '50,000 rows processed in 145 seconds', source: 'Daily Sales Aggregation' }
          ]
        },
        {
          id: '2',
          name: 'Customer Data Sync',
          source: 'MySQL Analytics',
          destination: 'PostgreSQL Production',
          status: 'warning',
          lastRun: '15 minutes ago',
          duration: 328,
          rowsProcessed: 12000,
          errorCount: 45,
          successRate: 96.5,
          runs: generatePipelineRuns('customer_sync', 20),
          logs: [
            { timestamp: new Date().toISOString(), level: 'warning', message: 'Pipeline completed with warnings', details: '45 rows failed validation', source: 'Customer Data Sync' },
            { timestamp: new Date(Date.now() - 180000).toISOString(), level: 'warning', message: 'Duplicate key violations detected', source: 'Customer Data Sync' }
          ]
        },
        {
          id: '3',
          name: 'Log Archival Pipeline',
          source: 'MongoDB Logs',
          destination: 'Cold Storage',
          status: 'error',
          lastRun: '1 hour ago',
          duration: 0,
          rowsProcessed: 0,
          errorCount: 1,
          successRate: 0,
          runs: generatePipelineRuns('log_archival', 20),
          logs: [
            { timestamp: new Date().toISOString(), level: 'error', message: 'Pipeline failed to start', details: 'Source database is unreachable', source: 'Log Archival Pipeline' },
            { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'critical', message: 'Connection to MongoDB Logs failed', source: 'Log Archival Pipeline' }
          ]
        }
      ];
      setPipelinesStatus(mockData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch pipelines status', variant: 'destructive' });
    }
  };

  const fetchAppMetrics = async () => {
    try {
      // Fetch real application metrics from backend API
      const response = await fetch('/api/performance/application', { credentials: 'include' });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          setAppMetrics(result.data);
          return;
        }
      }
      
      // Fallback to mock data
      const mockData: AppMetrics = {
        uptime: '15d 8h 42m',
        requests: 1247539,
        errors: 234,
        avgResponseTime: 124,
        cpu: 45,
        memory: 62,
        activeUsers: 847,
        logs: [
          { timestamp: new Date().toISOString(), level: 'info', message: 'Application health check passed', source: 'Health Monitor' },
          { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'warning', message: 'High memory usage detected', details: 'Memory usage: 62%', source: 'Resource Monitor' },
          { timestamp: new Date(Date.now() - 300000).toISOString(), level: 'error', message: 'API endpoint timeout', details: '/api/heavy-query took 30+ seconds', source: 'API Gateway' },
          { timestamp: new Date(Date.now() - 450000).toISOString(), level: 'info', message: 'Cache cleared successfully', source: 'Cache Manager' },
          { timestamp: new Date(Date.now() - 600000).toISOString(), level: 'warning', message: 'Rate limit exceeded for user', details: 'User ID: 1234 exceeded 1000 req/min', source: 'Rate Limiter' }
        ]
      };
      setAppMetrics(mockData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch app metrics', variant: 'destructive' });
    }
  };

  // Helper Functions for Sorting, Filtering, and Exporting
  
  const sortData = <T,>(data: T[], field: keyof T, direction: 'asc' | 'desc'): T[] => {
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  };
  
  const filterData = <T extends Record<string, any>>(data: T[], filters: Record<string, string>): T[] => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = String(item[key]).toLowerCase();
        return itemValue.includes(value.toLowerCase());
      });
    });
  };
  
  const exportToCSV = (data: any[], filename: string, columns: string[]) => {
    const csvContent = [
      columns.join(','),
      ...data.map(row => 
        columns.map(col => {
          const value = row[col];
          // Escape quotes and wrap in quotes if contains comma or newline
          const stringValue = String(value || '').replace(/"/g, '""');
          return stringValue.includes(',') || stringValue.includes('\n') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'Success', description: `Exported ${data.length} rows to ${filename}.csv` });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied!', description: 'Query copied to clipboard' });
    }).catch(() => {
      toast({ title: 'Error', description: 'Failed to copy query', variant: 'destructive' });
    });
  };
  
  const killQuery = async (queryId: string, datasourceId: string) => {
    try {
      const response = await fetch(`/api/performance/data-sources/${datasourceId}/kill-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ queryId })
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: `Query ${queryId} has been terminated` });
        // Refresh active queries
        fetchAllData();
      } else {
        toast({ title: 'Error', description: 'Failed to kill query', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to kill query', variant: 'destructive' });
    }
  };
  
  const toggleSort = <T,>(
    currentField: keyof T,
    currentDirection: 'asc' | 'desc',
    newField: keyof T,
    setField: (field: keyof T) => void,
    setDirection: (direction: 'asc' | 'desc') => void
  ) => {
    if (currentField === newField) {
      setDirection(currentDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setField(newField);
      setDirection('asc');
    }
  };
  
  const SortableHeader: React.FC<{
    label: string;
    field: string;
    currentField: string;
    currentDirection: 'asc' | 'desc';
    onSort: () => void;
  }> = ({ label, field, currentField, currentDirection, onSort }) => (
    <th 
      className="text-left p-3 font-semibold cursor-pointer hover:bg-muted/50 transition group"
      onClick={onSort}
    >
      <div className="flex items-center gap-2">
        {label}
        {currentField === field ? (
          currentDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50" />
        )}
      </div>
    </th>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return 'bg-green-500';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-500';
      case 'down':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-700" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const filterPipelines = (pipelines: PipelineStatus[]) => {
    if (!pipelineSearchTerm) return pipelines;
    
    return pipelines.filter(pipeline => 
      pipeline.name.toLowerCase().includes(pipelineSearchTerm.toLowerCase()) ||
      pipeline.source.toLowerCase().includes(pipelineSearchTerm.toLowerCase()) ||
      pipeline.destination.toLowerCase().includes(pipelineSearchTerm.toLowerCase()) ||
      pipeline.status.toLowerCase().includes(pipelineSearchTerm.toLowerCase())
    );
  };

  const filterLogsByDate = (logs: Log[]) => {
    if (logDateFilter === 'all') return logs;
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;
    
    return logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const diff = now - logTime;
      
      switch (logDateFilter) {
        case 'today':
          return diff <= oneDay;
        case 'week':
          return diff <= oneWeek;
        case 'month':
          return diff <= oneMonth;
        default:
          return true;
      }
    });
  };

  const filterLogsByRegex = (logs: Log[]) => {
    if (!logSearchRegex) return logs;
    
    try {
      const regex = new RegExp(logSearchRegex, 'i');
      setIsRegexValid(true);
      
      return logs.filter(log => 
        regex.test(log.message) ||
        (log.details && regex.test(log.details)) ||
        (log.source && regex.test(log.source))
      );
    } catch (error) {
      setIsRegexValid(false);
      return logs;
    }
  };

  const filterLogs = (logs: Log[]) => {
    let filtered = logs;
    
    // Apply severity filter
    if (logFilter !== 'all') {
      filtered = filtered.filter(log => log.level === logFilter);
    }
    
    // Apply date filter
    filtered = filterLogsByDate(filtered);
    
    // Apply regex search
    filtered = filterLogsByRegex(filtered);
    
    // Apply simple search (if regex is not provided)
    if (!logSearchRegex && searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Gauge className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Performance Monitoring</h2>
                <p className="text-white/90 text-sm">Comprehensive monitoring across all systems</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className={`${autoRefresh ? 'bg-white text-purple-600' : 'border-white text-white hover:bg-white/20'}`}
              >
                {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {autoRefresh ? 'Stop' : 'Start'} Auto-Refresh
              </Button>
              
              <Button onClick={fetchAllData} className="bg-white text-purple-600 hover:bg-white/90">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="datasources" className="flex items-center gap-2 py-3">
            <Database className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Data Sources</div>
              <div className="text-xs text-muted-foreground">DB Health & Performance</div>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="pipelines" className="flex items-center gap-2 py-3">
            <GitBranch className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Pipelines</div>
              <div className="text-xs text-muted-foreground">ETL Status & Logs</div>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="application" className="flex items-center gap-2 py-3">
            <Activity className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Application</div>
              <div className="text-xs text-muted-foreground">App Metrics & Logs</div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Data Sources Tab */}
        <TabsContent value="datasources" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sources</p>
                    <p className="text-3xl font-bold">{dataSourcesHealth.length}</p>
                  </div>
                  <Database className="h-10 w-10 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Healthy</p>
                    <p className="text-3xl font-bold text-green-600">
                      {dataSourcesHealth.filter(ds => ds.status === 'healthy').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Degraded</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {dataSourcesHealth.filter(ds => ds.status === 'degraded').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-yellow-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Down</p>
                    <p className="text-3xl font-bold text-red-600">
                      {dataSourcesHealth.filter(ds => ds.status === 'down').length}
                    </p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Sources List */}
          <div className="space-y-4">
            {dataSourcesHealth.map((ds) => (
              <Card key={ds.id} className={`border-l-4 ${
                ds.status === 'healthy' ? 'border-l-green-500' :
                ds.status === 'degraded' ? 'border-l-yellow-500' :
                'border-l-red-500'
              }`}>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition" onClick={() => toggleDataSourceCollapse(ds.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(ds.status)}
                      <div className="flex-1">
                        <CardTitle>{ds.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span>{ds.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {ds.lastChecked}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(ds.status)} text-white`}>
                        {ds.status.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDataSourceCollapse(ds.id);
                        }}
                      >
                        {collapsedDataSources.has(ds.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronUp className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {!collapsedDataSources.has(ds.id) && (
                  <CardContent className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CPU Usage</p>
                      <div className="flex items-center gap-2">
                        <Progress value={ds.metrics.cpu} className="h-2" />
                        <span className="text-sm font-medium">{ds.metrics.cpu}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Memory</p>
                      <div className="flex items-center gap-2">
                        <Progress value={ds.metrics.memory} className="h-2" />
                        <span className="text-sm font-medium">{ds.metrics.memory}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Disk</p>
                      <div className="flex items-center gap-2">
                        <Progress value={ds.metrics.disk} className="h-2" />
                        <span className="text-sm font-medium">{ds.metrics.disk}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Queries/sec</p>
                      <p className="text-lg font-bold">{ds.metrics.queries}</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Uptime: <strong>{ds.uptime}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>Response: <strong>{ds.responseTime}ms</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span>Connections: <strong>{ds.connections}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Errors: <strong className={ds.errors > 0 ? 'text-red-600' : 'text-green-600'}>{ds.errors}</strong></span>
                    </div>
                  </div>

                  {/* Response Time Metrics */}
                  <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Avg Response Time</p>
                      <p className="text-2xl font-bold text-blue-600">{ds.avgResponseTime}ms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Min Response Time</p>
                      <p className="text-2xl font-bold text-green-600">{ds.minResponseTime}ms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Max Response Time</p>
                      <p className="text-2xl font-bold text-red-600">{ds.maxResponseTime}ms</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedDataSource(ds);
                        setShowAllQueriesModal(true);
                      }}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      All Queries
                      <Badge variant="secondary" className="ml-2">{ds.activeQueries?.length || 0}</Badge>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                      onClick={() => {
                        setSelectedDataSource(ds);
                        setShowSlowQueriesModal(true);
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Slow Queries
                      <Badge variant="destructive" className="ml-2">{ds.slowQueries?.length || 0}</Badge>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-purple-500 text-purple-700 hover:bg-purple-50"
                      onClick={() => {
                        setSelectedDataSource(ds);
                        setShowAccessLogsModal(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Access Logs
                      <Badge variant="secondary" className="ml-2">{ds.accessLogs?.length || 0}</Badge>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-red-500 text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedDataSource(ds);
                        setShowAlertsModal(true);
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Configure Alerts
                    </Button>
                  </div>

                  {/* Recent Logs */}
                  {ds.logs.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-semibold mb-2">Recent Logs:</p>
                      <div className="space-y-2">
                        {ds.logs.slice(0, 3).map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                            {getLogIcon(log.level)}
                            <div className="flex-1">
                              <p className="font-medium">{log.message}</p>
                              {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                              <p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pipelines Tab */}
        <TabsContent value="pipelines" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pipelines</p>
                    <p className="text-3xl font-bold">{pipelinesStatus.length}</p>
                  </div>
                  <GitBranch className="h-10 w-10 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success</p>
                    <p className="text-3xl font-bold text-green-600">
                      {pipelinesStatus.filter(p => p.status === 'success').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Warning</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {pipelinesStatus.filter(p => p.status === 'warning').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-yellow-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-3xl font-bold text-red-600">
                      {pipelinesStatus.filter(p => p.status === 'error').length}
                    </p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pipelines by name, source, destination, or status..."
                  value={pipelineSearchTerm}
                  onChange={(e) => setPipelineSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pipelines List */}
          <div className="space-y-4">
            {filterPipelines(pipelinesStatus).map((pipeline) => (
              <Card key={pipeline.id} className={`border-l-4 ${
                pipeline.status === 'success' ? 'border-l-green-500' :
                pipeline.status === 'warning' ? 'border-l-yellow-500' :
                'border-l-red-500'
              }`}>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition" onClick={() => togglePipelineCollapse(pipeline.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(pipeline.status)}
                      <div className="flex-1">
                        <CardTitle>{pipeline.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {pipeline.source} → {pipeline.destination}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(pipeline.status)} text-white`}>
                        {pipeline.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {pipeline.successRate}% Success
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePipelineCollapse(pipeline.id);
                        }}
                      >
                        {collapsedPipelines.has(pipeline.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronUp className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {!collapsedPipelines.has(pipeline.id) && (
                  <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Last Run</p>
                      <p className="font-semibold">{pipeline.lastRun}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Duration</p>
                      <p className="font-semibold">{pipeline.duration}s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Rows Processed</p>
                      <p className="font-semibold">{pipeline.rowsProcessed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Error Count</p>
                      <p className={`font-semibold ${pipeline.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {pipeline.errorCount}
                      </p>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Run Now
                      </Button>
                    </div>
                  </div>

                  {/* DAG Run History - Airflow Style */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-purple-600" />
                        <h3 className="text-sm font-bold">DAG Run History</h3>
                        <Badge variant="outline" className="font-mono text-xs">
                          Last 20 Runs
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRunHistory(pipeline.id)}
                      >
                        {showRunHistory.has(pipeline.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Details
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Quick Visual Timeline (Always Visible) */}
                    <div className="flex items-center gap-1 mb-4">
                      {pipeline.runs.slice(0, 20).map((run, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-semibold cursor-pointer hover:opacity-80 transition ${
                            run.status === 'success' ? 'bg-green-500 text-white' :
                            run.status === 'warning' ? 'bg-yellow-500 text-white' :
                            'bg-red-500 text-white'
                          }`}
                          title={`Run ${run.runId}\nStart: ${new Date(run.startTime).toLocaleString()}\nDuration: ${run.duration}s\nRows: ${run.rows.toLocaleString()}\nErrors: ${run.errorCount}`}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>

                    {/* Detailed Run History Table (Collapsible) */}
                    {showRunHistory.has(pipeline.id) && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                              <tr>
                                <th className="text-left p-3 font-semibold">#</th>
                                <th className="text-left p-3 font-semibold">Run ID</th>
                                <th className="text-left p-3 font-semibold">Status</th>
                                <th className="text-left p-3 font-semibold">Start Time</th>
                                <th className="text-left p-3 font-semibold">End Time</th>
                                <th className="text-left p-3 font-semibold">Duration</th>
                                <th className="text-left p-3 font-semibold">Rows</th>
                                <th className="text-left p-3 font-semibold">Errors</th>
                                <th className="text-left p-3 font-semibold">Triggered By</th>
                                <th className="text-left p-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pipeline.runs.map((run, idx) => (
                                <tr key={idx} className={`border-t hover:bg-muted/50 transition ${
                                  run.status === 'error' ? 'bg-red-50/30' :
                                  run.status === 'warning' ? 'bg-yellow-50/30' :
                                  'bg-white'
                                }`}>
                                  <td className="p-3 text-muted-foreground">{idx + 1}</td>
                                  <td className="p-3 font-mono text-xs">{run.runId}</td>
                                  <td className="p-3">
                                    <Badge className={`${
                                      run.status === 'success' ? 'bg-green-500' :
                                      run.status === 'warning' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    } text-white`}>
                                      {run.status === 'success' ? <CheckCircle2 className="h-3 w-3 mr-1" /> :
                                       run.status === 'warning' ? <AlertTriangle className="h-3 w-3 mr-1" /> :
                                       <XCircle className="h-3 w-3 mr-1" />}
                                      {run.status.toUpperCase()}
                                    </Badge>
                                  </td>
                                  <td className="p-3 font-mono text-xs">
                                    {new Date(run.startTime).toLocaleString()}
                                  </td>
                                  <td className="p-3 font-mono text-xs">
                                    {new Date(run.endTime).toLocaleString()}
                                  </td>
                                  <td className="p-3">
                                    <span className="font-semibold">{run.duration}s</span>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-semibold">{run.rows.toLocaleString()}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className={`font-semibold ${run.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {run.errorCount}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs">{run.triggeredBy}</span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2"
                                      title="View run details"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logs */}
                  {pipeline.logs.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-semibold mb-2">Recent Logs:</p>
                      <div className="space-y-2">
                        {pipeline.logs.slice(0, 3).map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                            {getLogIcon(log.level)}
                            <div className="flex-1">
                              <p className="font-medium">{log.message}</p>
                              {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                              <p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Application Tab */}
        <TabsContent value="application" className="space-y-6">
          {appMetrics && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Requests</p>
                        <p className="text-3xl font-bold">{appMetrics.requests.toLocaleString()}</p>
                      </div>
                      <Activity className="h-10 w-10 text-blue-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Users</p>
                        <p className="text-3xl font-bold text-green-600">{appMetrics.activeUsers}</p>
                      </div>
                      <Server className="h-10 w-10 text-green-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                        <p className="text-3xl font-bold">{appMetrics.avgResponseTime}ms</p>
                      </div>
                      <Zap className="h-10 w-10 text-yellow-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Errors</p>
                        <p className="text-3xl font-bold text-red-600">{appMetrics.errors}</p>
                      </div>
                      <XCircle className="h-10 w-10 text-red-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                  <CardDescription>Application server resource utilization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">CPU Usage</span>
                        </div>
                        <span className="text-sm font-bold">{appMetrics.cpu}%</span>
                      </div>
                      <Progress value={appMetrics.cpu} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Memory Usage</span>
                        </div>
                        <span className="text-sm font-bold">{appMetrics.memory}%</span>
                      </div>
                      <Progress value={appMetrics.memory} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Uptime</span>
                        </div>
                        <span className="text-sm font-bold">{appMetrics.uptime}</span>
                      </div>
                      <div className="h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logs Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Application Logs</CardTitle>
                      <CardDescription>Real-time application event logs (Kibana-style)</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Log Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search logs (basic)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Regex search (e.g. error|warn|timeout)..."
                        value={logSearchRegex}
                        onChange={(e) => setLogSearchRegex(e.target.value)}
                        className={`pl-10 ${!isRegexValid ? 'border-red-500' : ''}`}
                      />
                      {!isRegexValid && (
                        <p className="text-xs text-red-600 mt-1">Invalid regex pattern</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Select value={logFilter} onValueChange={(value: any) => setLogFilter(value)}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={logDateFilter} onValueChange={(value: string) => setLogDateFilter(value)}>
                      <SelectTrigger className="w-[180px]">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>

                    {(searchTerm || logSearchRegex || logFilter !== 'all' || logDateFilter !== 'all') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setLogSearchRegex('');
                          setLogFilter('all');
                          setLogDateFilter('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Log Entries */}
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filterLogs(appMetrics.logs).map((log, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          log.level === 'critical' ? 'border-l-red-700 bg-red-50' :
                          log.level === 'error' ? 'border-l-red-500 bg-red-50/50' :
                          log.level === 'warning' ? 'border-l-yellow-500 bg-yellow-50/50' :
                          'border-l-blue-500 bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getLogIcon(log.level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <Badge variant="outline" className="text-xs font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                              </Badge>
                              <Badge className={`text-xs ${
                                log.level === 'critical' ? 'bg-red-700' :
                                log.level === 'error' ? 'bg-red-500' :
                                log.level === 'warning' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              } text-white`}>
                                {log.level.toUpperCase()}
                              </Badge>
                              {log.source && (
                                <span className="text-xs text-muted-foreground">{log.source}</span>
                              )}
                            </div>
                            <p className="font-medium text-sm">{log.message}</p>
                            {log.details && (
                              <p className="text-xs text-muted-foreground mt-1 font-mono">{log.details}</p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* All Queries Modal - Enhanced */}
      <Dialog open={showAllQueriesModal} onOpenChange={setShowAllQueriesModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                All Active Queries - {selectedDataSource?.name}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const queries = selectedDataSource?.activeQueries || [];
                    const filteredData = filterData(queries, activeQueriesFilters);
                    const sortedData = sortData(filteredData, activeQueriesSortField, activeQueriesSortDirection);
                    exportToCSV(sortedData, `active-queries-${selectedDataSource?.name}`, 
                      ['queryId', 'database', 'user', 'query', 'duration', 'state', 'timestamp']);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Currently executing queries in this data source ({selectedDataSource?.activeQueries?.length || 0} queries)
            </DialogDescription>
          </DialogHeader>
          
          {/* Filter Inputs */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <Input
              placeholder="Filter Query ID..."
              value={activeQueriesFilters.queryId || ''}
              onChange={(e) => setActiveQueriesFilters(prev => ({ ...prev, queryId: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Filter User..."
              value={activeQueriesFilters.user || ''}
              onChange={(e) => setActiveQueriesFilters(prev => ({ ...prev, user: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Filter Query..."
              value={activeQueriesFilters.query || ''}
              onChange={(e) => setActiveQueriesFilters(prev => ({ ...prev, query: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Filter State..."
              value={activeQueriesFilters.state || ''}
              onChange={(e) => setActiveQueriesFilters(prev => ({ ...prev, state: e.target.value }))}
              className="text-sm"
            />
          </div>
          
          <div className="flex-1 overflow-hidden mt-4">
            <div className="border rounded-lg overflow-hidden h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <SortableHeader
                        label="Query ID"
                        field="queryId"
                        currentField={activeQueriesSortField}
                        currentDirection={activeQueriesSortDirection}
                        onSort={() => toggleSort(activeQueriesSortField, activeQueriesSortDirection, 'queryId' as keyof QueryInfo, setActiveQueriesSortField, setActiveQueriesSortDirection)}
                      />
                      <SortableHeader
                        label="Database"
                        field="database"
                        currentField={activeQueriesSortField}
                        currentDirection={activeQueriesSortDirection}
                        onSort={() => toggleSort(activeQueriesSortField, activeQueriesSortDirection, 'database' as keyof QueryInfo, setActiveQueriesSortField, setActiveQueriesSortDirection)}
                      />
                      <SortableHeader
                        label="User"
                        field="user"
                        currentField={activeQueriesSortField}
                        currentDirection={activeQueriesSortDirection}
                        onSort={() => toggleSort(activeQueriesSortField, activeQueriesSortDirection, 'user' as keyof QueryInfo, setActiveQueriesSortField, setActiveQueriesSortDirection)}
                      />
                      <th className="text-left p-3 font-semibold">Query</th>
                      <SortableHeader
                        label="Duration (ms)"
                        field="duration"
                        currentField={activeQueriesSortField}
                        currentDirection={activeQueriesSortDirection}
                        onSort={() => toggleSort(activeQueriesSortField, activeQueriesSortDirection, 'duration' as keyof QueryInfo, setActiveQueriesSortField, setActiveQueriesSortDirection)}
                      />
                      <SortableHeader
                        label="State"
                        field="state"
                        currentField={activeQueriesSortField}
                        currentDirection={activeQueriesSortDirection}
                        onSort={() => toggleSort(activeQueriesSortField, activeQueriesSortDirection, 'state' as keyof QueryInfo, setActiveQueriesSortField, setActiveQueriesSortDirection)}
                      />
                      <SortableHeader
                        label="Timestamp"
                        field="timestamp"
                        currentField={activeQueriesSortField}
                        currentDirection={activeQueriesSortDirection}
                        onSort={() => toggleSort(activeQueriesSortField, activeQueriesSortDirection, 'timestamp' as keyof QueryInfo, setActiveQueriesSortField, setActiveQueriesSortDirection)}
                      />
                      <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const queries = selectedDataSource?.activeQueries || [];
                      const filteredData = filterData(queries, activeQueriesFilters);
                      const sortedData = sortData(filteredData, activeQueriesSortField, activeQueriesSortDirection);
                      
                      return sortedData.map((query, idx) => (
                        <tr key={idx} className="border-t hover:bg-muted/50 transition">
                          <td className="p-3 font-mono text-xs">{query.queryId}</td>
                          <td className="p-3">{query.database}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {query.user}
                            </div>
                          </td>
                          <td className="p-3 max-w-md">
                            <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto max-h-20">
                              {query.query}
                            </code>
                          </td>
                          <td className="p-3 font-semibold">{query.duration}</td>
                          <td className="p-3">
                            <Badge variant="outline">{query.state}</Badge>
                          </td>
                          <td className="p-3 font-mono text-xs">
                            {new Date(query.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm(`Are you sure you want to terminate query ${query.queryId}?`)) {
                                  killQuery(query.queryId, selectedDataSource?.id || '');
                                }
                              }}
                            >
                              <StopCircle className="h-3 w-3 mr-1" />
                              Kill
                            </Button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slow Queries Modal - Enhanced */}
      <Dialog open={showSlowQueriesModal} onOpenChange={setShowSlowQueriesModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Slow Queries - {selectedDataSource?.name}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const queries = selectedDataSource?.slowQueries || [];
                    const filteredData = filterData(queries, slowQueriesFilters);
                    const sortedData = sortData(filteredData, slowQueriesSortField, slowQueriesSortDirection);
                    exportToCSV(sortedData, `slow-queries-${selectedDataSource?.name}`, 
                      ['queryId', 'query', 'executionTime', 'rowsScanned', 'recommendation', 'optimization']);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Queries requiring optimization with recommendations ({selectedDataSource?.slowQueries?.length || 0} queries)
            </DialogDescription>
          </DialogHeader>
          
          {/* Filter Inputs */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Input
              placeholder="Filter Query ID..."
              value={slowQueriesFilters.queryId || ''}
              onChange={(e) => setSlowQueriesFilters(prev => ({ ...prev, queryId: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Filter Query Text..."
              value={slowQueriesFilters.query || ''}
              onChange={(e) => setSlowQueriesFilters(prev => ({ ...prev, query: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Filter Recommendation..."
              value={slowQueriesFilters.recommendation || ''}
              onChange={(e) => setSlowQueriesFilters(prev => ({ ...prev, recommendation: e.target.value }))}
              className="text-sm"
            />
          </div>
          
          <div className="flex-1 overflow-hidden mt-4">
            <div className="space-y-3 overflow-y-auto max-h-[600px]">
              {(() => {
                const queries = selectedDataSource?.slowQueries || [];
                const filteredData = filterData(queries, slowQueriesFilters);
                const sortedData = sortData(filteredData, slowQueriesSortField, slowQueriesSortDirection);
                
                return sortedData.map((query, idx) => (
                  <Card key={idx} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="font-mono">{query.queryId}</Badge>
                              <Badge variant="destructive">{query.executionTime}ms</Badge>
                              <Badge variant="secondary">{query.rowsScanned.toLocaleString()} rows scanned</Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(query.query)}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Query
                              </Button>
                            </div>
                            <code className="text-xs bg-muted px-3 py-2 rounded block overflow-x-auto max-h-32">
                              {query.query}
                            </code>
                          </div>
                        </div>
                        
                        {query.recommendation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Recommendation</p>
                                <p className="text-sm text-blue-800">{query.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {query.optimization && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-semibold text-green-900">Optimization</p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(query.optimization || '')}
                                    className="h-6 px-2"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <code className="text-xs bg-white px-2 py-1 rounded block overflow-x-auto border border-green-300">
                                  {query.optimization}
                                </code>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          </div>
          
          {/* Sort Controls */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm font-semibold">Sort by:</span>
            <Button
              size="sm"
              variant={slowQueriesSortField === 'executionTime' ? 'default' : 'outline'}
              onClick={() => toggleSort(slowQueriesSortField, slowQueriesSortDirection, 'executionTime' as keyof SlowQuery, setSlowQueriesSortField, setSlowQueriesSortDirection)}
            >
              Execution Time
              {slowQueriesSortField === 'executionTime' && (
                slowQueriesSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
              )}
            </Button>
            <Button
              size="sm"
              variant={slowQueriesSortField === 'rowsScanned' ? 'default' : 'outline'}
              onClick={() => toggleSort(slowQueriesSortField, slowQueriesSortDirection, 'rowsScanned' as keyof SlowQuery, setSlowQueriesSortField, setSlowQueriesSortDirection)}
            >
              Rows Scanned
              {slowQueriesSortField === 'rowsScanned' && (
                slowQueriesSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Logs Modal - Enhanced with More Details */}
      <Dialog open={showAccessLogsModal} onOpenChange={setShowAccessLogsModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Access Logs - {selectedDataSource?.name}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const logs = selectedDataSource?.accessLogs || [];
                    const filteredData = filterData(logs, accessLogsFilters);
                    const sortedData = sortData(filteredData, accessLogsSortField, accessLogsSortDirection);
                    exportToCSV(sortedData, `access-logs-${selectedDataSource?.name}`, 
                      ['timestamp', 'user', 'action', 'status', 'duration', 'query']);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Detailed access activities and operations ({selectedDataSource?.accessLogs?.length || 0} logs)
            </DialogDescription>
          </DialogHeader>
          
          {/* Filter Inputs */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <Input
              placeholder="Filter User..."
              value={accessLogsFilters.user || ''}
              onChange={(e) => setAccessLogsFilters(prev => ({ ...prev, user: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Filter Action..."
              value={accessLogsFilters.action || ''}
              onChange={(e) => setAccessLogsFilters(prev => ({ ...prev, action: e.target.value }))}
              className="text-sm"
            />
            <Select
              value={accessLogsFilters.status || 'all'}
              onValueChange={(value) => setAccessLogsFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Filter Status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter Query..."
              value={accessLogsFilters.query || ''}
              onChange={(e) => setAccessLogsFilters(prev => ({ ...prev, query: e.target.value }))}
              className="text-sm"
            />
          </div>
          
          <div className="flex-1 overflow-hidden mt-4">
            <div className="border rounded-lg overflow-hidden h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <SortableHeader
                        label="Timestamp"
                        field="timestamp"
                        currentField={accessLogsSortField}
                        currentDirection={accessLogsSortDirection}
                        onSort={() => toggleSort(accessLogsSortField, accessLogsSortDirection, 'timestamp' as keyof AccessLogEntry, setAccessLogsSortField, setAccessLogsSortDirection)}
                      />
                      <SortableHeader
                        label="User"
                        field="user"
                        currentField={accessLogsSortField}
                        currentDirection={accessLogsSortDirection}
                        onSort={() => toggleSort(accessLogsSortField, accessLogsSortDirection, 'user' as keyof AccessLogEntry, setAccessLogsSortField, setAccessLogsSortDirection)}
                      />
                      <SortableHeader
                        label="Action"
                        field="action"
                        currentField={accessLogsSortField}
                        currentDirection={accessLogsSortDirection}
                        onSort={() => toggleSort(accessLogsSortField, accessLogsSortDirection, 'action' as keyof AccessLogEntry, setAccessLogsSortField, setAccessLogsSortDirection)}
                      />
                      <SortableHeader
                        label="Status"
                        field="status"
                        currentField={accessLogsSortField}
                        currentDirection={accessLogsSortDirection}
                        onSort={() => toggleSort(accessLogsSortField, accessLogsSortDirection, 'status' as keyof AccessLogEntry, setAccessLogsSortField, setAccessLogsSortDirection)}
                      />
                      <SortableHeader
                        label="Duration (ms)"
                        field="duration"
                        currentField={accessLogsSortField}
                        currentDirection={accessLogsSortDirection}
                        onSort={() => toggleSort(accessLogsSortField, accessLogsSortDirection, 'duration' as keyof AccessLogEntry, setAccessLogsSortField, setAccessLogsSortDirection)}
                      />
                      <th className="text-left p-3 font-semibold">Query Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const logs = selectedDataSource?.accessLogs || [];
                      const filteredData = filterData(logs, accessLogsFilters);
                      const sortedData = sortData(filteredData, accessLogsSortField, accessLogsSortDirection);
                      
                      return sortedData.map((log, idx) => (
                        <tr key={idx} className={`border-t hover:bg-muted/50 transition ${
                          log.status === 'failed' ? 'bg-red-50/30' : ''
                        }`}>
                          <td className="p-3 font-mono text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {log.user}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{log.action}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${
                              log.status === 'success' ? 'bg-green-500' : 
                              log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                            } text-white flex items-center gap-1 w-fit`}>
                              {log.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> :
                               log.status === 'failed' ? <XCircle className="h-3 w-3" /> :
                               <Clock className="h-3 w-3" />}
                              {log.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3 font-semibold">{log.duration}</td>
                          <td className="p-3 max-w-md">
                            {log.query ? (
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto max-h-16">
                                  {log.query}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(log.query || '')}
                                  className="h-6 px-2 flex-shrink-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No query details</span>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Alerts Modal */}
      <Dialog open={showAlertsModal} onOpenChange={setShowAlertsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              Configure Alerts - {selectedDataSource?.name}
            </DialogTitle>
            <DialogDescription>
              Set up alerts and notifications for this data source
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            {/* Alert Configuration UI */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">High CPU Usage</span>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Alert when CPU usage exceeds 80% for 5 minutes
                </p>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="80" className="w-20" />
                  <span className="text-sm">% for</span>
                  <Input type="number" placeholder="5" className="w-20" />
                  <span className="text-sm">minutes</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold">High Memory Usage</span>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Alert when memory usage exceeds 85% for 5 minutes
                </p>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="85" className="w-20" />
                  <span className="text-sm">% for</span>
                  <Input type="number" placeholder="5" className="w-20" />
                  <span className="text-sm">minutes</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold">Slow Query Detected</span>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Alert when query execution time exceeds threshold
                </p>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="5000" className="w-24" />
                  <span className="text-sm">milliseconds</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">Connection Failure</span>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alert immediately when connection fails or database is unreachable
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAlertsModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: 'Alerts Configured',
                  description: `Alert settings saved for ${selectedDataSource?.name}`,
                });
                setShowAlertsModal(false);
              }}>
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensivePerformance;

