import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  colorClass?: string;
  trend?: string;
  trendDirection?: "up" | "down";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass = "text-blue-600",
  trend,
  trendDirection
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className={cn("text-2xl font-bold", colorClass)}>
                {value}
              </h3>
              {trend && (
                <span className={cn(
                  "text-xs font-medium",
                  trendDirection === "up" ? "text-green-600" : "text-red-600"
                )}>
                  {trend}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg bg-opacity-10", colorClass)}>
              <Icon className={cn("h-5 w-5", colorClass)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
