import React, { useState, useEffect } from 'react';
import PostgresForm from '../data-sources/PostgresForm';

interface EditDataSourceViewProps {
  dataSourceId: string;
  onCancel: () => void;
  onSaved: () => void;
}

const EditDataSourceView: React.FC<EditDataSourceViewProps> = ({ dataSourceId, onCancel, onSaved }) => {
  const [dataSource, setDataSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataSource = async () => {
      try {
        // This is a bit of a hack. The GET /api/data-sources endpoint returns all sources.
        // We'll find the one we need. A dedicated GET /api/data-sources/:id would be better.
        const response = await fetch('/api/data-sources', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch data sources');
        const sources = await response.json();
        const sourceToEdit = sources.find((s: any) => s.id === dataSourceId);
        if (!sourceToEdit) throw new Error('Data source not found');
        setDataSource(sourceToEdit);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataSource();
  }, [dataSourceId]);

  const renderContent = () => {
    if (isLoading) return <p>Loading data source...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!dataSource) return <p>Data source not found.</p>;

    switch (dataSource.connection_type) {
      case 'postgres':
        return <PostgresForm existingData={dataSource} onSaved={onSaved} />;
      // Add cases for other types like mongodb, bigquery as they are implemented
      default:
        return <p>Unsupported data source type for editing: {dataSource.type}</p>;
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={onCancel}
        className="mb-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        &larr; Back to Data Sources
      </button>
      {renderContent()}
    </div>
  );
};

export default EditDataSourceView;
