"use client";

import { Button } from "@/components/ui/button";
import { getDeliveryStatusLabel } from "@/lib/utils";
import { Package, Truck, CheckCircle } from "lucide-react";

const VALID_DELIVERY_TRANSITIONS: Record<string, string[]> = {
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: [],
};

interface StatusUpdaterProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => Promise<void>;
  isLoading?: boolean;
}

// Config for the NEXT status we're transitioning TO
function getButtonConfig(nextStatus: string) {
  switch (nextStatus) {
    case "PICKED_UP":
      return {
        icon: Package,
        label: "Picked Up",
        description: "Collected from restaurant",
      };
    case "IN_TRANSIT":
      return {
        icon: Truck,
        label: "Start Delivery",
        description: "Heading to customer",
      };
    case "DELIVERED":
      return {
        icon: CheckCircle,
        label: "Mark Delivered",
        description: "Order completed",
      };
    default:
      return {
        icon: Package,
        label: nextStatus,
        description: "",
      };
  }
}

export function StatusUpdater({
  currentStatus,
  onStatusChange,
  isLoading = false,
}: StatusUpdaterProps) {
  const nextStatuses = VALID_DELIVERY_TRANSITIONS[currentStatus] ?? [];

  if (currentStatus === "DELIVERED") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-green-500/30 bg-green-500/5 p-8">
        <CheckCircle className="mb-2 h-16 w-16 text-green-600" />
        <p className="text-lg font-semibold text-green-700">
          Delivery Completed
        </p>
        <p className="text-sm text-muted-foreground">
          This order has been successfully delivered
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Current: {getDeliveryStatusLabel(currentStatus)}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {nextStatuses.map((nextStatus) => {
          const config = getButtonConfig(nextStatus);
          const Icon = config.icon;
          return (
            <Button
              key={nextStatus}
              size="lg"
              className="h-auto min-h-[80px] flex-col gap-2 py-6 text-base"
              onClick={() => onStatusChange(nextStatus)}
              disabled={isLoading}
            >
              <Icon className="h-10 w-10" />
              <span className="font-semibold">{config.label}</span>
              <span className="text-xs font-normal opacity-90">
                {config.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
