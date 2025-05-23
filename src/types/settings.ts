import { MeasurementUnit, SpaceOptimization } from "./collage";

export interface Settings {
  pageSizeIndex: number;
  layoutIndex: number;
  spaceOptimization: SpaceOptimization;
  selectedUnit: MeasurementUnit;
}
