
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { pageSizes } from '@/data/page-sizes';
import { layoutPresets } from '@/data/layout-presets';
import { CollageState, CollageImage, CollageCell } from '@/types/collage';
import { toast } from '@/hooks/use-toast';

interface CollageContextType {
  collageState: CollageState;
  updatePageSize: (pageSizeIndex: number) => void;
  updateLayout: (layoutIndex: number) => void;
  handleImagesAdded: (newImages: CollageImage[]) => void;
  assignImageToCell: (rowIndex: number, colIndex: number, imageId: string) => void;
  removeImage: (imageId: string) => void;
  updateImageCount: (imageId: string, count: number) => void;
  rearrangeCollage: () => void;
}

const CollageContext = createContext<CollageContextType | undefined>(undefined);

// Helper function to calculate the maximum number of cells that can fit on a page
function calculateGridDimensions(pageWidth: number, pageHeight: number, cellWidth: number, cellHeight: number, margin: number) {
  // Calculate usable area by removing margins from all sides
  const usableWidth = pageWidth - (margin * 2);
  const usableHeight = pageHeight - (margin * 2);
  
  // Calculate how many cells can fit in each dimension
  const columns = Math.floor(usableWidth / cellWidth);
  const rows = Math.floor(usableHeight / cellHeight);
  
  return { rows, columns };
}

export function CollageProvider({ children }: { children: ReactNode }) {
  // Calculate initial grid dimensions
  const initialLayout = layoutPresets[0];
  const initialPageSize = pageSizes[0];
  const initialGrid = calculateGridDimensions(
    initialPageSize.width,
    initialPageSize.height,
    initialLayout.cellWidth,
    initialLayout.cellHeight,
    initialLayout.margin
  );

  const [collageState, setCollageState] = useState<CollageState>({
    pageSize: initialPageSize,
    layout: initialLayout,
    images: [],
    cells: [],
    rows: initialGrid.rows,
    columns: initialGrid.columns
  });

  const updatePageSize = (pageSizeIndex: number) => {
    const newPageSize = pageSizes[pageSizeIndex];
    
    setCollageState(prev => {
      // Recalculate grid dimensions based on new page size
      const { rows, columns } = calculateGridDimensions(
        newPageSize.width,
        newPageSize.height,
        prev.layout.cellWidth,
        prev.layout.cellHeight,
        prev.layout.margin
      );
      
      return {
        ...prev,
        pageSize: newPageSize,
        rows,
        columns
      };
    });
    
    // After changing page size, we need to reinitialize the cells
    initializeCells();
    
    toast({ 
      title: "Page size updated",
      description: `Changed to ${newPageSize.label}`
    });
  };

  const updateLayout = (layoutIndex: number) => {
    const newLayout = layoutPresets[layoutIndex];
    
    setCollageState(prev => {
      // Calculate new grid dimensions based on the selected layout
      const { rows, columns } = calculateGridDimensions(
        prev.pageSize.width,
        prev.pageSize.height,
        newLayout.cellWidth,
        newLayout.cellHeight,
        newLayout.margin
      );
      
      // Create a new cells grid based on the calculated dimensions
      const newCells: CollageCell[][] = Array(rows)
        .fill(null)
        .map((_, rowIndex) => 
          Array(columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null
            }))
        );
      
      return {
        ...prev,
        layout: newLayout,
        rows,
        columns,
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
      const updatedImages = [...prev.images, ...newImages.map(img => ({
        ...img,
        count: 1 // Initialize count to 1 for each image
      }))];
      
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

  const updateImageCount = (imageId: string, count: number) => {
    setCollageState(prev => {
      const updatedImages = prev.images.map(img => 
        img.id === imageId ? { ...img, count } : img
      );
      
      return {
        ...prev,
        images: updatedImages
      };
    });
  };

  const rearrangeCollage = () => {
    setCollageState(prev => {
      const totalCells = prev.rows * prev.columns;
      
      // Create a new cells grid
      const newCells: CollageCell[][] = Array(prev.rows)
        .fill(null)
        .map((_, rowIndex) => 
          Array(prev.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null
            }))
        );
      
      // Create an array of image IDs based on their counts
      const imagePool: string[] = [];
      prev.images.forEach(image => {
        if (image.count && image.count > 0) {
          // Add image ID to pool as many times as its count
          for (let i = 0; i < Math.min(image.count, totalCells); i++) {
            imagePool.push(image.id);
          }
        }
      });
      
      // Limit the pool to total number of cells
      const limitedPool = imagePool.slice(0, totalCells);
      
      // Fill cells with images from the pool
      let poolIndex = 0;
      for (let rowIndex = 0; rowIndex < prev.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < prev.columns; colIndex++) {
          if (poolIndex < limitedPool.length) {
            newCells[rowIndex][colIndex].imageId = limitedPool[poolIndex];
            poolIndex++;
          }
        }
      }
      
      toast({ 
        title: "Collage rearranged", 
        description: `Applied image quantities to the layout (${poolIndex} of ${totalCells} cells filled)`
      });
      
      return {
        ...prev,
        cells: newCells
      };
    });
  };

  const initializeCells = useCallback(() => {
    setCollageState(prev => {
      // Calculate grid dimensions
      const { rows, columns } = calculateGridDimensions(
        prev.pageSize.width,
        prev.pageSize.height,
        prev.layout.cellWidth,
        prev.layout.cellHeight,
        prev.layout.margin
      );
      
      // Create a new cells grid
      const newCells: CollageCell[][] = Array(rows)
        .fill(null)
        .map((_, rowIndex) => 
          Array(columns)
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
          rows,
          columns,
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
        rows,
        columns,
        cells: newCells
      };
    });
  }, []);

  // Initialize cells when the component first mounts
  useState(() => {
    initializeCells();
  });

  return (
    <CollageContext.Provider value={{ 
      collageState, 
      updatePageSize, 
      updateLayout, 
      handleImagesAdded, 
      assignImageToCell,
      removeImage,
      updateImageCount,
      rearrangeCollage
    }}>
      {children}
    </CollageContext.Provider>
  );
}

export const useCollage = () => {
  const context = useContext(CollageContext);
  if (context === undefined) {
    throw new Error('useCollage must be used within a CollageProvider');
  }
  return context;
};
