/**
 * Mock Data for DataMantri Demo
 * Complete dataset simulating real application data
 */

// User & Authentication
export const mockUser = {
  id: 'demo-user-1',
  email: 'demo@datamantri.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'ADMIN',
  is_admin: true,
  organization_name: 'DataMantri Demo',
  organization_logo_url: null,
  must_reset_password: false,
};

// Data Sources
export const mockDataSources = [
  {
    id: '1',
    name: 'PostgreSQL Production',
    connection_type: 'postgresql',
    host: 'prod-db.datamantri.com',
    port: 5432,
    database: 'production',
    username: 'admin',
    status: 'connected',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-10-01T15:20:00Z',
  },
  {
    id: '2',
    name: 'MySQL Analytics',
    connection_type: 'mysql',
    host: 'analytics-db.datamantri.com',
    port: 3306,
    database: 'analytics',
    username: 'analyst',
    status: 'connected',
    created_at: '2024-02-10T09:15:00Z',
    updated_at: '2024-09-28T11:45:00Z',
  },
  {
    id: '3',
    name: 'MongoDB Documents',
    connection_type: 'mongodb',
    host: 'mongo.datamantri.com',
    port: 27017,
    database: 'documents',
    username: 'docuser',
    status: 'connected',
    created_at: '2024-03-05T14:00:00Z',
    updated_at: '2024-10-02T08:30:00Z',
  },
  {
    id: '4',
    name: 'BigQuery Warehouse',
    connection_type: 'bigquery',
    host: 'bigquery.googleapis.com',
    database: 'data_warehouse',
    username: 'service-account',
    status: 'connected',
    created_at: '2024-01-20T12:00:00Z',
    updated_at: '2024-10-03T16:00:00Z',
  },
];

// Tables and Schemas
export const mockTables = {
  '1': [
    { name: 'users', rows: 15420, columns: 12 },
    { name: 'orders', rows: 45890, columns: 18 },
    { name: 'products', rows: 2340, columns: 15 },
    { name: 'customers', rows: 12890, columns: 20 },
    { name: 'transactions', rows: 89450, columns: 25 },
  ],
  '2': [
    { name: 'sales_analytics', rows: 234567, columns: 30 },
    { name: 'user_behavior', rows: 567890, columns: 22 },
    { name: 'marketing_campaigns', rows: 3456, columns: 18 },
  ],
  '3': [
    { name: 'customer_profiles', rows: 45678, columns: 35 },
    { name: 'product_catalog', rows: 8901, columns: 28 },
    { name: 'reviews', rows: 123456, columns: 12 },
  ],
  '4': [
    { name: 'fact_sales', rows: 9876543, columns: 40 },
    { name: 'dim_customer', rows: 234567, columns: 25 },
    { name: 'dim_product', rows: 12345, columns: 20 },
  ],
};

// Dashboards
export const mockDashboards = [
  {
    id: '1',
    name: 'Sales Overview',
    description: 'Comprehensive sales performance dashboard',
    created_by: 'demo-user-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-10-01T14:30:00Z',
    is_public: true,
    charts: [
      {
        id: 'chart-1',
        title: 'Monthly Revenue',
        type: 'line',
        config: { dataKey: 'revenue' },
      },
      {
        id: 'chart-2',
        title: 'Product Category Sales',
        type: 'bar',
        config: { dataKey: 'sales' },
      },
      {
        id: 'chart-3',
        title: 'Revenue by Region',
        type: 'pie',
        config: { dataKey: 'region' },
      },
    ],
  },
  {
    id: '2',
    name: 'Customer Analytics',
    description: 'Customer behavior and segmentation analysis',
    created_by: 'demo-user-1',
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-09-15T16:20:00Z',
    is_public: true,
    charts: [
      {
        id: 'chart-4',
        title: 'Customer Acquisition',
        type: 'area',
        config: { dataKey: 'customers' },
      },
      {
        id: 'chart-5',
        title: 'Customer Lifetime Value',
        type: 'bar',
        config: { dataKey: 'ltv' },
      },
    ],
  },
  {
    id: '3',
    name: 'Marketing Performance',
    description: 'Campaign effectiveness and ROI tracking',
    created_by: 'demo-user-1',
    created_at: '2024-03-10T11:00:00Z',
    updated_at: '2024-09-28T10:15:00Z',
    is_public: false,
    charts: [
      {
        id: 'chart-6',
        title: 'Campaign ROI',
        type: 'bar',
        config: { dataKey: 'roi' },
      },
      {
        id: 'chart-7',
        title: 'Conversion Funnel',
        type: 'funnel',
        config: { dataKey: 'conversions' },
      },
    ],
  },
];

