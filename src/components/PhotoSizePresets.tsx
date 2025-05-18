
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { LayoutPreset, MeasurementUnit } from '@/types/collage';
import { layoutPresets } from '@/data/layout-presets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UnitConverter } from '@/lib/unit-converter';
import { Trash2, PlusCircle, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function PhotoSizePresets() {
  const [customPresets, setCustomPresets] = useState<LayoutPreset[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit>('mm');
  
  const [newPreset, setNewPreset] = useState({
    id: '',
    name: '',
    label: '',
    cellWidth: '',
    cellHeight: '',
    margin: ''
  });
  
  // Load custom presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('customLayoutPresets');
    if (savedPresets) {
      try {
        setCustomPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Error loading custom presets:', error);
      }
    }
  }, []);
  
  const savePresetsToStorage = (presets: LayoutPreset[]) => {
    localStorage.setItem('customLayoutPresets', JSON.stringify(presets));
  };
  
  const handleAddPreset = () => {
    if (!newPreset.id || !newPreset.name || !newPreset.label || 
        !newPreset.cellWidth || !newPreset.cellHeight || !newPreset.margin) {
      toast({
        title: "Invalid input",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Parse dimensions and convert to mm
      const widthData = UnitConverter.parseDimensionString(newPreset.cellWidth);
      const heightData = UnitConverter.parseDimensionString(newPreset.cellHeight);
      const marginData = UnitConverter.parseDimensionString(newPreset.margin);
      
      const widthInMm = UnitConverter.convertToMm(parseFloat(widthData.value.toString()), widthData.unit);
      const heightInMm = UnitConverter.convertToMm(parseFloat(heightData.value.toString()), heightData.unit);
      const marginInMm = UnitConverter.convertToMm(parseFloat(marginData.value.toString()), marginData.unit);
      
      if (widthInMm <= 0 || heightInMm <= 0 || marginInMm < 0) {
        toast({
          title: "Invalid dimensions",
          description: "Width and height must be greater than 0, margin must be 0 or greater",
          variant: "destructive"
        });
        return;
      }
      
      const preset: LayoutPreset = {
        id: newPreset.id.toLowerCase().replace(/\s+/g, '-'),
        name: newPreset.name,
        label: newPreset.label,
        cellWidth: widthInMm,
        cellHeight: heightInMm,
        margin: marginInMm
      };
      
      const updatedPresets = [...customPresets, preset];
      setCustomPresets(updatedPresets);
      savePresetsToStorage(updatedPresets);
      
      toast({
        title: "Preset added",
        description: `Added ${preset.label} to your custom presets`
      });
      
      setNewPreset({ id: '', name: '', label: '', cellWidth: '', cellHeight: '', margin: '' });
      setShowAddDialog(false);
    } catch (error) {
      toast({
        title: "Error adding preset",
        description: "Please check your input values",
        variant: "destructive"
      });
    }
  };
  
  const handleDeletePreset = (index: number) => {
    const updatedPresets = customPresets.filter((_, i) => i !== index);
    setCustomPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    
    toast({
      title: "Preset deleted",
      description: "Custom preset has been removed"
    });
  };
  
  const exportPresets = () => {
    const dataStr = JSON.stringify(customPresets);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = `collage-photo-presets-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    toast({
      title: "Presets exported",
      description: "Your custom presets have been exported"
    });
  };
  
  const importPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedPresets = JSON.parse(event.target?.result as string);
        
        if (Array.isArray(importedPresets) && importedPresets.every(isValidLayoutPreset)) {
          setCustomPresets(importedPresets);
          savePresetsToStorage(importedPresets);
          
          toast({
            title: "Presets imported",
            description: `Successfully imported ${importedPresets.length} presets`
          });
        } else {
          throw new Error("Invalid preset format");
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is not valid",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    // Reset the input
    e.target.value = '';
  };
  
  // Type guard to validate imported presets
  const isValidLayoutPreset = (obj: any): obj is LayoutPreset => {
    return (
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.label === 'string' &&
      typeof obj.cellWidth === 'number' &&
      typeof obj.cellHeight === 'number' &&
      typeof obj.margin === 'number'
    );
  };
  
  const formatDimension = (mm: number): string => {
    return UnitConverter.formatDimension(mm, selectedUnit);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Default Photo Sizes</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedUnit('mm')}>mm</Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedUnit('cm')}>cm</Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedUnit('in')}>in</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Photo Size</TableHead>
                <TableHead>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {layoutPresets.map((preset) => (
                <TableRow key={preset.id}>
                  <TableCell>{preset.label}</TableCell>
                  <TableCell>{formatDimension(preset.cellWidth)}×{formatDimension(preset.cellHeight)}</TableCell>
                  <TableCell>{formatDimension(preset.margin)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Custom Photo Sizes</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                <PlusCircle className="h-4 w-4 mr-1" /> Add New
              </Button>
              <Button variant="outline" size="sm" onClick={exportPresets}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={importPresets}
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" /> Import
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customPresets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Photo Size</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customPresets.map((preset, index) => (
                  <TableRow key={`${preset.id}-${index}`}>
                    <TableCell>{preset.label}</TableCell>
                    <TableCell>{formatDimension(preset.cellWidth)}×{formatDimension(preset.cellHeight)}</TableCell>
                    <TableCell>{formatDimension(preset.margin)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePreset(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No custom presets yet. Create your first custom photo size preset.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && setShowAddDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Photo Size</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preset-id">ID</Label>
                <Input
                  id="preset-id"
                  placeholder="e.g., custom-3x5"
                  value={newPreset.id}
                  onChange={(e) => setNewPreset({...newPreset, id: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">System identifier</p>
              </div>
              
              <div>
                <Label htmlFor="preset-name">Name</Label>
                <Input
                  id="preset-name"
                  placeholder="e.g., 3x5_custom"
                  value={newPreset.name}
                  onChange={(e) => setNewPreset({...newPreset, name: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">System name</p>
              </div>
              
              <div>
                <Label htmlFor="preset-label">Display Name</Label>
                <Input
                  id="preset-label"
                  placeholder="e.g., Custom 3×5"
                  value={newPreset.label}
                  onChange={(e) => setNewPreset({...newPreset, label: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">User-friendly name</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preset-width">Width</Label>
                <Input
                  id="preset-width"
                  placeholder="e.g., 76.2mm, 7.62cm, 3in"
                  value={newPreset.cellWidth}
                  onChange={(e) => setNewPreset({...newPreset, cellWidth: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="preset-height">Height</Label>
                <Input
                  id="preset-height"
                  placeholder="e.g., 127mm, 12.7cm, 5in"
                  value={newPreset.cellHeight}
                  onChange={(e) => setNewPreset({...newPreset, cellHeight: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="preset-margin">Margin</Label>
                <Input
                  id="preset-margin"
                  placeholder="e.g., 5mm, 0.5cm, 0.2in"
                  value={newPreset.margin}
                  onChange={(e) => setNewPreset({...newPreset, margin: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPreset}>Add Preset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
