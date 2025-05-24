import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitConverter } from "@/lib/unit-converter";

interface CustomPresetDialogProps {
  open: boolean;
  onClose: () => void;
  type: "pageSize" | "layout";
  onSave: (data: PageSizeData | LayoutData) => void;
}

export interface PageSizeData {
  width: number;
  height: number;
  margin: number;
  name: string;
  saveAsPreset: boolean;
}

export interface LayoutData {
  cellWidth: number;
  cellHeight: number;
  name: string;
  saveAsPreset: boolean;
}

export function CustomPresetDialog({
  open,
  onClose,
  type,
  onSave,
}: CustomPresetDialogProps) {
  const [name, setName] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [margin, setMargin] = useState("");
  const [saveAsPreset, setSaveAsPreset] = useState(false);

  const handleSave = () => {
    try {
      // Parse the dimensions with their units
      const widthData = UnitConverter.parseDimensionString(width);
      const heightData = UnitConverter.parseDimensionString(height);

      // Convert to mm (internal working unit)
      const widthInMm = UnitConverter.convertToMm(
        widthData.value,
        widthData.unit
      );
      const heightInMm = UnitConverter.convertToMm(
        heightData.value,
        heightData.unit
      );

      if (type === "pageSize") {
        const marginData = UnitConverter.parseDimensionString(margin || "5mm");
        const marginInMm = UnitConverter.convertToMm(
          marginData.value,
          marginData.unit
        );

        if (widthInMm > 0 && heightInMm > 0 && marginInMm >= 0) {
          const pageSizeData: PageSizeData = {
            width: widthInMm,
            height: heightInMm,
            margin: marginInMm,
            name: name || "Custom Size",
            saveAsPreset,
          };
          onSave(pageSizeData);
          resetForm();
          onClose();
        }
      } else {
        if (widthInMm > 0 && heightInMm > 0) {
          const layoutData: LayoutData = {
            cellWidth: widthInMm,
            cellHeight: heightInMm,
            name: name || "Custom Layout",
            saveAsPreset,
          };
          onSave(layoutData);
          resetForm();
          onClose();
        }
      }
    } catch (error) {
      console.error("Error parsing custom dimensions:", error);
    }
  };

  const resetForm = () => {
    setName("");
    setWidth("");
    setHeight("");
    setMargin("");
    setSaveAsPreset(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Create Custom {type === "pageSize" ? "Page Size" : "Photo Size"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="preset-name" className="text-sm">
              Name (optional)
            </Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Custom ${
                type === "pageSize" ? "Page" : "Photo"
              } Size`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="custom-width" className="text-sm">
                Width
              </Label>
              <Input
                id="custom-width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="e.g., 210mm, 21cm, 8.5in"
              />
            </div>
            <div>
              <Label htmlFor="custom-height" className="text-sm">
                Height
              </Label>
              <Input
                id="custom-height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 297mm, 29.7cm, 11in"
              />
            </div>
          </div>

          {type === "pageSize" && (
            <div>
              <Label htmlFor="custom-margin" className="text-sm">
                Margin
              </Label>
              <Input
                id="custom-margin"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="e.g., 5mm, 0.5cm, 0.2in"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="save-preset"
              checked={saveAsPreset}
              onChange={(e) => setSaveAsPreset(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="save-preset" className="text-sm">
              Save as preset for future use
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create {type === "pageSize" ? "Page Size" : "Photo Size"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
