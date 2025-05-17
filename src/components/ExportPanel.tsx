import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, SlidersHorizontal } from 'lucide-react';
import { PageSize, ExportFormat } from '@/types/collage';
import { toast } from '@/hooks/use-toast';
import { Input } from './ui/input';

interface ExportPanelProps {
  collageRef: React.RefObject<HTMLDivElement>;
  pageSize: PageSize;
  isEnabled: boolean;
}

export function ExportPanel({ collageRef, pageSize, isEnabled }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportScale, setExportScale] = useState(2); // Scale factor for export resolution
  const [customDpi, setCustomDpi] = useState(300); // Custom DPI value
  
  const handleExport = async () => {
    if (!collageRef.current || !isEnabled) return;
    
    setIsExporting(true);
    
    try {
      // Calculate the pixel dimensions based on the page size and DPI
      const pixelWidth = (pageSize.width / 25.4) * customDpi; // Convert mm to inches then multiply by DPI
      const pixelHeight = (pageSize.height / 25.4) * customDpi;
      
      // Capture the canvas using html2canvas with the calculated scale
      const canvas = await html2canvas(collageRef.current, {
        scale: exportScale, // Higher resolution
        useCORS: true, // Allow loading cross-origin images
        backgroundColor: '#ffffff',
        width: collageRef.current.offsetWidth,
        height: collageRef.current.offsetHeight
      });
      
      if (exportFormat === 'png') {
        // Export as PNG
        const link = document.createElement('a');
        link.download = `collage-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "Export complete",
          description: `Your collage has been exported as PNG at ${customDpi} DPI`
        });
      } else {
        // Export as PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: pageSize.width > pageSize.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pageSize.width, pageSize.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, pageSize.width, pageSize.height);
        pdf.save(`collage-${Date.now()}.pdf`);
        
        toast({
          title: "Export complete",
          description: `Your collage has been exported as PDF at ${customDpi} DPI`
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Export</h2>
      
      <div className="space-y-3">
        <div>
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
          </div>
        </div>
        
        <div>
          <p className="text-sm mb-2">Resolution (DPI)</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={customDpi}
              onChange={(e) => setCustomDpi(Number(e.target.value))}
              min="72"
              max="600"
              className="w-20 h-8"
            />
            <span className="text-xs text-muted-foreground">DPI</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.5"
              value={exportScale}
              onChange={(e) => setExportScale(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs w-8">{exportScale}x</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Higher resolution may take longer to export
          </p>
        </div>
        
        <button
          type="button"
          disabled={isExporting || !isEnabled}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
            isEnabled
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          <span>{isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}</span>
        </button>
        
        {!isEnabled && (
          <p className="text-xs text-muted-foreground text-center">
            Add at least one image to enable export
          </p>
        )}
      </div>
    </div>
  );
}
