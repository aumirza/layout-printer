import { useState, useEffect } from "react";
import { Check, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageSize, MeasurementUnit } from "@/types/collage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitConverter } from "@/lib/unit-converter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isCustom, setIsCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [customMargin, setCustomMargin] = useState("");

  // Format dimensions according to selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleUnitChange = (unit: MeasurementUnit) => {
    onUnitChange(unit);
  };

  const handleCustomSizeSubmit = () => {
    try {
      // Parse the custom dimensions with their units
      const widthData = UnitConverter.parseDimensionString(customWidth);
      const heightData = UnitConverter.parseDimensionString(customHeight);
      const marginData = UnitConverter.parseDimensionString(
        customMargin || "5mm"
      );

      // Convert to mm (internal working unit)
      const widthInMm = UnitConverter.convertToMm(
        widthData.value,
        widthData.unit
      );
      const heightInMm = UnitConverter.convertToMm(
        heightData.value,
        heightData.unit
      );
      const marginInMm = UnitConverter.convertToMm(
        marginData.value,
        marginData.unit
      );

      if (widthInMm > 0 && heightInMm > 0 && marginInMm >= 0) {
        onCustomSize(widthInMm, heightInMm, marginInMm);
        setIsCustom(false);
      }
    } catch (error) {
      console.error("Error parsing custom size:", error);
    }
  };

  const handlePageSizeChange = (value: string) => {
    if (value === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false); // Ensure custom form is hidden if a preset is chosen
      onSelect(parseInt(value, 10));
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

      {isCustom ? (
        <div className="space-y-3 p-3 border rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="custom-width" className="text-xs">
                Width
              </Label>
              <Input
                id="custom-width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder={`e.g., 210mm, 21cm, 8.5in`}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="custom-height" className="text-xs">
                Height
              </Label>
              <Input
                id="custom-height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder={`e.g., 297mm, 29.7cm, 11in`}
                className="h-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="custom-margin" className="text-xs">
              Margin
            </Label>
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
            <Button size="sm" onClick={handleCustomSizeSubmit}>
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <Select
          value={pageSizes
            .findIndex((p) => p.name === selectedPageSize.name)
            .toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select page size" />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size, index) => (
              <SelectItem key={size.name} value={index.toString()}>
                {size.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">
              <div className="flex items-center">
                <span className="flex-1 text-primary">Custom Size...</span>
                <Edit2 className="w-4 h-4 text-primary ml-2" />
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="mt-2 text-sm text-muted-foreground">
        <p>
          Selected size: {formatDimension(selectedPageSize.width)}×
          {formatDimension(selectedPageSize.height)}
        </p>
        <p>Margin: {formatDimension(selectedPageSize.margin)}</p>
      </div>
    </div>
  );
}
