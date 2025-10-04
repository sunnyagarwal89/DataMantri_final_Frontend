import { useState } from 'react';
import { X, ChevronRight, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { FeatureProps } from './index';

interface DrilldownLevel {
  title: string;
  data: any[];
  query: string;
}

const Drilldown: React.FC<FeatureProps & {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onDrilldown?: (params: any) => Promise<any>;
}> = ({ isOpen, onClose, initialData, onDrilldown }) => {
  const [drilldownStack, setDrilldownStack] = useState<DrilldownLevel[]>([
    { title: 'Details', data: initialData ? [initialData] : [], query: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const currentLevel = drilldownStack[drilldownStack.length - 1];

  const handleDrillDeeper = async (item: any) => {
    if (onDrilldown) {
      setLoading(true);
      try {
        const result = await onDrilldown(item);
        setDrilldownStack([...drilldownStack, {
          title: `${item.name || item.label || 'Details'}`,
          data: result.rows || [],
          query: result.query || ''
        }]);
      } catch (error) {
        console.error('Drilldown error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoBack = () => {
    if (drilldownStack.length > 1) {
      setDrilldownStack(drilldownStack.slice(0, -1));
    }
  };

  const handleClose = () => {
    setDrilldownStack([drilldownStack[0]]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {drilldownStack.length > 1 && (
                <button
                  onClick={handleGoBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <DialogTitle>
                {drilldownStack.map((level, index) => (
                  <span key={index} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    {level.title}
                  </span>
                ))}
              </DialogTitle>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="mt-4">
            {currentLevel.data && currentLevel.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <tr>
                      {Object.keys(currentLevel.data[0]).map((key) => (
                        <th key={key} className="px-4 py-3 text-left text-sm font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentLevel.data.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition"
                        onClick={() => handleDrillDeeper(row)}
                      >
                        {Object.values(row).map((value: any, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-sm text-gray-900">
                            {value !== null && value !== undefined ? String(value) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No data available</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Drilldown;

