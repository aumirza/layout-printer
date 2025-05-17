
export interface PageSize {
  name: string;
  width: number;   // in mm
  height: number;  // in mm
  label: string;
}

export interface LayoutPreset {
  id: string;
  name: string;
  rows: number;
  columns: number;
  cellWidth: number;  // in mm
  cellHeight: number; // in mm
  label: string;
}

export interface CollageImage {
  id: string;
  src: string;
  name: string;
  count?: number;
}

export interface CollageCell {
  id: string;
  imageId: string | null;
}

export interface CollageState {
  pageSize: PageSize;
  layout: LayoutPreset;
  images: CollageImage[];
  cells: CollageCell[][];
}

export type ExportFormat = 'png' | 'pdf';
