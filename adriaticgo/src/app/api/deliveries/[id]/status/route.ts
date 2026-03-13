import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deliveryStatusSchema } from "@/lib/validators";

const VALID_DELIVERY_TRANSITIONS: Record<string, string[]> = {
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: [],
};

const DELIVERY_TO_ORDER_STATUS: Record<string, string> = {
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "DELIVERING",
  DELIVERED: "DELIVERED",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as { role?: string }).role !== "DELIVERY_PERSON") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = deliveryStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status: newStatus } = parsed.data;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }
    if (delivery.driverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowedNext = VALID_DELIVERY_TRANSITIONS[delivery.status];
    if (!allowedNext?.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${delivery.status} to ${newStatus}`,
        },
        { status: 400 }
      );
    }

    const orderStatus = DELIVERY_TO_ORDER_STATUS[newStatus];
    const now = new Date();

    const updateData: {
      status: string;
      pickedUpAt?: Date;
      deliveredAt?: Date;
    } = { status: newStatus };
    if (newStatus === "PICKED_UP") {
      updateData.pickedUpAt = now;
    } else if (newStatus === "DELIVERED") {
      updateData.deliveredAt = now;
    }

    const updatedDelivery = await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id },
        data: updateData,
      });
      if (orderStatus) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: orderStatus },
        });
      }
      return tx.delivery.findUniqueOrThrow({
        where: { id },
        include: {
          order: {
            include: {
              restaurant: { select: { name: true, address: true, latitude: true, longitude: true } },
              items: { select: { menuItemName: true, quantity: true, unitPrice: true } },
            },
          },
        },
      });
    });

    return NextResponse.json(updatedDelivery);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
