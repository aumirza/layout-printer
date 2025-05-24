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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnitConverter } from "@/lib/unit-converter";
import {
  Trash2,
  PlusCircle,
  Download,
  Upload,
  Edit,
  GripVertical,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  CustomPresetStorage,
  CustomPageSize,
  CustomLayoutPreset,
} from "@/lib/custom-preset-storage";
import { PageSize, LayoutPreset, MeasurementUnit } from "@/types/collage";
import { pageSizes } from "@/data/page-sizes";
import { layoutPresets } from "@/data/layout-presets";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

type PresetType = "pageSize" | "layout";

interface PresetManagerProps {
  type: PresetType;
}

interface EditablePreset {
  id: string;
  name: string;
  label: string;
  isBuiltIn: boolean;
  isVisible: boolean;
  order: number;
  data: PageSize | LayoutPreset;
}

interface EditDialogState {
  open: boolean;
  preset: EditablePreset | null;
  isNew: boolean;
}

interface SortablePresetRowProps {
  preset: EditablePreset;
  unit: MeasurementUnit;
  onEdit: (preset: EditablePreset) => void;
  onDelete: (preset: EditablePreset) => void;
  onDuplicate: (preset: EditablePreset) => void;
  onToggleVisibility: (preset: EditablePreset) => void;
}

