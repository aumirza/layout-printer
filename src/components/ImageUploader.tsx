
import { useRef, useState } from 'react';
import { Plus, X, Image } from 'lucide-react';
import { CollageImage } from '@/types/collage';
import { toast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImagesAdded: (images: CollageImage[]) => void;
  images: CollageImage[];
  onImageRemove: (id: string) => void;
}

export function ImageUploader({ onImagesAdded, images, onImageRemove }: ImageUploaderProps) {
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
          count: 1
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
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Uploaded Images</h3>
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
            {images.map(image => (
              <div 
                key={image.id} 
                className="flex items-center bg-white p-2 rounded border group relative"
              >
                <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={image.src} 
                    alt={image.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-2 overflow-hidden">
                  <p className="text-xs truncate" title={image.name}>
                    {image.name}
                  </p>
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
            ))}
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
