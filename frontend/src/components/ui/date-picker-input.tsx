"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerInputProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  disabled = false,
  className,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Atualiza o input quando o value externo muda
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Tenta fazer parse da data enquanto digita
    // Aceita formatos: dd/mm/yyyy, dd/mm/yy, ddmmyyyy
    const cleaned = newValue.replace(/\D/g, "");
    
    if (cleaned.length === 8) {
      const day = cleaned.substring(0, 2);
      const month = cleaned.substring(2, 4);
      const year = cleaned.substring(4, 8);
      const dateString = `${day}/${month}/${year}`;
      
      const parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
      
      if (isValid(parsedDate)) {
        onChange(parsedDate);
      }
    } else if (cleaned.length === 6) {
      const day = cleaned.substring(0, 2);
      const month = cleaned.substring(2, 4);
      const year = `20${cleaned.substring(4, 6)}`;
      const dateString = `${day}/${month}/${year}`;
      
      const parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
      
      if (isValid(parsedDate)) {
        onChange(parsedDate);
      }
    }
  };

  const handleInputBlur = () => {
    // Formata o input ao perder o foco
    if (value && isValid(value)) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else {
      setInputValue("");
      onChange(undefined);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  // Aplica máscara de data (dd/mm/yyyy)
  const applyMask = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    let masked = cleaned;

    if (cleaned.length >= 2) {
      masked = cleaned.substring(0, 2) + "/" + cleaned.substring(2);
    }
    if (cleaned.length >= 4) {
      masked = masked.substring(0, 5) + "/" + cleaned.substring(4, 8);
    }

    return masked.substring(0, 10); // Limita a dd/mm/yyyy
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite apenas números, /, backspace, delete, tab, enter, e setas
    const allowedKeys = [
      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
      "/", "Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight"
    ];

    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("flex w-full", className)}>
      <Input
        type="text"
        value={applyMask(inputValue)}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-r-none"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="rounded-l-none border-l-0 px-3"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}