import { ChevronDown, X,ChevronUp } from "lucide-react";
import React,{useState} from "react";

export default function SideBar ({isOpen, onClose}) {
    const [openSections, setOpenSections] = useState(['flavor', 'dietary']);

    const toggleSection = (section) => {
        setOpenSections(prev => 
            prev.includes(section)
            ? prev.filter(s => s != section)
            : [...prev, section]
        );
    };

    const flavorOptions = [
        {
            label: 'Trái cây', count:23
        },
        {
            label: 'Vị ngọt', count:42
        },
        {
            label:'Vị mặn', count:1
        },
        {
            label:'Cay',count:5
        },
        {
            label:'Chua',count:10
        },
        {
            label:'Thanh vị',count:4
        },
    ];

    const dietaryOptions = [
        {
            label: 'Ăn chay', count:35
        },
        {
            label: 'Thuần chay', count:42
        },
        {
            label:'Không gluten', count:1
        },
        {
            label:'Không sữa',count:5
        },
        {
            label:'Hữu cơ (Organic)',count:10
        },
    ];

    return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto
          w-72 lg:w-64 bg-white border-r border-gray-200
          transition-transform duration-300 z-50
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Flavor Section */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('flavor')}
              className="flex items-center justify-between w-full mb-4"
            >
              <h3 className="font-semibold text-gray-900">Flavor</h3>
              {openSections.includes('flavor') ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {openSections.includes('flavor') && (
              <div className="space-y-3">
                {flavorOptions.map((option) => (
                  <label key={option.label} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-[#0F172A] transition-colors">
                      {option.label}
                    </span>
                    <span className="text-sm text-gray-400 ml-auto">
                      ({option.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Dietary Section */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('dietary')}
              className="flex items-center justify-between w-full mb-4"
            >
              <h3 className="font-semibold text-gray-900">Dietary</h3>
              {openSections.includes('dietary') ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {openSections.includes('dietary') && (
              <div className="space-y-3">
                {dietaryOptions.map((option) => (
                  <label key={option.label} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-[#0F172A] transition-colors">
                      {option.label}
                    </span>
                    <span className="text-sm text-gray-400 ml-auto">
                      ({option.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Clear All Button */}
          <button className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Clear All Filters
          </button>
        </div>
      </aside>
    </>
  );
}