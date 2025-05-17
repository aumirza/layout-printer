
import { useState, useRef, useCallback } from 'react';
import { PageLayout } from './components/PageLayout';
import { PageSizeSelector } from './components/PageSizeSelector';
import { LayoutSelector } from './components/LayoutSelector';
import { ImageUploader } from './components/ImageUploader';
import { CollageCanvas } from './components/CollageCanvas';
import { ExportPanel } from './components/ExportPanel';
import { pageSizes } from './data/page-sizes';
import { layoutPresets } from './data/layout-presets';
import { CollageState, CollageImage, CollageCell } from './types/collage';
import { Toaster } from './components/toaster';
import { toast } from './hooks/use-toast';

function App() {
  const [collageState, setCollageState] = useState<CollageState>({
    pageSize: pageSizes[0],
    layout: layoutPresets[0],
    images: [],
    cells: []
  });
  
  const collageRef = useRef<HTMLDivElement>(null);

  const updatePageSize = (pageSizeIndex: number) => {
    const newPageSize = pageSizes[pageSizeIndex];
    setCollageState(prev => ({
      ...prev,
      pageSize: newPageSize
    }));
    
    // After changing page size, we need to reinitialize the cells
    initializeCells(prev => ({
      ...prev,
      layout: prev.layout,
      images: prev.images
    }));
    
    toast({ 
      title: "Page size updated",
      description: `Changed to ${newPageSize.label}`
    });
  };

  const updateLayout = (layoutIndex: number) => {
    const newLayout = layoutPresets[layoutIndex];
    setCollageState(prev => {
      // Create a new cells grid based on the new layout
      const newCells: CollageCell[][] = Array(newLayout.rows)
        .fill(null)
        .map((_, rowIndex) => 
          Array(newLayout.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null
            }))
        );
      
      return {
        ...prev,
        layout: newLayout,
        cells: newCells
      };
    });
    
    toast({ 
      title: "Layout updated", 
      description: `Changed to ${newLayout.label}`
    });
  };

  const handleImagesAdded = (newImages: CollageImage[]) => {
    setCollageState(prev => {
      const updatedImages = [...prev.images, ...newImages];
      
      // If there's only one image, auto-fill all cells with that image
      if (prev.images.length === 0 && newImages.length === 1) {
        const updatedCells = prev.cells.map(row =>
          row.map(cell => ({
            ...cell,
            imageId: newImages[0].id
          }))
        );
        
        return {
          ...prev,
          images: updatedImages,
          cells: updatedCells
        };
      }
      
      return {
        ...prev,
        images: updatedImages
      };
    });
    
    toast({ 
      title: "Images added", 
      description: `${newImages.length} new image(s) added`
    });
  };

  const assignImageToCell = (rowIndex: number, colIndex: number, imageId: string) => {
    setCollageState(prev => {
      const newCells = [...prev.cells];
      newCells[rowIndex][colIndex] = {
        ...newCells[rowIndex][colIndex],
        imageId
      };
      return {
        ...prev,
        cells: newCells
      };
    });
  };

  const removeImage = (imageId: string) => {
    setCollageState(prev => {
      // Remove image from images array
      const updatedImages = prev.images.filter(img => img.id !== imageId);
      
      // Clear this image from any cells
      const updatedCells = prev.cells.map(row =>
        row.map(cell => 
          cell.imageId === imageId 
            ? { ...cell, imageId: null } 
            : cell
        )
      );
      
      return {
        ...prev,
        images: updatedImages,
        cells: updatedCells
      };
    });
    
    toast({ 
      title: "Image removed", 
      description: "Image removed from collage"
    });
  };

  const initializeCells = useCallback(() => {
    setCollageState(prev => {
      const { layout } = prev;
      
      // Create a new cells grid
      const newCells: CollageCell[][] = Array(layout.rows)
        .fill(null)
        .map((_, rowIndex) => 
          Array(layout.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null
            }))
        );
      
      // If we have exactly one image, fill all cells with it
      if (prev.images.length === 1) {
        return {
          ...prev,
          cells: newCells.map(row => 
            row.map(cell => ({
              ...cell,
              imageId: prev.images[0].id
            }))
          )
        };
      }
      
      return {
        ...prev,
        cells: newCells
      };
    });
  }, []);

  // Initialize cells when the component first mounts
  useState(() => {
    initializeCells();
  });

  return (
    <PageLayout>
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
      <Toaster />
    </PageLayout>
  );
}

export default App;
