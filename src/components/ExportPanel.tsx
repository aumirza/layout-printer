import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Download,
  SlidersHorizontal,
  Printer,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  PageSize,
  ExportFormat,
  MeasurementUnit,
  LayoutPreset,
  CollageState,
} from "@/types/collage";
import { toast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { UnitConverter } from "@/lib/unit-converter";
import { CanvasRenderer } from "@/lib/canvas-renderer";

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
    if (value && value.includes("oklch")) {
      const convertedValue = convertOklchInCSS(value);
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
  const [exportScale, setExportScale] = useState(4); // Increased default scale for better quality
  const [customDpi, setCustomDpi] = useState(300); // Custom DPI value

  const handleExport = async () => {
    if (!collageRef.current || !isEnabled) return;

    setIsExporting(true);

    try {
      // Use the shared canvas renderer to create a consistent export element
      const exportElement = CanvasRenderer.renderCanvasElement(collageState, {
        dpi: customDpi,
        forExport: true,
      });

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
          --border: #e2e8f0 !important;
          --input: #e2e8f0 !important;
          --ring: #94a3b8 !important;
          --chart-1: #f97316 !important;
          --chart-2: #06b6d4 !important;
          --chart-3: #3b82f6 !important;
          --chart-4: #eab308 !important;
          --chart-5: #f59e0b !important;
        }
      `;
      document.head.appendChild(styleOverride);

      // Force style recalculation
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Convert oklch colors in the export element
      convertElementOklchColors(exportElement);

      // Capture the canvas with consistent settings
      const canvas = await html2canvas(exportElement, {
        scale: exportScale,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: exportElement.offsetWidth,
        height: exportElement.offsetHeight,
        imageTimeout: 15000,
        allowTaint: true,
        logging: false,
      });

      // Clean up temporary elements
      document.body.removeChild(tempContainer);
      document.head.removeChild(styleOverride);

      if (exportFormat === "png") {
        // Export as PNG
        const link = document.createElement("a");
        link.download = `collage-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png", 1.0); // Max quality
        link.click();

        toast({
          title: "Export complete",
          description: `Your collage has been exported as PNG at ${customDpi} DPI`,
        });
      } else if (exportFormat === "pdf") {
        // Export as PDF
        const imgData = canvas.toDataURL("image/png", 1.0); // Max quality
        const pdf = new jsPDF({
          orientation:
            collageState.pageSize.width > collageState.pageSize.height
              ? "landscape"
              : "portrait",
          unit: "mm",
          format: [collageState.pageSize.width, collageState.pageSize.height],
          compress: false, // No compression for better quality
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
          description: `Your collage has been exported as PDF at ${customDpi} DPI`,
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
          <p className="text-sm mb-2">Resolution (DPI)</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={customDpi}
              onChange={(e) => setCustomDpi(Number(e.target.value))}
              min="72"
              max="1200"
              className="w-20 h-8"
            />
            <span className="text-xs text-muted-foreground">DPI</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={exportScale}
              onChange={(e) => setExportScale(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs w-8">{exportScale}x</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
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
