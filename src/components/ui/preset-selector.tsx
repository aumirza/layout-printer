import { Edit2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PresetItem {
  id?: string;
  name?: string;
  label: string;
}

interface PresetSelectorProps<T extends PresetItem> {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onCustomCreate: () => void;
  formatItemLabel: (item: T) => string;
  placeholder: string;
  customCreateLabel: string;
  className?: string;
}

export function PresetSelector<T extends PresetItem>({
  items,
  selectedIndex,
  onSelect,
  onCustomCreate,
  formatItemLabel,
  placeholder,
  customCreateLabel,
  className,
}: PresetSelectorProps<T>) {
  const handleChange = (value: string) => {
    if (value === "custom") {
      onCustomCreate();
    } else {
      const index = parseInt(value, 10);
      onSelect(index);
    }
  };

  return (
    <Select
      value={selectedIndex >= 0 ? selectedIndex.toString() : ""}
      onValueChange={handleChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item, index) => (
          <SelectItem
            key={item.id || item.name || index}
            value={index.toString()}
          >
            <span>{formatItemLabel(item)}</span>
          </SelectItem>
        ))}
        <SelectItem value="custom">
          <div className="flex items-center">
            <span className="flex-1 text-primary">{customCreateLabel}</span>
            <Edit2 className="w-4 h-4 text-primary ml-2" />
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
