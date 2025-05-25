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
import { useCollage } from "@/context/CollageContext";

interface ImageSettingsProps {
  image: CollageImage;
  onUpdate?: (updates: Partial<CollageImage>) => void; // Optional direct update function
}

export function ImageSettings({ image, onUpdate }: ImageSettingsProps) {
  const [isFitMenuOpen, setIsFitMenuOpen] = useState(false);
  const [isOrientationMenuOpen, setIsOrientationMenuOpen] = useState(false);
  const { updateImageSettings } = useCollage();

  const handleFitChange = (fit: ImageFitOption) => {
    if (onUpdate) {
      onUpdate({ fit });
    } else {
      updateImageSettings(image.id, { fit });
    }
    setIsFitMenuOpen(false);
  };

  const handleOrientationChange = (orientation: ImageOrientation) => {
    if (onUpdate) {
      onUpdate({ orientation });
    } else {
      updateImageSettings(image.id, { orientation });
    }
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
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M14 9h-4v6h4" />
            </svg>
            Stretch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFitChange("original")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="12" cy="12" r="5" />
            </svg>
            Original
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
                "bg-violet-50 text-violet-600 border-violet-200",
              image.orientation === "landscape" &&
                "bg-orange-50 text-orange-600 border-orange-200"
            )}
          >
            <RotateCw className="h-3 w-3" />
            <span>{getOrientationLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleOrientationChange("auto")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M9 3v18M3 9h18" />
            </svg>
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
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="3" width="12" height="18" rx="2" ry="2" />
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
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
            </svg>
            Landscape
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
