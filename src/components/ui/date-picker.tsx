// components/ui/date-picker.tsx
import * as React from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  className = "",
}: {
  date: Date | null;
  setDate: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className + " justify-start text-left font-normal"}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(d) => setDate(d || null)}
        />
      </PopoverContent>
    </Popover>
  );
}
