// Simulated data sources for demo purposes
export const DATA_SOURCES = {
  'sales-performance': () => [
    { month: 'Jan', sales: 4000, target: 3500, profit: 1200 },
    { month: 'Feb', sales: 3000, target: 3500, profit: 800 },
    { month: 'Mar', sales: 5000, target: 4000, profit: 1800 },
    { month: 'Apr', sales: 4500, target: 4000, profit: 1500 },
    { month: 'May', sales: 6000, target: 5000, profit: 2200 },
    { month: 'Jun', sales: 5500, target: 5000, profit: 2000 }
  ],
  'user-analytics': () => [
    { category: 'Desktop', users: 2400, sessions: 4000 },
    { category: 'Mobile', users: 1398, sessions: 3000 },
    { category: 'Tablet', users: 9800, sessions: 2000 },
    { category: 'Other', users: 3908, sessions: 2780 }
  ],
  'revenue-breakdown': () => [
    { name: 'Product A', value: 400, revenue: 45000 },
    { name: 'Product B', value: 300, revenue: 32000 },
    { name: 'Product C', value: 300, revenue: 28000 },
    { name: 'Product D', value: 200, revenue: 15000 }
  ],
  'monthly-trends': () => [
    { date: '2024-01', value: 100 },
    { date: '2024-02', value: 120 },
    { date: '2024-03', value: 110 },
    { date: '2024-04', value: 140 },
    { date: '2024-05', value: 160 },
    { date: '2024-06', value: 150 },
    { date: '2024-07', value: 180 }
  ],
  'geographic-data': () => [
    { country: 'USA', value: 4000, population: 331000000 },
    { country: 'China', value: 3000, population: 1439323776 },
    { country: 'Japan', value: 2000, population: 125800000 },
    { country: 'Germany', value: 2780, population: 83200000 },
    { country: 'UK', value: 1890, population: 67500000 },
    { country: 'France', value: 2390, population: 67400000 }
  ]
};

export async function fetchData(dataSource: string): Promise<any[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  const dataGenerator = DATA_SOURCES[dataSource as keyof typeof DATA_SOURCES];

  if (dataGenerator) {
    return dataGenerator();
  }

  // Fallback to generic sample data
  return [
    { name: 'Sample A', value: Math.random() * 100 },
    { name: 'Sample B', value: Math.random() * 100 },
    { name: 'Sample C', value: Math.random() * 100 },
    { name: 'Sample D', value: Math.random() * 100 },
    { name: 'Sample E', value: Math.random() * 100 }
  ];
}

// Mock API functions for different data sources
export async function fetchSalesData(): Promise<any[]> {
  return fetchData('sales-performance');
}

export async function fetchUserAnalytics(): Promise<any[]> {
  return fetchData('user-analytics');
}

export async function fetchRevenueBreakdown(): Promise<any[]> {
  return fetchData('revenue-breakdown');
}

export async function fetchMonthlyTrends(): Promise<any[]> {
  return fetchData('monthly-trends');
}

export async function fetchGeographicData(): Promise<any[]> {
  return fetchData('geographic-data');
}
