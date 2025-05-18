
import { useState, useEffect } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageSize, MeasurementUnit } from '@/types/collage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnitConverter } from '@/lib/unit-converter';

interface PageSizeSelectorProps {
  pageSizes: PageSize[];
  selectedPageSize: PageSize;
  onSelect: (index: number) => void;
  onCustomSize: (width: number, height: number) => void;
  selectedUnit: MeasurementUnit;
  onUnitChange: (unit: MeasurementUnit) => void;
}

export function PageSizeSelector({
  pageSizes,
  selectedPageSize,
  onSelect,
  onCustomSize,
  selectedUnit,
  onUnitChange
}: PageSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  // Format dimensions according to selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleUnitChange = (unit: MeasurementUnit) => {
    onUnitChange(unit);
  };

  const handleCustomSizeSubmit = () => {
    try {
      // Parse the custom dimensions with their units
      const widthData = UnitConverter.parseDimensionString(customWidth);
      const heightData = UnitConverter.parseDimensionString(customHeight);
      
      // Convert to mm (internal working unit)
      const widthInMm = UnitConverter.convertToMm(widthData.value, widthData.unit);
      const heightInMm = UnitConverter.convertToMm(heightData.value, heightData.unit);
      
      if (widthInMm > 0 && heightInMm > 0) {
        onCustomSize(widthInMm, heightInMm);
        setIsCustom(false);
      }
    } catch (error) {
      console.error("Error parsing custom size:", error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Page Size</h2>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "px-2 h-8 text-xs",
              selectedUnit === 'mm' && "bg-muted"
            )}
            onClick={() => handleUnitChange('mm')}
          >
            mm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "px-2 h-8 text-xs",
              selectedUnit === 'cm' && "bg-muted"
            )}
            onClick={() => handleUnitChange('cm')}
          >
            cm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "px-2 h-8 text-xs",
              selectedUnit === 'in' && "bg-muted"
            )}
            onClick={() => handleUnitChange('in')}
          >
            in
          </Button>
        </div>
      </div>
      
      {isCustom ? (
        <div className="space-y-3 p-3 border rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="custom-width" className="text-xs">Width</Label>
              <Input
                id="custom-width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder={`e.g., 210mm, 21cm, 8.5in`}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="custom-height" className="text-xs">Height</Label>
              <Input
                id="custom-height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder={`e.g., 297mm, 29.7cm, 11in`}
                className="h-9"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustom(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCustomSizeSubmit}
            >
              Apply
            </Button>
          </div>
        </div>
      ) : (
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
                <li>
                  <button
                    type="button"
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-muted"
                    onClick={() => {
                      setIsOpen(false);
                      setIsCustom(true);
                    }}
                  >
                    <span className="flex-1 text-primary">Custom Size...</span>
                    <Edit2 className="w-4 h-4 text-primary" />
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-2 text-sm text-muted-foreground">
        <p>Selected size: {formatDimension(selectedPageSize.width)}×{formatDimension(selectedPageSize.height)}</p>
      </div>
    </div>
  );
}
