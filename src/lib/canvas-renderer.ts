import {
  CollageState,
  CollageCell,
  ImageFitOption,
  CollageImage,
} from "@/types/collage";

// Color conversion utility for oklch to hex - used for export compatibility
const oklchToHex = (oklchString: string): string => {
  const oklchColorMap: Record<string, string> = {
    "oklch(1 0 0)": "#ffffff",
    "oklch(0.129 0.042 264.695)": "#020817",
    "oklch(0.208 0.042 265.755)": "#0f172a",
    "oklch(0.984 0.003 247.858)": "#f8fafc",
    "oklch(0.968 0.007 247.896)": "#f1f5f9",
    "oklch(0.554 0.046 257.417)": "#64748b",
    "oklch(0.577 0.245 27.325)": "#ef4444",
    "oklch(0.929 0.013 255.508)": "#e2e8f0",
    "oklch(0.704 0.04 256.788)": "#94a3b8",
    "oklch(0.646 0.222 41.116)": "#f97316",
    "oklch(0.6 0.118 184.704)": "#06b6d4",
    "oklch(0.398 0.07 227.392)": "#3b82f6",
    "oklch(0.828 0.189 84.429)": "#eab308",
    "oklch(0.769 0.188 70.08)": "#f59e0b",
    "oklch(0.279 0.041 260.031)": "#1e293b",
    "oklch(0.704 0.191 22.216)": "#dc2626",
    "oklch(1 0 0 / 10%)": "rgba(255, 255, 255, 0.1)",
    "oklch(1 0 0 / 15%)": "rgba(255, 255, 255, 0.15)",
    "oklch(0.551 0.027 264.364)": "#475569",
    "oklch(0.488 0.243 264.376)": "#3b82f6",
    "oklch(0.696 0.17 162.48)": "#10b981",
    "oklch(0.627 0.265 303.9)": "#8b5cf6",
    "oklch(0.645 0.246 16.439)": "#ef4444",
  };

  return oklchColorMap[oklchString] || oklchString;
};

export interface CanvasRendererOptions {
  dpi?: number;
  forExport?: boolean;
}

export class CanvasRenderer {
  private static mmToPixels(mm: number, dpi: number = 96): number {
    return (mm / 25.4) * dpi;
  }

  static getCanvasDimensions(
    pageSize: { width: number; height: number },
    dpi: number = 96
  ) {
    return {
      width: this.mmToPixels(pageSize.width, dpi),
      height: this.mmToPixels(pageSize.height, dpi),
    };
  }

  static getCellDimensions(
    layout: { cellWidth: number; cellHeight: number },
    pageMargin: number,
    dpi: number = 96
  ) {
    return {
      cellWidth: this.mmToPixels(layout.cellWidth, dpi),
      cellHeight: this.mmToPixels(layout.cellHeight, dpi),
      margin: this.mmToPixels(pageMargin, dpi),
    };
  }

  static getCellPosition(
    rowIndex: number,
    colIndex: number,
    cellDimensions: ReturnType<typeof CanvasRenderer.getCellDimensions>
  ) {
    const { cellWidth, cellHeight, margin } = cellDimensions;
    return {
      left: margin + colIndex * cellWidth,
      top: margin + rowIndex * cellHeight,
      width: cellWidth,
      height: cellHeight,
    };
  }

  static getObjectFitClass(fit: ImageFitOption): string {
    switch (fit) {
      case "cover":
        return "object-cover";
      case "contain":
        return "object-contain";
      case "fill":
        return "object-fill";
      case "original":
        return "object-none";
      default:
        return "object-cover";
    }
  }

  static getOrientationStyles(
    cell: CollageCell,
    objectFit: ImageFitOption,
    cellWidth: number,
    cellHeight: number
  ) {
    const orientation = cell.orientation || "auto";

    if (orientation === "landscape") {
      // Calculate the scale factor needed after rotation
      const scaleRatio = cellWidth / cellHeight;

      let scaleTransform = "";

      if (objectFit === "cover" || objectFit === "fill") {
        scaleTransform = ` scale(${Math.max(scaleRatio, 1 / scaleRatio)})`;
      } else if (objectFit === "contain") {
        scaleTransform = ` scale(${Math.min(scaleRatio, 1 / scaleRatio)})`;
      }

      return {
        transform: `rotate(90deg)${scaleTransform}`,
        transformOrigin: "center",
      };
    }

    return {
      transform: "none",
      transformOrigin: "center",
    };
  }

  static getCuttingMarkersStyle() {
    return {
      position: "absolute" as const,
      inset: "0",
      pointerEvents: "none" as const,
    };
  }

