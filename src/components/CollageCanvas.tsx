import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CollageState, ImageFitOption, CollageCell } from "@/types/collage";
import { UnitConverter } from "@/lib/unit-converter";
import { CanvasRenderer } from "@/lib/canvas-renderer";

interface CollageCanvasProps {
  collageState: CollageState;
  onAssignImage: (rowIndex: number, colIndex: number, imageId: string) => void;
}

export const CollageCanvas = forwardRef<HTMLDivElement, CollageCanvasProps>(
  ({ collageState, onAssignImage }, ref) => {
    const {
      pageSize,
      layout,
      cells,
      images,
      rows,
      columns,
      showCuttingMarkers,
      selectedUnit,
    } = collageState;
    const [activeCell, setActiveCell] = useState<{
      row: number;
      col: number;
    } | null>(null);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

    // Calculate actual screen DPI (default to 96 DPI if not available)
    const dpi = window.devicePixelRatio * 96;

    // Use shared renderer for consistent dimensions
    const canvasDimensions = CanvasRenderer.getCanvasDimensions(pageSize, dpi);
    const cellDimensions = CanvasRenderer.getCellDimensions(
      layout,
      pageSize.margin,
      dpi
    );

    // Reset the selected image when the images change
    useEffect(() => {
      if (images.length === 0) {
        setSelectedImageId(null);
      } else if (images.length === 1 && !selectedImageId) {
        setSelectedImageId(images[0].id);
      }
    }, [images, selectedImageId]);

    const handleCellClick = (rowIndex: number, colIndex: number) => {
      // Show image selection for this cell
      setActiveCell({ row: rowIndex, col: colIndex });
    };

    const handleImageSelect = (imageId: string) => {
      if (activeCell) {
        onAssignImage(activeCell.row, activeCell.col, imageId);
        setActiveCell(null); // Close the selection
      }
      setSelectedImageId(imageId);
    };

    const closeImageSelection = () => {
      setActiveCell(null);
    };

    // Get object-fit style based on image fit option
    const getObjectFitStyle = (imageId: string | null): ImageFitOption => {
      return CanvasRenderer.getImageFitFromCollageImage(images, imageId);
    };

    // Get transform and container styles based on cell orientation
    const getOrientationStyles = (
      cell: CollageCell,
      objectFit: ImageFitOption
    ) => {
      return CanvasRenderer.getOrientationStyles(
        cell,
        objectFit,
        cellDimensions.cellWidth,
        cellDimensions.cellHeight
      );
    };

    // Format dimensions according to selected unit
    const formatDimension = (value: number): string => {
      return UnitConverter.formatDimension(value, selectedUnit, 1);
    };

    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 relative">
          <div
            ref={ref}
            className="bg-white shadow-md mx-auto"
            style={{
              width: `${canvasDimensions.width}px`,
              height: `${canvasDimensions.height}px`,
              position: "relative",
              overflow: "hidden",
              padding: `${cellDimensions.margin}px`,
            }}
          >
            {/* Render the grid of cells */}
            {cells.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const hasImage = cell.imageId !== null;
                const image = images.find((img) => img.id === cell.imageId);
                const objectFit = getObjectFitStyle(cell.imageId);
                const cellPosition = CanvasRenderer.getCellPosition(
                  rowIndex,
                  colIndex,
                  cellDimensions
                );

                return (
                  <div
                    key={cell.id}
                    className={cn(
                      "absolute overflow-hidden",
                      !hasImage && "bg-muted/30",
                      hasImage && "bg-center"
                    )}
                    style={{
                      width: `${cellPosition.width}px`,
                      height: `${cellPosition.height}px`,
                      left: `${cellPosition.left}px`,
                      top: `${cellPosition.top}px`,
                    }}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {hasImage && image ? (
                      <>
                        <img
                          src={image.src}
                          alt={image.name}
                          className={cn(
                            "w-full h-full cursor-pointer",
                            CanvasRenderer.getObjectFitClass(objectFit)
                          )}
                          style={{
                            objectPosition: "center center",
                            objectFit:
                              objectFit === "original" ? "none" : objectFit,
                            ...getOrientationStyles(cell, objectFit),
                          }}
                          draggable={false}
                        />
                        {showCuttingMarkers && (
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Use thin 2mm markers as requested */}
                            <div className="absolute left-0 top-0 w-2 h-2 border-t-[1px] border-l-[1px] border-gray-400"></div>
                            <div className="absolute right-0 top-0 w-2 h-2 border-t-[1px] border-r-[1px] border-gray-400"></div>
                            <div className="absolute left-0 bottom-0 w-2 h-2 border-b-[1px] border-l-[1px] border-gray-400"></div>
                            <div className="absolute right-0 bottom-0 w-2 h-2 border-b-[1px] border-r-[1px] border-gray-400"></div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full cursor-pointer">
                        <span className="text-xs text-muted-foreground">
                          Empty
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Image selection popup */}
          {activeCell && images.length > 0 && (
            <div className="absolute bg-white border rounded-lg shadow-lg p-2 mt-2 z-10">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Select Image</h4>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={closeImageSelection}
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={cn(
                      "p-1 border rounded cursor-pointer",
                      selectedImageId === image.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleImageSelect(image.id)}
                  >
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-12 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* <div className="text-center text-sm text-muted-foreground mt-2">
          <p>
            {pageSize.label} - {formatDimension(pageSize.width)}×{formatDimension(pageSize.height)} 
            ({cells.flat().filter(cell => cell.imageId !== null).length} of {rows * columns} cells filled)
          </p>
          <p className="text-xs mt-1">Photo size: {formatDimension(layout.cellWidth)}×{formatDimension(layout.cellHeight)}</p>
        </div> */}
      </div>
    );
  }
);

CollageCanvas.displayName = "CollageCanvas";
