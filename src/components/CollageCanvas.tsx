import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CollageState, ImageFitOption, CollageCell } from "@/types/collage";
import { UnitConverter } from "@/lib/unit-converter";

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

    // Calculate the scale factor to fit the page on the screen
    const maxWidth = 800; // Maximum width in pixels
    const scaleFactor = Math.min(1, maxWidth / pageSize.width);

    // Convert mm to pixels using the scale factor
    const pxWidth = pageSize.width * scaleFactor;
    const pxHeight = pageSize.height * scaleFactor;
    const cellPxWidth = layout.cellWidth * scaleFactor;
    const cellPxHeight = layout.cellHeight * scaleFactor;
    const marginPx = layout.margin * scaleFactor;

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
      if (!imageId) return "cover";
      const image = images.find((img) => img.id === imageId);
      return image?.fit || "cover";
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
              width: `${pxWidth}px`,
              height: `${pxHeight}px`,
              position: "relative",
              overflow: "hidden",
              padding: `${marginPx}px`,
            }}
          >
            {/* Render the grid of cells */}
            {cells.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const hasImage = cell.imageId !== null;
                const image = images.find((img) => img.id === cell.imageId);
                const objectFit = getObjectFitStyle(cell.imageId);

                return (
                  <div
                    key={cell.id}
                    className={cn(
                      "absolute overflow-hidden",
                      !hasImage && "bg-muted/30",
                      hasImage && "bg-center"
                    )}
                    style={{
                      width: `${cellPxWidth}px`,
                      height: `${cellPxHeight}px`,
                      left: `${marginPx + colIndex * cellPxWidth}px`,
                      top: `${marginPx + rowIndex * cellPxHeight}px`,
                    }}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {hasImage && image ? (
                      <>
                        <img
                          src={image.src}
                          alt={image.name}
                          className={cn("w-full h-full cursor-pointer", {
                            "object-cover": objectFit === "cover",
                            "object-contain": objectFit === "contain",
                            "object-none": objectFit === "original",
                          })}
                          style={{
                            objectPosition: "center",
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