  static getCuttingMarkerCorners() {
    return [
      {
        position:
          "absolute left-0 top-0 w-2 h-2 border-t-[1px] border-l-[1px] border-gray-400",
      },
      {
        position:
          "absolute right-0 top-0 w-2 h-2 border-t-[1px] border-r-[1px] border-gray-400",
      },
      {
        position:
          "absolute left-0 bottom-0 w-2 h-2 border-b-[1px] border-l-[1px] border-gray-400",
      },
      {
        position:
          "absolute right-0 bottom-0 w-2 h-2 border-b-[1px] border-r-[1px] border-gray-400",
      },
    ];
  }

  static getImageFitFromCollageImage(
    images: CollageImage[],
    imageId: string | null
  ): ImageFitOption {
    if (!imageId) return "cover";
    const image = images.find((img) => img.id === imageId);
    return image?.fit || "cover";
  }

  static renderCanvasElement(
    collageState: CollageState,
    options: CanvasRendererOptions = {}
  ): HTMLDivElement {
    const { dpi = 96, forExport = false } = options;
    const { pageSize, layout, cells, images, showCuttingMarkers } =
      collageState;

    // Calculate dimensions
    const canvasDimensions = this.getCanvasDimensions(pageSize, dpi);
    const cellDimensions = this.getCellDimensions(layout, pageSize.margin, dpi);

    // Create container element
    const container = document.createElement("div");
    container.style.cssText = `
      width: ${canvasDimensions.width}px;
      height: ${canvasDimensions.height}px;
      position: relative;
      overflow: hidden;
      padding: ${cellDimensions.margin}px;
      background-color: white;
      ${
        forExport
          ? "box-shadow: none;"
          : "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
      }
    `;

    // Render cells
    cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellPosition = this.getCellPosition(
          rowIndex,
          colIndex,
          cellDimensions
        );
        const hasImage = cell.imageId !== null;
        const image = images.find((img) => img.id === cell.imageId);
        const objectFit = this.getImageFitFromCollageImage(
          images,
          cell.imageId
        );

        // Create cell element
        const cellElement = document.createElement("div");
        cellElement.style.cssText = `
          position: absolute;
          width: ${cellPosition.width}px;
          height: ${cellPosition.height}px;
          left: ${cellPosition.left}px;
          top: ${cellPosition.top}px;
          overflow: hidden;
          ${!hasImage ? "background-color: rgba(0, 0, 0, 0.05);" : ""}
          background-position: center center;
        `;

        if (hasImage && image) {
          // Create image element
          const imgElement = document.createElement("img");
          imgElement.src = image.src;
          imgElement.alt = image.name;
          imgElement.draggable = false;

          const orientationStyles = this.getOrientationStyles(
            cell,
            objectFit,
            cellPosition.width,
            cellPosition.height
          );

          imgElement.style.cssText = `
            width: 100%;
            height: 100%;
            object-position: center center;
            object-fit: ${objectFit === "original" ? "none" : objectFit};
            transform: ${orientationStyles.transform};
            transform-origin: ${orientationStyles.transformOrigin};
            ${forExport ? "cursor: default;" : "cursor: pointer;"}
          `;

          cellElement.appendChild(imgElement);

          // Add cutting markers if enabled
          if (showCuttingMarkers) {
            const markersContainer = document.createElement("div");
            markersContainer.style.cssText = `
              position: absolute;
              inset: 0;
              pointer-events: none;
            `;

            // Add corner markers
            const corners = [
              "left: 0; top: 0; width: 8px; height: 8px; border-top: 1px solid #9ca3af; border-left: 1px solid #9ca3af;",
              "right: 0; top: 0; width: 8px; height: 8px; border-top: 1px solid #9ca3af; border-right: 1px solid #9ca3af;",
              "left: 0; bottom: 0; width: 8px; height: 8px; border-bottom: 1px solid #9ca3af; border-left: 1px solid #9ca3af;",
              "right: 0; bottom: 0; width: 8px; height: 8px; border-bottom: 1px solid #9ca3af; border-right: 1px solid #9ca3af;",
            ];

            corners.forEach((cornerStyle) => {
              const corner = document.createElement("div");
              corner.style.cssText = `position: absolute; ${cornerStyle}`;
              markersContainer.appendChild(corner);
            });

            cellElement.appendChild(markersContainer);
          }
        } else {
          // Empty cell
          const emptyText = document.createElement("div");
          emptyText.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            ${forExport ? "cursor: default;" : "cursor: pointer;"}
          `;
          emptyText.innerHTML =
            '<span style="font-size: 12px; color: #6b7280;">Empty</span>';
          cellElement.appendChild(emptyText);
        }

        container.appendChild(cellElement);
      });
    });

    return container;
  }
}
