
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSizePresets } from './PageSizePresets';
import { PhotoSizePresets } from './PhotoSizePresets';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your presets and application preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="page-sizes" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="page-sizes">Page Size Presets</TabsTrigger>
            <TabsTrigger value="photo-sizes">Photo Size Presets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="page-sizes" className="mt-4">
            <PageSizePresets />
          </TabsContent>
          
          <TabsContent value="photo-sizes" className="mt-4">
            <PhotoSizePresets />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
