import React, { useState } from 'react';
import DataSourceSelector from '../data-sources/DataSourceSelector';
import PostgresForm from '../data-sources/PostgresForm';
import MongoForm from '../data-sources/MongoForm';
import BigQueryForm from '../data-sources/BigQueryForm';

interface CreateDataSourceViewProps {
  onCancel: () => void;
}

const CreateDataSourceView: React.FC<CreateDataSourceViewProps> = ({ onCancel }) => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const handleSelectSource = (type: string) => {
    setSelectedSource(type);
  };

  const handleBack = () => {
    if (selectedSource) {
      setSelectedSource(null);
    } else {
      onCancel();
    }
  };

  const renderForm = () => {
    switch (selectedSource) {
      case 'postgres':
        return <PostgresForm onSaved={onCancel} />;
      case 'mongodb':
        return <MongoForm onSaved={onCancel} />;
      case 'bigquery':
        return <BigQueryForm onSaved={onCancel} />;
      default:
        return <DataSourceSelector onSelect={handleSelectSource} />;
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={handleBack}
        className="mb-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        &larr; Back
      </button>
      {renderForm()}
    </div>
  );
};

export default CreateDataSourceView;
