import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageSize, MeasurementUnit } from "@/types/collage";
import { pageSizes } from "@/data/page-sizes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UnitConverter } from "@/lib/unit-converter";
import { Trash2, PlusCircle, Download, Upload, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  CustomPresetStorage,
  CustomPageSize,
} from "@/lib/custom-preset-storage";

export function PageSizePresets() {
  const [customPresets, setCustomPresets] = useState<CustomPageSize[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit>("mm");

  const [newPreset, setNewPreset] = useState({
    name: "",
    label: "",
    width: "",
    height: "",
    margin: "",
  });

  // Load custom presets from storage
  useEffect(() => {
    const loadPresets = () => {
      const presets = CustomPresetStorage.getCustomPageSizes();
      setCustomPresets(presets);
    };

    loadPresets();

    // Listen for storage changes to update custom presets
    const handleStorageChange = () => loadPresets();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleAddPreset = () => {
    if (
      !newPreset.name ||
      !newPreset.label ||
      !newPreset.width ||
      !newPreset.height
    ) {
      toast({
        title: "Invalid input",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse dimensions and convert to mm
      const widthData = UnitConverter.parseDimensionString(newPreset.width);
      const heightData = UnitConverter.parseDimensionString(newPreset.height);
      const marginData = UnitConverter.parseDimensionString(
        newPreset.margin || "5mm"
      );

      const widthInMm = UnitConverter.convertToMm(
        parseFloat(widthData.value.toString()),
        widthData.unit
      );
      const heightInMm = UnitConverter.convertToMm(
        parseFloat(heightData.value.toString()),
        heightData.unit
      );
      const marginInMm = UnitConverter.convertToMm(
        parseFloat(marginData.value.toString()),
        marginData.unit
      );

      if (widthInMm <= 0 || heightInMm <= 0 || marginInMm < 0) {
        toast({
          title: "Invalid dimensions",
          description:
            "Width and height must be greater than 0, margin must be 0 or greater",
          variant: "destructive",
        });
        return;
      }

      const savedPreset = CustomPresetStorage.saveCustomPageSize({
        name: newPreset.name.toLowerCase().replace(/\s+/g, "-"),
        label: newPreset.label,
        width: widthInMm,
        height: heightInMm,
        margin: marginInMm,
      });

      setCustomPresets(CustomPresetStorage.getCustomPageSizes());

      toast({
        title: "Preset added",
        description: `Added ${savedPreset.label} to your custom presets`,
      });

      setNewPreset({ name: "", label: "", width: "", height: "", margin: "" });
      setShowAddDialog(false);
    } catch (error) {
      toast({
        title: "Error adding preset",
        description: "Please check your input values",
        variant: "destructive",
      });
    }
  };

  const handleDeletePreset = (name: string) => {
    CustomPresetStorage.deleteCustomPageSize(name);
    setCustomPresets(CustomPresetStorage.getCustomPageSizes());

    toast({
      title: "Preset deleted",
      description: "Custom preset has been removed",
    });
  };

  const exportPresets = () => {
    const dataStr = JSON.stringify(customPresets);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportName = `collage-page-presets-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();

    toast({
      title: "Presets exported",
      description: "Your custom presets have been exported",
    });
  };

  const importPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedPresets = JSON.parse(event.target?.result as string);

        if (
          Array.isArray(importedPresets) &&
          importedPresets.every(isValidPageSize)
        ) {
          // Convert imported presets to custom presets and save them
          importedPresets.forEach((preset: PageSize) => {
            CustomPresetStorage.saveCustomPageSize({
              name: preset.name,
              label: preset.label,
              width: preset.width,
              height: preset.height,
              margin: preset.margin,
            });
          });

          // Refresh the list
          setCustomPresets(CustomPresetStorage.getCustomPageSizes());

          toast({
            title: "Presets imported",
            description: `Successfully imported ${importedPresets.length} presets`,
          });
        } else {
          throw new Error("Invalid preset format");
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is not valid",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    // Reset the input
    e.target.value = "";
  };

  // Type guard to validate imported presets
  const isValidPageSize = (obj: unknown): obj is PageSize => {
    return (
      typeof obj === "object" &&
      obj !== null &&
      typeof (obj as PageSize).name === "string" &&
      typeof (obj as PageSize).label === "string" &&
      typeof (obj as PageSize).width === "number" &&
      typeof (obj as PageSize).height === "number" &&
      typeof (obj as PageSize).margin === "number"
    );
  };

  const formatDimension = (mm: number): string => {
    return UnitConverter.formatDimension(mm, selectedUnit);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Default Page Sizes</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUnit("mm")}
              >
                mm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUnit("cm")}
              >
                cm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUnit("in")}
              >
                in
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dimensions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageSizes.map((size) => (
                <TableRow key={size.name}>
                  <TableCell>{size.label}</TableCell>
                  <TableCell>
                    {formatDimension(size.width)}×{formatDimension(size.height)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Custom Page Sizes</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Add New
              </Button>
              <Button variant="outline" size="sm" onClick={exportPresets}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={importPresets}
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" /> Import
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customPresets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customPresets.map((size) => (
                  <TableRow key={size.name}>
                    <TableCell>{size.label}</TableCell>
                    <TableCell>
                      {formatDimension(size.width)}×
                      {formatDimension(size.height)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePreset(size.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No custom presets yet. Create your first custom preset.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => !open && setShowAddDialog(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Page Size</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preset-name">Identifier</Label>
                <Input
                  id="preset-name"
                  placeholder="e.g., custom-a4"
                  value={newPreset.name}
                  onChange={(e) =>
                    setNewPreset({ ...newPreset, name: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Unique name for system use
                </p>
              </div>

              <div>
                <Label htmlFor="preset-label">Display Name</Label>
                <Input
                  id="preset-label"
                  placeholder="e.g., Custom A4"
                  value={newPreset.label}
                  onChange={(e) =>
                    setNewPreset({ ...newPreset, label: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  User-friendly name
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preset-width">Width</Label>
                <Input
                  id="preset-width"
                  placeholder="e.g., 210mm, 21cm, 8.5in"
                  value={newPreset.width}
                  onChange={(e) =>
                    setNewPreset({ ...newPreset, width: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="preset-height">Height</Label>
                <Input
                  id="preset-height"
                  placeholder="e.g., 297mm, 29.7cm, 11in"
                  value={newPreset.height}
                  onChange={(e) =>
                    setNewPreset({ ...newPreset, height: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preset-margin">Margin</Label>
              <Input
                id="preset-margin"
                placeholder="e.g., 5mm, 0.5cm, 0.2in"
                value={newPreset.margin}
                onChange={(e) =>
                  setNewPreset({ ...newPreset, margin: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional - defaults to 5mm if empty
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPreset}>Add Preset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
