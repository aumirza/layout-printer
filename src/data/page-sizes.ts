
import { PageSize } from "@/types/collage";

export const pageSizes: PageSize[] = [
  { name: "a4", width: 210, height: 297, label: "A4" },
  { name: "a3", width: 297, height: 420, label: "A3" },
  { name: "letter", width: 215.9, height: 279.4, label: "Letter" },
  { name: "12x18", width: 304.8, height: 457.2, label: "12×18 inches" },
  { name: "5x7", width: 127, height: 177.8, label: "5×7 inches" },
  { name: "6x4", width: 152.4, height: 101.6, label: "6×4 inches" },
  { name: "8.5x11", width: 215.9, height: 279.4, label: "8.5×11 inches" },
  { name: "11x17", width: 279.4, height: 431.8, label: "11×17 inches" }
];

// Helper function to create a custom page size
export const createCustomPageSize = (width: number, height: number): PageSize => {
  return {
    name: "custom",
    width,
    height,
    label: "Custom Size"
  };
};
