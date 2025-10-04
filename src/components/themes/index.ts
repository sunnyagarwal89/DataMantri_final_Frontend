// Theme Registry - Maps theme names to theme configurations

export interface DashboardTheme {
  name: string;
  description: string;
  dashboard: {
    background: string;
    text: string;
  };
  header: {
    background: string;
    text: string;
    gradient?: string;
  };
  chart: {
    background?: string;
    border?: string;
    shadow?: string;
  };
  primaryColor: string;
  secondaryColor?: string;
  colors: string[]; // Chart color palette
  gridColor?: string;
  axisColor?: string;
  tooltipBg?: string;
  tooltipBorder?: string;
  headerBg?: string;
  rowEvenBg?: string;
  rowOddBg?: string;
  textColor?: string;
}

// Theme Definitions (50 themes)
export const ThemeRegistry: Record<string, DashboardTheme> = {
  // Professional Themes (1-10)
  default: {
    name: 'Default',
    description: 'Clean and professional default theme',
    dashboard: { background: '#f8f9fa', text: '#212529' },
    header: { background: '#ffffff', text: '#212529', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    chart: { background: '#ffffff', border: '2px solid #e9ecef', shadow: '0 4px 6px rgba(0,0,0,0.1)' },
    primaryColor: '#3b82f6',
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    gridColor: '#e5e7eb',
    axisColor: '#6b7280',
    tooltipBg: '#ffffff',
    tooltipBorder: '#d1d5db',
  },

  dark: {
    name: 'Dark',
    description: 'Modern dark theme',
    dashboard: { background: '#1a1a1a', text: '#f5f5f5' },
    header: { background: '#2d2d2d', text: '#f5f5f5', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    chart: { background: '#2d2d2d', border: '2px solid #404040', shadow: '0 4px 6px rgba(0,0,0,0.3)' },
    primaryColor: '#60a5fa',
    colors: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'],
    gridColor: '#404040',
    axisColor: '#9ca3af',
    tooltipBg: '#374151',
    tooltipBorder: '#4b5563',
    headerBg: '#1f2937',
    rowEvenBg: '#2d2d2d',
    rowOddBg: '#252525',
    textColor: '#f5f5f5',
  },

  corporate: {
    name: 'Corporate',
    description: 'Professional corporate theme',
    dashboard: { background: '#ffffff', text: '#1e40af' },
    header: { background: '#1e40af', text: '#ffffff', gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
    chart: { background: '#ffffff', border: '2px solid #dbeafe', shadow: '0 4px 6px rgba(30,64,175,0.1)' },
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    colors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    gridColor: '#e0e7ff',
    axisColor: '#1e40af',
  },

  minimal: {
    name: 'Minimal',
    description: 'Clean minimal design',
    dashboard: { background: '#ffffff', text: '#000000' },
    header: { background: '#ffffff', text: '#000000', gradient: 'none' },
    chart: { background: '#ffffff', border: '1px solid #e5e5e5', shadow: 'none' },
    primaryColor: '#000000',
    colors: ['#000000', '#333333', '#666666', '#999999', '#cccccc'],
    gridColor: '#f5f5f5',
    axisColor: '#666666',
  },

  ocean: {
    name: 'Ocean',
    description: 'Cool ocean blue theme',
    dashboard: { background: '#f0f9ff', text: '#0c4a6e' },
    header: { background: '#0369a1', text: '#ffffff', gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' },
    chart: { background: '#ffffff', border: '2px solid #bae6fd', shadow: '0 4px 6px rgba(3,105,161,0.1)' },
    primaryColor: '#0284c7',
    colors: ['#0284c7', '#06b6d4', '#14b8a6', '#10b981', '#22c55e'],
    gridColor: '#e0f2fe',
    axisColor: '#0369a1',
  },

  sunset: {
    name: 'Sunset',
    description: 'Warm sunset colors',
    dashboard: { background: '#fff7ed', text: '#7c2d12' },
    header: { background: '#ea580c', text: '#ffffff', gradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)' },
    chart: { background: '#ffffff', border: '2px solid #fed7aa', shadow: '0 4px 6px rgba(234,88,12,0.1)' },
    primaryColor: '#ea580c',
    colors: ['#ea580c', '#f59e0b', '#fbbf24', '#facc15', '#fde047'],
    gridColor: '#ffedd5',
    axisColor: '#c2410c',
  },

  forest: {
    name: 'Forest',
    description: 'Natural green theme',
    dashboard: { background: '#f0fdf4', text: '#14532d' },
    header: { background: '#15803d', text: '#ffffff', gradient: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' },
    chart: { background: '#ffffff', border: '2px solid #bbf7d0', shadow: '0 4px 6px rgba(21,128,61,0.1)' },
    primaryColor: '#16a34a',
    colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
    gridColor: '#dcfce7',
    axisColor: '#15803d',
  },

  royal: {
    name: 'Royal',
    description: 'Elegant purple theme',
    dashboard: { background: '#faf5ff', text: '#581c87' },
    header: { background: '#7c3aed', text: '#ffffff', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' },
    chart: { background: '#ffffff', border: '2px solid #e9d5ff', shadow: '0 4px 6px rgba(124,58,237,0.1)' },
    primaryColor: '#7c3aed',
    colors: ['#7c3aed', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
    gridColor: '#f3e8ff',
    axisColor: '#6d28d9',
  },

  rose: {
    name: 'Rose',
    description: 'Soft pink theme',
    dashboard: { background: '#fff1f2', text: '#881337' },
    header: { background: '#e11d48', text: '#ffffff', gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)' },
    chart: { background: '#ffffff', border: '2px solid #fecdd3', shadow: '0 4px 6px rgba(225,29,72,0.1)' },
    primaryColor: '#e11d48',
    colors: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
    gridColor: '#ffe4e6',
    axisColor: '#be123c',
  },

  slate: {
    name: 'Slate',
    description: 'Professional slate gray',
    dashboard: { background: '#f8fafc', text: '#0f172a' },
    header: { background: '#475569', text: '#ffffff', gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)' },
    chart: { background: '#ffffff', border: '2px solid #e2e8f0', shadow: '0 4px 6px rgba(71,85,105,0.1)' },
    primaryColor: '#475569',
    colors: ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
    gridColor: '#f1f5f9',
    axisColor: '#334155',
  },

  // Modern Themes (11-20)
  neon: {
    name: 'Neon',
    description: 'Vibrant neon colors',
    dashboard: { background: '#0a0a0a', text: '#00ff00' },
    header: { background: '#1a1a1a', text: '#00ff00', gradient: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)' },
    chart: { background: '#1a1a1a', border: '2px solid #00ff00', shadow: '0 0 20px rgba(0,255,0,0.5)' },
    primaryColor: '#00ff00',
    colors: ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff0080'],
    gridColor: '#2a2a2a',
    axisColor: '#00ff00',
    textColor: '#00ff00',
  },

  // Placeholder themes for remaining 38 themes
  pastel: generatePlaceholderTheme('Pastel', 'Soft pastel colors', '#fef3c7'),
  vibrant: generatePlaceholderTheme('Vibrant', 'Bold vibrant colors', '#dc2626'),
  monochrome: generatePlaceholderTheme('Monochrome', 'Black and white', '#000000'),
  nature: generatePlaceholderTheme('Nature', 'Earth tones', '#84cc16'),
  tech: generatePlaceholderTheme('Tech', 'Futuristic tech', '#06b6d4'),
  vintage: generatePlaceholderTheme('Vintage', 'Retro vintage', '#92400e'),
  candy: generatePlaceholderTheme('Candy', 'Sweet candy colors', '#ec4899'),
  ice: generatePlaceholderTheme('Ice', 'Cool ice theme', '#93c5fd'),
  fire: generatePlaceholderTheme('Fire', 'Hot fire colors', '#dc2626'),
  earth: generatePlaceholderTheme('Earth', 'Earthy browns', '#78350f'),
  sky: generatePlaceholderTheme('Sky', 'Sky blues', '#0284c7'),
  lavender: generatePlaceholderTheme('Lavender', 'Soft lavender', '#a78bfa'),
  mint: generatePlaceholderTheme('Mint', 'Fresh mint green', '#34d399'),
  peach: generatePlaceholderTheme('Peach', 'Warm peach tones', '#fb923c'),
  berry: generatePlaceholderTheme('Berry', 'Rich berry colors', '#be123c'),
  lemon: generatePlaceholderTheme('Lemon', 'Bright lemon yellow', '#fde047'),
  azure: generatePlaceholderTheme('Azure', 'Deep azure blue', '#2563eb'),
  crimson: generatePlaceholderTheme('Crimson', 'Rich crimson red', '#991b1b'),
  emerald: generatePlaceholderTheme('Emerald', 'Precious emerald', '#059669'),
  amber: generatePlaceholderTheme('Amber', 'Golden amber', '#d97706'),
  indigo: generatePlaceholderTheme('Indigo', 'Deep indigo', '#4f46e5'),
  teal: generatePlaceholderTheme('Teal', 'Modern teal', '#0d9488'),
  lime: generatePlaceholderTheme('Lime', 'Bright lime', '#65a30d'),
  fuchsia: generatePlaceholderTheme('Fuchsia', 'Bold fuchsia', '#c026d3'),
  cyan: generatePlaceholderTheme('Cyan', 'Electric cyan', '#06b6d4'),
  bronze: generatePlaceholderTheme('Bronze', 'Metallic bronze', '#92400e'),
  silver: generatePlaceholderTheme('Silver', 'Metallic silver', '#71717a'),
  gold: generatePlaceholderTheme('Gold', 'Luxurious gold', '#ca8a04'),
  platinum: generatePlaceholderTheme('Platinum', 'Premium platinum', '#d4d4d8'),
  copper: generatePlaceholderTheme('Copper', 'Warm copper', '#c2410c'),
  steel: generatePlaceholderTheme('Steel', 'Industrial steel', '#52525b'),
  sage: generatePlaceholderTheme('Sage', 'Calm sage green', '#84cc16'),
  plum: generatePlaceholderTheme('Plum', 'Rich plum purple', '#7e22ce'),
  coral: generatePlaceholderTheme('Coral', 'Tropical coral', '#f97316'),
  navy: generatePlaceholderTheme('Navy', 'Classic navy', '#1e40af'),
  maroon: generatePlaceholderTheme('Maroon', 'Deep maroon', '#7f1d1d'),
  olive: generatePlaceholderTheme('Olive', 'Muted olive', '#65a30d'),
  turquoise: generatePlaceholderTheme('Turquoise', 'Vibrant turquoise', '#06b6d4'),
  mauve: generatePlaceholderTheme('Mauve', 'Soft mauve', '#a855f7'),
  chartreuse: generatePlaceholderTheme('Chartreuse', 'Bright chartreuse', '#84cc16'),
};

// Helper function to generate placeholder themes
function generatePlaceholderTheme(name: string, description: string, primaryColor: string): DashboardTheme {
  return {
    name,
    description,
    dashboard: { background: '#f9fafb', text: '#111827' },
    header: { background: primaryColor, text: '#ffffff', gradient: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` },
    chart: { background: '#ffffff', border: '2px solid #e5e7eb', shadow: '0 4px 6px rgba(0,0,0,0.1)' },
    primaryColor,
    colors: [primaryColor, '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    gridColor: '#e5e7eb',
    axisColor: '#6b7280',
  };
}

// Get list of available themes for AI
export const getAvailableThemes = (): string[] => {
  return Object.keys(ThemeRegistry);
};

// Theme descriptions for AI context
export const getThemeDescriptions = (): Record<string, string> => {
  const descriptions: Record<string, string> = {};
  Object.entries(ThemeRegistry).forEach(([key, theme]) => {
    descriptions[key] = theme.description;
  });
  return descriptions;
};

export default ThemeRegistry;

