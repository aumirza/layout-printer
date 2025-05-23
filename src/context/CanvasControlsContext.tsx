import { createContext, useContext, useRef, RefObject } from "react";
import { useCanvasControls } from "@/hooks/use-canvas-controls";
import { useCollage } from "./CollageContext";

interface CanvasControlsContextType {
  canvasContainerRef: RefObject<HTMLDivElement>;
  zoom: number;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleWheel: (e: WheelEvent) => void;
}

const CanvasControlsContext = createContext<CanvasControlsContextType | null>(
  null
);

export function CanvasControlsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collageState } = useCollage();

  const canvasControls = useCanvasControls({
    pageSize: collageState.pageSize,
  });

  return (
    <CanvasControlsContext.Provider value={canvasControls}>
      {children}
    </CanvasControlsContext.Provider>
  );
}

export function useCanvasControlsContext() {
  const context = useContext(CanvasControlsContext);
  if (!context) {
    throw new Error(
      "useCanvasControlsContext must be used within a CanvasControlsProvider"
    );
  }
  return context;
}
