import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PostgresFormProps {
  existingData?: any;
  onSaved: () => void;
}

const PostgresForm: React.FC<PostgresFormProps> = ({ existingData, onSaved }) => {
  const { toast } = useToast();
  const isEditing = !!existingData;

  const [name, setName] = useState(existingData?.name || '');
  const [host, setHost] = useState(existingData?.connection_params?.host || '');
  const [port, setPort] = useState(existingData?.connection_params?.port?.toString() || '5432');
  const [user, setUser] = useState(existingData?.connection_params?.user || '');
  const [password, setPassword] = useState(existingData?.connection_params?.password || '');
  const [database, setDatabase] = useState(existingData?.connection_params?.database || '');

  const handleTestConnection = async () => {
    const payload = {
      type: 'postgres',
      connection_params: { host, port: parseInt(port, 10), user, password, database },
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
          description: 'Connection test successful.',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: result.message || 'Unable to connect to the database.',
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
      type: 'postgres',
      connection_params: { host, port: parseInt(port, 10), user, password, database },
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
          description: `Data source ${isEditing ? 'updated' : 'saved'} successfully.`,
        });
        onSaved();
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
      <h1 className="text-2xl font-bold mb-4">{isEditing ? 'Edit' : 'Connect to'} PostgreSQL</h1>
      <form className="space-y-4">
        {/* Form inputs are correct */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Connection Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., My Production DB"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Host</label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., localhost"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Port</label>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="5432"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., postgres"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Database</label>
          <input
            type="text"
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., mydatabase"
          />
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

export default PostgresForm;
