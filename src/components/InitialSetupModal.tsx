import { useState, useEffect } from "react";
import {
  MeasurementUnit,
  PageSize,
  LayoutPreset,
  SpaceOptimization,
} from "@/types/collage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { pageSizes } from "@/data/page-sizes";
import { layoutPresets } from "@/data/layout-presets";
import { UnitConverter } from "@/lib/unit-converter";
import { Settings } from "@/types/settings";

interface InitialSetupModalProps {
  open: boolean;
  onClose: () => void;
  onApplySettings: (settings: Settings) => void;
}

export function InitialSetupModal({
  open,
  onClose,
  onApplySettings,
}: InitialSetupModalProps) {
  const [pageSizeIndex, setPageSizeIndex] = useState(0);
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [spaceOptimization, setSpaceOptimization] =
    useState<SpaceOptimization>("loose");
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit>("mm");
  const [calculatedCells, setCalculatedCells] = useState<number>(0);

  // Calculate the estimated number of cells
  useEffect(() => {
    if (pageSizeIndex >= 0 && layoutIndex >= 0) {
      const pageSize = pageSizes[pageSizeIndex];
      const layout = layoutPresets[layoutIndex];

      // Calculate usable area by removing margins
      const usableWidth = pageSize.width - pageSize.margin * 2;
      const usableHeight = pageSize.height - pageSize.margin * 2;

      // Calculate cells based on layout dimensions
      const columns = Math.floor(usableWidth / layout.cellWidth);
      const rows = Math.floor(usableHeight / layout.cellHeight);

      setCalculatedCells(rows * columns);
    }
  }, [pageSizeIndex, layoutIndex]);

  const handleApply = () => {
    onApplySettings({
      pageSizeIndex,
      layoutIndex,
      spaceOptimization,
      selectedUnit,
    });
    onClose();

    // Save preferences to localStorage
    localStorage.setItem(
      "collagePreferences",
      JSON.stringify({
        pageSizeIndex,
        layoutIndex,
        spaceOptimization,
        selectedUnit,
      })
    );
  };

  const formatDimension = (value: number): string => {
    if (selectedUnit === "in") {
      return `${UnitConverter.mmToInches(value).toFixed(2)}″`;
    } else if (selectedUnit === "cm") {
      return `${UnitConverter.mmToCm(value).toFixed(1)}cm`;
    }
    return `${value}mm`;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Setup Your Collage
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <Label>Measurement Unit</Label>
            <div className="flex items-center space-x-2">
              <Select
                value={selectedUnit}
                onValueChange={(value: MeasurementUnit) =>
                  setSelectedUnit(value)
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">mm</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">inches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pageSize">Page Size</Label>
            <Select
              value={pageSizeIndex.toString()}
              onValueChange={(value) => setPageSizeIndex(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size, index) => (
                  <SelectItem key={size.name} value={index.toString()}>
                    {size.label} ({formatDimension(size.width)}×
                    {formatDimension(size.height)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="photoSize">Photo Size</Label>
            <Select
              value={layoutIndex.toString()}
              onValueChange={(value) => setLayoutIndex(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select photo size" />
              </SelectTrigger>
              <SelectContent>
                {layoutPresets.map((layout, index) => (
                  <SelectItem key={layout.id} value={index.toString()}>
                    {layout.label} ({formatDimension(layout.cellWidth)}×
                    {formatDimension(layout.cellHeight)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <Label htmlFor="fitType">Photo Arrangement</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {spaceOptimization === "loose"
                  ? "Loose Fit: Consistent orientation (easier to cut)"
                  : "Tight Fit: Mixed orientations (maximizes space)"}
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
                  setSpaceOptimization(checked ? "tight" : "loose")
                }
              />
              <Label htmlFor="fit-toggle" className="text-xs">
                Tight
              </Label>
            </div>
          </div>

          <div className="bg-muted/30 rounded-md p-3 mt-2">
            <p className="text-sm font-medium">Estimated Layout</p>
            <p className="text-sm">
              This will create approximately <strong>{calculatedCells}</strong>{" "}
              photo cells.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Start Creating</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
