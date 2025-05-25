import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { PageSize, LayoutPreset, MeasurementUnit } from "@/types/collage";
import { pageSizes } from "@/data/page-sizes";
import { layoutPresets } from "@/data/layout-presets";

export interface CustomPageSize extends PageSize {
  isCustom: true;
}

export interface CustomLayoutPreset extends LayoutPreset {
  isCustom: true;
}

export interface EditablePreset {
  id: string;
  name: string;
  label: string;
  isBuiltIn: boolean;
  isVisible: boolean;
  order: number;
  data: PageSize | LayoutPreset;
}

export interface PresetSettings {
  visibleIds: string[];
  order: string[];
}

interface PresetStore {
  // Page sizes
  defaultPageSizes: PageSize[];
  customPageSizes: CustomPageSize[];
  pageSizeSettings: PresetSettings;

  // Layout presets
  defaultLayouts: LayoutPreset[];
  customLayouts: CustomLayoutPreset[];
  layoutSettings: PresetSettings;

  // Editor state
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  currentEditingPreset: EditablePreset | null;
  isNewPreset: boolean;

  // Actions for page sizes
  addCustomPageSize: (
    pageSize: Omit<CustomPageSize, "isCustom" | "name"> & { name?: string }
  ) => CustomPageSize;
  deleteCustomPageSize: (name: string) => void;

  // Actions for layouts
  addCustomLayout: (
    layout: Omit<CustomLayoutPreset, "isCustom" | "id"> & { id?: string }
  ) => CustomLayoutPreset;
  deleteCustomLayout: (id: string) => void;

  // Getters
  getAllPageSizes: () => (PageSize | CustomPageSize)[];
  getAllLayouts: () => (LayoutPreset | CustomLayoutPreset)[];

  // Initialize with defaults
  initializeDefaults: () => void;

  // Preset management
  getPresets: (type: "pageSize" | "layout") => EditablePreset[];
  savePresetSettings: (
    type: "pageSize" | "layout",
    settings: PresetSettings
  ) => void;
  handleToggleVisibility: (
    type: "pageSize" | "layout",
    preset: EditablePreset
  ) => void;
  handleEdit: (preset: EditablePreset) => void;
  handleDuplicate: (
    type: "pageSize" | "layout",
    preset: EditablePreset
  ) => void;
  handleNewPreset: (type: "pageSize" | "layout") => void;
  handleSaveEdit: (
    type: "pageSize" | "layout",
    editedPreset: EditablePreset
  ) => void;
  confirmDelete: (preset: EditablePreset) => void;
  handleDelete: (type: "pageSize" | "layout", presetId: string) => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;
  exportPresets: (type: "pageSize" | "layout") => void;
  importPresets: (type: "pageSize" | "layout", data: string) => void;
}

