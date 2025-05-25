import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageSize } from "@/types/collage";
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
