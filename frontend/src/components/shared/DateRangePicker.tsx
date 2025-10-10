import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  date?: DateRange;
  setDate: (date: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  date,
  setDate,
  placeholder = "Selecione o período"
}: DateRangePickerProps) {
  // Normalizar datas para evitar problemas de timezone
  const handleDateChange = (newDate: DateRange | undefined) => {
    if (newDate?.from) {
      // Normalizar para meio-dia no horário local
      const normalizedFrom = new Date(newDate.from);
      normalizedFrom.setHours(12, 0, 0, 0);

      const normalizedRange: DateRange = {
        from: normalizedFrom,
        to: newDate.to ? (() => {
          const normalizedTo = new Date(newDate.to);
          normalizedTo.setHours(12, 0, 0, 0);
          return normalizedTo;
        })() : undefined
      };

      setDate(normalizedRange);
    } else {
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
              </>
            ) : (
              format(date.from, "dd/MM/yyyy", { locale: ptBR })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleDateChange}
          numberOfMonths={2}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
