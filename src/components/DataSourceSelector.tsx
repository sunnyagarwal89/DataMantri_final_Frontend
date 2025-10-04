import React from 'react';
import { DataSource } from '../utils/fileParser';

interface DataSourceSelectorProps {
  dataSources: DataSource[];
  onDataSourceSelect: (dataSourceId: string, tableName: string) => void;
  onDataSourceDelete: (dataSourceId: string) => void;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  dataSources,
  onDataSourceSelect,
  onDataSourceDelete
}) => {
  if (!Array.isArray(dataSources) || dataSources.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources available</h3>
        <p className="text-gray-600">Upload a CSV or Excel file to get started with creating dashboards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Available Data Sources</h2>
        <span className="text-sm text-gray-500">
          {Array.isArray(dataSources) ? dataSources.length : 0} data source{Array.isArray(dataSources) && dataSources.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dataSources.map((dataSource) => (
          <div key={dataSource.id} className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {dataSource.type === 'csv' ? (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{dataSource.name}</h3>
                    <p className="text-sm text-gray-500">
                      {dataSource.type.toUpperCase()} • {new Date(dataSource.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDataSourceDelete(dataSource.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Delete data source"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Available Tables:</h4>
                <div className="space-y-2">
                  {Object.entries(dataSource.tables).map(([tableName, tableInfo]) => (
                    <div key={tableName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{tableName}</span>
                          <span className="text-xs text-gray-500">
                            ({tableInfo.rowCount} rows × {tableInfo.columnCount} cols)
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Columns: {tableInfo.headers.slice(0, 5).join(', ')}
                          {Array.isArray(tableInfo.headers) && tableInfo.headers.length > 5 && `... (+${tableInfo.headers.length - 5} more)`}
                        </div>
                      </div>
                      <button
                        onClick={() => onDataSourceSelect(dataSource.id, tableName)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>File size: {(dataSource.fileSize / 1024).toFixed(1)} KB</span>
                  <span>Uploaded: {new Date(dataSource.uploadedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSourceSelector;
