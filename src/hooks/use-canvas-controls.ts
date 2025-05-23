import { useState, useEffect, useCallback, useRef } from "react";

interface CanvasControlsState {
  zoom: number;
  isDragging: boolean;
  dragStart: { x: number; y: number };
  dragOffset: { x: number; y: number };
}

interface UseCanvasControlsProps {
  pageSize: { width: number; height: number };
}

export function useCanvasControls({ pageSize }: UseCanvasControlsProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setDragOffset({ x: 0, y: 0 });
  };

  // Constrain drag offset when zoom changes to prevent canvas from going out of bounds
  useEffect(() => {
    const containerEl = canvasContainerRef.current;
    if (!containerEl) return;

    const containerRect = containerEl.getBoundingClientRect();

    // Use actual page size from collage state
    const maxWidth = 800; // Maximum width in pixels (same as CollageCanvas)
    const scaleFactor = Math.min(1, maxWidth / pageSize.width);
    const actualCanvasWidth = pageSize.width * scaleFactor * (zoom / 100);
    const actualCanvasHeight = pageSize.height * scaleFactor * (zoom / 100);

    // Ensure at least 150px of canvas remains visible on each side
    const minVisibleArea = 150;
    const maxOffsetX = Math.max(
      0,
      (actualCanvasWidth - containerRect.width) / 2 +
        containerRect.width -
        minVisibleArea
    );
    const maxOffsetY = Math.max(
      0,
      (actualCanvasHeight - containerRect.height) / 2 +
        containerRect.height -
        minVisibleArea
    );
    const minOffsetX = Math.min(
      0,
      -(actualCanvasWidth - containerRect.width) / 2 -
        containerRect.width +
        minVisibleArea
    );
    const minOffsetY = Math.min(
      0,
      -(actualCanvasHeight - containerRect.height) / 2 -
        containerRect.height +
        minVisibleArea
    );

    setDragOffset((prev) => ({
      x: Math.max(minOffsetX, Math.min(maxOffsetX, prev.x)),
      y: Math.max(minOffsetY, Math.min(maxOffsetY, prev.y)),
    }));
  }, [zoom, pageSize.width, pageSize.height]);

  const calculateConstraints = useCallback(() => {
    const containerEl = canvasContainerRef.current;
    if (!containerEl) return null;

    const containerRect = containerEl.getBoundingClientRect();
    const maxWidth = 800;
    const scaleFactor = Math.min(1, maxWidth / pageSize.width);
    const actualCanvasWidth = pageSize.width * scaleFactor * (zoom / 100);
    const actualCanvasHeight = pageSize.height * scaleFactor * (zoom / 100);

    const minVisibleArea = 150;
    const maxOffsetX = Math.max(
      0,
      (actualCanvasWidth - containerRect.width) / 2 +
        containerRect.width -
        minVisibleArea
    );
    const maxOffsetY = Math.max(
      0,
      (actualCanvasHeight - containerRect.height) / 2 +
        containerRect.height -
        minVisibleArea
    );
    const minOffsetX = Math.min(
      0,
      -(actualCanvasWidth - containerRect.width) / 2 -
        containerRect.width +
        minVisibleArea
    );
    const minOffsetY = Math.min(
      0,
      -(actualCanvasHeight - containerRect.height) / 2 -
        containerRect.height +
        minVisibleArea
    );

    return { maxOffsetX, maxOffsetY, minOffsetX, minOffsetY };
  }, [zoom, pageSize.width, pageSize.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      // Middle mouse button only
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const deltaX = (e.clientX - dragStart.x) * 0.3; // Reduce speed to 30%
        const deltaY = (e.clientY - dragStart.y) * 0.3; // Reduce speed to 30%

        setDragOffset((prev) => {
          const constraints = calculateConstraints();
          if (!constraints) return prev;

          const { maxOffsetX, maxOffsetY, minOffsetX, minOffsetY } =
            constraints;

          const newX = Math.max(
            minOffsetX,
            Math.min(maxOffsetX, prev.x + deltaX)
          );
          const newY = Math.max(
            minOffsetY,
            Math.min(maxOffsetY, prev.y + deltaY)
          );

          return { x: newX, y: newY };
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [dragStart.x, dragStart.y, isDragging, calculateConstraints]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
    }
  }, []);

  // Apply mouse events only when the user is actively dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener(
        "mousemove",
        handleMouseMove as unknown as EventListener
      );
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove as unknown as EventListener
      );
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, handleMouseMove]);

  // Add wheel event listener for zoom control
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (canvasContainer) {
      canvasContainer.addEventListener("wheel", handleWheel, {
        passive: false,
      });

      return () => {
        canvasContainer.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleWheel]);

  return {
    canvasContainerRef,
    zoom,
    isDragging,
    dragOffset,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  };
}
