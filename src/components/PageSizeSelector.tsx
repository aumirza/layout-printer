import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageSize, MeasurementUnit } from "@/types/collage";
import { Button } from "@/components/ui/button";
import { UnitConverter } from "@/lib/unit-converter";
import { PresetSelector } from "@/components/ui/preset-selector";
import { CustomPresetDialog } from "@/components/ui/custom-preset-dialog";
import { usePresetStore } from "@/stores/preset-store";

interface PageSizeSelectorProps {
  pageSizes: PageSize[];
  selectedPageSize: PageSize;
  onSelect: (pagesize: PageSize) => void;
  onCustomSize: (width: number, height: number, margin: number) => void;
  selectedUnit: MeasurementUnit;
  onUnitChange: (unit: MeasurementUnit) => void;
}

export function PageSizeSelector({
  selectedPageSize,
  onSelect,
  onCustomSize,
  selectedUnit,
  onUnitChange,
}: PageSizeSelectorProps) {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const getAllPageSizes = usePresetStore((state) => state.getAllPageSizes);
  const addCustomPageSize = usePresetStore((state) => state.addCustomPageSize);
  const [allPageSizes, setAllPageSizes] = useState<PageSize[]>([]);

  // Load all page sizes from store
  useEffect(() => {
    setAllPageSizes(getAllPageSizes());
  }, [getAllPageSizes]);

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
      addCustomPageSize({
        name: data.name,
        id: `custom_${Date.now()}`,
        width: data.width,
        height: data.height,
        margin: data.margin,
        label: data.name,
      });

      // Refresh the list
      setAllPageSizes(getAllPageSizes());
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
        selected={selectedPageSize}
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
