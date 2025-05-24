import { useState, useEffect } from "react";
import { CollageApp } from "@/components/CollageApp";
import { InitialSetupModal } from "@/components/InitialSetupModal";
import { useCollage } from "@/context/CollageContext";
import { Settings } from "@/types/settings";

const Editor = () => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { updatePageSize, updateLayout, setSpaceOptimization, setUnit } =
    useCollage();

  useEffect(() => {
    const hasSeenSetup = sessionStorage.getItem("hasSeenCollageSetup");
    if (!hasSeenSetup) {
      setShowSetupModal(true);
    }
  }, []);

  const handleInitialSetup = (settings: Settings) => {
    updatePageSize(settings.pageSizeIndex);
    updateLayout(settings.layoutIndex);
    setSpaceOptimization(settings.spaceOptimization);
    setUnit(settings.selectedUnit);

    sessionStorage.setItem("hasSeenCollageSetup", "true");
    setShowSetupModal(false);
  };

  return (
    <>
      <CollageApp />
      <InitialSetupModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onApplySettings={handleInitialSetup}
      />
    </>
  );
};

export default Editor;
