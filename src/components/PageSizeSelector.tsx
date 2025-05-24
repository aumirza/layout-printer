import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageSize, MeasurementUnit } from "@/types/collage";
import { Button } from "@/components/ui/button";
import { UnitConverter } from "@/lib/unit-converter";
import { PresetSelector } from "@/components/ui/preset-selector";
import { CustomPresetDialog } from "@/components/ui/custom-preset-dialog";
import {
  CustomPresetStorage,
  CustomPageSize,
} from "@/lib/custom-preset-storage";

interface PageSizeSelectorProps {
  pageSizes: PageSize[];
  selectedPageSize: PageSize;
  onSelect: (index: number) => void;
  onCustomSize: (width: number, height: number, margin: number) => void;
  selectedUnit: MeasurementUnit;
  onUnitChange: (unit: MeasurementUnit) => void;
}

export function PageSizeSelector({
  pageSizes,
  selectedPageSize,
  onSelect,
  onCustomSize,
  selectedUnit,
  onUnitChange,
}: PageSizeSelectorProps) {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [allPageSizes, setAllPageSizes] = useState<
    (PageSize | CustomPageSize)[]
  >([]);

  // Load all page sizes (default + custom) on component mount
  useEffect(() => {
    const loadAllPageSizes = () => {
      const customSizes = CustomPresetStorage.getCustomPageSizes();
      setAllPageSizes([...pageSizes, ...customSizes]);
    };

    loadAllPageSizes();

    // Listen for storage changes to update custom presets
    const handleStorageChange = () => loadAllPageSizes();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [pageSizes]);

  // Format dimensions according to selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleUnitChange = (unit: MeasurementUnit) => {
    onUnitChange(unit);
  };

  const handleCustomPresetSave = (data: {
    width: number;
    height: number;
    margin: number;
    name: string;
    saveAsPreset: boolean;
  }) => {
    // Apply the custom size immediately
    onCustomSize(data.width, data.height, data.margin);

    // Save as preset if requested
    if (data.saveAsPreset) {
      const customPageSize = CustomPresetStorage.saveCustomPageSize({
        name: data.name,
        width: data.width,
        height: data.height,
        margin: data.margin,
        label: data.name,
      });

      // Refresh the list
      const customSizes = CustomPresetStorage.getCustomPageSizes();
      setAllPageSizes([...pageSizes, ...customSizes]);
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
              selectedUnit === "mm" && "bg-muted"
            )}
            onClick={() => handleUnitChange("mm")}
          >
            mm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "px-2 h-8 text-xs",
              selectedUnit === "cm" && "bg-muted"
            )}
            onClick={() => handleUnitChange("cm")}
          >
            cm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "px-2 h-8 text-xs",
              selectedUnit === "in" && "bg-muted"
            )}
            onClick={() => handleUnitChange("in")}
          >
            in
          </Button>
        </div>
      </div>

      <PresetSelector
        items={allPageSizes}
        selectedIndex={allPageSizes.findIndex(
          (p) => p.name === selectedPageSize.name
        )}
        onSelect={onSelect}
        onCustomCreate={() => setIsCustomDialogOpen(true)}
        formatItemLabel={(size) =>
          `${size.label} (${formatDimension(size.width)}×${formatDimension(
            size.height
          )})`
        }
        placeholder="Select page size"
        customCreateLabel="Create Custom Size..."
        className="w-full"
      />

      <div className="mt-2 text-sm text-muted-foreground">
        <p>
          Selected size: {formatDimension(selectedPageSize.width)}×
          {formatDimension(selectedPageSize.height)}
        </p>
        <p>Margin: {formatDimension(selectedPageSize.margin)}</p>
      </div>

      <CustomPresetDialog
        open={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        type="pageSize"
        onSave={handleCustomPresetSave}
      />
    </div>
  );
}
