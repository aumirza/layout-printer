
import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LayoutPreset } from '@/types/collage';

interface LayoutSelectorProps {
  layouts: LayoutPreset[];
  selectedLayout: LayoutPreset;
  onSelect: (index: number) => void;
}

export function LayoutSelector({ layouts, selectedLayout, onSelect }: LayoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Layout</h2>
      
      <div className="relative">
        <button
          type="button"
          className="flex items-center justify-between w-full p-3 bg-white border rounded-lg shadow-sm hover:bg-muted"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedLayout.label}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            <ul className="py-1">
              {layouts.map((layout, index) => (
                <li key={layout.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center w-full px-4 py-2 text-left hover:bg-muted",
                      selectedLayout.id === layout.id && "bg-primary/10"
                    )}
                    onClick={() => {
                      onSelect(index);
                      setIsOpen(false);
                    }}
                  >
                    <span className="flex-1">{layout.label}</span>
                    {selectedLayout.id === layout.id && <Check className="w-4 h-4 text-primary" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-sm text-muted-foreground">
        <p>Grid size: {selectedLayout.columns}×{selectedLayout.rows} ({selectedLayout.columns * selectedLayout.rows} cells)</p>
        <p>Cell size: {selectedLayout.cellWidth.toFixed(1)}×{selectedLayout.cellHeight.toFixed(1)}mm</p>
      </div>
    </div>
  );
}
