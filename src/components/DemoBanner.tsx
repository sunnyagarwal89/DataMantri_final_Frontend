import { AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DemoBanner() {
  return (
    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20 mb-4">
      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <span className="font-semibold">Demo Mode:</span> You're exploring DataMantri with mock data. 
        All features are fully functional, but data resets on page reload. 
        <a href="https://datamantri.com" className="underline ml-2 hover:text-blue-900 dark:hover:text-blue-100">
          Get Started with Real Data →
        </a>
      </AlertDescription>
    </Alert>
  );
}

export function DemoModeBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
      <Sparkles className="h-3 w-3" />
      <span>DEMO MODE</span>
    </div>
  );
}

