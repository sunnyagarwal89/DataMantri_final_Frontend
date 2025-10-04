export interface ChartComponent {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  title: string;
  dataSource?: string;
  config?: {
    xAxis?: string;
    yAxis?: string;
    dataKey?: string;
    color?: string;
    width?: number;
    height?: number;
  };
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  layout?: {
    gridColumns?: number;
    gridRows?: number;
  };
  components?: ChartComponent[];
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardData {
  [key: string]: any[];
}

export interface DashboardProps {
  template?: DashboardTemplate | null;
  data?: DashboardData;
  onComponentUpdate?: (componentId: string, data: any[]) => void;
}

export interface PromptMatchResult {
  template: DashboardTemplate | null;
  confidence: number;
  reason: string;
}

export interface TemplateLoaderOptions {
  zipFilePath: string;
  category?: string;
  autoGenerateIds?: boolean;
}
