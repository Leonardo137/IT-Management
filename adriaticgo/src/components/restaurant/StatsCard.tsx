"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ title, value, description, icon, className }: StatsCardProps) {
  return (
    <Card className={cn("size-full", className)} size="sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
