import { useState } from "react";
import { Check, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LayoutPreset,
  MeasurementUnit,
  SpaceOptimization,
} from "@/types/collage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnitConverter } from "@/lib/unit-converter";

interface LayoutSelectorProps {
  layouts: LayoutPreset[];
  selectedLayout: LayoutPreset;
  onSelect: (index: number) => void;
  onCustomLayout: (cellWidth: number, cellHeight: number) => void;
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
  cellCount,
}: LayoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  // Format dimensions according to selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleCustomLayoutSubmit = () => {
    try {
      // Parse the custom dimensions with their units
      const widthData = UnitConverter.parseDimensionString(customWidth);
      const heightData = UnitConverter.parseDimensionString(customHeight);

      // Convert to mm (internal working unit)
      const widthInMm = UnitConverter.convertToMm(
        widthData.value,
        widthData.unit
      );
      const heightInMm = UnitConverter.convertToMm(
        heightData.value,
        heightData.unit
      );

      if (widthInMm > 0 && heightInMm > 0) {
        onCustomLayout(widthInMm, heightInMm);
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
              <Label htmlFor="custom-cell-width" className="text-xs">
                Width
              </Label>
              <Input
                id="custom-cell-width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder={`e.g., 50mm, 5cm, 2in`}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="custom-cell-height" className="text-xs">
                Height
              </Label>
              <Input
                id="custom-cell-height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder={`e.g., 70mm, 7cm, 3in`}
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
            <Button size="sm" onClick={handleCustomLayoutSubmit}>
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Select
            value={selectedLayout.name}
            onValueChange={(value) => {
              if (value === "custom") {
                setIsCustom(true);
              } else {
                const layoutIndex = layouts.findIndex(
                  (layout) => layout.name === value
                );
                if (layoutIndex !== -1) {
                  onSelect(layoutIndex);
                }
                setIsCustom(false);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a photo size" />
            </SelectTrigger>
            <SelectContent>
              {layouts.map((layout, index) => (
                <SelectItem key={layout.name} value={layout.name}>
                  {layout.name} ({formatDimension(layout.cellWidth)} x{" "}
                  {formatDimension(layout.cellHeight)})
                </SelectItem>
              ))}
              <SelectItem value="custom">
                <div className="flex items-center">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Custom Size
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>
            Unit size: {formatDimension(selectedLayout.cellWidth)}×
            {formatDimension(selectedLayout.cellHeight)}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <Label htmlFor="fitType" className="text-sm">
              Photo Arrangement
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              {spaceOptimization === "loose"
                ? "Loose Fit: Consistent orientation"
                : "Tight Fit: Mixed orientations"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="fit-toggle" className="text-xs">
              Loose
            </Label>
            <Switch
              id="fit-toggle"
              checked={spaceOptimization === "tight"}
              onCheckedChange={(checked) =>
                onSpaceOptimizationChange(checked ? "tight" : "loose")
              }
            />
            <Label htmlFor="fit-toggle" className="text-xs">
              Tight
            </Label>
          </div>
        </div>

        <div className="bg-muted/30 rounded-md p-2 text-sm">
          <p>
            Estimated layout: <strong>{cellCount}</strong> photo cells
          </p>
        </div>
      </div>
    </div>
  );
}
