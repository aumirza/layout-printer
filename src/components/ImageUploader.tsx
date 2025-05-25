import { useMemo, useRef, useState } from "react";
import { Plus, X, Image, Shuffle, DivideSquare } from "lucide-react";
import { CollageImage } from "@/types/collage";
import { toast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ImageSettings } from "./ImageSettings";
import { useCollage } from "@/context/CollageContext";

export function ImageUploader() {
  const {
    collageState,
    handleImagesAdded,
    removeImage,
    updateImageCount,
    rearrangeCollage,
    distributeEqually,
  } = useCollage();

  const { images } = collageState;
  const maxCells = useMemo(
    () => collageState.rows * collageState.columns,
    [collageState.rows, collageState.columns]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Process only image files
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select image files only",
        variant: "destructive",
      });
      return;
    }

    const newImages: CollageImage[] = [];
    let processed = 0;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        newImages.push({
          id: `image-${Date.now()}-${processed}`,
          src,
          name: file.name,
          count: 1,
          fit: "cover", // Default fit
          orientation: "auto", // Default orientation
        });

        processed++;
        if (processed === imageFiles.length) {
          handleImagesAdded(newImages);
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
    if (!isNaN(count) && count >= 0) {
      updateImageCount(id, count);
    }
  };

  // Calculate total quantity of all images
  const totalQuantity = images.reduce((sum, img) => sum + (img.count || 0), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Images</h2>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
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
          <p className="text-sm font-medium">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium">Uploaded Images</h3>
          <div className="max-h-52 overflow-y-auto space-y-2 p-1">
            {images.map((image) => (
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
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <div className="flex items-center mt-1">
                      <label className="text-xs text-muted-foreground mr-2">
                        Count:
                      </label>
                      <Input
                        type="number"
                        value={image.count || 1}
                        onChange={(e) =>
                          handleCountChange(image.id, e.target.value)
                        }
                        className="h-6 w-16 text-xs"
                        min="0"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground flex-shrink-0"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <ImageSettings image={image} />
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

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={distributeEqually}
                disabled={images.length === 0}
              >
                <DivideSquare className="h-3 w-3 mr-1" />
                Distribute Equal
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={rearrangeCollage}
                disabled={images.length === 0}
              >
                <Shuffle className="h-3 w-3 mr-1" />
                Rearrange
              </Button>
            </div>

            {totalQuantity > maxCells && (
              <p className="text-xs text-red-500 mt-2">
                Total quantity exceeds available cells. Some images will not be
                displayed.
              </p>
            )}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center p-4 border rounded-lg bg-muted/30">
          <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No images uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}