export const usePresetStore = create<PresetStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      defaultPageSizes: [],
      customPageSizes: [],
      defaultLayouts: [],
      customLayouts: [],
      pageSizeSettings: { visibleIds: [], order: [] },
      layoutSettings: { visibleIds: [], order: [] },
      editDialogOpen: false,
      deleteDialogOpen: false,
      currentEditingPreset: null,
      isNewPreset: false,

      // Page size actions
      addCustomPageSize: (pageSize) => {
        const newPageSize: CustomPageSize = {
          ...pageSize,
          isCustom: true,
          name: pageSize.name || `custom_${Date.now()}`,
        };

        set((state) => {
          state.customPageSizes.push(newPageSize);

          // Update settings to make new preset visible
          if (!state.pageSizeSettings.visibleIds.includes(newPageSize.name)) {
            state.pageSizeSettings.visibleIds.push(newPageSize.name);
          }
          if (!state.pageSizeSettings.order.includes(newPageSize.name)) {
            state.pageSizeSettings.order.push(newPageSize.name);
          }
        });

        return newPageSize;
      },

      deleteCustomPageSize: (name) => {
        set((state) => {
          state.customPageSizes = state.customPageSizes.filter(
            (size) => size.name !== name
          );

          // Remove from settings
          state.pageSizeSettings.visibleIds =
            state.pageSizeSettings.visibleIds.filter((id) => id !== name);
          state.pageSizeSettings.order = state.pageSizeSettings.order.filter(
            (id) => id !== name
          );
        });
      },

      // Layout actions
      addCustomLayout: (layout) => {
        const newLayout: CustomLayoutPreset = {
          ...layout,
          isCustom: true,
          id: layout.id || `custom_${Date.now()}`,
        };

        set((state) => {
          state.customLayouts.push(newLayout);

          // Update settings to make new preset visible
          if (!state.layoutSettings.visibleIds.includes(newLayout.id)) {
            state.layoutSettings.visibleIds.push(newLayout.id);
          }
          if (!state.layoutSettings.order.includes(newLayout.id)) {
            state.layoutSettings.order.push(newLayout.id);
          }
        });

        return newLayout;
      },

      deleteCustomLayout: (id) => {
        set((state) => {
          state.customLayouts = state.customLayouts.filter(
            (layout) => layout.id !== id
          );

          // Remove from settings
          state.layoutSettings.visibleIds =
            state.layoutSettings.visibleIds.filter(
              (layoutId) => layoutId !== id
            );
          state.layoutSettings.order = state.layoutSettings.order.filter(
            (layoutId) => layoutId !== id
          );
        });
      },

      // Getters
      getAllPageSizes: () => {
        const state = get();
        return [...state.defaultPageSizes, ...state.customPageSizes];
      },

      getAllLayouts: () => {
        const state = get();
        return [...state.defaultLayouts, ...state.customLayouts];
      },

      // Initialize defaults
      initializeDefaults: () => {
        set((state) => {
          if (state.defaultPageSizes.length === 0) {
            state.defaultPageSizes = pageSizes;
          }
          if (state.defaultLayouts.length === 0) {
            state.defaultLayouts = layoutPresets;
          }

          // Initialize settings if empty
          if (state.pageSizeSettings.visibleIds.length === 0) {
            state.pageSizeSettings.visibleIds = pageSizes.map(
              (size) => size.name
            );
            state.pageSizeSettings.order = pageSizes.map((size) => size.name);
          }

          if (state.layoutSettings.visibleIds.length === 0) {
            state.layoutSettings.visibleIds = layoutPresets.map(
              (layout) => layout.id
            );
            state.layoutSettings.order = layoutPresets.map(
              (layout) => layout.id
            );
          }
        });
      },

      // Preset management
      getPresets: (type) => {
        const state = get();
        const isPageSize = type === "pageSize";
        const settings = isPageSize
          ? state.pageSizeSettings
          : state.layoutSettings;
        let allPresets: EditablePreset[] = [];

        if (isPageSize) {
          // Convert page sizes to editable presets
          allPresets = [
            ...state.defaultPageSizes.map((size) => ({
              id: size.name,
              name: size.name,
              label: size.label,
              isBuiltIn: true,
              isVisible: settings.visibleIds.includes(size.name),
              order: settings.order.indexOf(size.name),
              data: size,
            })),
            ...state.customPageSizes.map((size) => ({
              id: size.name,
              name: size.name,
              label: size.label,
              isBuiltIn: false,
              isVisible: settings.visibleIds.includes(size.name),
              order: settings.order.indexOf(size.name),
              data: size,
            })),
          ];
        } else {
          // Convert layouts to editable presets
          allPresets = [
            ...state.defaultLayouts.map((layout) => ({
              id: layout.id,
              name: layout.name,
              label: layout.label,
              isBuiltIn: true,
              isVisible: settings.visibleIds.includes(layout.id),
              order: settings.order.indexOf(layout.id),
              data: layout,
            })),
            ...state.customLayouts.map((layout) => ({
              id: layout.id,
              name: layout.name,
              label: layout.label,
              isBuiltIn: false,
              isVisible: settings.visibleIds.includes(layout.id),
              order: settings.order.indexOf(layout.id),
              data: layout,
            })),
          ];
        }

        // Sort by order field
        return allPresets.sort((a, b) => {
          if (a.order === -1) return 1;
          if (b.order === -1) return -1;
          return a.order - b.order;
        });
      },

      savePresetSettings: (type, settings) => {
        set((state) => {
          if (type === "pageSize") {
            state.pageSizeSettings = settings;
          } else {
            state.layoutSettings = settings;
          }
        });
      },

      handleToggleVisibility: (type, preset) => {
        set((state) => {
          const settings =
            type === "pageSize" ? state.pageSizeSettings : state.layoutSettings;

          if (preset.isVisible) {
            // Remove from visible ids
            settings.visibleIds = settings.visibleIds.filter(
              (id) => id !== preset.id
            );
          } else {
            // Add to visible ids
            settings.visibleIds.push(preset.id);
          }
        });
      },

      handleEdit: (preset) => {
        set((state) => {
          state.currentEditingPreset = preset;
          state.isNewPreset = false;
          state.editDialogOpen = true;
        });
      },

      handleDuplicate: (type, preset) => {
        const state = get();
        if (type === "pageSize" && "width" in preset.data) {
          const pageSize = preset.data as PageSize;
          state.addCustomPageSize({
            name: `${pageSize.name}_copy`,
            id: `${pageSize.name}_copy`,
            width: pageSize.width,
            height: pageSize.height,
            margin: pageSize.margin,
            label: `${pageSize.label} (Copy)`,
          });
        } else if (type === "layout" && "cellWidth" in preset.data) {
          const layout = preset.data as LayoutPreset;
          state.addCustomLayout({
            name: `${layout.name}_copy`,
            id: `${layout.id}_copy`,
            cellWidth: layout.cellWidth,
            cellHeight: layout.cellHeight,
            label: `${layout.label} (Copy)`,
          });
        }
      },

      handleNewPreset: (type) => {
        const newPreset: EditablePreset = {
          id: `new_${Date.now()}`,
          name: "",
          label: "",
          isBuiltIn: false,
          isVisible: true,
          order: 999,
          data:
            type === "pageSize"
              ? { name: "", width: 0, height: 0, margin: 0, label: "" }
              : { id: "", name: "", cellWidth: 0, cellHeight: 0, label: "" },
        };

        set((state) => {
          state.currentEditingPreset = newPreset;
          state.isNewPreset = true;
          state.editDialogOpen = true;
        });
      },

      handleSaveEdit: (type, editedPreset) => {
        set((state) => {
          const isPageSize = type === "pageSize";

          if (state.isNewPreset) {
            // Create new preset
            if (isPageSize && "width" in editedPreset.data) {
              const pageSize = editedPreset.data as PageSize;
              state.customPageSizes.push({
                ...pageSize,
                isCustom: true,
              } as CustomPageSize);

              // Update settings
              if (!state.pageSizeSettings.visibleIds.includes(pageSize.name)) {
                state.pageSizeSettings.visibleIds.push(pageSize.name);
              }
              if (!state.pageSizeSettings.order.includes(pageSize.name)) {
                state.pageSizeSettings.order.push(pageSize.name);
              }
            } else if (!isPageSize && "cellWidth" in editedPreset.data) {
              const layout = editedPreset.data as LayoutPreset;
              state.customLayouts.push({
                ...layout,
                isCustom: true,
              } as CustomLayoutPreset);

              // Update settings
              if (!state.layoutSettings.visibleIds.includes(layout.id)) {
                state.layoutSettings.visibleIds.push(layout.id);
              }
              if (!state.layoutSettings.order.includes(layout.id)) {
                state.layoutSettings.order.push(layout.id);
              }
            }
          } else {
            // Update existing preset
            if (isPageSize) {
              const index = state.customPageSizes.findIndex(
                (p) => p.name === editedPreset.id
              );
              if (index !== -1 && "width" in editedPreset.data) {
                const pageSize = editedPreset.data as PageSize;
                state.customPageSizes[index] = {
                  ...pageSize,
                  isCustom: true,
                } as CustomPageSize;
              }
            } else {
              const index = state.customLayouts.findIndex(
                (l) => l.id === editedPreset.id
              );
              if (index !== -1 && "cellWidth" in editedPreset.data) {
                const layout = editedPreset.data as LayoutPreset;
                state.customLayouts[index] = {
                  ...layout,
                  isCustom: true,
                } as CustomLayoutPreset;
              }
            }
          }

          state.editDialogOpen = false;
          state.currentEditingPreset = null;
        });
      },

      confirmDelete: (preset) => {
        set((state) => {
          state.currentEditingPreset = preset;
          state.deleteDialogOpen = true;
        });
      },

      handleDelete: (type, presetId) => {
        set((state) => {
          if (type === "pageSize") {
            state.customPageSizes = state.customPageSizes.filter(
              (size) => size.name !== presetId
            );
            state.pageSizeSettings.visibleIds =
              state.pageSizeSettings.visibleIds.filter((id) => id !== presetId);
            state.pageSizeSettings.order = state.pageSizeSettings.order.filter(
              (id) => id !== presetId
            );
          } else {
            state.customLayouts = state.customLayouts.filter(
              (layout) => layout.id !== presetId
            );
            state.layoutSettings.visibleIds =
              state.layoutSettings.visibleIds.filter((id) => id !== presetId);
            state.layoutSettings.order = state.layoutSettings.order.filter(
              (id) => id !== presetId
            );
          }
          state.deleteDialogOpen = false;
          state.currentEditingPreset = null;
        });
      },

      closeEditDialog: () => {
        set((state) => {
          state.editDialogOpen = false;
          state.currentEditingPreset = null;
        });
      },

      closeDeleteDialog: () => {
        set((state) => {
          state.deleteDialogOpen = false;
          state.currentEditingPreset = null;
        });
      },

      exportPresets: (type) => {
        const state = get();
        const dataToExport =
          type === "pageSize" ? state.customPageSizes : state.customLayouts;

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
          dataStr
        )}`;

        const exportName = `${type}-presets-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportName);
        linkElement.click();
      },

      importPresets: (type, data) => {
        try {
          const importedData = JSON.parse(data);

          set((state) => {
            if (type === "pageSize" && Array.isArray(importedData)) {
              importedData.forEach((item) => {
                if (item.width && item.height) {
                  const newSize: CustomPageSize = {
                    name: item.name || `imported_${Date.now()}`,
                    width: Number(item.width),
                    height: Number(item.height),
                    margin: Number(item.margin || 0),
                    label: item.label || item.name || "Imported Size",
                    isCustom: true,
                  };

                  // Check for duplicates
                  if (
                    !state.customPageSizes.some((s) => s.name === newSize.name)
                  ) {
                    state.customPageSizes.push(newSize);

                    // Update settings
                    if (
                      !state.pageSizeSettings.visibleIds.includes(newSize.name)
                    ) {
                      state.pageSizeSettings.visibleIds.push(newSize.name);
                    }
                    if (!state.pageSizeSettings.order.includes(newSize.name)) {
                      state.pageSizeSettings.order.push(newSize.name);
                    }
                  }
                }
              });
            } else if (type === "layout" && Array.isArray(importedData)) {
              importedData.forEach((item) => {
                if (item.cellWidth && item.cellHeight) {
                  const newLayout: CustomLayoutPreset = {
                    id: item.id || `imported_${Date.now()}`,
                    name: item.name || `imported_${Date.now()}`,
                    cellWidth: Number(item.cellWidth),
                    cellHeight: Number(item.cellHeight),
                    label: item.label || item.name || "Imported Layout",
                    isCustom: true,
                  };

                  // Check for duplicates
                  if (!state.customLayouts.some((l) => l.id === newLayout.id)) {
                    state.customLayouts.push(newLayout);

                    // Update settings
                    if (
                      !state.layoutSettings.visibleIds.includes(newLayout.id)
                    ) {
                      state.layoutSettings.visibleIds.push(newLayout.id);
                    }
                    if (!state.layoutSettings.order.includes(newLayout.id)) {
                      state.layoutSettings.order.push(newLayout.id);
                    }
                  }
                }
              });
            }
          });
        } catch (error) {
          console.error("Failed to import presets:", error);
        }
      },
    })),
    {
      name: "preset-storage",
      partialize: (state) => ({
        customPageSizes: state.customPageSizes,
        customLayouts: state.customLayouts,
        pageSizeSettings: state.pageSizeSettings,
        layoutSettings: state.layoutSettings,
      }),
    }
  )
);

// Initialize the store with defaults on first load
usePresetStore.getState().initializeDefaults();
