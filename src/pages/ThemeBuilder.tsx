import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Palette, Plus, Pencil, Trash2 } from 'lucide-react';

const ThemeDialog = ({ theme, onSave, onCancel }: { theme?: any; onSave: (data: any) => void; onCancel: () => void; }) => {
  const [name, setName] = useState('');
  const [styles, setStyles] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (theme) {
      setName(theme.name);
      setStyles(JSON.stringify(theme.styles, null, 2));
    } else {
      setName('');
      setStyles('');
    }
  }, [theme]);

  const handleSave = () => {
    let parsedStyles;
    try {
      parsedStyles = JSON.parse(styles);
      setError('');
    } catch (e) {
      setError('Invalid JSON format for styles.');
      return;
    }
    onSave({ id: theme?.id, name, styles: parsedStyles });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{theme ? 'Edit Theme' : 'Create Theme'}</DialogTitle>
        <DialogDescription>Define the name and styles for the theme.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Theme Name</label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Dark Mode" />
        </div>
        <div>
          <label htmlFor="styles" className="block text-sm font-medium text-gray-700 mb-1">Styles (JSON)</label>
          <Textarea id="styles" value={styles} onChange={(e) => setStyles(e.target.value)} rows={12} placeholder='{\n  "backgroundColor": "#000000",\n  "textColor": "#FFFFFF"\n}' />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>{theme ? 'Update' : 'Create'}</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ThemeBuilder = () => {
  const { toast } = useToast();
  const [themes, setThemes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any | null>(null);

  const fetchThemes = () => {
    fetch('/api/themes', { credentials: 'include' })
      .then(res => res.json())
      .then(setThemes)
      .catch(() => toast({ title: 'Error', description: 'Failed to fetch themes.', variant: 'destructive' }));
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleSaveTheme = async (data: any) => {
    const { id, ...payload } = data;
    const url = id ? `/api/themes/${id}` : '/api/themes';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        toast({ title: 'Success', description: `Theme ${id ? 'updated' : 'created'} successfully.` });
        fetchThemes();
        setIsDialogOpen(false);
        setEditingTheme(null);
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to save theme.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  const handleDeleteTheme = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this theme?')) return;

    try {
      const response = await fetch(`/api/themes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Theme deleted successfully.' });
        fetchThemes();
      } else {
        const result = await response.json();
        toast({ title: 'Error', description: result.message || 'Failed to delete theme.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Palette /> Theme Builder</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingTheme(null)}>
              <Plus className="h-4 w-4" />
              Create Theme
            </Button>
          </DialogTrigger>
          <ThemeDialog 
            theme={editingTheme}
            onSave={handleSaveTheme} 
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingTheme(null);
            }}
          />
        </Dialog>
      </div>
      <div className="bg-white shadow-md rounded-lg">
        {themes.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {themes.map(theme => (
              <li key={theme.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{theme.name}</p>
                  <p className="text-sm text-gray-500">Updated: {new Date(theme.updated_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingTheme(theme); setIsDialogOpen(true); }}>
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTheme(theme.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center">
            <p>No themes created yet. Click 'Create Theme' to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeBuilder;