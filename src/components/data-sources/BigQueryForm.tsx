import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BigQueryFormProps {
  existingData?: any;
  onSaved?: () => void;
}

const BigQueryForm: React.FC<BigQueryFormProps> = ({ existingData, onSaved }) => {
  const { toast } = useToast();
  const isEditing = !!existingData;

  const [name, setName] = useState(existingData?.name || '');
  const [projectId, setProjectId] = useState(existingData?.details?.project_id || '');
  const [credentials, setCredentials] = useState(existingData?.details?.credentials || '');

  const handleTestConnection = async () => {
    const payload = {
      type: 'bigquery',
      details: { project_id: projectId, credentials },
    };

    try {
      const response = await fetch('/api/data-sources/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'BigQuery connection test successful.',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: result.message || 'Unable to connect to BigQuery.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while testing the connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveConnection = async () => {
    const payload = {
      name,
      type: 'bigquery',
      details: { project_id: projectId, credentials },
    };

    const url = isEditing ? `/api/data-sources/${existingData.id}` : '/api/data-sources';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: `BigQuery data source ${isEditing ? 'updated' : 'saved'} successfully.`,
        });
        if (onSaved) onSaved();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while saving.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{isEditing ? 'Edit' : 'Connect to'} Google BigQuery</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Connection Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., My BigQuery Project"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Project ID</label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., my-gcp-project-123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Account Credentials (JSON)</label>
          <textarea
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", ...}'
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste your Google Cloud service account JSON credentials here
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Test Connection
          </button>
          <button
            type="button"
            onClick={handleSaveConnection}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? 'Update' : 'Save'} Connection
          </button>
        </div>
      </form>
    </div>
  );
};

export default BigQueryForm;
