import { useRef } from "react";
import { CanvasControlsProvider } from "@/context/CanvasControlsContext";
import { Header } from "./ui/header";
import { CollageSidebar } from "./CollageSidebar";
import { CanvasControls } from "./CanvasControls";
import { CanvasContainer } from "./CanvasContainer";

export function CollageApp() {
  const collageRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />

      <CanvasControlsProvider>
        <div className="flex flex-col lg:flex-row h-[calc(100vh-49px)] overflow-hidden">
          <CollageSidebar collageRef={collageRef} />

          <div className="w-full lg:w-3/4 bg-muted flex-1 flex flex-col">
            <CanvasControls />
            <CanvasContainer collageRef={collageRef} />
          </div>
        </div>
      </CanvasControlsProvider>
    </div>
  );
}
