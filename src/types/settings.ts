import {
  LayoutPreset,
  MeasurementUnit,
  PageSize,
  SpaceOptimization,
} from "./collage";

export interface Settings {
  pageSize: PageSize;
  layout: LayoutPreset;
  spaceOptimization: SpaceOptimization;
  selectedUnit: MeasurementUnit;
}
