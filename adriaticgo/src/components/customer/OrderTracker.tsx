import { Check } from "lucide-react";
import { cn, getOrderStatusLabel } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_FLOW } from "@/types";

interface OrderTrackerProps {
  currentStatus: OrderStatus;
}

export function OrderTracker({ currentStatus }: OrderTrackerProps) {
  if (currentStatus === "CANCELLED") {
    return (
      <div className="flex items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <span className="text-xl font-bold">&times;</span>
          </div>
          <p className="font-semibold text-destructive">Order Cancelled</p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="py-4">
      <div className="flex items-start justify-between">
        {ORDER_STATUS_FLOW.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={status} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                    isPending &&
                      "border-muted-foreground/30 bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 w-16 text-center text-[10px] font-medium leading-tight sm:text-xs",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {getOrderStatusLabel(status)}
                </span>
              </div>
              {index < ORDER_STATUS_FLOW.length - 1 && (
                <div
                  className={cn(
                    "mt-5 h-0.5 flex-1",
                    index < currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
