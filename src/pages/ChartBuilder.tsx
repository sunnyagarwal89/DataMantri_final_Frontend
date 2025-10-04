import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Plus } from 'lucide-react';

const ChartBuilder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chart Component Builder</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Chart
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Custom Chart Components
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Build reusable chart components with AI assistance.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartBuilder;