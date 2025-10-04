import { Download } from 'lucide-react';
import { FeatureProps } from './index';

const ExportCSV: React.FC<FeatureProps> = ({ data, config }) => {
  const handleExport = () => {
    if (!data || !data.rows || data.rows.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Convert data to CSV
      const rows = data.rows;
      const headers = Object.keys(rows[0]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      rows.forEach((row: any) => {
        const values = headers.map(header => {
          let value = row[header];
          // Handle special characters and quotes
          if (value === null || value === undefined) {
            return '';
          }
          value = String(value);
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = '"' + value.replace(/"/g, '""') + '"';
          }
          return value;
        });
        csvContent += values.join(',') + '\n';
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${config?.title || 'data'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
      title="Export to CSV"
    >
      <Download className="w-4 h-4" />
      <span className="text-sm font-semibold">Export CSV</span>
    </button>
  );
};

export default ExportCSV;

