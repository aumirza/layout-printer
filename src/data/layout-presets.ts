
import { LayoutPreset } from "@/types/collage";

export const layoutPresets: LayoutPreset[] = [
  { 
    id: "1x1.5_labels", 
    name: "1×1.5\" Labels", 
    rows: 10, 
    columns: 7, 
    cellWidth: 25.4, // 1 inch in mm
    cellHeight: 38.1, // 1.5 inch in mm
    label: "1×1.5\" Label Grid (70 labels)"
  },
  { 
    id: "2x2", 
    name: "2×2 Grid", 
    rows: 2, 
    columns: 2, 
    cellWidth: 89, 
    cellHeight: 127, 
    label: "2×2 Photo Grid (4 photos)" 
  },
  { 
    id: "3x3", 
    name: "3×3 Grid", 
    rows: 3, 
    columns: 3, 
    cellWidth: 65, 
    cellHeight: 89, 
    label: "3×3 Photo Grid (9 photos)" 
  },
  { 
    id: "4x4", 
    name: "4×4 Grid", 
    rows: 4, 
    columns: 4, 
    cellWidth: 50, 
    cellHeight: 65, 
    label: "4×4 Photo Grid (16 photos)" 
  },
  { 
    id: "2x3", 
    name: "2×3 Grid", 
    rows: 2, 
    columns: 3, 
    cellWidth: 76.2, // 3 inches in mm
    cellHeight: 127, // 5 inches in mm
    label: "2×3 Photo Grid (6 photos)" 
  },
  { 
    id: "passport_photos", 
    name: "Passport Photos", 
    rows: 5, 
    columns: 4, 
    cellWidth: 35, 
    cellHeight: 45, 
    label: "Passport Photos (20 photos)" 
  }
];