// Chart Data
export const mockChartData = {
  'chart-1': Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.floor(Math.random() * 50000) + 100000,
    target: 120000,
  })),
  'chart-2': [
    { category: 'Electronics', sales: 125000, growth: 15 },
    { category: 'Clothing', sales: 89000, growth: 8 },
    { category: 'Home & Garden', sales: 67000, growth: 12 },
    { category: 'Sports', sales: 45000, growth: 5 },
    { category: 'Books', sales: 34000, growth: -3 },
  ],
  'chart-3': [
    { region: 'North America', value: 450000 },
    { region: 'Europe', value: 380000 },
    { region: 'Asia Pacific', value: 290000 },
    { region: 'Latin America', value: 120000 },
    { region: 'Middle East', value: 80000 },
  ],
  'chart-4': Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    customers: Math.floor(Math.random() * 500) + 1000,
  })),
  'chart-5': [
    { segment: 'Premium', ltv: 5400, count: 1200 },
    { segment: 'Standard', ltv: 2800, count: 4500 },
    { segment: 'Basic', ltv: 1200, count: 8900 },
  ],
  'chart-6': [
    { campaign: 'Summer Sale', roi: 245, spend: 15000 },
    { campaign: 'Black Friday', roi: 380, spend: 45000 },
    { campaign: 'Email Campaign', roi: 156, spend: 5000 },
    { campaign: 'Social Media', roi: 198, spend: 12000 },
  ],
  'chart-7': [
    { stage: 'Visitors', count: 45000 },
    { stage: 'Sign Ups', count: 12000 },
    { stage: 'Trials', count: 4500 },
    { stage: 'Paid', count: 890 },
  ],
};

// Data Marts
export const mockDataMarts = [
  {
    id: '1',
    name: 'Sales Data Mart',
    description: 'Aggregated sales data for reporting',
    data_source_id: '1',
    table_name: 'dm_sales',
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    last_refreshed: '2024-10-04T03:00:00Z',
    row_count: 234567,
  },
  {
    id: '2',
    name: 'Customer 360',
    description: 'Unified customer view across all touchpoints',
    data_source_id: '2',
    table_name: 'dm_customer_360',
    status: 'active',
    created_at: '2024-02-15T11:00:00Z',
    last_refreshed: '2024-10-04T02:30:00Z',
    row_count: 45678,
  },
  {
    id: '3',
    name: 'Product Analytics',
    description: 'Product performance metrics and analytics',
    data_source_id: '1',
    table_name: 'dm_product_analytics',
    status: 'active',
    created_at: '2024-03-01T09:00:00Z',
    last_refreshed: '2024-10-04T01:45:00Z',
    row_count: 12345,
  },
];

// Pipelines
export const mockPipelines = [
  {
    id: '1',
    name: 'Daily Sales ETL',
    description: 'Extract and transform daily sales data',
    source_id: 1,
    source_table: 'orders',
    destination_id: 4,
    destination_table: 'fact_sales',
    mode: 'batch',
    schedule: '0 2 * * *',
    status: 'active',
    created_at: '2024-01-10T10:00:00Z',
    last_run_at: '2024-10-04T02:00:00Z',
  },
  {
    id: '2',
    name: 'Customer Data Sync',
    description: 'Real-time customer data synchronization',
    source_id: 3,
    source_table: 'customer_profiles',
    destination_id: 2,
    destination_table: 'customers',
    mode: 'realtime',
    schedule: null,
    status: 'running',
    created_at: '2024-02-05T11:00:00Z',
    last_run_at: '2024-10-04T16:45:00Z',
  },
  {
    id: '3',
    name: 'Analytics Aggregation',
    description: 'Hourly aggregation of analytics data',
    source_id: 2,
    source_table: 'user_behavior',
    destination_id: 4,
    destination_table: 'analytics_summary',
    mode: 'batch',
    schedule: '0 * * * *',
    status: 'active',
    created_at: '2024-03-15T14:00:00Z',
    last_run_at: '2024-10-04T16:00:00Z',
  },
];

// Pipeline Runs
export const mockPipelineRuns = {
  '1': Array.from({ length: 10 }, (_, i) => ({
    id: `run-1-${i}`,
    pipeline_id: '1',
    status: i === 0 ? 'success' : ['success', 'success', 'success', 'failed'][Math.floor(Math.random() * 4)],
    start_time: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    records_processed: Math.floor(Math.random() * 10000) + 5000,
    records_failed: Math.floor(Math.random() * 50),
    log: 'Pipeline executed successfully',
    error_message: null,
  })),
  '2': Array.from({ length: 10 }, (_, i) => ({
    id: `run-2-${i}`,
    pipeline_id: '2',
    status: 'success',
    start_time: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - i * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    records_processed: Math.floor(Math.random() * 1000) + 500,
    records_failed: 0,
    log: 'Real-time sync completed',
    error_message: null,
  })),
  '3': Array.from({ length: 10 }, (_, i) => ({
    id: `run-3-${i}`,
    pipeline_id: '3',
    status: ['success', 'success', 'success', 'failed'][Math.floor(Math.random() * 4)],
    start_time: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - i * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
    records_processed: Math.floor(Math.random() * 50000) + 10000,
    records_failed: Math.floor(Math.random() * 100),
    log: 'Aggregation completed',
    error_message: null,
  })),
};

// Performance Metrics
export const mockPerformanceMetrics = {
  queries: Array.from({ length: 50 }, (_, i) => ({
    id: `query-${i}`,
    query: `SELECT * FROM ${['users', 'orders', 'products', 'customers'][Math.floor(Math.random() * 4)]}`,
    execution_time: Math.random() * 5000,
    rows_returned: Math.floor(Math.random() * 10000),
    timestamp: new Date(Date.now() - i * 60 * 1000).toISOString(),
    status: ['success', 'success', 'success', 'error'][Math.floor(Math.random() * 4)],
  })),
  systemMetrics: {
    cpu: Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
      value: Math.random() * 100,
    })),
    memory: Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
      value: Math.random() * 100,
    })),
    connections: Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
      value: Math.floor(Math.random() * 100),
    })),
  },
};

// SQL Query Results
export const mockQueryResults = {
  columns: ['id', 'name', 'email', 'created_at', 'status'],
  rows: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
  })),
  executionTime: Math.random() * 2000,
  rowCount: 25,
};

// Organizations & Access Management
export const mockOrganizations = [
  {
    id: '1',
    name: 'DataMantri Demo',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockRoles = [
  { id: '1', name: 'Admin', description: 'Full system access', permissions_count: 28 },
  { id: '2', name: 'Data Analyst', description: 'Read and query data', permissions_count: 15 },
  { id: '3', name: 'Viewer', description: 'View dashboards only', permissions_count: 5 },
];

export const mockUsers = [
  {
    id: '1',
    email: 'demo@datamantri.com',
    first_name: 'Demo',
    last_name: 'User',
    role: 'Admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'analyst@datamantri.com',
    first_name: 'Jane',
    last_name: 'Analyst',
    role: 'Data Analyst',
    is_active: true,
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: '3',
    email: 'viewer@datamantri.com',
    first_name: 'John',
    last_name: 'Viewer',
    role: 'Viewer',
    is_active: true,
    created_at: '2024-03-20T00:00:00Z',
  },
];

