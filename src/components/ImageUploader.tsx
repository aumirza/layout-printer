
import { useRef, useState } from 'react';
import { Plus, X, Image, Shuffle, DivideSquare } from 'lucide-react';
import { CollageImage, ImageFitOption, ImageOrientation } from '@/types/collage';
import { toast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ImageSettings } from './ImageSettings';

interface ImageUploaderProps {
  onImagesAdded: (images: CollageImage[]) => void;
  images: CollageImage[];
  onImageRemove: (id: string) => void;
  onUpdateImage: (id: string, updates: Partial<CollageImage>) => void;
  onUpdateCount?: (id: string, count: number) => void;
  onRearrange?: () => void;
  onDistributeEqually?: () => void;
  maxCells: number;
}

export function ImageUploader({ 
  onImagesAdded, 
  images, 
  onImageRemove, 
  onUpdateImage,
  onUpdateCount, 
  onRearrange,
  onDistributeEqually,
  maxCells
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Process only image files
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select image files only",
        variant: "destructive"
      });
      return;
    }
    
    const newImages: CollageImage[] = [];
    let processed = 0;
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        newImages.push({
          id: `image-${Date.now()}-${processed}`,
          src,
          name: file.name,
          count: 1,
          fit: 'cover', // Default fit
          orientation: 'auto' // Default orientation
        });
        
        processed++;
        if (processed === imageFiles.length) {
          onImagesAdded(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleCountChange = (id: string, value: string) => {
    const count = parseInt(value);
    // Allow zero or positive numbers
    if (!isNaN(count) && count >= 0 && onUpdateCount) {
      onUpdateCount(id, count);
    }
  };

  // Calculate total quantity of all images
  const totalQuantity = images.reduce((sum, img) => sum + (img.count || 0), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Images</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 rounded-full p-3 mb-3">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
      
      {images.length > 0 && (
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium">Uploaded Images</h3>
          <div className="max-h-52 overflow-y-auto space-y-2 p-1">
            {images.map(image => (
              <div 
                key={image.id} 
                className="flex flex-col bg-white p-2 rounded border group relative"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={image.src} 
                      alt={image.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-2 overflow-hidden flex-grow">
                    <p className="text-xs truncate" title={image.name}>
                      {image.name}
                    </p>
                    
                    <div className="flex items-center mt-1">
                      <span className="text-xs mr-2">Qty:</span>
                      <Input
                        type="number"
                        value={image.count || 0}
                        onChange={(e) => handleCountChange(image.id, e.target.value)}
                        min="0"
                        max={maxCells}
                        className="h-6 w-16 text-xs py-0 px-1"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-white/80 hover:bg-red-50 text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageRemove(image.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="mt-2 pl-12">
                  <ImageSettings
                    image={image}
                    onUpdate={onUpdateImage}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {totalQuantity} of {maxCells} cells will be filled
              </span>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 flex items-center justify-center gap-1"
                onClick={onDistributeEqually}
                disabled={images.length === 0}
              >
                <DivideSquare className="h-3.5 w-3.5" />
                Distribute Equally
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className={`flex-1 flex items-center justify-center gap-1 ${
                  totalQuantity > maxCells 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : ''
                }`}
                onClick={onRearrange}
                disabled={totalQuantity === 0}
              >
                <Shuffle className="h-3.5 w-3.5" />
                Arrange
              </Button>
            </div>
            
            {totalQuantity > maxCells && (
              <p className="text-xs text-red-500 mt-2">
                Total quantity exceeds available cells. Some images will not be displayed.
              </p>
            )}
          </div>
        </div>
      )}
      
      {images.length === 0 && (
        <div className="text-center p-4 border rounded-lg bg-muted/30">
          <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
