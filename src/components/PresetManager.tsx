import { useState, useEffect, useRef } from "react";
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
import { PageSize, LayoutPreset, MeasurementUnit } from "@/types/collage";
import { usePresetStore, EditablePreset } from "@/stores/preset-store";
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

interface EditDialogState {
  open: boolean;
  preset: EditablePreset | null;
  isNew: boolean;
}

interface PresetManagerProps {
  type: PresetType;
}

interface SortablePresetRowProps {
  preset: EditablePreset;
  unit: MeasurementUnit;
  type: PresetType;
  onEdit: (preset: EditablePreset) => void;
  onDelete: (preset: EditablePreset) => void;
  onDuplicate: (preset: EditablePreset) => void;
  onToggleVisibility: (preset: EditablePreset) => void;
}

function SortablePresetRow({
  preset,
  unit,
  type,
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

  const presets = usePresetStore((state) => state.getPresets(type));
  const savePresetSettings = usePresetStore(
    (state) => state.savePresetSettings
  );

  // Get store actions and wrap with correct type parameter
  const toggleVisibility = usePresetStore(
    (state) => state.handleToggleVisibility
  );
  const editPreset = usePresetStore((state) => state.handleEdit);
  const duplicatePreset = usePresetStore((state) => state.handleDuplicate);
  const createNewPreset = usePresetStore((state) => state.handleNewPreset);
  const saveEditPreset = usePresetStore((state) => state.handleSaveEdit);
  const deletePreset = usePresetStore((state) => state.handleDelete);
  const exportPresetsFromStore = usePresetStore((state) => state.exportPresets);
  const importPresetsToStore = usePresetStore((state) => state.importPresets);

  // Wrap the handlers to include the type parameter
  const handleToggleVisibility = (preset: EditablePreset) => {
    toggleVisibility(type, preset);
  };

  const handleEdit = (preset: EditablePreset) => {
    editPreset(preset);
    // Populate the edit form
    if ("width" in preset.data) {
      const pageSize = preset.data as PageSize;
      setEditForm({
        name: preset.name,
        label: preset.label,
        width: pageSize.width.toString(),
        height: pageSize.height.toString(),
        margin: pageSize.margin.toString(),
        cellWidth: "",
        cellHeight: "",
      });
    } else if ("cellWidth" in preset.data) {
      const layout = preset.data as LayoutPreset;
      setEditForm({
        name: preset.name,
        label: preset.label,
        width: "",
        height: "",
        margin: "",
        cellWidth: layout.cellWidth.toString(),
        cellHeight: layout.cellHeight.toString(),
      });
    }
    setEditDialog({ open: true, preset, isNew: false });
  };

  const handleDuplicate = (preset: EditablePreset) => {
    duplicatePreset(type, preset);
  };

  const handleNewPreset = () => {
    createNewPreset(type);
    // Clear the form
    setEditForm({
      name: "",
      label: "",
      width: "",
      height: "",
      margin: "",
      cellWidth: "",
      cellHeight: "",
    });
    setEditDialog({ open: true, preset: null, isNew: true });
  };

  const handleSaveEdit = () => {
    if (!editDialog.preset && !editDialog.isNew) return;

    const editedPreset: EditablePreset = editDialog.isNew
      ? {
          id: `new_${Date.now()}`,
          name: editForm.name,
          label: editForm.label,
          isBuiltIn: false,
          isVisible: true,
          order: 999,
          data:
            type === "pageSize"
              ? {
                  name: editForm.name,
                  label: editForm.label,
                  width: parseFloat(editForm.width),
                  height: parseFloat(editForm.height),
                  margin: parseFloat(editForm.margin || "0"),
                }
              : {
                  id: editForm.name,
                  name: editForm.name,
                  label: editForm.label,
                  cellWidth: parseFloat(editForm.cellWidth),
                  cellHeight: parseFloat(editForm.cellHeight),
                },
        }
      : {
          ...editDialog.preset!,
          name: editForm.name,
          label: editForm.label,
          data:
            type === "pageSize"
              ? {
                  ...(editDialog.preset!.data as PageSize),
                  name: editForm.name,
                  label: editForm.label,
                  width: parseFloat(editForm.width),
                  height: parseFloat(editForm.height),
                  margin: parseFloat(editForm.margin || "0"),
                }
              : {
                  ...(editDialog.preset!.data as LayoutPreset),
                  id: editForm.name,
                  name: editForm.name,
                  label: editForm.label,
                  cellWidth: parseFloat(editForm.cellWidth),
                  cellHeight: parseFloat(editForm.cellHeight),
                },
        };

    saveEditPreset(type, editedPreset);
    setEditDialog({ open: false, preset: null, isNew: false });
  };

  const handleDelete = (preset: EditablePreset) => {
    setDeleteDialog({ open: true, preset });
  };

  const confirmDelete = () => {
    if (deleteDialog.preset) {
      deletePreset(type, deleteDialog.preset.id);
      setDeleteDialog({ open: false, preset: null });
    }
  };

  const exportPresets = () => {
    exportPresetsFromStore(type);
  };

  const importPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importPresetsToStore(type, content);
      };
      reader.readAsText(file);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = presets.findIndex((item) => item.id === active.id);
      const newIndex = presets.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(presets, oldIndex, newIndex);
      const newSettings = {
        visibleIds: newItems.filter((p) => p.isVisible).map((p) => p.id),
        order: newItems.map((p) => p.id),
      };
      savePresetSettings(type, newSettings);
    }
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
                        type={type}
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
        onOpenChange={(open) => {
          if (!open) setEditDialog({ open: false, preset: null, isNew: false });
        }}
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
        onOpenChange={(open) => {
          if (!open) setDeleteDialog({ open: false, preset: null });
        }}
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
