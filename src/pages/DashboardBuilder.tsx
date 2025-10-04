import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Brain, 
  ArrowLeft,
  Sparkles,
  Layers,
  Zap,
  Layout,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VisualDashboardBuilder from '@/components/VisualDashboardBuilder';
import AIDashboardBuilder from './AIDashboardBuilder';

interface DataMart {
  id: number;
  name: string;
  type: string;
  description: string;
}

interface Dashboard {
  id: string;
  title: string;
  description: string;
  spec: any;
  created_at: string;
  updated_at: string;
}

const DashboardBuilder = () => {
  const [selectedCreationType, setSelectedCreationType] = useState<string>('');
  const [dashboardName, setDashboardName] = useState('');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load dashboard for editing if edit parameter is present
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      loadDashboardForEdit(editId);
    }
  }, [searchParams]);

  const loadDashboardForEdit = async (dashboardId: string) => {
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const dashboard = await response.json();
        setEditingDashboard(dashboard);
        setDashboardName(dashboard.title);
        // Determine if it's visual or AI based on spec
        setSelectedCreationType('visual'); // Default to visual, can be enhanced
        setIsBuilderOpen(true);
      } else {
        toast({
          title: '❌ Error',
          description: 'Failed to load dashboard for editing',
          variant: 'destructive'
        });
        navigate('/all-dashboards');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load dashboard',
        variant: 'destructive'
      });
      navigate('/all-dashboards');
    }
  };

  const creationOptions = [
    {
      id: 'visual',
      title: 'Visual Builder',
      description: 'Drag and drop interface to build custom dashboards',
      icon: Layers,
      emoji: '🎨',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      features: ['Drag & Drop Charts', 'Custom SQL Queries', 'Theme Customization', 'Filter Configuration']
    },
    {
      id: 'ai',
      title: 'AI Builder',
      description: 'Generate dashboards using AI prompts',
      icon: Brain,
      emoji: '✨',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      features: ['Natural Language', 'Smart Suggestions', 'Auto-Layout', 'Instant Generation']
    }
  ];

  // If visual builder is selected and confirmed, show the full builder
  if (isBuilderOpen && selectedCreationType === 'visual') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="p-6 bg-white border-b shadow-sm flex items-center gap-4">
          <button
            onClick={() => {
              setIsBuilderOpen(false);
              setSelectedCreationType('');
              setDashboardName('');
            }}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Selection
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Visual Builder: {dashboardName}</h2>
            <p className="text-sm text-gray-600">Drag, drop, and configure your custom dashboard</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <VisualDashboardBuilder editingDashboard={editingDashboard} />
        </div>
      </div>
    );
  }

  // If AI builder is selected and confirmed, show the AI Dashboard Builder
  if (isBuilderOpen && selectedCreationType === 'ai') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="p-6 bg-white border-b shadow-sm flex items-center gap-4">
          <button
            onClick={() => {
              setIsBuilderOpen(false);
              setSelectedCreationType('');
              setDashboardName('');
            }}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Selection
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Builder: {dashboardName}</h2>
            <p className="text-sm text-gray-600">Generate dashboards using AI prompts</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AIDashboardBuilder />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
      {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Layout className="w-9 h-9 text-white" />
            </div>
      <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                Dashboard Builder
              </h1>
              <p className="text-gray-600 text-xl mt-1">Create stunning dashboards with AI or visual tools</p>
            </div>
          </div>
      </div>

      {/* Create New Dashboard Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-indigo-600" />
            Create New Dashboard
            </h2>
            <p className="text-gray-600 mt-2">Choose your preferred method to build your next great dashboard</p>
          </div>

          <div className="p-8">
          {/* Creation Type Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Select Creation Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creationOptions.map((option) => (
                  <button
                  key={option.id}
                    onClick={() => setSelectedCreationType(option.id)}
                    className={`text-left p-8 rounded-2xl border-3 transition-all duration-300 group ${
                      selectedCreationType === option.id
                        ? `border-${option.gradient.split(' ')[0].replace('from-', '')} bg-gradient-to-br ${option.bgGradient} shadow-2xl scale-105`
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-xl hover:scale-102'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center shadow-lg ${
                        selectedCreationType === option.id ? 'scale-110' : 'group-hover:scale-110'
                      } transition-transform duration-300`}>
                        <span className="text-4xl">{option.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{option.title}</h3>
                          {selectedCreationType === option.id && (
                            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                              ✓ SELECTED
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed">{option.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {option.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            selectedCreationType === option.id
                              ? 'bg-white text-indigo-700 shadow-md'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
              ))}
            </div>
          </div>

            {/* Dashboard Name Input */}
          {selectedCreationType && (
              <div className="space-y-6 border-t-2 border-gray-200 pt-8 animate-fade-in">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Dashboard Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your dashboard name..."
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none text-lg transition"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!dashboardName.trim()) {
                        toast({
                          title: "⚠️ Missing Name",
                          description: "Please enter a dashboard name to continue.",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      // Open builder inline (no navigation)
                      setIsBuilderOpen(true);
                    }}
                    disabled={!dashboardName.trim()}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 ${
                      dashboardName.trim()
                        ? selectedCreationType === 'visual'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-2xl hover:scale-105'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-2xl hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedCreationType === 'visual' ? (
                      <>
                        <Layers className="w-5 h-5" />
                        Open Visual Builder
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Open AI Builder
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
                    </div>
                  </div>

        {/* Feature Comparison */}
        {!selectedCreationType && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Feature Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Feature</th>
                    <th className="text-center py-4 px-4 font-bold text-purple-600">🎨 Visual Builder</th>
                    <th className="text-center py-4 px-4 font-bold text-blue-600">✨ AI Builder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-700">Setup Time</td>
                    <td className="text-center py-4 px-4 text-gray-600">Manual (5-15 min)</td>
                    <td className="text-center py-4 px-4 text-gray-600">Instant (30 sec)</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-700">Control Level</td>
                    <td className="text-center py-4 px-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">Full Control</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">AI Guided</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-700">SQL Knowledge</td>
                    <td className="text-center py-4 px-4 text-gray-600">Required</td>
                    <td className="text-center py-4 px-4 text-gray-600">Optional</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-700">Customization</td>
                    <td className="text-center py-4 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Unlimited</span>
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600">Template-based</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-700">Best For</td>
                    <td className="text-center py-4 px-4 text-gray-600">Complex, Custom Dashboards</td>
                    <td className="text-center py-4 px-4 text-gray-600">Quick Prototypes</td>
                  </tr>
                </tbody>
              </table>
                      </div>
                    </div>
                  )}
                  </div>
                  
      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default DashboardBuilder;
