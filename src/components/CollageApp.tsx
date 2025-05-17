
import { useRef } from 'react';
import { PageSizeSelector } from './PageSizeSelector';
import { LayoutSelector } from './LayoutSelector';
import { ImageUploader } from './ImageUploader';
import { CollageCanvas } from './CollageCanvas';
import { ExportPanel } from './ExportPanel';
import { useCollage } from '@/context/CollageContext';
import { pageSizes } from '@/data/page-sizes';
import { layoutPresets } from '@/data/layout-presets';

export function CollageApp() {
  const { 
    collageState, 
    updatePageSize, 
    updateLayout, 
    handleImagesAdded, 
    assignImageToCell,
    removeImage,
    updateImageCount,
    rearrangeCollage 
  } = useCollage();
  
  const collageRef = useRef<HTMLDivElement>(null);
  const maxCells = collageState.rows * collageState.columns;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      <div className="flex flex-col w-full md:w-1/4 space-y-6">
        <PageSizeSelector 
          pageSizes={pageSizes} 
          selectedPageSize={collageState.pageSize} 
          onSelect={updatePageSize} 
        />
        
        <LayoutSelector 
          layouts={layoutPresets} 
          selectedLayout={collageState.layout} 
          onSelect={updateLayout}
        />
        
        <ImageUploader 
          onImagesAdded={handleImagesAdded} 
          images={collageState.images}
          onImageRemove={removeImage}
          onUpdateCount={updateImageCount}
          onRearrange={rearrangeCollage}
          maxCells={maxCells}
        />
        
        <ExportPanel 
          collageRef={collageRef}
          pageSize={collageState.pageSize}
          isEnabled={collageState.images.length > 0}
        />
      </div>
      
      <div className="w-full md:w-3/4 bg-muted rounded-lg p-4">
        <CollageCanvas 
          ref={collageRef}
          collageState={collageState}
          onAssignImage={assignImageToCell}
        />
      </div>
    </div>
  );
}
