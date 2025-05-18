
import { useRef, useState, useEffect } from 'react';
import { PageSizeSelector } from './PageSizeSelector';
import { LayoutSelector } from './LayoutSelector';
import { ImageUploader } from './ImageUploader';
import { CollageCanvas } from './CollageCanvas';
import { ExportPanel } from './ExportPanel';
import { useCollage } from '@/context/CollageContext';
import { pageSizes } from '@/data/page-sizes';
import { layoutPresets } from '@/data/layout-presets';
import { InitialSetupModal } from './InitialSetupModal';
import { Header } from './ui/header';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RotateCcw, MoveHorizontal } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function CollageApp() {
  const { 
    collageState, 
    updatePageSize, 
    updateLayout, 
    handleImagesAdded, 
    assignImageToCell,
    removeImage,
    updateImageCount,
    updateImageSettings,
    rearrangeCollage,
    distributeEqually,
    setSpaceOptimization,
    toggleCuttingMarkers,
    resetCanvas,
    clearAll,
    setUnit,
    createCustomPageSize,
    createCustomLayout
  } = useCollage();
  
  const [showSetupModal, setShowSetupModal] = useState(false);
  const collageRef = useRef<HTMLDivElement>(null);
  const maxCells = collageState.rows * collageState.columns;
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Show setup modal on first load
  useEffect(() => {
    const hasSeenSetup = localStorage.getItem('hasSeenCollageSetup');
    if (!hasSeenSetup) {
      setShowSetupModal(true);
    }
    
    // Load saved custom presets
    const customLayoutPresetsData = localStorage.getItem('customLayoutPresets');
    const customPageSizesData = localStorage.getItem('customPageSizes');
    
    if (customLayoutPresetsData) {
      try {
        // Here you would load the custom presets into your state
        console.log('Found custom layout presets:', customLayoutPresetsData);
      } catch (error) {
        console.error('Error parsing custom layout presets:', error);
      }
    }
    
    if (customPageSizesData) {
      try {
        // Here you would load the custom page sizes into your state
        console.log('Found custom page sizes:', customPageSizesData);
      } catch (error) {
        console.error('Error parsing custom page sizes:', error);
      }
    }
  }, []);

  const handleInitialSetup = (settings: any) => {
    updatePageSize(settings.pageSizeIndex);
    updateLayout(settings.layoutIndex);
    setSpaceOptimization(settings.spaceOptimization);
    setUnit(settings.selectedUnit);
    
    localStorage.setItem('hasSeenCollageSetup', 'true');
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };
  
  const handleResetZoom = () => {
    setZoom(100);
    setDragOffset({ x: 0, y: 0 });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {  // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setDragOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Apply mouse events only when the user is actively dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as unknown as EventListener);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as unknown as EventListener);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-49px)] overflow-hidden">
        <div className="w-full lg:w-1/4 p-4 overflow-y-auto border-r">
          <div className="space-y-6 pb-6">
            <Accordion type="single" collapsible defaultValue="page-size">
              <AccordionItem value="page-size">
                <AccordionTrigger className="text-lg font-semibold">Page Size</AccordionTrigger>
                <AccordionContent>
                  <PageSizeSelector 
                    pageSizes={pageSizes} 
                    selectedPageSize={collageState.pageSize} 
                    onSelect={updatePageSize}
                    onCustomSize={createCustomPageSize}
                    selectedUnit={collageState.selectedUnit}
                    onUnitChange={setUnit}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="photo-size">
                <AccordionTrigger className="text-lg font-semibold">Photo Size</AccordionTrigger>
                <AccordionContent>
                  <LayoutSelector 
                    layouts={layoutPresets} 
                    selectedLayout={collageState.layout} 
                    onSelect={updateLayout}
                    onCustomLayout={createCustomLayout}
                    selectedUnit={collageState.selectedUnit}
                    spaceOptimization={collageState.spaceOptimization}
                    onSpaceOptimizationChange={setSpaceOptimization}
                    cellCount={maxCells}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="photos">
                <AccordionTrigger className="text-lg font-semibold">Photos</AccordionTrigger>
                <AccordionContent>
                  <ImageUploader 
                    onImagesAdded={handleImagesAdded} 
                    images={collageState.images}
                    onImageRemove={removeImage}
                    onUpdateImage={updateImageSettings}
                    onUpdateCount={updateImageCount}
                    onRearrange={rearrangeCollage}
                    onDistributeEqually={distributeEqually}
                    maxCells={maxCells}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="export">
                <AccordionTrigger className="text-lg font-semibold">Options & Export</AccordionTrigger>
                <AccordionContent>
                  <ExportPanel 
                    collageRef={collageRef}
                    pageSize={collageState.pageSize}
                    isEnabled={collageState.images.length > 0}
                    onToggleCuttingMarkers={toggleCuttingMarkers}
                    showCuttingMarkers={collageState.showCuttingMarkers}
                    onResetCanvas={resetCanvas}
                    onClearAll={clearAll}
                    selectedUnit={collageState.selectedUnit}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        <div className="w-full lg:w-3/4 bg-muted flex-1 flex flex-col">
          <div className="border-b bg-background p-2 flex justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleResetZoom} title="Reset View">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <div className="text-sm">{zoom}%</div>
            </div>
            
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="cursor-grab"
                onMouseDown={handleMouseDown}
                title="Click and drag to move canvas"
              >
                <MoveHorizontal className="h-4 w-4 mr-1" /> 
                Move Canvas
              </Button>
            </div>
          </div>
          
          <div 
            ref={canvasContainerRef}
            className="flex-1 overflow-auto p-4 flex justify-center items-center"
          >
            <div
              style={{ 
                transform: `scale(${zoom / 100}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
            >
              <CollageCanvas 
                ref={collageRef}
                collageState={collageState}
                onAssignImage={assignImageToCell}
              />
            </div>
          </div>
        </div>
      </div>
      
      <InitialSetupModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onApplySettings={handleInitialSetup}
      />
    </div>
  );
}
