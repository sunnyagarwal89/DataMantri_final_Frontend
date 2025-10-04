import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardProps {
  template?: any;
  data?: any;
  onComponentUpdate?: any;
}

const Dashboard: React.FC<DashboardProps> = () => {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Dashboard Component</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription>
            Dashboard component is temporarily simplified to prevent errors.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
