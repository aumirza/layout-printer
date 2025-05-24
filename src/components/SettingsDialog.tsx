import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PresetManager } from "./PresetManager";
import { MeasurementUnit } from "@/types/collage";
import { toast } from "@/hooks/use-toast";
import { Download, Upload, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [defaultUnit, setDefaultUnit] = useState<MeasurementUnit>(() => {
    return (localStorage.getItem("defaultUnit") as MeasurementUnit) || "mm";
  });

  const [showCuttingMarkers, setShowCuttingMarkers] = useState(() => {
    return localStorage.getItem("defaultShowCuttingMarkers") === "true";
  });

  const [autoSave, setAutoSave] = useState(() => {
    return localStorage.getItem("autoSave") !== "false";
  });

  const [exportQuality, setExportQuality] = useState(() => {
    return localStorage.getItem("exportQuality") || "high";
  });

  const handleDefaultUnitChange = (unit: MeasurementUnit) => {
    setDefaultUnit(unit);
    localStorage.setItem("defaultUnit", unit);
    toast({
      title: "Default unit updated",
      description: `New projects will use ${unit} by default`,
    });
  };

  const handleCuttingMarkersChange = (checked: boolean) => {
    setShowCuttingMarkers(checked);
    localStorage.setItem("defaultShowCuttingMarkers", checked.toString());
    toast({
      title: "Default cutting markers updated",
      description: `New projects will ${
        checked ? "show" : "hide"
      } cutting markers by default`,
    });
  };

  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    localStorage.setItem("autoSave", checked.toString());
    toast({
      title: "Auto-save updated",
      description: `Auto-save is now ${checked ? "enabled" : "disabled"}`,
    });
  };

  const handleExportQualityChange = (quality: string) => {
    setExportQuality(quality);
    localStorage.setItem("exportQuality", quality);
    toast({
      title: "Export quality updated",
      description: `Default export quality set to ${quality}`,
    });
  };

  const exportAllSettings = () => {
    const settings = {
      defaultUnit,
      showCuttingMarkers,
      autoSave,
      exportQuality,
      pagePresetSettings: localStorage.getItem("pageSizePresetSettings"),
      layoutPresetSettings: localStorage.getItem("layoutPresetSettings"),
      collagePreferences: localStorage.getItem("collagePreferences"),
      customPageSizes: localStorage.getItem("customPageSizes"),
      customLayouts: localStorage.getItem("customLayouts"),
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportName = `collage-settings-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();

    toast({
      title: "Settings exported",
      description: "All settings and presets have been exported",
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);

        // Import general settings
        if (importedSettings.defaultUnit) {
          setDefaultUnit(importedSettings.defaultUnit);
          localStorage.setItem("defaultUnit", importedSettings.defaultUnit);
        }

        if (typeof importedSettings.showCuttingMarkers === "boolean") {
          setShowCuttingMarkers(importedSettings.showCuttingMarkers);
          localStorage.setItem(
            "defaultShowCuttingMarkers",
            importedSettings.showCuttingMarkers.toString()
          );
        }

        if (typeof importedSettings.autoSave === "boolean") {
          setAutoSave(importedSettings.autoSave);
          localStorage.setItem(
            "autoSave",
            importedSettings.autoSave.toString()
          );
        }

        if (importedSettings.exportQuality) {
          setExportQuality(importedSettings.exportQuality);
          localStorage.setItem("exportQuality", importedSettings.exportQuality);
        }

        // Import preset settings
        if (importedSettings.pagePresetSettings) {
          localStorage.setItem(
            "pageSizePresetSettings",
            importedSettings.pagePresetSettings
          );
        }

        if (importedSettings.layoutPresetSettings) {
          localStorage.setItem(
            "layoutPresetSettings",
            importedSettings.layoutPresetSettings
          );
        }

        // Import custom presets
        if (importedSettings.customPageSizes) {
          localStorage.setItem(
            "customPageSizes",
            importedSettings.customPageSizes
          );
        }

        if (importedSettings.customLayouts) {
          localStorage.setItem("customLayouts", importedSettings.customLayouts);
        }

        // Import collage preferences
        if (importedSettings.collagePreferences) {
          localStorage.setItem(
            "collagePreferences",
            importedSettings.collagePreferences
          );
        }

        toast({
          title: "Settings imported",
          description:
            "All settings have been imported successfully. Please refresh the page to apply changes.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid settings file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  const resetAllSettings = () => {
    // Clear all localStorage items related to the app
    const keysToRemove = [
      "defaultUnit",
      "defaultShowCuttingMarkers",
      "autoSave",
      "exportQuality",
      "pageSizePresetSettings",
      "layoutPresetSettings",
      "collagePreferences",
      "customPageSizes",
      "customLayouts",
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Reset state to defaults
    setDefaultUnit("mm");
    setShowCuttingMarkers(false);
    setAutoSave(true);
    setExportQuality("high");

    toast({
      title: "Settings reset",
      description:
        "All settings have been reset to defaults. Please refresh the page.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your presets and application preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="page-sizes">Page Sizes</TabsTrigger>
            <TabsTrigger value="photo-sizes">Photo Sizes</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Default Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Default Measurement Unit</Label>
                      <p className="text-sm text-muted-foreground">
                        Unit used when creating new projects
                      </p>
                    </div>
                    <Select
                      value={defaultUnit}
                      onValueChange={handleDefaultUnitChange}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Cutting Markers</Label>
                      <p className="text-sm text-muted-foreground">
                        Default visibility of cutting guides
                      </p>
                    </div>
                    <Switch
                      checked={showCuttingMarkers}
                      onCheckedChange={handleCuttingMarkersChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-save Projects</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save project changes
                      </p>
                    </div>
                    <Switch
                      checked={autoSave}
                      onCheckedChange={handleAutoSaveChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Export Quality</Label>
                      <p className="text-sm text-muted-foreground">
                        Default quality for exports
                      </p>
                    </div>
                    <Select
                      value={exportQuality}
                      onValueChange={handleExportQualityChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="ultra">Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Restore</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={exportAllSettings}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All Settings
                    </Button>
                    <Label htmlFor="import-settings" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Import Settings
                        </span>
                      </Button>
                      <Input
                        id="import-settings"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={importSettings}
                      />
                    </Label>
                    <Button
                      onClick={resetAllSettings}
                      variant="destructive"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Export your settings and custom presets to backup or share
                    them. Import to restore from a backup file.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="page-sizes" className="mt-4">
            <PresetManager type="pageSize" />
          </TabsContent>

          <TabsContent value="photo-sizes" className="mt-4">
            <PresetManager type="layout" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
