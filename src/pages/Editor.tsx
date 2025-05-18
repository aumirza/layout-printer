
import { useState, useEffect } from 'react';
import { CollageApp } from '@/components/CollageApp';
import { InitialSetupModal } from '@/components/InitialSetupModal';

const Editor = () => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  useEffect(() => {
    const hasSeenSetup = localStorage.getItem('hasSeenCollageSetup');
    if (!hasSeenSetup) {
      setShowSetupModal(true);
    }
  }, []);

  const handleSetupComplete = (settings: any) => {
    localStorage.setItem('hasSeenCollageSetup', 'true');
    setShowSetupModal(false);
  };

  return (
    <>
      <CollageApp />
      <InitialSetupModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onApplySettings={handleSetupComplete}
      />
    </>
  );
};

export default Editor;
