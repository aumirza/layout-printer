import { useState } from "react";
import {
  CollageImage,
  ImageFitOption,
  ImageOrientation,
} from "@/types/collage";
import { Maximize, Image as ImageIcon, RotateCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ImageSettingsProps {
  image: CollageImage;
  onUpdate: (imageId: string, updates: Partial<CollageImage>) => void;
}

export function ImageSettings({ image, onUpdate }: ImageSettingsProps) {
  const [isFitMenuOpen, setIsFitMenuOpen] = useState(false);
  const [isOrientationMenuOpen, setIsOrientationMenuOpen] = useState(false);

  const handleFitChange = (fit: ImageFitOption) => {
    onUpdate(image.id, { fit });
    setIsFitMenuOpen(false);
  };

  const handleOrientationChange = (orientation: ImageOrientation) => {
    onUpdate(image.id, { orientation });
    setIsOrientationMenuOpen(false);
  };

  // Get the current fit mode label
  const getFitLabel = () => {
    switch (image.fit) {
      case "contain":
        return "Fit";
      case "fill":
        return "Stretch";
      case "original":
        return "Original";
      case "cover":
      default:
        return "Fill";
    }
  };

  // Get the current orientation label
  const getOrientationLabel = () => {
    switch (image.orientation) {
      case "portrait":
        return "Portrait";
      case "landscape":
        return "Landscape";
      case "auto":
      default:
        return "Auto";
    }
  };

  return (
    <div className="flex gap-1">
      <DropdownMenu open={isFitMenuOpen} onOpenChange={setIsFitMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-6 text-xs flex gap-1 items-center",
              image.fit === "contain" &&
                "bg-blue-50 text-blue-600 border-blue-200",
              image.fit === "fill" &&
                "bg-green-50 text-green-600 border-green-200",
              image.fit === "original" &&
                "bg-amber-50 text-amber-600 border-amber-200"
            )}
          >
            <Maximize className="h-3 w-3" />
            <span>{getFitLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleFitChange("cover")}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Fill
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFitChange("contain")}>
            <Maximize className="h-4 w-4 mr-2" />
            Fit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFitChange("fill")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            Fill Stretch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFitChange("original")}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Original Size
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu
        open={isOrientationMenuOpen}
        onOpenChange={setIsOrientationMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-6 text-xs flex gap-1 items-center",
              image.orientation === "portrait" &&
                "bg-green-50 text-green-600 border-green-200",
              image.orientation === "landscape" &&
                "bg-purple-50 text-purple-600 border-purple-200"
            )}
          >
            <RotateCw className="h-3 w-3" />
            <span>{getOrientationLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleOrientationChange("auto")}>
            Auto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOrientationChange("portrait")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="6" y="3" width="12" height="18" rx="2" />
            </svg>
            Portrait
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOrientationChange("landscape")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
            </svg>
            Landscape
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
