// components/ui/datepicker.tsx
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Pick a date",
  className,
  disabled = false,
  fromDate,
  toDate,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className,
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected || undefined}
          onSelect={(date) => onSelect(date || null)}
          initialFocus
          disabled={disabled}
          fromDate={fromDate}
          toDate={toDate}
        />
      </PopoverContent>
    </Popover>
  );
}