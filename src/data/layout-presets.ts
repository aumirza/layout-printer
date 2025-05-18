
import { LayoutPreset } from "@/types/collage";

export const layoutPresets: LayoutPreset[] = [
  { 
    id: "1x1.5_labels", 
    name: "1×1.5\" Labels", 
    cellWidth: 25.4, // 1 inch in mm
    cellHeight: 38.1, // 1.5 inch in mm
    label: "1×1.5\" Photo",
    margin: 5 // 5mm margin
  },
  { 
    id: "2x2_photo", 
    name: "2×2\" Photo", 
    cellWidth: 50.8, // 2 inches in mm
    cellHeight: 50.8, // 2 inches in mm
    label: "2×2\" Photo",
    margin: 5
  },
  { 
    id: "3x3_photo", 
    name: "3×3\" Photo", 
    cellWidth: 76.2, // 3 inches in mm
    cellHeight: 76.2, // 3 inches in mm
    label: "3×3\" Photo",
    margin: 7
  },
  { 
    id: "3x5_photo", 
    name: "3×5\" Photo", 
    cellWidth: 76.2, // 3 inches in mm
    cellHeight: 127, // 5 inches in mm
    label: "3×5\" Photo",
    margin: 7
  },
  { 
    id: "passport_photo", 
    name: "Passport Photo", 
    cellWidth: 35, 
    cellHeight: 45, 
    label: "Passport Photo",
    margin: 4
  },
  { 
    id: "2x3_photo", 
    name: "2×3\" Photo", 
    cellWidth: 50.8, // 2 inches in mm
    cellHeight: 76.2, // 3 inches in mm
    label: "2×3\" Photo",
    margin: 5
  },
  { 
    id: "wallet_size", 
    name: "Wallet Size", 
    cellWidth: 63.5, // 2.5 inches in mm
    cellHeight: 88.9, // 3.5 inches in mm
    label: "Wallet Size (2.5×3.5\")",
    margin: 5
  },
  { 
    id: "4x6_photo", 
    name: "4×6\" Photo", 
    cellWidth: 101.6, // 4 inches in mm
    cellHeight: 152.4, // 6 inches in mm
    label: "4×6\" Photo",
    margin: 7
  }
];

// Helper function to create a custom layout preset
export const createCustomLayout = (cellWidth: number, cellHeight: number, margin: number): LayoutPreset => {
  return {
    id: "custom",
    name: "Custom Layout",
    cellWidth,
    cellHeight,
    label: "Custom Size",
    margin
  };
};
