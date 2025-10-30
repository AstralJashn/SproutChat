import { X } from 'lucide-react';

interface PackingListProps {
  onClose: () => void;
}

export function PackingList({ onClose }: PackingListProps) {
  const essentialItems = [
    { category: 'Water & Food', items: ['Water (1 gallon per person per day)', 'Non-perishable food (3-day supply)', 'Manual can opener'] },
    { category: 'First Aid', items: ['First aid kit', 'Prescription medications', 'Personal hygiene items'] },
    { category: 'Tools & Supplies', items: ['Flashlight', 'Extra batteries', 'Multi-tool/knife', 'Duct tape'] },
    { category: 'Communication', items: ['Battery/hand-crank radio', 'Whistle', 'Cell phone with chargers'] },
    { category: 'Clothing & Shelter', items: ['Warm clothing', 'Rain gear', 'Emergency blanket', 'Sleeping bag'] },
    { category: 'Documents', items: ['Copies of important documents', 'Cash', 'Emergency contact list'] }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Emergency Packing List</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {essentialItems.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-lg font-semibold text-emerald-400">{section.category}</h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start space-x-2 text-gray-300">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-900/50">
          <p className="text-sm text-gray-400 text-center">
            Keep your emergency kit in an easily accessible location and check it regularly.
          </p>
        </div>
      </div>
    </div>
  );
}
