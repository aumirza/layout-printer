import { useState, useEffect, useCallback, useRef } from "react";

interface CanvasControlsState {
  zoom: number;
  isDragging: boolean;
  dragStart: { x: number; y: number };
  dragOffset: { x: number; y: number };
  isSpacePressed: boolean;
}

interface UseCanvasControlsProps {
  pageSize: { width: number; height: number };
}

export function useCanvasControls({ pageSize }: UseCanvasControlsProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Calculate fit-to-container zoom level
  const calculateFitZoom = useCallback(() => {
    const containerEl = canvasContainerRef.current;
    if (!containerEl) return 100;

    const containerRect = containerEl.getBoundingClientRect();

    // Calculate actual screen DPI (default to 96 DPI if not available)
    const dpi = window.devicePixelRatio * 96;

    // Convert mm to pixels using screen DPI (1 inch = 25.4mm)
    const mmToPixels = (mm: number) => (mm / 25.4) * dpi;

    // Get actual paper dimensions in pixels at 100% zoom
    const paperWidthPx = mmToPixels(pageSize.width);
    const paperHeightPx = mmToPixels(pageSize.height);

    // Leave some padding around the paper (80px on each side)
    const padding = 160;
    const availableWidth = containerRect.width - padding;
    const availableHeight = containerRect.height - padding;

    // Calculate zoom levels needed to fit width and height
    const zoomForWidth = (availableWidth / paperWidthPx) * 100;
    const zoomForHeight = (availableHeight / paperHeightPx) * 100;

    // Use the smaller zoom to ensure both dimensions fit
    const fitZoom = Math.min(zoomForWidth, zoomForHeight);

    // Constrain between 20% and 100% zoom
    return Math.max(20, Math.min(100, fitZoom));
  }, [pageSize.width, pageSize.height]);

  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Set initial zoom to fit the paper when container or page size changes
  useEffect(() => {
    const fitZoom = calculateFitZoom();
    setZoom(fitZoom);
    setDragOffset({ x: 0, y: 0 }); // Reset drag offset when resizing
  }, [calculateFitZoom, pageSize.width, pageSize.height]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 20));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleFitToContainer = () => {
    const fitZoom = calculateFitZoom();
    setZoom(fitZoom);
    setDragOffset({ x: 0, y: 0 });
  };

  // Constrain drag offset when zoom changes to prevent canvas from going out of bounds
  useEffect(() => {
    const containerEl = canvasContainerRef.current;
    if (!containerEl) return;

    const containerRect = containerEl.getBoundingClientRect();

    // Calculate actual screen DPI (default to 96 DPI if not available)
    const dpi = window.devicePixelRatio * 96;

    // Convert mm to pixels using screen DPI (1 inch = 25.4mm)
    const mmToPixels = (mm: number) => (mm / 25.4) * dpi;

    // Use actual page size converted to pixels with real DPI
    const actualCanvasWidth = mmToPixels(pageSize.width) * (zoom / 100);
    const actualCanvasHeight = mmToPixels(pageSize.height) * (zoom / 100);

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

    // Calculate actual screen DPI (default to 96 DPI if not available)
    const dpi = window.devicePixelRatio * 96;

    // Convert mm to pixels using screen DPI (1 inch = 25.4mm)
    const mmToPixels = (mm: number) => (mm / 25.4) * dpi;

    const actualCanvasWidth = mmToPixels(pageSize.width) * (zoom / 100);
    const actualCanvasHeight = mmToPixels(pageSize.height) * (zoom / 100);

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
    // Middle mouse button (scroll wheel press) or right-click with Ctrl/Shift or Space key
    if (
      e.button === 1 || // Middle mouse button
      (e.button === 2 && (e.ctrlKey || e.shiftKey)) || // Right-click with Ctrl or Shift
      (e.button === 0 && isSpacePressed) // Left-click with space key
    ) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const calculatePanSpeed = useCallback(() => {
    // Base speed factor
    const baseSpeed = 0.5;

    // Zoom factor: higher zoom = slower panning for precision
    // At 100% zoom = 1.0x speed, at 200% zoom = 0.5x speed, at 50% zoom = 1.5x speed
    const zoomFactor = Math.max(0.3, Math.min(2.0, 100 / zoom));

    // Paper size factor: larger papers need faster panning
    // Normalize based on A4 size (210x297mm)
    const paperArea = pageSize.width * pageSize.height;
    const a4Area = 210 * 297; // A4 area in mm²
    const sizeFactor = Math.sqrt(paperArea / a4Area);

    // Container size factor: larger viewports can handle faster panning
    const containerEl = canvasContainerRef.current;
    if (containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const containerArea = containerRect.width * containerRect.height;
      const baseContainerArea = 800 * 600; // Base container size
      const containerFactor = Math.sqrt(containerArea / baseContainerArea);

      return baseSpeed * zoomFactor * sizeFactor * containerFactor;
    }

    return baseSpeed * zoomFactor * sizeFactor;
  }, [zoom, pageSize.width, pageSize.height]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const panSpeed = calculatePanSpeed();
        const deltaX = (e.clientX - dragStart.x) * panSpeed;
        const deltaY = (e.clientY - dragStart.y) * panSpeed;

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
    [
      dragStart.x,
      dragStart.y,
      isDragging,
      calculateConstraints,
      calculatePanSpeed,
    ]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom((prev) => Math.max(20, Math.min(200, prev + delta)));
    }
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    // Prevent context menu when right-clicking with modifier keys for panning
    if (e.ctrlKey || e.shiftKey) {
      e.preventDefault();
    }
  };

  const handleContextMenuNative = useCallback((e: Event) => {
    const mouseEvent = e as MouseEvent;
    // Prevent context menu when right-clicking with modifier keys for panning
    if (mouseEvent.ctrlKey || mouseEvent.shiftKey) {
      e.preventDefault();
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" && !e.repeat) {
      e.preventDefault();
      setIsSpacePressed(true);
    }
  }, []);

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        if (isDragging) {
          setIsDragging(false);
        }
      }
    },
    [isDragging]
  );

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

  // Add context menu event listener
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (canvasContainer) {
      canvasContainer.addEventListener("contextmenu", handleContextMenuNative);

      return () => {
        canvasContainer.removeEventListener(
          "contextmenu",
          handleContextMenuNative
        );
      };
    }
  }, [handleContextMenuNative]);

  // Add keyboard event listeners for space key panning
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    canvasContainerRef,
    zoom,
    isDragging,
    dragOffset,
    isSpacePressed,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitToContainer,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleContextMenu,
  };
}
