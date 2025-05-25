import { useState, useEffect } from "react";
import { InitialSetupModal } from "@/components/InitialSetupModal";
import { useCollage } from "@/context/CollageContext";
import { Settings } from "@/types/settings";

import { useRef } from "react";
import { CanvasControlsProvider } from "@/context/CanvasControlsContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { CollageSidebar } from "@/components/CollageSidebar";
import { CanvasControls } from "@/components/CanvasControls";
import { CanvasContainer } from "@/components/CanvasContainer";

const Editor = () => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { updatePageSize, updateLayout, setSpaceOptimization, setUnit } =
    useCollage();
  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenSetup = sessionStorage.getItem("hasSeenCollageSetup");
    if (!hasSeenSetup) {
      setShowSetupModal(true);
    }
  }, []);

  const handleInitialSetup = (settings: Settings) => {
    updatePageSize(settings.pageSize);
    updateLayout(settings.layout);
    setSpaceOptimization(settings.spaceOptimization);
    setUnit(settings.selectedUnit);

    sessionStorage.setItem("hasSeenCollageSetup", "true");
    setShowSetupModal(false);
  };

  return (
    <CanvasControlsProvider>
      <SidebarProvider>
        <CollageSidebar collageRef={collageRef} />
        <SidebarInset className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 flex flex-col overflow-hidden">
            <CanvasContainer collageRef={collageRef} />
            <CanvasControls />
          </main>
          <InitialSetupModal
            open={showSetupModal}
            onClose={() => setShowSetupModal(false)}
            onApplySettings={handleInitialSetup}
          />
        </SidebarInset>
      </SidebarProvider>
    </CanvasControlsProvider>
  );
};

export default Editor;
