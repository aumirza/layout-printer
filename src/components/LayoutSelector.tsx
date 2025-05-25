import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutPreset,
  MeasurementUnit,
  SpaceOptimization,
} from "@/types/collage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UnitConverter } from "@/lib/unit-converter";
import { PresetSelector } from "@/components/ui/preset-selector";
import { CustomPresetDialog } from "@/components/ui/custom-preset-dialog";
import { usePresetStore } from "@/stores/preset-store";

interface LayoutSelectorProps {
  layouts: LayoutPreset[];
  selectedLayout: LayoutPreset;
  onSelect: (layout: LayoutPreset) => void;
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
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const getAllLayouts = usePresetStore((state) => state.getAllLayouts);
  const addCustomLayout = usePresetStore((state) => state.addCustomLayout);
  const [allLayouts, setAllLayouts] = useState<LayoutPreset[]>([]);

  // Load all layouts from store
  useEffect(() => {
    setAllLayouts(getAllLayouts());
  }, [getAllLayouts]);

  // Format dimensions according to selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleCustomPresetSave = (data: {
    cellWidth: number;
    cellHeight: number;
    name: string;
    saveAsPreset: boolean;
  }) => {
    // Apply the custom layout immediately
    onCustomLayout(data.cellWidth, data.cellHeight);

    // Save as preset if requested
    if (data.saveAsPreset) {
      addCustomLayout({
        name: data.name,
        cellWidth: data.cellWidth,
        cellHeight: data.cellHeight,
        label: data.name,
      });

      // Refresh the list
      setAllLayouts(getAllLayouts());
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Photo Size</h2>

      <PresetSelector
        items={allLayouts}
        selected={selectedLayout}
        onSelect={onSelect}
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

      <CustomPresetDialog
        open={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        type="layout"
        onSave={handleCustomPresetSave}
      />
    </div>
  );
}
