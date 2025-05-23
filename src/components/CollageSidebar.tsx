import { RefObject } from "react";
import { PageSizeSelector } from "./PageSizeSelector";
import { LayoutSelector } from "./LayoutSelector";
import { ImageUploader } from "./ImageUploader";
import { ExportPanel } from "./ExportPanel";
import { useCollage } from "@/context/CollageContext";
import { pageSizes } from "@/data/page-sizes";
import { layoutPresets } from "@/data/layout-presets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface CollageSidebarProps {
  collageRef: RefObject<HTMLDivElement>;
}

export function CollageSidebar({ collageRef }: CollageSidebarProps) {
  const {
    collageState,
    updatePageSize,
    updateLayout,
    handleImagesAdded,
    removeImage,
    updateImageCount,
    updateImageSettings,
    rearrangeCollage,
    distributeEqually,
    setSpaceOptimization,
    toggleCuttingMarkers,
    resetCanvas,
    clearAll,
    setUnit,
    createCustomPageSize,
    createCustomLayout,
  } = useCollage();

  const maxCells = collageState.rows * collageState.columns;
  return (
    <div className="w-full lg:w-1/4 p-4 overflow-y-auto border-r">
      <div className="space-y-6 pb-6">
        <Accordion type="single" collapsible defaultValue="page-size">
          <AccordionItem value="page-size">
            <AccordionTrigger className="text-lg font-semibold">
              Page Size
            </AccordionTrigger>
            <AccordionContent>
              <PageSizeSelector
                pageSizes={pageSizes}
                selectedPageSize={collageState.pageSize}
                onSelect={updatePageSize}
                onCustomSize={createCustomPageSize}
                selectedUnit={collageState.selectedUnit}
                onUnitChange={setUnit}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="photo-size">
            <AccordionTrigger className="text-lg font-semibold">
              Photo Size
            </AccordionTrigger>
            <AccordionContent>
              <LayoutSelector
                layouts={layoutPresets}
                selectedLayout={collageState.layout}
                onSelect={updateLayout}
                onCustomLayout={createCustomLayout}
                selectedUnit={collageState.selectedUnit}
                spaceOptimization={collageState.spaceOptimization}
                onSpaceOptimizationChange={setSpaceOptimization}
                cellCount={maxCells}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="photos">
            <AccordionTrigger className="text-lg font-semibold">
              Photos
            </AccordionTrigger>
            <AccordionContent>
              <ImageUploader
                onImagesAdded={handleImagesAdded}
                images={collageState.images}
                onImageRemove={removeImage}
                onUpdateImage={updateImageSettings}
                onUpdateCount={updateImageCount}
                onRearrange={rearrangeCollage}
                onDistributeEqually={distributeEqually}
                maxCells={maxCells}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export">
            <AccordionTrigger className="text-lg font-semibold">
              Options & Export
            </AccordionTrigger>
            <AccordionContent>
              <ExportPanel
                collageRef={collageRef}
                pageSize={collageState.pageSize}
                isEnabled={collageState.images.length > 0}
                onToggleCuttingMarkers={toggleCuttingMarkers}
                showCuttingMarkers={collageState.showCuttingMarkers}
                onResetCanvas={resetCanvas}
                onClearAll={clearAll}
                selectedUnit={collageState.selectedUnit}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
