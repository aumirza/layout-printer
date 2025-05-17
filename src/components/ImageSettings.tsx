
import { useState } from 'react';
import { CollageImage, ImageFitOption, ImageOrientation } from '@/types/collage';
import { 
  Maximize, 
  Image as ImageIcon,
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem 
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface ImageSettingsProps {
  image: CollageImage;
  onUpdate: (imageId: string, updates: Partial<CollageImage>) => void;
}

export function ImageSettings({ image, onUpdate }: ImageSettingsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFitChange = (fit: ImageFitOption) => {
    onUpdate(image.id, { fit });
    setIsMenuOpen(false);
  };

  const handleOrientationChange = (orientation: ImageOrientation) => {
    onUpdate(image.id, { orientation });
    setIsMenuOpen(false);
  };

  // Get the current fit mode label
  const getFitLabel = () => {
    switch (image.fit) {
      case 'contain': return 'Fit';
      case 'original': return 'Original';
      case 'cover':
      default: return 'Fill';
    }
  };

  // Get the current orientation label
  const getOrientationLabel = () => {
    switch (image.orientation) {
      case 'portrait': return 'Portrait';
      case 'landscape': return 'Landscape';
      case 'auto':
      default: return 'Auto';
    }
  };

  return (
    <div className="flex gap-1">
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 text-xs flex gap-1 items-center">
            <Maximize className="h-3 w-3" />
            <span>{getFitLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleFitChange('cover')}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Fill
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFitChange('contain')}>
            <Maximize className="h-4 w-4 mr-2" />
            Fit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFitChange('original')}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Original Size
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 text-xs flex gap-1 items-center">
            <RotateCw className="h-3 w-3" />
            <span>{getOrientationLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleOrientationChange('auto')}>
            Auto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOrientationChange('portrait')}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Portrait
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOrientationChange('landscape')}>
            <RotateCw className="h-4 w-4 mr-2" />
            Landscape
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
