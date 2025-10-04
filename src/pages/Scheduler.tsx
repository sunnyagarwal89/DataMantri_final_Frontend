import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Mail, MessageSquare, Clock, Plus, Edit, Trash2, Play, Pause, TestTube2, Send, Phone, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Dashboard {
  id: string;
  title: string;
}

interface Scheduler {
  id: string;
  name: string;
  dashboard_id: string;
  dashboard_name?: string;
  delivery_method: string;
  recipients_email: string;
  recipients_mobile: string;
  subject: string;
  message: string;
  frequency: string;
  schedule_time: string;
  day_of_week?: number;
  day_of_month?: number;
  timezone: string;
  format_pdf: boolean;
  format_excel: boolean;
  format_inline: boolean;
  status: string;
  last_run?: string;
  next_run?: string;
  last_status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  active: number;
  paused: number;
  reports_sent_this_month: number;
}

const Scheduler = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [schedulers, setSchedulers] = useState<Scheduler[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, paused: 0, reports_sent_this_month: 0 });
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScheduler, setEditingScheduler] = useState<Scheduler | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dashboard_id: '',
    delivery_method: 'email',
    recipients_email: '',
    recipients_mobile: '',
    subject: '',
    message: '',
    frequency: 'daily',
    schedule_time: '09:00',
    day_of_week: 0,
    day_of_month: 1,
    timezone: 'UTC',
    format_pdf: true,
    format_excel: false,
    format_inline: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchDashboards();
    fetchSchedulers();
    fetchStats();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await fetch('/api/get-dashboards', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDashboards(data.dashboards || []);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    }
  };

  const fetchSchedulers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedulers', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSchedulers(data.schedulers || []);
      }
    } catch (error) {
      console.error('Error fetching schedulers:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to fetch schedulers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/schedulers/stats', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dashboard_id: '',
      delivery_method: 'email',
      recipients_email: '',
      recipients_mobile: '',
      subject: '',
      message: '',
      frequency: 'daily',
      schedule_time: '09:00',
      day_of_week: 0,
      day_of_month: 1,
      timezone: 'UTC',
      format_pdf: true,
      format_excel: false,
      format_inline: false,
    });
    setEditingScheduler(null);
  };

  const handleCreateScheduler = async () => {
    if (!formData.name || !formData.dashboard_id) {
      toast({
        title: '⚠️ Missing Information',
        description: 'Please fill in name and select a dashboard.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.delivery_method === 'email' && !formData.recipients_email) {
      toast({
        title: '⚠️ Missing Information',
        description: 'Please provide email recipients.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.delivery_method === 'whatsapp' && !formData.recipients_mobile) {
      toast({
        title: '⚠️ Missing Information',
        description: 'Please provide mobile numbers.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const url = editingScheduler ? `/api/schedulers/${editingScheduler.id}` : '/api/schedulers';
      const method = editingScheduler ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: '✅ Success',
          description: `Scheduler ${editingScheduler ? 'updated' : 'created'} successfully.`,
        });
        setIsDialogOpen(false);
        resetForm();
        fetchSchedulers();
        fetchStats();
      } else {
        const error = await response.json();
        toast({
          title: '❌ Error',
          description: error.error || 'Failed to save scheduler',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving scheduler:', error);
    toast({
        title: '❌ Error',
        description: 'Failed to save scheduler',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditScheduler = (scheduler: Scheduler) => {
    setEditingScheduler(scheduler);
    setFormData({
      name: scheduler.name,
      dashboard_id: scheduler.dashboard_id,
      delivery_method: scheduler.delivery_method,
      recipients_email: scheduler.recipients_email || '',
      recipients_mobile: scheduler.recipients_mobile || '',
      subject: scheduler.subject || '',
      message: scheduler.message || '',
      frequency: scheduler.frequency,
      schedule_time: scheduler.schedule_time || '09:00',
      day_of_week: scheduler.day_of_week || 0,
      day_of_month: scheduler.day_of_month || 1,
      timezone: scheduler.timezone || 'UTC',
      format_pdf: scheduler.format_pdf,
      format_excel: scheduler.format_excel,
      format_inline: scheduler.format_inline,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteScheduler = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduler?')) return;

    try {
      const response = await fetch(`/api/schedulers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: '✅ Success',
          description: 'Scheduler deleted successfully.',
        });
        fetchSchedulers();
        fetchStats();
      } else {
        toast({
          title: '❌ Error',
          description: 'Failed to delete scheduler',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting scheduler:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to delete scheduler',
        variant: 'destructive'
      });
    }
  };

  const handleToggleScheduler = async (id: string) => {
    try {
      const response = await fetch(`/api/schedulers/${id}/toggle`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '✅ Success',
          description: data.message,
        });
        fetchSchedulers();
        fetchStats();
    } else {
        toast({
          title: '❌ Error',
          description: 'Failed to toggle scheduler',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error toggling scheduler:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to toggle scheduler',
        variant: 'destructive'
      });
    }
  };

  const handleTestScheduler = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schedulers/${id}/test`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '✅ Test Successful',
          description: (
            <div className="space-y-1">
              <p>{data.message}</p>
              <div className="text-xs text-muted-foreground mt-2">
                <p>Dashboard: {data.test_details.dashboard_name}</p>
                <p>To: {data.test_details.recipients_email || data.test_details.recipients_mobile}</p>
              </div>
            </div>
          ),
        });
        fetchSchedulers();
      } else {
        const error = await response.json();
        toast({
          title: '❌ Test Failed',
          description: error.error || 'Failed to send test report',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error testing scheduler:', error);
    toast({
        title: '❌ Error',
        description: 'Failed to send test report',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <Phone className="h-4 w-4" />;
      case 'slack': return <MessageSquare className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getFrequencyText = (frequency: string, day_of_week?: number, day_of_month?: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return `Weekly on ${days[day_of_week || 0]}`;
      case 'monthly': return `Monthly on day ${day_of_month || 1}`;
      default: return frequency;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Scheduler
              </h1>
            </div>
            <p className="text-gray-600 text-lg ml-1">
              Automate dashboard delivery with custom schedules
          </p>
        </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
          <DialogTrigger asChild>
              <Button 
                className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-6 text-base shadow-lg"
              >
                <Plus className="h-5 w-5" />
              Create New Scheduler
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  {editingScheduler ? 'Edit Scheduler' : 'Create New Scheduler'}
                </DialogTitle>
              <DialogDescription>
                  Set up automated dashboard delivery with custom schedules
              </DialogDescription>
            </DialogHeader>
            
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold">Scheduler Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Weekly Sales Report"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-base"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="dashboard" className="text-base font-semibold">Select Dashboard *</Label>
                    <Select value={formData.dashboard_id} onValueChange={(value) => setFormData({ ...formData, dashboard_id: value })}>
                      <SelectTrigger className="text-base">
                    <SelectValue placeholder="Choose a dashboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboards.map((dashboard) => (
                      <SelectItem key={dashboard.id} value={dashboard.id}>
                            {dashboard.title}
                      </SelectItem>
                        ))}
                      </SelectContent>
                </Select>
                  </div>
              </div>

                {/* Delivery Method */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Delivery Method *</Label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'email', name: 'Email', icon: Mail },
                      { id: 'whatsapp', name: 'WhatsApp', icon: Phone },
                      { id: 'slack', name: 'Slack', icon: MessageSquare },
                    ].map((method) => (
                    <Card
                        key={method.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          formData.delivery_method === method.id ? 'ring-2 ring-purple-600 bg-purple-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData({ ...formData, delivery_method: method.id })}
                      >
                        <CardContent className="flex flex-col items-center justify-center p-6">
                          <method.icon className={`h-8 w-8 mb-2 ${formData.delivery_method === method.id ? 'text-purple-600' : 'text-gray-600'}`} />
                          <p className="text-sm font-semibold">{method.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

                {/* Recipients */}
                <div className="grid grid-cols-1 gap-4">
                  {formData.delivery_method === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="recipients-email" className="text-base font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Recipients *
                      </Label>
                      <Textarea
                        id="recipients-email"
                        placeholder="user1@company.com, user2@company.com"
                        value={formData.recipients_email}
                        onChange={(e) => setFormData({ ...formData, recipients_email: e.target.value })}
                        rows={2}
                        className="text-base"
                      />
                      <p className="text-sm text-muted-foreground">
                        Separate multiple email addresses with commas
                      </p>
                    </div>
                  )}
                  
                  {formData.delivery_method === 'whatsapp' && (
                    <div className="space-y-2">
                      <Label htmlFor="recipients-mobile" className="text-base font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Mobile Numbers *
                      </Label>
                      <Textarea
                        id="recipients-mobile"
                        placeholder="+1234567890, +0987654321"
                        value={formData.recipients_mobile}
                        onChange={(e) => setFormData({ ...formData, recipients_mobile: e.target.value })}
                        rows={2}
                        className="text-base"
                      />
                      <p className="text-sm text-muted-foreground">
                        Separate multiple numbers with commas (include country code)
                      </p>
                    </div>
                  )}

                  {formData.delivery_method === 'slack' && (
                    <div className="space-y-2">
                      <Label htmlFor="recipients-email" className="text-base font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Slack Channels / Users *
                      </Label>
                      <Textarea
                        id="recipients-email"
                        placeholder="#channel-name, @username"
                        value={formData.recipients_email}
                        onChange={(e) => setFormData({ ...formData, recipients_email: e.target.value })}
                        rows={2}
                        className="text-base"
                      />
                      <p className="text-sm text-muted-foreground">
                        Separate multiple channels/users with commas
                      </p>
                    </div>
                  )}
                </div>

                {/* Subject and Message */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base font-semibold">Subject</Label>
                  <Input
                    id="subject"
                      placeholder="Your Daily Report"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="text-base"
                  />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message" className="text-base font-semibold">Message</Label>
                  <Textarea
                      id="message"
                      placeholder="Here's your scheduled dashboard report..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                      className="text-base"
                  />
                </div>
              </div>

              {/* Schedule Settings */}
                <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-base font-semibold">Frequency *</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger className="text-base">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label htmlFor="day-of-week" className="text-base font-semibold">Day of Week</Label>
                      <Select value={formData.day_of_week.toString()} onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}>
                        <SelectTrigger className="text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Monday</SelectItem>
                          <SelectItem value="1">Tuesday</SelectItem>
                          <SelectItem value="2">Wednesday</SelectItem>
                          <SelectItem value="3">Thursday</SelectItem>
                          <SelectItem value="4">Friday</SelectItem>
                          <SelectItem value="5">Saturday</SelectItem>
                          <SelectItem value="6">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  )}
                  
                  {formData.frequency === 'monthly' && (
                    <div className="space-y-2">
                      <Label htmlFor="day-of-month" className="text-base font-semibold">Day of Month</Label>
                      <Input
                        id="day-of-month"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.day_of_month}
                        onChange={(e) => setFormData({ ...formData, day_of_month: parseInt(e.target.value) })}
                        className="text-base"
                      />
                    </div>
                  )}
                  
                <div className="space-y-2">
                    <Label htmlFor="time" className="text-base font-semibold">Time</Label>
                  <Input
                    id="time"
                    type="time"
                      value={formData.schedule_time}
                      onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                      className="text-base"
                  />
                </div>
              </div>

              {/* Delivery Format */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Delivery Format</Label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pdf"
                        checked={formData.format_pdf}
                        onCheckedChange={(checked) => setFormData({ ...formData, format_pdf: checked as boolean })}
                      />
                      <Label htmlFor="pdf" className="text-base cursor-pointer">PDF Attachment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="excel"
                        checked={formData.format_excel}
                        onCheckedChange={(checked) => setFormData({ ...formData, format_excel: checked as boolean })}
                      />
                      <Label htmlFor="excel" className="text-base cursor-pointer">Excel Export</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inline"
                        checked={formData.format_inline}
                        onCheckedChange={(checked) => setFormData({ ...formData, format_inline: checked as boolean })}
                    />
                      <Label htmlFor="inline" className="text-base cursor-pointer">Inline Content</Label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateScheduler} 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {loading ? 'Saving...' : editingScheduler ? 'Update Scheduler' : 'Create Scheduler'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Schedulers</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paused</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.paused}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Pause className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports This Month</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.reports_sent_this_month}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
      </div>

      {/* Schedulers List */}
      <div className="max-w-7xl mx-auto">
        <Card className="border-2 bg-white/80 backdrop-blur">
        <CardHeader>
            <CardTitle className="text-2xl">Active Schedulers</CardTitle>
          <CardDescription>Manage your automated report schedules</CardDescription>
        </CardHeader>
        <CardContent>
            {loading && schedulers.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading schedulers...</p>
              </div>
            ) : schedulers.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No schedulers created yet</p>
                <p className="text-gray-400 text-sm">Click "Create New Scheduler" to get started</p>
              </div>
            ) : (
          <div className="space-y-4">
                {schedulers.map((scheduler) => (
                  <div key={scheduler.id} className="flex items-center justify-between p-6 border-2 rounded-xl hover:shadow-md transition-all bg-white">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                          {getDeliveryIcon(scheduler.delivery_method)}
                          <span className="text-white text-xs"></span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{scheduler.name}</h3>
                          <p className="text-sm text-gray-600">{scheduler.dashboard_name || 'Dashboard'}</p>
                        </div>
                        <Badge 
                          variant={scheduler.status === 'active' ? 'default' : 'secondary'}
                          className={scheduler.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}
                        >
                      {scheduler.status}
                    </Badge>
                        {scheduler.last_status === 'success' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ✓ Success
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Frequency</p>
                          <p className="font-medium text-gray-900">
                            {getFrequencyText(scheduler.frequency, scheduler.day_of_week, scheduler.day_of_month)} at {scheduler.schedule_time}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Recipients</p>
                          <p className="font-medium text-gray-900 truncate" title={scheduler.recipients_email || scheduler.recipients_mobile}>
                            {(scheduler.recipients_email || scheduler.recipients_mobile || '').split(',')[0]}
                            {(scheduler.recipients_email || scheduler.recipients_mobile || '').split(',').length > 1 && 
                              ` +${(scheduler.recipients_email || scheduler.recipients_mobile || '').split(',').length - 1}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Run</p>
                          <p className="font-medium text-gray-900">{formatTime(scheduler.last_run)}</p>
                  </div>
                        <div>
                          <p className="text-gray-500">Next Run</p>
                          <p className="font-medium text-purple-600">{formatTime(scheduler.next_run)}</p>
                  </div>
                  </div>
                </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleTestScheduler(scheduler.id)}
                        title="Test Scheduler"
                      >
                        <TestTube2 className="h-4 w-4" />
                        Test
                      </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                        onClick={() => handleToggleScheduler(scheduler.id)}
                        title={scheduler.status === 'active' ? 'Pause' : 'Resume'}
                  >
                    {scheduler.status === 'active' ? (
                          <Pause className="h-4 w-4 text-yellow-600" />
                    ) : (
                          <Play className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditScheduler(scheduler)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteScheduler(scheduler.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
            )}
        </CardContent>
      </Card>
          </div>
    </div>
  );
};

export default Scheduler;
