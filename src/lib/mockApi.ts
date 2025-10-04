/**
 * Mock API Service for DataMantri Demo
 * Simulates backend API calls with realistic delays and responses
 */

import {
  mockUser,
  mockDataSources,
  mockTables,
  mockDashboards,
  mockChartData,
  mockDataMarts,
  mockPipelines,
  mockPipelineRuns,
  mockPerformanceMetrics,
  mockQueryResults,
  mockOrganizations,
  mockRoles,
  mockUsers,
  mockSchedulers,
} from './mockData';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random failures (1% chance)
const shouldFail = () => Math.random() < 0.01;

class MockApiService {
  private isAuthenticated = false;

  // Authentication
  async login(email: string, password: string) {
    await delay(500);
    if (shouldFail()) {
      throw new Error('Login failed. Please try again.');
    }
    this.isAuthenticated = true;
    return {
      status: 'success',
      message: 'Login successful',
      must_reset_password: false,
    };
  }

  async demoLogin() {
    await delay(300);
    this.isAuthenticated = true;
    return {
      status: 'success',
      message: 'Demo login successful',
    };
  }

  async logout() {
    await delay(200);
    this.isAuthenticated = false;
    return { status: 'success', message: 'Logout successful' };
  }

  async getSession() {
    await delay(100);
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return {
      status: 'success',
      user: mockUser,
    };
  }

  // Data Sources
  async getDataSources() {
    await delay();
    if (shouldFail()) throw new Error('Failed to fetch data sources');
    return mockDataSources;
  }

  async getDataSource(id: string) {
    await delay();
    const source = mockDataSources.find(s => s.id === id);
    if (!source) throw new Error('Data source not found');
    return source;
  }

