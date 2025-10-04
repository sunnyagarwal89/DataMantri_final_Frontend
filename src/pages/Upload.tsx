import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload as UploadIcon, FileText, Database, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadHistory = [
    { id: 1, filename: 'sales_data_q4.csv', size: '2.3 MB', status: 'completed', timestamp: '2 hours ago', records: 15420 },
    { id: 2, filename: 'customer_analytics.xlsx', size: '5.1 MB', status: 'processing', timestamp: '30 minutes ago', records: 8750 },
    { id: 3, filename: 'marketing_metrics.json', size: '1.8 MB', status: 'failed', timestamp: '1 hour ago', records: 0 },
    { id: 4, filename: 'financial_report.csv', size: '3.7 MB', status: 'completed', timestamp: '1 day ago', records: 22100 },
  ];

  const supportedFormats = [
    { format: 'CSV', description: 'Comma-separated values', icon: FileText },
    { format: 'Excel', description: '.xlsx and .xls files', icon: FileText },
    { format: 'JSON', description: 'JavaScript Object Notation', icon: Database },
    { format: 'SQL', description: 'Database dump files', icon: Database },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload Complete",
            description: `${file.name} has been uploaded successfully.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
    } as const;
    return variants[status as keyof typeof variants] || 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Upload Utility</h1>
        <p className="text-muted-foreground">
          Upload and manage your data files for analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Upload New File
            </CardTitle>
            <CardDescription>
              Drag and drop files or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* File Drop Zone */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop files here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".csv,.xlsx,.xls,.json,.sql"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* File Size Limits */}
              <div className="text-sm text-muted-foreground">
                <p>Maximum file size: 100 MB</p>
                <p>Supported formats: CSV, Excel, JSON, SQL</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supported Formats */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Formats</CardTitle>
            <CardDescription>File types you can upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supportedFormats.map((format) => (
                <div key={format.format} className="flex items-center gap-3 p-3 border rounded-lg">
                  <format.icon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{format.format}</p>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>Recent file uploads and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uploadHistory.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(upload.status)}
                  <div>
                    <p className="font-medium">{upload.filename}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{upload.size}</span>
                      <span>{upload.timestamp}</span>
                      {upload.records > 0 && <span>{upload.records.toLocaleString()} records</span>}
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusBadge(upload.status)}>
                  {upload.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;