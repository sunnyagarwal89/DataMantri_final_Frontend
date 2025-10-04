import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { HelpCircle } from 'lucide-react';

const AppTopbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <span className="text-sm font-medium">DataMantri Dashboard</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
        
        {user && (
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout ({user.email})
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppTopbar;