import { Button } from "./ui/button";
import { ZoomIn, ZoomOut, RotateCcw, MoveHorizontal } from "lucide-react";
import { useCanvasControlsContext } from "@/context/CanvasControlsContext";

export function CanvasControls() {
  const { zoom, handleZoomIn, handleZoomOut, handleResetZoom } =
    useCanvasControlsContext();
  return (
    <div className="border-b bg-background p-2 flex justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetZoom}
          title="Reset Zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="text-sm">{zoom}%</div>
      </div>

      <div className="flex items-center">
        <div className="text-sm text-muted-foreground mr-4">
          Middle-click and drag to pan
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-help"
          title="Use middle mouse button (scroll wheel click) and drag to move canvas, or Ctrl+scroll to zoom"
        >
          <MoveHorizontal className="h-4 w-4 mr-1" />
          Pan Help
        </Button>
      </div>
    </div>
  );
}
