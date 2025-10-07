"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value?: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  disabled = false,
  className,
  icon,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");

  // Formata o valor para exibição
  const formatCurrency = (val: number): string => {
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Atualiza o display quando o value externo muda
  React.useEffect(() => {
    if (value !== undefined && value !== null && !isNaN(value)) {
      setDisplayValue(formatCurrency(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Remove tudo exceto números
    const numbersOnly = input.replace(/\D/g, "");

    if (numbersOnly === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Converte para número (centavos)
    const numberValue = parseInt(numbersOnly, 10) / 100;

    // Atualiza o valor
    onChange(numberValue);
    setDisplayValue(formatCurrency(numberValue));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Seleciona todo o texto ao focar
    e.target.select();
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(icon && "ps-9", className)}
      />
      {icon && (
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 flex items-center justify-center peer-disabled:opacity-50 start-0 ps-3">
          {icon}
        </div>
      )}
    </div>
  );
}