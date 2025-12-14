import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MultiselectOption {
  value: string;
  label: string;
}

interface MultiselectProps {
  options: MultiselectOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  selectAllLabel?: string;
}

export function Multiselect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select options...",
  className,
  selectAllLabel = "Select All",
}: MultiselectProps) {
  const [open, setOpen] = React.useState(false);

  const allSelected = options.length > 0 && options.every((opt) => selected.includes(opt.value));
  const someSelected = selected.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options.map((opt) => opt.value));
    }
  };

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((v) => v !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) {
      return placeholder;
    }
    if (selected.length === 1) {
      const option = options.find((opt) => opt.value === selected[0]);
      return option?.label || placeholder;
    }
    return `${selected.length} branches selected`;
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-input hover:bg-accent",
            className
          )}
        >
          <span className="truncate text-left flex-1">{getDisplayText()}</span>
          <div className="flex items-center gap-1">
            {selected.length > 0 && (
              <button
                type="button"
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100 rounded-sm hover:bg-muted flex items-center justify-center"
                onClick={clearSelection}
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="max-h-60 overflow-y-auto">
          {/* Select All Option */}
          <div
            className="flex items-center gap-2 px-3 py-2 border-b border-border cursor-pointer hover:bg-muted/50"
            onClick={toggleSelectAll}
          >
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
              onClick={(e) => e.stopPropagation()}
            />
            <Label
              htmlFor="select-all"
              className="cursor-pointer font-semibold flex-1 text-sm"
            >
              {selectAllLabel}
            </Label>
            {someSelected && (
              <span className="text-xs text-muted-foreground">
                {selected.length} selected
              </span>
            )}
          </div>

          {/* Individual Options */}
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-muted/50"
                onClick={() => toggleOption(option.value)}
              >
                <Checkbox
                  id={`option-${option.value}`}
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => toggleOption(option.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Label
                  htmlFor={`option-${option.value}`}
                  className="cursor-pointer flex-1 text-sm"
                >
                  {option.label}
                </Label>
                {selected.includes(option.value) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

