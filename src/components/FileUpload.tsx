import React, { useState, useRef } from 'react';
import { FileParser, DataSource, DataSourceManager } from '../utils';

interface FileUploadProps {
  onDataSourceAdded: (dataSource: DataSource) => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataSourceAdded, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['csv', 'xls', 'xlsx'];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      onError('Please upload a CSV or Excel file (.csv, .xls, .xlsx)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const parsedData = await FileParser.parseFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      const dataSourceManager = new DataSourceManager();
      const dataSource = dataSourceManager.addDataSource(file, parsedData);

      onDataSourceAdded(dataSource);

      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Small delay to show 100% progress
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      onError(error instanceof Error ? error.message : 'Failed to parse file');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      // Create a synthetic event to reuse the file handling logic
      const syntheticEvent = {
        target: { files: [file] },
        currentTarget: { files: [file] },
        preventDefault: () => {},
        stopPropagation: () => {},
        nativeEvent: new Event('change'),
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        timeStamp: Date.now(),
        type: 'change',
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: () => {}
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleFileSelect(syntheticEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isUploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 cursor-pointer'
          }
        `}
        onClick={!isUploading ? triggerFileInput : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Processing file...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-xl font-medium text-gray-900 mb-2">
                Upload your data file
              </p>
              <p className="text-gray-600">
                Drag and drop your CSV or Excel file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: .csv, .xls, .xlsx (max 10MB)
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-1">Supported formats:</p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>CSV</strong>: Comma-separated values with headers</li>
          <li>• <strong>Excel</strong>: .xls and .xlsx files with multiple sheets</li>
          <li>• <strong>Size limit</strong>: 10MB maximum file size</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
