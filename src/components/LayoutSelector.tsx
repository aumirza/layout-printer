import { useState, useEffect, useMemo } from "react";
import { LayoutPreset } from "@/types/collage";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UnitConverter } from "@/lib/unit-converter";
import { PresetSelector } from "@/components/ui/preset-selector";
import {
  CustomPresetDialog,
  LayoutData,
} from "@/components/ui/custom-preset-dialog";
import { usePresetStore } from "@/stores/preset-store";
import { useCollage } from "@/context/CollageContext";
import { layoutPresets } from "@/data/layout-presets";

export function LayoutSelector() {
  const {
    collageState,
    updateLayout,
    createCustomLayout,
    setSpaceOptimization,
  } = useCollage();

  const {
    layout: selectedLayout,
    selectedUnit,
    spaceOptimization,
  } = collageState;

  const maxCells = useMemo(
    () => collageState.rows * collageState.columns,
    [collageState.rows, collageState.columns]
  );

  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const presetStore = usePresetStore();
  const [allLayouts, setAllLayouts] = useState<LayoutPreset[]>(layoutPresets);

  // Load all layouts from store
  useEffect(() => {
    setAllLayouts(presetStore.getAllLayouts());
  }, [presetStore]);

  // Format dimensions according to selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleCustomPresetSave = (data: LayoutData) => {
    // Apply the custom layout immediately
    createCustomLayout(data.cellWidth, data.cellHeight);

    // Save as preset if requested
    if (data.saveAsPreset) {
      presetStore.addCustomLayout({
        name: data.name,
        id: `custom_${Date.now()}`,
        cellWidth: data.cellWidth,
        cellHeight: data.cellHeight,
        label: data.name,
      });

      // Refresh the list
      setAllLayouts(presetStore.getAllLayouts());
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Photo Size</h2>

      <PresetSelector
        items={allLayouts}
        selected={selectedLayout}
        onSelect={updateLayout}
        onCustomCreate={() => setIsCustomDialogOpen(true)}
        formatItemLabel={(layout) =>
          `${layout.label} (${formatDimension(
            layout.cellWidth
          )} x ${formatDimension(layout.cellHeight)})`
        }
        placeholder="Select a photo size"
        customCreateLabel="Create Custom Size..."
        className="w-full"
      />

      <div className="mt-4 space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>
            Unit size: {formatDimension(selectedLayout.cellWidth)}×
            {formatDimension(selectedLayout.cellHeight)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="space-optimization"
            checked={spaceOptimization === "tight"}
            onCheckedChange={(checked) =>
              setSpaceOptimization(checked ? "tight" : "loose")
            }
          />
          <Label htmlFor="space-optimization">
            <span className="ml-2">Space optimization</span>
            <p className="text-xs text-muted-foreground">
              {spaceOptimization === "tight"
                ? "Tight fit (more photos)"
                : "Loose fit (consistent orientation)"}
            </p>
          </Label>
        </div>

        <div className="text-sm font-medium">
          <p>Fits up to {maxCells} photos per page</p>
        </div>
      </div>

      <CustomPresetDialog
        open={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        type="layout"
        onSave={handleCustomPresetSave}
      />
    </div>
  );
}
