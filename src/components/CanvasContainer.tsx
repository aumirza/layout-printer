import { RefObject } from "react";
import { CollageCanvas } from "./CollageCanvas";
import { useCollage } from "@/context/CollageContext";
import { useCanvasControlsContext } from "@/context/CanvasControlsContext";

interface CanvasContainerProps {
  collageRef: RefObject<HTMLDivElement>;
}

export function CanvasContainer({ collageRef }: CanvasContainerProps) {
  const { collageState, assignImageToCell } = useCollage();

  const {
    canvasContainerRef,
    zoom,
    isDragging,
    dragOffset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  } = useCanvasControlsContext();
  return (
    <div
      ref={canvasContainerRef}
      className="flex-1 overflow-auto p-10 flex justify-center items-center active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleWheel(e.nativeEvent);
      }}
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right click
    >
      <div
        style={{
          transform: `scale(${zoom / 100}) translate(${dragOffset.x}px, ${
            dragOffset.y
          }px)`,
          transformOrigin: "center",
          transition: isDragging ? "none" : "transform 0.2s ease",
        }}
      >
        <CollageCanvas
          ref={collageRef}
          collageState={collageState}
          onAssignImage={assignImageToCell}
        />
      </div>
    </div>
  );
}
