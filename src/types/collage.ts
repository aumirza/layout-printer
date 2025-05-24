export interface PageSize {
  name: string;
  width: number; // in mm
  height: number; // in mm
  label: string;
  margin: number; // in mm
}

export interface LayoutPreset {
  id: string;
  name: string;
  cellWidth: number; // in mm
  cellHeight: number; // in mm
  label: string;
}

export interface CollageImage {
  id: string;
  src: string;
  name: string;
  count?: number;
  fit?: ImageFitOption;
  orientation?: ImageOrientation;
}

export type ImageFitOption = "cover" | "contain" | "fill" | "original";
export type ImageOrientation = "auto" | "portrait" | "landscape";
export type SpaceOptimization = "loose" | "tight";
export type MeasurementUnit = "mm" | "cm" | "in";

export interface CollageCell {
  id: string;
  imageId: string | null;
  orientation?: ImageOrientation;
}

export interface CollageState {
  pageSize: PageSize;
  layout: LayoutPreset;
  images: CollageImage[];
  cells: CollageCell[][];
  rows: number;
  columns: number;
  spaceOptimization: SpaceOptimization;
  showCuttingMarkers: boolean;
  selectedUnit: MeasurementUnit;
}

export type ExportFormat = "png" | "pdf" | "print";

export interface LayoutCalculation {
  rows: number;
  columns: number;
  orientation: ImageOrientation;
  totalCells: number;
}
