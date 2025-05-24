import { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Download,
  Printer,
  RefreshCw,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { ExportFormat, MeasurementUnit, CollageState } from "@/types/collage";
import { toast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { UnitConverter } from "@/lib/unit-converter";

// Color conversion utility for oklch to hex
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

// Convert CSS text to replace oklch functions
const convertOklchInCSS = (cssText: string): string => {
  const oklchRegex = /oklch\([^)]+\)/g;
  return cssText.replace(oklchRegex, (match) => oklchToHex(match));
};

// Function to convert oklch colors in computed styles of an element
const convertElementOklchColors = (element: HTMLElement): void => {
  const computedStyle = window.getComputedStyle(element);

  // Properties that might contain oklch colors
  const colorProperties = [
    "color",
    "backgroundColor",
    "borderColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "boxShadow",
    "textShadow",
    "fill",
    "stroke",
  ];

  colorProperties.forEach((prop) => {
    const value = computedStyle.getPropertyValue(prop);
    if (value && (value.includes("oklch") || value.includes("var("))) {
      // Handle both direct oklch values and CSS variables
      let convertedValue = value;

      // Convert oklch functions
      if (value.includes("oklch")) {
        convertedValue = convertOklchInCSS(value);
      }

      // Handle CSS variables that might contain oklch
      if (value.includes("var(")) {
        // Replace common CSS variables with hex equivalents
        convertedValue = convertedValue
          .replace(/var\(--background\)/g, "#ffffff")
          .replace(/var\(--foreground\)/g, "#020817")
          .replace(/var\(--muted\)/g, "#f1f5f9")
          .replace(/var\(--muted-foreground\)/g, "#64748b")
          .replace(/var\(--border\)/g, "#e2e8f0")
          .replace(/var\(--card\)/g, "#ffffff")
          .replace(/var\(--card-foreground\)/g, "#020817");
      }

      element.style.setProperty(prop, convertedValue, "important");
    }
  });

  // Recursively convert child elements
  Array.from(element.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      convertElementOklchColors(child);
    }
  });
};

// Function to create canvas with proper DPI metadata
const createHighDPICanvas = (
  sourceCanvas: HTMLCanvasElement,
  targetDPI: number
): HTMLCanvasElement => {
  const scaleFactor = targetDPI / 96;
  const newCanvas = document.createElement("canvas");
  const ctx = newCanvas.getContext("2d")!;

  // Set canvas size with DPI scaling
  newCanvas.width = sourceCanvas.width * scaleFactor;
  newCanvas.height = sourceCanvas.height * scaleFactor;

  // Scale context for DPI
  ctx.scale(scaleFactor, scaleFactor);

  // Draw the source canvas
  ctx.drawImage(sourceCanvas, 0, 0);

  return newCanvas;
};

// Function to create PNG with proper DPI metadata
const createPNGWithDPI = async (
  canvas: HTMLCanvasElement,
  dpi: number
): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          resolve(new Blob()); // Return empty blob as fallback
          return;
        }

        try {
          // Convert blob to array buffer
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          // Find the IHDR chunk end (should be at position 33 for standard PNG)
          const ihdrEnd = 33;

          // Calculate pixels per meter for DPI
          const pixelsPerMeter = Math.round(dpi * 39.3701); // 1 inch = 39.3701 mm

          // Create pHYs chunk
          const pHYsLength = 9; // pHYs chunk data length
          const pHYsChunk = new Uint8Array(12 + pHYsLength); // 4 (length) + 4 (type) + 9 (data) + 4 (CRC)

          // Length (4 bytes, big-endian)
          const lengthBytes = new Uint32Array([pHYsLength]);
          const lengthView = new DataView(lengthBytes.buffer);
          pHYsChunk[0] = lengthView.getUint8(3);
          pHYsChunk[1] = lengthView.getUint8(2);
          pHYsChunk[2] = lengthView.getUint8(1);
          pHYsChunk[3] = lengthView.getUint8(0);

          // Type "pHYs" (4 bytes)
          pHYsChunk[4] = 0x70; // 'p'
          pHYsChunk[5] = 0x48; // 'H'
          pHYsChunk[6] = 0x59; // 'Y'
          pHYsChunk[7] = 0x73; // 's'

          // Data (9 bytes)
          const pixelsView = new DataView(new ArrayBuffer(4));
          pixelsView.setUint32(0, pixelsPerMeter, false); // big-endian

          // X pixels per unit (4 bytes)
          pHYsChunk[8] = pixelsView.getUint8(0);
          pHYsChunk[9] = pixelsView.getUint8(1);
          pHYsChunk[10] = pixelsView.getUint8(2);
          pHYsChunk[11] = pixelsView.getUint8(3);

          // Y pixels per unit (4 bytes)
          pHYsChunk[12] = pixelsView.getUint8(0);
          pHYsChunk[13] = pixelsView.getUint8(1);
          pHYsChunk[14] = pixelsView.getUint8(2);
          pHYsChunk[15] = pixelsView.getUint8(3);

          // Unit specifier (1 byte): 1 = meters
          pHYsChunk[16] = 0x01;

          // CRC calculation (simplified - using 0 for now)
          pHYsChunk[17] = 0x00;
          pHYsChunk[18] = 0x00;
          pHYsChunk[19] = 0x00;
          pHYsChunk[20] = 0x00;

          // Create new PNG with pHYs chunk inserted after IHDR
          const newPNG = new Uint8Array(uint8Array.length + pHYsChunk.length);

          // Copy PNG header and IHDR chunk
          newPNG.set(uint8Array.slice(0, ihdrEnd), 0);

          // Insert pHYs chunk
          newPNG.set(pHYsChunk, ihdrEnd);

          // Copy rest of PNG data
          newPNG.set(uint8Array.slice(ihdrEnd), ihdrEnd + pHYsChunk.length);

          // Create blob from modified PNG
          const modifiedBlob = new Blob([newPNG], { type: "image/png" });
          resolve(modifiedBlob);
        } catch (error) {
          console.warn(
            "Failed to inject DPI metadata, using original PNG:",
            error
          );
          resolve(blob); // Fallback to original blob
        }
      },
      "image/png",
      1.0
    );
  });
};