  async createDataSource(data: any) {
    await delay(800);
    const newSource = {
      id: `${mockDataSources.length + 1}`,
      ...data,
      status: 'connected',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDataSources.push(newSource);
    return newSource;
  }

  async updateDataSource(id: string, data: any) {
    await delay(600);
    const index = mockDataSources.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Data source not found');
    mockDataSources[index] = {
      ...mockDataSources[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockDataSources[index];
  }

  async deleteDataSource(id: string) {
    await delay(400);
    const index = mockDataSources.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Data source not found');
    mockDataSources.splice(index, 1);
    return { message: 'Data source deleted successfully' };
  }

  async testConnection(id: string) {
    await delay(1000);
    if (Math.random() < 0.1) {
      return { status: 'error', message: 'Connection failed' };
    }
    return { status: 'success', message: 'Connection successful' };
  }

  // Tables
  async getTables(dataSourceId: string) {
    await delay();
    return mockTables[dataSourceId] || [];
  }

  async getTableSchema(dataSourceId: string, tableName: string) {
    await delay();
    return {
      name: tableName,
      columns: Array.from({ length: 10 }, (_, i) => ({
        name: `column_${i + 1}`,
        type: ['varchar', 'integer', 'timestamp', 'boolean', 'decimal'][Math.floor(Math.random() * 5)],
        nullable: Math.random() > 0.5,
        primary_key: i === 0,
      })),
    };
  }

  async getTableData(dataSourceId: string, tableName: string, page = 1, limit = 50) {
    await delay();
    return {
      columns: ['id', 'name', 'value', 'created_at'],
      rows: Array.from({ length: limit }, (_, i) => ({
        id: (page - 1) * limit + i + 1,
        name: `Record ${(page - 1) * limit + i + 1}`,
        value: Math.floor(Math.random() * 10000),
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      })),
      total: 5000,
      page,
      limit,
    };
  }

  // Dashboards
  async getDashboards() {
    await delay();
    return mockDashboards;
  }

  async getDashboard(id: string) {
    await delay();
    const dashboard = mockDashboards.find(d => d.id === id);
    if (!dashboard) throw new Error('Dashboard not found');
    return dashboard;
  }

  async createDashboard(data: any) {
    await delay(800);
    const newDashboard = {
      id: `${mockDashboards.length + 1}`,
      ...data,
      created_by: mockUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      charts: [],
    };
    mockDashboards.push(newDashboard);
    return newDashboard;
  }

  async updateDashboard(id: string, data: any) {
    await delay(600);
    const index = mockDashboards.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Dashboard not found');
    mockDashboards[index] = {
      ...mockDashboards[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockDashboards[index];
  }

  async deleteDashboard(id: string) {
    await delay(400);
    const index = mockDashboards.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Dashboard not found');
    mockDashboards.splice(index, 1);
    return { message: 'Dashboard deleted successfully' };
  }

  // Charts
  async getChartData(chartId: string) {
    await delay();
    return mockChartData[chartId] || [];
  }

  // Data Marts
  async getDataMarts() {
    await delay();
    return mockDataMarts;
  }

  async getDataMart(id: string) {
    await delay();
    const mart = mockDataMarts.find(m => m.id === id);
    if (!mart) throw new Error('Data mart not found');
    return mart;
  }

  async createDataMart(data: any) {
    await delay(800);
    const newMart = {
      id: `${mockDataMarts.length + 1}`,
      ...data,
      status: 'active',
      created_at: new Date().toISOString(),
      last_refreshed: new Date().toISOString(),
      row_count: 0,
    };
    mockDataMarts.push(newMart);
    return newMart;
  }

  async refreshDataMart(id: string) {
    await delay(2000);
    const mart = mockDataMarts.find(m => m.id === id);
    if (!mart) throw new Error('Data mart not found');
    mart.last_refreshed = new Date().toISOString();
    mart.row_count = Math.floor(Math.random() * 100000) + 10000;
    return mart;
  }

  // Pipelines
  async getPipelines() {
    await delay();
    return mockPipelines;
  }

  async getPipeline(id: string) {
    await delay();
    const pipeline = mockPipelines.find(p => p.id === id);
    if (!pipeline) throw new Error('Pipeline not found');
    return {
      ...pipeline,
      runs: mockPipelineRuns[id] || [],
    };
  }

  async createPipeline(data: any) {
    await delay(800);
    const newPipeline = {
      id: `${mockPipelines.length + 1}`,
      ...data,
      status: 'inactive',
      created_at: new Date().toISOString(),
      last_run_at: null,
    };
    mockPipelines.push(newPipeline);
    return newPipeline;
  }

  async updatePipeline(id: string, data: any) {
    await delay(600);
    const index = mockPipelines.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pipeline not found');
    mockPipelines[index] = {
      ...mockPipelines[index],
      ...data,
    };
    return mockPipelines[index];
  }

  async deletePipeline(id: string) {
    await delay(400);
    const index = mockPipelines.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pipeline not found');
    mockPipelines.splice(index, 1);
    return { message: 'Pipeline deleted successfully' };
  }

  async triggerPipeline(id: string) {
    await delay(1000);
    const pipeline = mockPipelines.find(p => p.id === id);
    if (!pipeline) throw new Error('Pipeline not found');
    
    const newRun = {
      id: `run-${id}-${Date.now()}`,
      pipeline_id: id,
      status: 'running',
      start_time: new Date().toISOString(),
      end_time: null,
      records_processed: 0,
      records_failed: 0,
      log: 'Pipeline started',
      error_message: null,
    };
    
    if (!mockPipelineRuns[id]) {
      mockPipelineRuns[id] = [];
    }
    mockPipelineRuns[id].unshift(newRun);
    
    // Simulate completion after 5 seconds
    setTimeout(() => {
      newRun.status = 'success';
      newRun.end_time = new Date().toISOString();
      newRun.records_processed = Math.floor(Math.random() * 10000) + 1000;
      newRun.log = 'Pipeline completed successfully';
    }, 5000);
    
    return { message: 'Pipeline triggered successfully', run_id: newRun.id };
  }

  // SQL Execution
  async executeSQL(dataSourceId: string, query: string) {
    await delay(1000);
    if (shouldFail()) {
      throw new Error('SQL execution failed: Syntax error near SELECT');
    }
    return mockQueryResults;
  }

  // Performance
  async getPerformanceMetrics() {
    await delay();
    return mockPerformanceMetrics;
  }

  async getQueryHistory() {
    await delay();
    return mockPerformanceMetrics.queries;
  }

  async getSystemMetrics() {
    await delay();
    return mockPerformanceMetrics.systemMetrics;
  }

  // Access Management
  async getOrganizations() {
    await delay();
    return mockOrganizations;
  }

  async getRoles() {
    await delay();
    return mockRoles;
  }

  async getUsers() {
    await delay();
    return mockUsers;
  }

  async createUser(data: any) {
    await delay(600);
    const newUser = {
      id: `${mockUsers.length + 1}`,
      ...data,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: string, data: any) {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
    };
    return mockUsers[index];
  }

  async deleteUser(id: string) {
    await delay(400);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockUsers.splice(index, 1);
    return { message: 'User deleted successfully' };
  }

  // AI Dashboard Generation
  async generateDashboard(prompt: string) {
    await delay(2000);
    return {
      success: true,
      dashboard: {
        name: 'AI Generated Dashboard',
        description: `Dashboard generated from: "${prompt}"`,
        charts: [
          { type: 'line', title: 'Trend Analysis', config: {} },
          { type: 'bar', title: 'Category Breakdown', config: {} },
          { type: 'pie', title: 'Distribution', config: {} },
        ],
      },
    };
  }

  // File Upload
  async uploadFile(file: File, config: any) {
    await delay(1500);
    return {
      success: true,
      message: 'File uploaded successfully',
      rows_imported: Math.floor(Math.random() * 10000) + 1000,
      table_name: config.table_name || file.name.replace(/\.[^/.]+$/, ''),
    };
  }

  // Schedulers
  async getSchedulers() {
    await delay(300);
    return mockSchedulers;
  }

  async getScheduler(id: string) {
    await delay(200);
    const scheduler = mockSchedulers.find(s => s.id === id);
    if (!scheduler) {
      throw new Error('Scheduler not found');
    }
    return scheduler;
  }

  async createScheduler(data: any) {
    await delay(500);
    return {
      id: String(mockSchedulers.length + 1),
      ...data,
      status: 'active',
      created_at: new Date().toISOString(),
      last_run: null,
      next_run: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  async updateScheduler(id: string, data: any) {
    await delay(400);
    const scheduler = mockSchedulers.find(s => s.id === id);
    if (!scheduler) {
      throw new Error('Scheduler not found');
    }
    return { ...scheduler, ...data };
  }

  async deleteScheduler(id: string) {
    await delay(300);
    return { success: true, message: 'Scheduler deleted successfully' };
  }
}

// Singleton instance
export const mockApi = new MockApiService();

// Export for use in demo
export default mockApi;

