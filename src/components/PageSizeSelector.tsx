
import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageSize } from '@/types/collage';

interface PageSizeSelectorProps {
  pageSizes: PageSize[];
  selectedPageSize: PageSize;
  onSelect: (index: number) => void;
}

export function PageSizeSelector({ pageSizes, selectedPageSize, onSelect }: PageSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Page Size</h2>
      
      <div className="relative">
        <button
          type="button"
          className="flex items-center justify-between w-full p-3 bg-white border rounded-lg shadow-sm hover:bg-muted"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedPageSize.label}</span>
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
              {pageSizes.map((size, index) => (
                <li key={size.name}>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center w-full px-4 py-2 text-left hover:bg-muted",
                      selectedPageSize.name === size.name && "bg-primary/10"
                    )}
                    onClick={() => {
                      onSelect(index);
                      setIsOpen(false);
                    }}
                  >
                    <span className="flex-1">{size.label}</span>
                    {selectedPageSize.name === size.name && <Check className="w-4 h-4 text-primary" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-sm text-muted-foreground">
        <p>Selected size: {selectedPageSize.width}×{selectedPageSize.height}mm</p>
      </div>
    </div>
  );
}
