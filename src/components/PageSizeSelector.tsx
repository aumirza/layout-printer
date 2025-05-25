import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MeasurementUnit, PageSize } from "@/types/collage";
import { Button } from "@/components/ui/button";
import { UnitConverter } from "@/lib/unit-converter";
import { PresetSelector } from "@/components/ui/preset-selector";
import {
  CustomPresetDialog,
  PageSizeData,
} from "@/components/ui/custom-preset-dialog";
import { usePresetStore } from "@/stores/preset-store";
import { useCollage } from "@/context/CollageContext";
import { pageSizes } from "@/data/page-sizes";

export function PageSizeSelector() {
  const {
    collageState,
    updatePageSize,
    createCustomPageSize: onCustomSize,
    setUnit,
  } = useCollage();

  const { pageSize: selectedPageSize, selectedUnit } = collageState;

  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const presetStore = usePresetStore();
  const [allPageSizes, setAllPageSizes] = useState<PageSize[]>(pageSizes);

  // Load all page sizes from store
  useEffect(() => {
    setAllPageSizes(presetStore.getAllPageSizes());
  }, [presetStore]);

  // Format dimensions according to selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleUnitChange = (unit: MeasurementUnit) => {
    setUnit(unit);
  };

  const handleCustomPresetSave = (data: PageSizeData) => {
    // Apply the custom size immediately
    onCustomSize(data.width, data.height, data.margin);

    // Save as preset if requested
    if (data.saveAsPreset) {
      presetStore.addCustomPageSize({
        name: data.name,
        id: `custom_${Date.now()}`,
        width: data.width,
        height: data.height,
        margin: data.margin,
        label: data.name,
      });

      // Refresh the list
      setAllPageSizes(presetStore.getAllPageSizes());
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
        onSelect={(preset) => updatePageSize(preset)}
        onCustomCreate={() => setIsCustomDialogOpen(true)}
        formatItemLabel={(preset) =>
          `${preset.label} (${formatDimension(preset.width)}×${formatDimension(
            preset.height
          )})`
        }
        placeholder="Select a page size"
        customCreateLabel="Create Custom Size"
      />

      <CustomPresetDialog
        open={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        type="pageSize"
        onSave={handleCustomPresetSave}
      />
    </div>
  );
}
