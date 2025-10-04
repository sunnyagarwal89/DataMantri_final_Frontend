import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  Shield,
  Key,
  Edit,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserInfo {
  username: string;
  host: string;
  privileges: string[];
  databases: string[];
  lastLogin: string;
  status: 'active' | 'locked' | 'expired';
}

interface PrivilegeInfo {
  name: string;
  description: string;
  category: 'global' | 'database' | 'table';
}

interface UserPrivilegeSectionProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const UserPrivilegeSection: React.FC<UserPrivilegeSectionProps> = ({ connectionStatus }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showEditPrivilegesDialog, setShowEditPrivilegesDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    password: '',
    host: '%',
    privileges: [] as string[]
  });

  const availablePrivileges: PrivilegeInfo[] = [
    { name: 'SELECT', description: 'Read data from tables', category: 'table' },
    { name: 'INSERT', description: 'Insert new rows into tables', category: 'table' },
    { name: 'UPDATE', description: 'Modify existing rows in tables', category: 'table' },
    { name: 'DELETE', description: 'Remove rows from tables', category: 'table' },
    { name: 'CREATE', description: 'Create databases and tables', category: 'database' },
    { name: 'DROP', description: 'Delete databases and tables', category: 'database' },
    { name: 'ALTER', description: 'Modify table structure', category: 'table' },
    { name: 'INDEX', description: 'Create and drop indexes', category: 'table' },
    { name: 'GRANT', description: 'Grant privileges to other users', category: 'global' },
    { name: 'SUPER', description: 'Administrative privileges', category: 'global' },
    { name: 'PROCESS', description: 'View running processes', category: 'global' },
    { name: 'RELOAD', description: 'Reload server settings', category: 'global' }
  ];

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchUsers();
    }
  }, [connectionStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock user data
      const mockUsers: UserInfo[] = [
        {
          username: 'admin',
          host: 'localhost',
          privileges: ['ALL PRIVILEGES'],
          databases: ['*'],
          lastLogin: '2024-03-20 14:30:00',
          status: 'active'
        },
        {
          username: 'dataviz_user',
          host: '%',
          privileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
          databases: ['dataviz_main'],
          lastLogin: '2024-03-20 12:15:30',
          status: 'active'
        },
        {
          username: 'readonly_user',
          host: '192.168.1.%',
          privileges: ['SELECT'],
          databases: ['dataviz_main', 'analytics_db'],
          lastLogin: '2024-03-19 16:45:22',
          status: 'active'
        },
        {
          username: 'backup_user',
          host: 'localhost',
          privileges: ['SELECT', 'LOCK TABLES', 'SHOW VIEW'],
          databases: ['*'],
          lastLogin: '2024-03-18 02:00:00',
          status: 'locked'
        }
      ];
      
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 800);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!createUserForm.username.trim() || !createUserForm.password.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Username and password are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/database/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createUserForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `User "${createUserForm.username}" created successfully`
        });
        setShowCreateUserDialog(false);
        setCreateUserForm({ username: '', password: '', host: '%', privileges: [] });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive'
      });
    }
  };

  const deleteUser = async (username: string, host: string) => {
    if (username === 'admin') {
      toast({
        title: 'Error',
        description: 'Cannot delete admin user',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${username}@${host}"?`)) return;

    try {
      const response = await fetch(`/api/database/user/${username}/${host}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `User "${username}@${host}" deleted successfully`
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const toggleUserStatus = async (username: string, host: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    
    try {
      const response = await fetch(`/api/database/user/${username}/${host}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `User ${newStatus === 'active' ? 'unlocked' : 'locked'} successfully`
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  const updateUserPrivileges = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/database/user/${selectedUser.username}/${selectedUser.host}/privileges`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ privileges: selectedUser.privileges })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User privileges updated successfully'
        });
        setShowEditPrivilegesDialog(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user privileges',
        variant: 'destructive'
      });
    }
  };

  const handlePrivilegeToggle = (privilege: string, isCreateForm: boolean = false) => {
    if (isCreateForm) {
      const newPrivileges = createUserForm.privileges.includes(privilege)
        ? createUserForm.privileges.filter(p => p !== privilege)
        : [...createUserForm.privileges, privilege];
      setCreateUserForm({ ...createUserForm, privileges: newPrivileges });
    } else if (selectedUser) {
      const newPrivileges = selectedUser.privileges.includes(privilege)
        ? selectedUser.privileges.filter(p => p !== privilege)
        : [...selectedUser.privileges, privilege];
      setSelectedUser({ ...selectedUser, privileges: newPrivileges });
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'locked':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {connectionStatus === 'connecting' ? 'Connecting to database server...' : 'Not connected to database server'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new database user with specific privileges
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={createUserForm.username}
                    onChange={(e) => setCreateUserForm({...createUserForm, username: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="% for any host"
                  value={createUserForm.host}
                  onChange={(e) => setCreateUserForm({...createUserForm, host: e.target.value})}
                />
              </div>

              <div>
                <Label>Privileges</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                  {availablePrivileges.map((privilege) => (
                    <div key={privilege.name} className="flex items-start space-x-2">
                      <Checkbox
                        id={`create-priv-${privilege.name}`}
                        checked={createUserForm.privileges.includes(privilege.name)}
                        onCheckedChange={() => handlePrivilegeToggle(privilege.name, true)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`create-priv-${privilege.name}`} className="text-sm font-medium">
                          {privilege.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{privilege.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={createUser} className="w-full">
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredUsers.map((user) => (
            <Card key={`${user.username}@${user.host}`} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="truncate">{user.username}@{user.host}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(user.status)}
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Privileges:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.privileges.slice(0, 3).map((privilege) => (
                        <Badge key={privilege} variant="outline" className="text-xs">
                          {privilege}
                        </Badge>
                      ))}
                      {user.privileges.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.privileges.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Databases:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.databases.slice(0, 2).map((db) => (
                        <Badge key={db} variant="secondary" className="text-xs">
                          {db}
                        </Badge>
                      ))}
                      {user.databases.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.databases.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditPrivilegesDialog(true);
                      }}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Privileges
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleUserStatus(user.username, user.host, user.status)}
                      className={user.status === 'active' ? 'text-orange-600 hover:text-orange-600' : 'text-green-600 hover:text-green-600'}
                    >
                      {user.status === 'active' ? 'Lock' : 'Unlock'}
                    </Button>
                    {user.username !== 'admin' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteUser(user.username, user.host)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No users match your search' : 'No users found'}
          </p>
        </div>
      )}

      {/* Edit Privileges Dialog */}
      <Dialog open={showEditPrivilegesDialog} onOpenChange={setShowEditPrivilegesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Privileges</DialogTitle>
            <DialogDescription>
              Modify privileges for {selectedUser?.username}@{selectedUser?.host}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Current Privileges</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                  {availablePrivileges.map((privilege) => (
                    <div key={privilege.name} className="flex items-start space-x-2">
                      <Checkbox
                        id={`edit-priv-${privilege.name}`}
                        checked={selectedUser.privileges.includes(privilege.name)}
                        onCheckedChange={() => handlePrivilegeToggle(privilege.name, false)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`edit-priv-${privilege.name}`} className="text-sm font-medium">
                          {privilege.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{privilege.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={updateUserPrivileges} className="w-full">
                Update Privileges
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPrivilegeSection;
