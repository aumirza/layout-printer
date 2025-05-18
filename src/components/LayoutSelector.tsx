
import { useState } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LayoutPreset, MeasurementUnit, SpaceOptimization } from '@/types/collage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UnitConverter } from '@/lib/unit-converter';

interface LayoutSelectorProps {
  layouts: LayoutPreset[];
  selectedLayout: LayoutPreset;
  onSelect: (index: number) => void;
  onCustomLayout: (cellWidth: number, cellHeight: number, margin: number) => void;
  selectedUnit: MeasurementUnit;
  spaceOptimization: SpaceOptimization;
  onSpaceOptimizationChange: (value: SpaceOptimization) => void;
  cellCount: number;
}

export function LayoutSelector({
  layouts,
  selectedLayout,
  onSelect,
  onCustomLayout,
  selectedUnit,
  spaceOptimization,
  onSpaceOptimizationChange,
  cellCount
}: LayoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [customMargin, setCustomMargin] = useState("");

  // Format dimensions according to selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleCustomLayoutSubmit = () => {
    try {
      // Parse the custom dimensions with their units
      const widthData = UnitConverter.parseDimensionString(customWidth);
      const heightData = UnitConverter.parseDimensionString(customHeight);
      const marginData = UnitConverter.parseDimensionString(customMargin);
      
      // Convert to mm (internal working unit)
      const widthInMm = UnitConverter.convertToMm(widthData.value, widthData.unit);
      const heightInMm = UnitConverter.convertToMm(heightData.value, heightData.unit);
      const marginInMm = UnitConverter.convertToMm(marginData.value, marginData.unit);
      
      if (widthInMm > 0 && heightInMm > 0 && marginInMm >= 0) {
        onCustomLayout(widthInMm, heightInMm, marginInMm);
        setIsCustom(false);
      }
    } catch (error) {
      console.error("Error parsing custom layout:", error);
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Photo Size</h2>
      
      {isCustom ? (
        <div className="space-y-3 p-3 border rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="custom-cell-width" className="text-xs">Width</Label>
              <Input
                id="custom-cell-width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder={`e.g., 50mm, 5cm, 2in`}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="custom-cell-height" className="text-xs">Height</Label>
              <Input
                id="custom-cell-height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder={`e.g., 70mm, 7cm, 3in`}
                className="h-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="custom-margin" className="text-xs">Margin</Label>
            <Input
              id="custom-margin"
              value={customMargin}
              onChange={(e) => setCustomMargin(e.target.value)}
              placeholder={`e.g., 5mm, 0.5cm, 0.2in`}
              className="h-9"
            />
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
              onClick={handleCustomLayoutSubmit}
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
      
      <div className="mt-4 space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>Unit size: {formatDimension(selectedLayout.cellWidth)}×{formatDimension(selectedLayout.cellHeight)}</p>
          <p>Margin: {formatDimension(selectedLayout.margin)}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <Label htmlFor="fitType" className="text-sm">Photo Arrangement</Label>
            <p className="text-xs text-muted-foreground mt-1">
              {spaceOptimization === 'loose' 
                ? 'Loose Fit: Consistent orientation'
                : 'Tight Fit: Mixed orientations'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="fit-toggle" className="text-xs">Loose</Label>
            <Switch 
              id="fit-toggle" 
              checked={spaceOptimization === 'tight'} 
              onCheckedChange={(checked) => onSpaceOptimizationChange(checked ? 'tight' : 'loose')}
            />
            <Label htmlFor="fit-toggle" className="text-xs">Tight</Label>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-md p-2 text-sm">
          <p>Estimated layout: <strong>{cellCount}</strong> photo cells</p>
        </div>
      </div>
    </div>
  );
}
