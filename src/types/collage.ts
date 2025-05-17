
export interface PageSize {
  name: string;
  width: number;   // in mm
  height: number;  // in mm
  label: string;
}

export interface LayoutPreset {
  id: string;
  name: string;
  cellWidth: number;  // in mm
  cellHeight: number; // in mm
  label: string;
  margin: number;     // in mm
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
  rows: number;
  columns: number;
}

export type ExportFormat = 'png' | 'pdf';
