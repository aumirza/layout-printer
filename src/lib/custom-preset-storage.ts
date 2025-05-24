import { PageSize, LayoutPreset } from "@/types/collage";

const CUSTOM_PAGE_SIZES_KEY = "customPageSizes";
const CUSTOM_LAYOUTS_KEY = "customLayouts";

export interface CustomPageSize extends PageSize {
  isCustom: true;
}

export interface CustomLayoutPreset extends LayoutPreset {
  isCustom: true;
}

export class CustomPresetStorage {
  // Page Size methods
  static getCustomPageSizes(): CustomPageSize[] {
    try {
      const stored = localStorage.getItem(CUSTOM_PAGE_SIZES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveCustomPageSize(
    pageSize: Omit<CustomPageSize, "isCustom">
  ): CustomPageSize {
    const customPageSizes = this.getCustomPageSizes();
    const newPageSize: CustomPageSize = {
      ...pageSize,
      isCustom: true,
      name: `custom_${Date.now()}`,
    };

    customPageSizes.push(newPageSize);
    localStorage.setItem(
      CUSTOM_PAGE_SIZES_KEY,
      JSON.stringify(customPageSizes)
    );
    return newPageSize;
  }

  static deleteCustomPageSize(name: string): void {
    const customPageSizes = this.getCustomPageSizes().filter(
      (size) => size.name !== name
    );
    localStorage.setItem(
      CUSTOM_PAGE_SIZES_KEY,
      JSON.stringify(customPageSizes)
    );
  }

  // Layout Preset methods
  static getCustomLayouts(): CustomLayoutPreset[] {
    try {
      const stored = localStorage.getItem(CUSTOM_LAYOUTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveCustomLayout(
    layout: Omit<CustomLayoutPreset, "isCustom" | "id">
  ): CustomLayoutPreset {
    const customLayouts = this.getCustomLayouts();
    const newLayout: CustomLayoutPreset = {
      ...layout,
      isCustom: true,
      id: `custom_${Date.now()}`,
    };

    customLayouts.push(newLayout);
    localStorage.setItem(CUSTOM_LAYOUTS_KEY, JSON.stringify(customLayouts));
    return newLayout;
  }

  static deleteCustomLayout(id: string): void {
    const customLayouts = this.getCustomLayouts().filter(
      (layout) => layout.id !== id
    );
    localStorage.setItem(CUSTOM_LAYOUTS_KEY, JSON.stringify(customLayouts));
  }

  // Combined methods for getting all presets
  static getAllPageSizes(
    defaultSizes: PageSize[]
  ): (PageSize | CustomPageSize)[] {
    return [...defaultSizes, ...this.getCustomPageSizes()];
  }

  static getAllLayouts(
    defaultLayouts: LayoutPreset[]
  ): (LayoutPreset | CustomLayoutPreset)[] {
    return [...defaultLayouts, ...this.getCustomLayouts()];
  }
}