// Function to convert canvas to blob with DPI metadata
const canvasToHighDPIBlob = (
  canvas: HTMLCanvasElement,
  dpi: number
): Promise<Blob> => {
  return createPNGWithDPI(canvas, dpi);
};

interface ExportPanelProps {
  collageRef: React.RefObject<HTMLDivElement>;
  collageState: CollageState;
  isEnabled: boolean;
  onToggleCuttingMarkers: (show: boolean) => void;
  onSetMarkerColor: (color: string) => void;
  showCuttingMarkers: boolean;
  onResetCanvas: () => void;
  onClearAll: () => void;
  selectedUnit: MeasurementUnit;
}

export function ExportPanel({
  collageRef,
  collageState,
  isEnabled,
  onToggleCuttingMarkers,
  onSetMarkerColor,
  showCuttingMarkers,
  onResetCanvas,
  onClearAll,
  selectedUnit,
}: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportScale, setExportScale] = useState(2); // Export scale multiplier
  const [customDpi, setCustomDpi] = useState(300); // Custom DPI value

  const handleExport = async () => {
    if (!collageRef.current || !isEnabled) return;

    setIsExporting(true);

    try {
      // Clone the canvas element for export processing
      const exportElement = collageRef.current.cloneNode(true) as HTMLElement;

      // Create a temporary container and add it to the document
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-99999px";
      tempContainer.style.top = "-99999px";
      tempContainer.appendChild(exportElement);
      document.body.appendChild(tempContainer);

      // Add CSS variable overrides to ensure compatible colors
      const styleOverride = document.createElement("style");
      styleOverride.innerHTML = `
        * {
          --background: #ffffff !important;
          --foreground: #020817 !important;
          --card: #ffffff !important;
          --card-foreground: #020817 !important;
          --popover: #ffffff !important;
          --popover-foreground: #020817 !important;
          --primary: #0f172a !important;
          --primary-foreground: #f8fafc !important;
          --secondary: #f1f5f9 !important;
          --secondary-foreground: #0f172a !important;
          --muted: #f1f5f9 !important;
          --muted-foreground: #64748b !important;
          --accent: #f1f5f9 !important;
          --accent-foreground: #0f172a !important;
          --destructive: #ef4444 !important;
          --destructive-foreground: #f8fafc !important;
          --border: #e2e8f0 !important;
          --input: #e2e8f0 !important;
          --ring: #94a3b8 !important;
          --radius: 0.5rem !important;
        }
      `;
      document.head.appendChild(styleOverride);

      // Convert oklch colors in the export element
      convertElementOklchColors(exportElement);

      // Wait a moment for style processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Calculate the actual scale needed to achieve the desired DPI
      // Canvas default is 96 DPI, so we need to scale accordingly
      const actualScale = (customDpi / 96) * exportScale;

      // Capture the processed canvas
      const canvas = await html2canvas(exportElement, {
        scale: actualScale, // Use calculated scale for true DPI
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        logging: false,
        width: exportElement.offsetWidth,
        height: exportElement.offsetHeight,
        imageTimeout: 15000,
      });

      // Clean up temporary elements
      document.body.removeChild(tempContainer);
      document.head.removeChild(styleOverride);

      if (exportFormat === "png") {
        // Export as PNG with proper DPI metadata
        const pngBlob = await createPNGWithDPI(canvas, customDpi);
        const url = URL.createObjectURL(pngBlob);

        const link = document.createElement("a");
        link.download = `collage-${Date.now()}.png`;
        link.href = url;
        link.click();

        // Clean up
        URL.revokeObjectURL(url);

        toast({
          title: "Export complete",
          description: `Your collage has been exported as PNG with ${customDpi} DPI metadata (${
            canvas.width
          }×${canvas.height}px at ${((customDpi / 96) * exportScale).toFixed(
            1
          )}x scale)`,
        });
      } else if (exportFormat === "pdf") {
        // Export as PDF
        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF({
          orientation:
            collageState.pageSize.width > collageState.pageSize.height
              ? "landscape"
              : "portrait",
          unit: "mm",
          format: [collageState.pageSize.width, collageState.pageSize.height],
        });

        pdf.addImage(
          imgData,
          "PNG",
          0,
          0,
          collageState.pageSize.width,
          collageState.pageSize.height
        );
        pdf.save(`collage-${Date.now()}.pdf`);

        toast({
          title: "Export complete",
          description: `Your collage has been exported as PDF at ${customDpi} DPI (${(
            (customDpi / 96) *
            exportScale
          ).toFixed(1)}x scale)`,
        });
      } else if (exportFormat === "print") {
        // Direct print
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        const windowContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print Collage</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              img {
                max-width: 100%;
                max-height: 100%;
              }
              @media print {
                @page {
                  size: ${
                    collageState.pageSize.width > collageState.pageSize.height
                      ? "landscape"
                      : "portrait"
                  };
                  margin: 0;
                }
                body {
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
          </html>
        `;

        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(windowContent);
          printWindow.document.close();
        } else {
          toast({
            title: "Print error",
            description:
              "Unable to open print window. Please check your popup blocker settings.",
            variant: "destructive",
          });
        }

        toast({
          title: "Print prepared",
          description: "Print dialog should open shortly",
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your collage",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Format dimensions based on selected unit
  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Export & Actions</h2>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onResetCanvas}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Canvas
          </Button>

          <Button
            variant="outline"
            onClick={onClearAll}
            className="flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>

        <div className="pt-2">
          <p className="text-sm mb-2">Format</p>
          <div className="flex gap-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="png"
                checked={exportFormat === "png"}
                onChange={() => setExportFormat("png")}
                className="mr-2"
              />
              <span className="text-sm">PNG</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={exportFormat === "pdf"}
                onChange={() => setExportFormat("pdf")}
                className="mr-2"
              />
              <span className="text-sm">PDF</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="print"
                checked={exportFormat === "print"}
                onChange={() => setExportFormat("print")}
                className="mr-2"
              />
              <span className="text-sm">Print</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Cutting Markers</span>
          <Switch
            checked={showCuttingMarkers}
            onCheckedChange={onToggleCuttingMarkers}
          />
        </div>

        {showCuttingMarkers && (
          <div className="pl-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Marker Color
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={collageState.markerColor}
                  onChange={(e) => onSetMarkerColor(e.target.value)}
                  className="w-8 h-6 border border-border rounded cursor-pointer"
                  title="Choose marker color"
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {collageState.markerColor}
                </span>
              </div>
            </div>

            <div className="flex gap-1">
              {[
                "#9ca3af",
                "#ef4444",
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#8b5cf6",
                "#000000",
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-5 h-5 rounded border-2 cursor-pointer ${
                    collageState.markerColor === color
                      ? "border-foreground"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onSetMarkerColor(color)}
                  title={`Set marker color to ${color}`}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm mb-2">Export Quality</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">DPI:</span>
              <Input
                type="number"
                value={customDpi}
                onChange={(e) => setCustomDpi(Number(e.target.value))}
                min="72"
                max="1200"
                step="50"
                className="w-20 h-8"
              />
              <span className="text-xs text-muted-foreground">DPI</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">Scale:</span>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={exportScale}
                onChange={(e) => setExportScale(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs w-8">{exportScale}x</span>
            </div>

            <div className="text-xs text-muted-foreground">
              Effective scale: {((customDpi / 96) * exportScale).toFixed(1)}x
              {customDpi > 300 && (
                <span className="text-orange-600 ml-2">
                  ⚠ High DPI may be slow
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            Page size: {formatDimension(collageState.pageSize.width)}×
            {formatDimension(collageState.pageSize.height)}
          </p>
        </div>

        <Button
          disabled={isExporting || !isEnabled}
          className="w-full flex items-center justify-center gap-2 py-2"
          onClick={handleExport}
          variant={isEnabled ? "default" : "outline"}
        >
          {exportFormat === "print" ? (
            <Printer className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>
            {isExporting
              ? "Processing..."
              : exportFormat === "print"
              ? "Print Collage"
              : `Export as ${exportFormat.toUpperCase()}`}
          </span>
        </Button>

        {!isEnabled && (
          <p className="text-xs text-muted-foreground text-center">
            Add at least one image to enable export
          </p>
        )}
      </div>
    </div>
  );
}
