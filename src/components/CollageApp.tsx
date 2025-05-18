
import { useRef, useState, useEffect } from 'react';
import { PageSizeSelector } from './PageSizeSelector';
import { LayoutSelector } from './LayoutSelector';
import { ImageUploader } from './ImageUploader';
import { CollageCanvas } from './CollageCanvas';
import { ExportPanel } from './ExportPanel';
import { useCollage } from '@/context/CollageContext';
import { pageSizes } from '@/data/page-sizes';
import { layoutPresets } from '@/data/layout-presets';
import { InitialSetupModal } from './InitialSetupModal';

export function CollageApp() {
  const { 
    collageState, 
    updatePageSize, 
    updateLayout, 
    handleImagesAdded, 
    assignImageToCell,
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
    createCustomLayout
  } = useCollage();
  
  const [showSetupModal, setShowSetupModal] = useState(false);
  const collageRef = useRef<HTMLDivElement>(null);
  const maxCells = collageState.rows * collageState.columns;

  // Show setup modal on first load
  useEffect(() => {
    const hasSeenSetup = localStorage.getItem('hasSeenCollageSetup');
    if (!hasSeenSetup) {
      setShowSetupModal(true);
    }
  }, []);

  const handleInitialSetup = (settings: any) => {
    updatePageSize(settings.pageSizeIndex);
    updateLayout(settings.layoutIndex);
    setSpaceOptimization(settings.spaceOptimization);
    setUnit(settings.selectedUnit);
    
    localStorage.setItem('hasSeenCollageSetup', 'true');
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex flex-col w-full lg:w-1/4 space-y-6 overflow-auto max-h-screen lg:max-h-none pb-6">
          <PageSizeSelector 
            pageSizes={pageSizes} 
            selectedPageSize={collageState.pageSize} 
            onSelect={updatePageSize}
            onCustomSize={createCustomPageSize}
            selectedUnit={collageState.selectedUnit}
            onUnitChange={setUnit}
          />
          
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
        </div>
        
        <div className="w-full lg:w-3/4 bg-muted rounded-lg p-4">
          <CollageCanvas 
            ref={collageRef}
            collageState={collageState}
            onAssignImage={assignImageToCell}
          />
        </div>
      </div>

      <InitialSetupModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onApplySettings={handleInitialSetup}
      />
    </>
  );
}
