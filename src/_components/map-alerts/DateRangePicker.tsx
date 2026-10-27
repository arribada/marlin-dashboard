'use client';

import { Calendar } from "lucide-react";
import { Input } from "../ui/input";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-2">
        <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-testid="start-date"
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-testid="end-date"
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
}
