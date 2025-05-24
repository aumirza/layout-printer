import { PageSize } from "@/types/collage";

export const pageSizes: PageSize[] = [
  { id: "a4", name: "a4", width: 210, height: 297, label: "A4", margin: 5 },
  { id: "a3", name: "a3", width: 297, height: 420, label: "A3", margin: 7 },
  {
    id: "letter",
    name: "letter",
    width: 215.9,
    height: 279.4,
    label: "Letter",
    margin: 5,
  },
  {
    id: "12x18",
    name: "12x18",
    width: 304.8,
    height: 457.2,
    label: "12×18 inches",
    margin: 7,
  },
  {
    id: "5x7",
    name: "5x7",
    width: 127,
    height: 177.8,
    label: "5×7 inches",
    margin: 4,
  },
  {
    id: "6x4",
    name: "6x4",
    width: 152.4,
    height: 101.6,
    label: "6×4 inches",
    margin: 4,
  },
  {
    id: "8.5x11",
    name: "8.5x11",
    width: 215.9,
    height: 279.4,
    label: "8.5×11 inches",
    margin: 5,
  },
  {
    id: "11x17",
    name: "11x17",
    width: 279.4,
    height: 431.8,
    label: "11×17 inches",
    margin: 7,
  },
];

// Helper function to create a custom page size
export const createCustomPageSize = (
  width: number,
  height: number,
  margin: number = 5
): PageSize => {
  return {
    name: "custom",
    width,
    height,
    label: "Custom Size",
    margin,
  };
};
