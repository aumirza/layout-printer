import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useCollage } from "@/context/CollageContext";

export function UnitSelector() {
  const {
    collageState: { selectedUnit },
    setUnit,
  } = useCollage();
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn("px-2 h-8 text-xs", selectedUnit === "mm" && "bg-muted")}
        onClick={() => setUnit("mm")}
      >
        mm
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn("px-2 h-8 text-xs", selectedUnit === "cm" && "bg-muted")}
        onClick={() => setUnit("cm")}
      >
        cm
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn("px-2 h-8 text-xs", selectedUnit === "in" && "bg-muted")}
        onClick={() => setUnit("in")}
      >
        in
      </Button>
    </div>
  );
}
