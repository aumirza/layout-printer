
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, SlidersHorizontal, Printer, Image as ImageIcon, RefreshCw, Trash2 } from 'lucide-react';
import { PageSize, ExportFormat, MeasurementUnit } from '@/types/collage';
import { toast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { UnitConverter } from '@/lib/unit-converter';

interface ExportPanelProps {
  collageRef: React.RefObject<HTMLDivElement>;
  pageSize: PageSize;
  isEnabled: boolean;
  onToggleCuttingMarkers: (show: boolean) => void;
  showCuttingMarkers: boolean;
  onResetCanvas: () => void;
  onClearAll: () => void;
  selectedUnit: MeasurementUnit;
}

export function ExportPanel({ 
  collageRef, 
  pageSize, 
  isEnabled, 
  onToggleCuttingMarkers,
  showCuttingMarkers,
  onResetCanvas,
  onClearAll,
  selectedUnit
}: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportScale, setExportScale] = useState(4); // Increased default scale for better quality
  const [customDpi, setCustomDpi] = useState(300); // Custom DPI value
  
  const handleExport = async () => {
    if (!collageRef.current || !isEnabled) return;
    
    setIsExporting(true);
    
    try {
      // Calculate the pixel dimensions based on the page size and DPI
      const pixelWidth = (pageSize.width / 25.4) * customDpi; // Convert mm to inches then multiply by DPI
      const pixelHeight = (pageSize.height / 25.4) * customDpi;
      
      // Capture the canvas with high quality settings
      const canvas = await html2canvas(collageRef.current, {
        scale: exportScale, // Higher resolution for better quality
        useCORS: true, // Allow loading cross-origin images
        backgroundColor: '#ffffff',
        width: collageRef.current.offsetWidth,
        height: collageRef.current.offsetHeight,
        imageTimeout: 0, // No timeout for image loading
        allowTaint: true, // Allow tainted canvas
        logging: false, // Disable logging
      });
      
      if (exportFormat === 'png') {
        // Export as PNG
        const link = document.createElement('a');
        link.download = `collage-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0); // Max quality
        link.click();
        
        toast({
          title: "Export complete",
          description: `Your collage has been exported as PNG at ${customDpi} DPI`
        });
      } else if (exportFormat === 'pdf') {
        // Export as PDF
        const imgData = canvas.toDataURL('image/png', 1.0); // Max quality
        const pdf = new jsPDF({
          orientation: pageSize.width > pageSize.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pageSize.width, pageSize.height],
          compress: false // No compression for better quality
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, pageSize.width, pageSize.height);
        pdf.save(`collage-${Date.now()}.pdf`);
        
        toast({
          title: "Export complete",
          description: `Your collage has been exported as PDF at ${customDpi} DPI`
        });
      } else if (exportFormat === 'print') {
        // Direct print
        const dataUrl = canvas.toDataURL('image/png', 1.0);
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
                  size: ${pageSize.width > pageSize.height ? 'landscape' : 'portrait'};
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
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(windowContent);
          printWindow.document.close();
        } else {
          toast({
            title: "Print error",
            description: "Unable to open print window. Please check your popup blocker settings.",
            variant: "destructive"
          });
        }
        
        toast({
          title: "Print prepared",
          description: "Print dialog should open shortly"
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your collage",
        variant: "destructive"
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
                checked={exportFormat === 'png'}
                onChange={() => setExportFormat('png')}
                className="mr-2"
              />
              <span className="text-sm">PNG</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={exportFormat === 'pdf'}
                onChange={() => setExportFormat('pdf')}
                className="mr-2"
              />
              <span className="text-sm">PDF</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="print"
                checked={exportFormat === 'print'}
                onChange={() => setExportFormat('print')}
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
            Page size: {formatDimension(pageSize.width)}×{formatDimension(pageSize.height)}
          </p>
        </div>
        
        <Button
          disabled={isExporting || !isEnabled}
          className="w-full flex items-center justify-center gap-2 py-2"
          onClick={handleExport}
          variant={isEnabled ? "default" : "outline"}
        >
          {exportFormat === 'print' ? (
            <Printer className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>
            {isExporting 
              ? 'Processing...' 
              : exportFormat === 'print' 
                ? 'Print Collage' 
                : `Export as ${exportFormat.toUpperCase()}`
            }
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
