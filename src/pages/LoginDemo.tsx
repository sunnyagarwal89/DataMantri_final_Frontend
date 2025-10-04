/**
 * Demo Login Page - Works without backend
 * Auto-redirects to dashboard
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginDemo() {
  const navigate = useNavigate();

  useEffect(() => {
    // Store demo user in localStorage
    const demoUser = {
      id: 1,
      email: 'demo@datamantri.com',
      name: 'Demo User',
      role: 'admin'
    };

    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'demo-token-' + Date.now());
    
    // Redirect to dashboard after 2 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">DM</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to DataMantri</CardTitle>
          <CardDescription className="text-base mt-2">
            🎭 Demo Mode - Loading your dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 text-center">
            Logging you in as <strong>Demo User</strong>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Skip to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