function SortablePresetRow({
  preset,
  unit,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleVisibility,
}: SortablePresetRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: preset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, unit, 1);
  };

  const isPageSize = "width" in preset.data;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "opacity-50",
        !preset.isVisible && "opacity-60 bg-muted/30"
      )}
    >
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleVisibility(preset)}
            className="h-6 w-6 p-0"
          >
            <Eye className={cn("h-3 w-3", !preset.isVisible && "opacity-30")} />
          </Button>
          <span
            className={cn(
              !preset.isVisible && "line-through text-muted-foreground"
            )}
          >
            {preset.label}
          </span>
          {preset.isBuiltIn && (
            <span className="text-xs bg-muted px-1 rounded">Built-in</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {isPageSize ? (
          <>
            {formatDimension((preset.data as PageSize).width)} ×{" "}
            {formatDimension((preset.data as PageSize).height)}
            {(preset.data as PageSize).margin > 0 && (
              <div className="text-xs text-muted-foreground">
                Margin: {formatDimension((preset.data as PageSize).margin)}
              </div>
            )}
          </>
        ) : (
          <>
            {formatDimension((preset.data as LayoutPreset).cellWidth)} ×{" "}
            {formatDimension((preset.data as LayoutPreset).cellHeight)}
          </>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(preset)}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(preset)}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {!preset.isBuiltIn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(preset)}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PresetManager({ type }: PresetManagerProps) {
  const [presets, setPresets] = useState<EditablePreset[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit>("mm");
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    preset: null,
    isNew: false,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    preset: EditablePreset | null;
  }>({ open: false, preset: null });

  const [editForm, setEditForm] = useState({
    name: "",
    label: "",
    width: "",
    height: "",
    margin: "",
    cellWidth: "",
    cellHeight: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load presets
  useEffect(() => {
    loadPresets();
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPresets = () => {
    const builtInPresets = type === "pageSize" ? pageSizes : layoutPresets;
    const customPresets =
      type === "pageSize"
        ? CustomPresetStorage.getCustomPageSizes()
        : CustomPresetStorage.getCustomLayouts();

    // Get visibility and order settings from localStorage
    const settingsKey = `${type}PresetSettings`;
    const savedSettings = JSON.parse(localStorage.getItem(settingsKey) || "{}");

    const allPresets: EditablePreset[] = [
      ...builtInPresets.map((preset, index) => ({
        id: preset.id || `builtin-${type}-${index}`,
        name: preset.name || preset.label,
        label: preset.label,
        isBuiltIn: true,
        isVisible:
          savedSettings[preset.id || `builtin-${type}-${index}`]?.isVisible ??
          true,
        order:
          savedSettings[preset.id || `builtin-${type}-${index}`]?.order ??
          index,
        data: preset,
      })),
      ...customPresets.map((preset, index) => ({
        id: preset.id,
        name: preset.name,
        label: preset.label,
        isBuiltIn: false,
        isVisible: savedSettings[preset.id]?.isVisible ?? true,
        order: savedSettings[preset.id]?.order ?? builtInPresets.length + index,
        data: preset,
      })),
    ];

    // Sort by order
    allPresets.sort((a, b) => a.order - b.order);
    setPresets(allPresets);
  };

  const savePresetSettings = (updatedPresets: EditablePreset[]) => {
    const settingsKey = `${type}PresetSettings`;
    const settings: Record<string, { isVisible: boolean; order: number }> = {};

    updatedPresets.forEach((preset, index) => {
      settings[preset.id] = {
        isVisible: preset.isVisible,
        order: index,
      };
    });

    localStorage.setItem(settingsKey, JSON.stringify(settings));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPresets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        savePresetSettings(newItems);
        return newItems;
      });
    }
  };

  const handleToggleVisibility = (preset: EditablePreset) => {
    const updatedPresets = presets.map((p) =>
      p.id === preset.id ? { ...p, isVisible: !p.isVisible } : p
    );
    setPresets(updatedPresets);
    savePresetSettings(updatedPresets);
  };

  const handleEdit = (preset: EditablePreset) => {
    if (type === "pageSize") {
      const pageData = preset.data as PageSize;
      setEditForm({
        name: preset.name,
        label: preset.label,
        width: pageData.width.toString(),
        height: pageData.height.toString(),
        margin: pageData.margin.toString(),
        cellWidth: "",
        cellHeight: "",
      });
    } else {
      const layoutData = preset.data as LayoutPreset;
      setEditForm({
        name: preset.name,
        label: preset.label,
        width: "",
        height: "",
        margin: "",
        cellWidth: layoutData.cellWidth.toString(),
        cellHeight: layoutData.cellHeight.toString(),
      });
    }

    setEditDialog({ open: true, preset, isNew: false });
  };

  const handleDuplicate = (preset: EditablePreset) => {
    const newName = `${preset.name} Copy`;

    if (type === "pageSize") {
      const pageData = preset.data as PageSize;
      setEditForm({
        name: newName,
        label: newName,
        width: pageData.width.toString(),
        height: pageData.height.toString(),
        margin: pageData.margin.toString(),
        cellWidth: "",
        cellHeight: "",
      });
    } else {
      const layoutData = preset.data as LayoutPreset;
      setEditForm({
        name: newName,
        label: newName,
        width: "",
        height: "",
        margin: "",
        cellWidth: layoutData.cellWidth.toString(),
        cellHeight: layoutData.cellHeight.toString(),
      });
    }

    setEditDialog({ open: true, preset: null, isNew: true });
  };

  const handleNewPreset = () => {
    setEditForm({
      name: "",
      label: "",
      width: "",
      height: "",
      margin: "5",
      cellWidth: "",
      cellHeight: "",
    });
    setEditDialog({ open: true, preset: null, isNew: true });
  };

  const handleSaveEdit = () => {
    try {
      if (type === "pageSize") {
        const width = parseFloat(editForm.width);
        const height = parseFloat(editForm.height);
        const margin = parseFloat(editForm.margin || "0");

        if (width <= 0 || height <= 0 || margin < 0) {
          toast({
            title: "Invalid dimensions",
            description:
              "Width and height must be greater than 0, margin must be 0 or greater",
            variant: "destructive",
          });
          return;
        }

        if (editDialog.isNew || !editDialog.preset?.isBuiltIn) {
          CustomPresetStorage.saveCustomPageSize({
            id: editDialog.preset?.id,
            name: editForm.name,
            label: editForm.label,
            width,
            height,
            margin,
          });
        }
      } else {
        const cellWidth = parseFloat(editForm.cellWidth);
        const cellHeight = parseFloat(editForm.cellHeight);

        if (cellWidth <= 0 || cellHeight <= 0) {
          toast({
            title: "Invalid dimensions",
            description: "Width and height must be greater than 0",
            variant: "destructive",
          });
          return;
        }

        if (editDialog.isNew || !editDialog.preset?.isBuiltIn) {
          CustomPresetStorage.saveCustomLayout({
            name: editForm.name,
            label: editForm.label,
            cellWidth,
            cellHeight,
          });
        }
      }

      loadPresets();
      setEditDialog({ open: false, preset: null, isNew: false });

      toast({
        title: editDialog.isNew ? "Preset created" : "Preset updated",
        description: `${editForm.label} has been ${
          editDialog.isNew ? "created" : "updated"
        }`,
      });
    } catch (error) {
      toast({
        title: "Error saving preset",
        description: "Please check your input values",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (preset: EditablePreset) => {
    setDeleteDialog({ open: true, preset });
  };

  const confirmDelete = () => {
    if (deleteDialog.preset && !deleteDialog.preset.isBuiltIn) {
      if (type === "pageSize") {
        CustomPresetStorage.deleteCustomPageSize(deleteDialog.preset.id);
      } else {
        CustomPresetStorage.deleteCustomLayout(deleteDialog.preset.id);
      }

      loadPresets();
      setDeleteDialog({ open: false, preset: null });

      toast({
        title: "Preset deleted",
        description: `${deleteDialog.preset.label} has been removed`,
      });
    }
  };

  const exportPresets = () => {
    const customPresetsOnly = presets.filter((p) => !p.isBuiltIn);
    const dataStr = JSON.stringify(customPresetsOnly.map((p) => p.data));
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportName = `collage-${type}-presets-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();

    toast({
      title: "Presets exported",
      description: `${customPresetsOnly.length} custom presets exported`,
    });
  };

  const importPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        if (Array.isArray(importedData)) {
          importedData.forEach((presetData: Record<string, unknown>) => {
            if (
              type === "pageSize" &&
              typeof presetData.width === "number" &&
              typeof presetData.height === "number"
            ) {
              CustomPresetStorage.saveCustomPageSize({
                name: String(
                  presetData.name || presetData.label || "Imported Page Size"
                ),
                label: String(
                  presetData.label || presetData.name || "Imported Page Size"
                ),
                width: presetData.width,
                height: presetData.height,
                margin:
                  typeof presetData.margin === "number" ? presetData.margin : 5,
                id: String(
                  presetData.id ||
                    `imported_page_${Date.now()}_${Math.random()}`
                ),
              });
            } else if (
              type === "layout" &&
              typeof presetData.cellWidth === "number" &&
              typeof presetData.cellHeight === "number"
            ) {
              CustomPresetStorage.saveCustomLayout({
                name: String(
                  presetData.name || presetData.label || "Imported Layout"
                ),
                label: String(
                  presetData.label || presetData.name || "Imported Layout"
                ),
                cellWidth: presetData.cellWidth,
                cellHeight: presetData.cellHeight,
              });
            }
          });

          loadPresets();
          toast({
            title: "Presets imported",
            description: `${importedData.length} presets imported successfully`,
          });
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {type === "pageSize" ? "Page Size" : "Photo Size"} Presets
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={selectedUnit}
                onValueChange={(value: MeasurementUnit) =>
                  setSelectedUnit(value)
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">mm</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={handleNewPreset} size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Preset
            </Button>
            <Button onClick={exportPresets} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Label htmlFor="import" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <Input
                id="import"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importPresets}
              />
            </Label>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={presets.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {presets.map((preset) => (
                      <SortablePresetRow
                        key={preset.id}
                        preset={preset}
                        unit={selectedUnit}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    ))}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          !open && setEditDialog({ open: false, preset: null, isNew: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editDialog.isNew ? "Create New" : "Edit"}{" "}
              {type === "pageSize" ? "Page Size" : "Photo Size"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Internal name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="label">Display Label</Label>
              <Input
                id="label"
                value={editForm.label}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Display name"
              />
            </div>
            {type === "pageSize" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="width">Width (mm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={editForm.width}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          width: e.target.value,
                        }))
                      }
                      placeholder="210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (mm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={editForm.height}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          height: e.target.value,
                        }))
                      }
                      placeholder="297"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="margin">Margin (mm)</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={editForm.margin}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        margin: e.target.value,
                      }))
                    }
                    placeholder="5"
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="cellWidth">Width (mm)</Label>
                  <Input
                    id="cellWidth"
                    type="number"
                    value={editForm.cellWidth}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        cellWidth: e.target.value,
                      }))
                    }
                    placeholder="89"
                  />
                </div>
                <div>
                  <Label htmlFor="cellHeight">Height (mm)</Label>
                  <Input
                    id="cellHeight"
                    type="number"
                    value={editForm.cellHeight}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        cellHeight: e.target.value,
                      }))
                    }
                    placeholder="127"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditDialog({ open: false, preset: null, isNew: false })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, preset: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.preset?.label}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
